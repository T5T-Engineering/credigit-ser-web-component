import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectableList } from "./selectable-list";

describe("SelectableList", () => {
  it("marks the selected item, shows counts and reports selection", async () => {
    const onSelect = vi.fn();
    render(
      <SelectableList
        label="Obligors"
        value="a"
        onSelect={onSelect}
        items={[
          { id: "a", label: "Uyi-Corp Ltd", description: "OBL-1", count: 12 },
          { id: "b", label: "Rock Constructions", count: 9, countTone: "warning" },
          { id: "c", label: "Closed Ltd", disabled: true },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Obligors" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Uyi-Corp Ltd/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("12")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Rock Constructions/ }));
    expect(onSelect).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: /Closed Ltd/ })).toBeDisabled();
  });

  it("shows the empty content when there are no items", () => {
    render(<SelectableList label="Obligors" items={[]} onSelect={() => {}} empty="No obligors." />);
    expect(screen.getByText("No obligors.")).toBeInTheDocument();
  });
});
