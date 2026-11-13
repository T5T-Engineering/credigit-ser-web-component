import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ResultDialog, ResultDialogHost, closeResult, showResult } from "./result-dialog";

afterEach(() => {
  act(() => closeResult());
});

describe("ResultDialog", () => {
  it("shows the outcome with an OK button that closes it", () => {
    const onOpenChange = vi.fn();
    render(<ResultDialog open onOpenChange={onOpenChange} title="Saved" description="The permission change is saved." />);
    expect(screen.getByRole("dialog", { name: /saved/i })).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("The permission change is saved.")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "OK" }).click());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("ResultDialogHost / showResult", () => {
  it("opens from anywhere and closes on OK", () => {
    render(<ResultDialogHost />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => showResult({ title: "Sent for approval", description: "A second person approves it.", tone: "info", closeLabel: "Done" }));
    expect(screen.getByRole("dialog", { name: /sent for approval/i })).toHaveAttribute("data-tone", "info");
    act(() => screen.getByRole("button", { name: "Done" }).click());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
