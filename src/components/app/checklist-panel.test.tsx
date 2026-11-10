import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChecklistPanel, checklistSummary, type ChecklistItem } from "./checklist-panel";

const items: ChecklistItem[] = [
  { id: "a", title: "Board resolution", status: "met", evidence: { label: "resolution.pdf", href: "#r" } },
  { id: "b", title: "Insurance assigned", status: "pending", owner: "Legal", dueDate: "15 Nov 2026", overdue: true },
  { id: "c", title: "Valuation report", status: "waived" },
  { id: "d", title: "Equity contribution", status: "deferred" },
  { id: "e", title: "DSCR at least 1.2x", status: "breached" },
];

describe("ChecklistPanel", () => {
  it("summarises progress (met + waived count as satisfied)", () => {
    render(<ChecklistPanel title="Conditions precedent" items={items} />);
    expect(screen.getByTestId("checklist-summary")).toHaveTextContent("2 of 5 satisfied");
    const bar = screen.getByRole("progressbar", { name: "Conditions precedent progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("1 Breached")).toBeInTheDocument();
    expect(screen.getByText(/overdue/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "resolution.pdf" })).toHaveAttribute("href", "#r");
    expect(checklistSummary([]).ratio).toBe(0);
  });

  it("toggles pending and met; other statuses are not toggleable", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ChecklistPanel items={items} onToggle={onToggle} />);
    await user.click(screen.getByRole("checkbox", { name: "Insurance assigned" }));
    expect(onToggle).toHaveBeenCalledWith("b", "met");
    await user.click(screen.getByRole("checkbox", { name: "Board resolution" }));
    expect(onToggle).toHaveBeenCalledWith("a", "pending");
    expect(screen.getByRole("checkbox", { name: "Valuation report" })).toBeDisabled();
  });
});

describe("ChecklistPanel props type", () => {
  it("accepts the checklist onToggle without a cast (native onToggle omitted)", () => {
    const onToggle = (id: string, status: "met" | "pending" | "waived" | "deferred" | "breached") => void [id, status];
    const props: import("./checklist-panel").ChecklistPanelProps = { items, onToggle };
    render(<ChecklistPanel {...props} />);
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });
});
