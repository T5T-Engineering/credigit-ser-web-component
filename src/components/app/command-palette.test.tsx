import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CommandPalette, scoreCommand, type CommandItem } from "./command-palette";
import { polyfillDialog } from "./test-utils";

beforeAll(polyfillDialog);

const items: CommandItem[] = [
  { id: "dash", label: "Dashboard", group: "pages" },
  { id: "pipe", label: "Origination pipeline", group: "pages", keywords: ["loans"] },
  { id: "app-1", label: "APP-2026-0042 Dangote Agro", group: "records" },
  { id: "new", label: "New credit application", group: "actions" },
  { id: "off", label: "Disabled action", group: "actions", disabled: true },
];

function Harness({ onSelect }: { onSelect: (i: CommandItem) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      items={items}
      groups={[
        { id: "pages", label: "Pages" },
        { id: "records", label: "Records" },
        { id: "actions", label: "Actions" },
      ]}
      onSelect={onSelect}
    />
  );
}

describe("CommandPalette", () => {
  it("opens with Ctrl+K, navigates with arrows and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    expect(screen.getByRole("group", { name: "Pages" })).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", options[2]!.id);
    await user.keyboard("{ArrowUp}");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "pipe" }));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("wraps upwards and skips disabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await user.keyboard("{Meta>}k{/Meta}");
    await user.keyboard("{ArrowUp}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "new" }));
  });

  it("filters by query and keywords, and shows the empty state", async () => {
    const user = userEvent.setup();
    render(<Harness onSelect={() => {}} />);
    await user.keyboard("{Control>}k{/Control}");
    await user.type(screen.getByRole("combobox"), "loans");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Origination pipeline");
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness onSelect={() => {}} />);
    await user.keyboard("{Control>}k{/Control}");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("scores a label prefix above a substring", () => {
    expect(scoreCommand(items[0]!, "dash")).toBeGreaterThan(scoreCommand(items[1]!, "line"));
    expect(scoreCommand(items[0]!, "nope")).toBe(0);
  });
});
