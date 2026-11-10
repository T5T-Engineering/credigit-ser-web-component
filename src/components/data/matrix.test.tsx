import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Matrix, toneForValue, type MatrixCell } from "./matrix";

const rows = [
  { id: "high", label: "High likelihood" },
  { id: "low", label: "Low likelihood" },
];
const columns = [
  { id: "minor", label: "Minor" },
  { id: "major", label: "Major" },
];
const cells: MatrixCell[] = [
  { row: "high", column: "minor", value: 6 },
  { row: "high", column: "major", value: 20, description: "Escalate to CRO" },
  { row: "low", column: "minor", value: 1 },
  { row: "low", column: "major", value: 9 },
];
const thresholds = [
  { to: 5, tone: "success" as const, label: "Low" },
  { to: 12, tone: "warning" as const, label: "Medium" },
  { to: 25, tone: "danger" as const, label: "High" },
];

describe("Matrix", () => {
  it("renders an accessible table with row and column headers", () => {
    render(<Matrix label="Risk heat map" rows={rows} columns={columns} cells={cells} thresholds={thresholds} />);
    const table = screen.getByRole("table", { name: "Risk heat map" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Row", "Minor", "Major"]);
    expect(within(table).getAllByRole("rowheader").map((h) => h.textContent)).toEqual(["High likelihood", "Low likelihood"]);
    expect(within(table).getByText("20")).toBeInTheDocument();
  });

  it("colours by thresholds and renders a legend", () => {
    const { container } = render(<Matrix label="Heat" rows={rows} columns={columns} cells={cells} thresholds={thresholds} />);
    const cell = (r: string, c: string) => container.querySelector(`td[data-row="${r}"][data-column="${c}"] > *`)!;
    expect(cell("high", "major").className).toContain("bg-danger-soft");
    expect(cell("high", "minor").className).toContain("bg-warning-soft");
    expect(cell("low", "minor").className).toContain("bg-success-soft");
    expect(within(screen.getByRole("list", { name: "Legend" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Low",
      "Medium",
      "High",
    ]);
  });

  it("uses a value scale when no tones are given", () => {
    const { container } = render(<Matrix label="Concentration" rows={rows} columns={columns} cells={cells} />);
    const max = container.querySelector('td[data-value="20"] > *') as HTMLElement;
    const min = container.querySelector('td[data-value="1"] > *') as HTMLElement;
    expect(max.style.backgroundColor).toContain("62%");
    expect(min.style.backgroundColor).toContain("6%");
    expect(screen.getByRole("img", { name: "Scale from 1 to 20" })).toBeInTheDocument();
  });

  it("makes cells clickable with descriptive names", async () => {
    const user = userEvent.setup();
    const onCellClick = vi.fn();
    render(<Matrix label="Heat" rows={rows} columns={columns} cells={cells} thresholds={thresholds} onCellClick={onCellClick} selected={null} />);
    const button = screen.getByRole("button", { name: "High likelihood, Major: 20. Escalate to CRO" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(onCellClick).toHaveBeenCalledWith(cells[1]);
  });

  it("toneForValue picks the first band that fits, else the last", () => {
    expect(toneForValue(5, thresholds)).toBe("success");
    expect(toneForValue(5.1, thresholds)).toBe("warning");
    expect(toneForValue(99, thresholds)).toBe("danger");
    expect(toneForValue(1, [])).toBeUndefined();
  });
});
