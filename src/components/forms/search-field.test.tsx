import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./index";

describe("SearchField", () => {
  it("clears with the clear button and returns focus", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    render(<SearchField onClear={onClear} onValueChange={onValueChange} />);
    const input = screen.getByRole("searchbox", { name: "Search" });
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    await user.type(input, "ACME");
    expect(input).toHaveValue("ACME");
    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("clears on Escape", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search borrowers" defaultValue="Ade" />);
    const input = screen.getByRole("searchbox", { name: "Search borrowers" });
    input.focus();
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });
});
