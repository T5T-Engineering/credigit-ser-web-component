import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DecisionPanel } from "./decision-panel";

describe("DecisionPanel", () => {
  it("requires a comment before submitting", async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn();
    render(<DecisionPanel onDecide={onDecide} />);
    await user.click(screen.getByRole("radio", { name: "Decline" }));
    await user.click(screen.getByRole("button", { name: "Submit: Decline" }));
    expect(onDecide).not.toHaveBeenCalled();
    expect(screen.getByText("A comment is required to decline.")).toBeInTheDocument();
    const comment = screen.getByRole("textbox", { name: /Comment/ });
    expect(comment).toHaveAttribute("aria-invalid", "true");
    await user.type(comment, "  Leverage above policy.  ");
    await user.click(screen.getByRole("button", { name: "Submit: Decline" }));
    expect(onDecide).toHaveBeenCalledWith({ decision: "decline", comment: "Leverage above policy." });
  });

  it("asks for a decision first", async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn();
    render(<DecisionPanel onDecide={onDecide} />);
    await user.click(screen.getByRole("button", { name: "Submit decision" }));
    expect(screen.getByText("Choose a decision.")).toBeInTheDocument();
    expect(onDecide).not.toHaveBeenCalled();
  });

  it("runs the step-up hook and aborts when it fails", async () => {
    const user = userEvent.setup();
    const onDecide = vi.fn();
    const onStepUp = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<DecisionPanel onDecide={onDecide} requireStepUp={(d) => d === "approve"} onStepUp={onStepUp} commentRequired={["decline"]} />);
    await user.click(screen.getByRole("radio", { name: "Approve" }));
    expect(screen.getByText("Re-authentication required")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit: Approve" }));
    expect(onStepUp).toHaveBeenCalledWith("approve");
    expect(onDecide).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Submit: Approve" }));
    expect(onDecide).toHaveBeenCalledWith({ decision: "approve", comment: "" });
  });
});
