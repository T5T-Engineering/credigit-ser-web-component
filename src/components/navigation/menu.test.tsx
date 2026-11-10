import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Menu } from "./menu";

function setup() {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(
    <div>
      <Menu
        trigger="Actions"
        items={[
          { label: "Edit", onSelect: onEdit },
          { label: "View report", href: "/report" },
          { label: "Delete", onSelect: onDelete, danger: true, divider: true },
        ]}
      />
      <button type="button">Outside</button>
    </div>,
  );
  return { onEdit, onDelete, user: userEvent.setup() };
}

describe("Menu", () => {
  it("opens from the trigger and focuses the first item", async () => {
    const { user } = setup();
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "View report" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("navigates with arrows, selects with Enter and returns focus", async () => {
    const { user, onDelete } = setup();
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and on outside click", async () => {
    const { user } = setup();
    const trigger = screen.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
