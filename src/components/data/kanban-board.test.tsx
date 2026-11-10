import { createEvent, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { KanbanBoard, type KanbanCard } from "./kanban-board";

const columns = [
  { id: "review", title: "Credit review", tone: "info" as const },
  { id: "committee", title: "Committee", limit: 1 },
  { id: "approved", title: "Approved", tone: "success" as const },
];
const cards: KanbanCard[] = [
  { id: "A1", columnId: "review", title: "Adamu Farms", meta: "₦250m", badges: [{ label: "SME", tone: "brand" }], assignee: { name: "Ngozi Eze" } },
  { id: "A2", columnId: "review", title: "Bisi Textiles" },
  { id: "A3", columnId: "committee", title: "Chika Oil" },
];

describe("KanbanBoard", () => {
  it("renders columns with counts and cards", () => {
    render(<KanbanBoard columns={columns} cards={cards} label="Pipeline" />);
    expect(screen.getByRole("list", { name: "Pipeline" })).toBeInTheDocument();
    const review = screen.getByRole("listitem", { name: "Credit review" });
    expect(within(review).getByLabelText("2 items")).toHaveTextContent("2");
    expect(within(review).getByText("Adamu Farms")).toBeInTheDocument();
    expect(within(review).getByText("SME")).toBeInTheDocument();
    expect(within(screen.getByRole("listitem", { name: "Committee" })).getByLabelText("1 item of limit 1")).toHaveTextContent("1/1");
    expect(within(screen.getByRole("listitem", { name: "Approved" })).getByText("No items")).toBeInTheDocument();
  });

  it("moves a card with the keyboard-accessible menu and announces it", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<KanbanBoard columns={columns} cards={cards} onMove={onMove} />);
    await user.click(screen.getByRole("button", { name: "Move Adamu Farms" }));
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent);
    expect(items).toEqual(["Move down", "Move to Committee", "Move to Approved"]);
    await user.click(screen.getByRole("menuitem", { name: "Move to Approved" }));
    expect(onMove).toHaveBeenCalledWith("A1", "approved", 0);
    expect(screen.getByRole("status")).toHaveTextContent("Moved Adamu Farms to Approved, position 1.");
  });

  it("reorders within a column via the menu", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<KanbanBoard columns={columns} cards={cards} onMove={onMove} />);
    screen.getByRole("button", { name: "Move Bisi Textiles" }).focus();
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("menuitem", { name: "Move up" }));
    expect(onMove).toHaveBeenCalledWith("A2", "review", 0);
  });

  it("moves a card by drag and drop", () => {
    const onMove = vi.fn();
    render(<KanbanBoard columns={columns} cards={cards} onMove={onMove} />);
    const card = screen.getByText("Bisi Textiles").closest("li")!;
    const target = screen.getByRole("listitem", { name: "Committee" });
    const dataTransfer = { setData: vi.fn(), getData: () => "A2", effectAllowed: "", dropEffect: "" };
    fireEvent.dragStart(card, { dataTransfer });
    const over = createEvent.dragOver(target, { dataTransfer });
    fireEvent(target, over);
    expect(over.defaultPrevented).toBe(true);
    fireEvent.drop(target, { dataTransfer });
    // jsdom has no layout (all rects are 0), so the drop index resolves to the top of the column.
    expect(onMove).toHaveBeenCalledWith("A2", "committee", 0);
  });

  it("is read-only without onMove", () => {
    render(<KanbanBoard columns={columns} cards={cards} />);
    expect(screen.queryByRole("button", { name: /^Move / })).not.toBeInTheDocument();
    expect(screen.getByText("Adamu Farms").closest("li")).not.toHaveAttribute("draggable");
  });
});
