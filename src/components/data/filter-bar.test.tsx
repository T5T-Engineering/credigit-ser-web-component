import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterBar, isFilterActive } from "./filter-bar";

const statusOptions = [
  { value: "PERFORMING", label: "Performing" },
  { value: "WATCHLIST", label: "Watchlist" },
];

describe("FilterBar", () => {
  it("renders search, select pills, date range and actions", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onStatus = vi.fn();
    render(
      <FilterBar
        search={{ value: "", onChange: onSearch, placeholder: "Search obligors" }}
        filters={[
          { id: "status", label: "Status", options: statusOptions, value: "", onChange: onStatus },
          { type: "dateRange", id: "date", label: "Booked", onChange: vi.fn() },
        ]}
        actions={<button type="button">Export</button>}
      />,
    );
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "a");
    expect(onSearch).toHaveBeenCalledWith("a");
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "WATCHLIST");
    expect(onStatus).toHaveBeenCalledWith("WATCHLIST");
    expect(screen.getByLabelText("Booked from")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    // Nothing active → no Clear all.
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
  });

  it("shows the selected label, marks active pills and clears all", async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(
      <FilterBar
        filters={[{ id: "status", label: "Status", options: statusOptions, value: "WATCHLIST", onChange: vi.fn() }]}
        onClearAll={onClearAll}
      />,
    );
    const pill = screen.getByRole("combobox", { name: "Status" }).parentElement!;
    expect(pill).toHaveTextContent("Status:Watchlist");
    expect(pill).toHaveAttribute("data-active", "true");
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("emits date range changes", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={[{ type: "dateRange", id: "d", label: "Date", from: "2026-01-01", onChange }]} />);
    fireEvent.change(screen.getByLabelText("Date to"), { target: { value: "2026-03-31" } });
    expect(onChange).toHaveBeenCalledWith({ from: "2026-01-01", to: "2026-03-31" });
    expect(screen.getByLabelText("Date to")).toHaveAttribute("min", "2026-01-01");
  });

  it("isFilterActive covers both filter kinds", () => {
    expect(isFilterActive({ id: "a", label: "A", options: [], value: "", onChange: () => {} })).toBe(false);
    expect(isFilterActive({ type: "dateRange", id: "b", label: "B", to: "2026-01-01", onChange: () => {} })).toBe(true);
  });
});
