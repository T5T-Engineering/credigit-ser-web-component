import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Wizard, type WizardStep } from "./wizard";

function steps(validate: WizardStep["validate"]): WizardStep[] {
  return [
    { id: "borrower", title: "Borrower", content: <p>Borrower fields</p>, validate },
    { id: "facility", title: "Facility", content: <p>Facility fields</p>, optional: true },
  ];
}

describe("Wizard", () => {
  it("blocks Next when validation fails and shows the message", async () => {
    const user = userEvent.setup();
    const validate = vi.fn().mockReturnValueOnce("BVN is required").mockReturnValue(true);
    render(<Wizard steps={steps(validate)} summary={<p>Summary</p>} onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("BVN is required");
    expect(screen.getByText("Borrower fields")).toBeInTheDocument();
    expect(screen.getByText(/\(has errors\)/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Facility fields")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("navigates back, supports async validation, the summary step and submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onStepChange = vi.fn();
    render(<Wizard steps={steps(async () => true)} summary={<p>Summary here</p>} onSubmit={onSubmit} onStepChange={onStepChange} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onStepChange).toHaveBeenLastCalledWith("facility");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Borrower fields")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Summary here")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review & submit" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("validateStep=false blocks with the default message; save draft passes the current step", async () => {
    const user = userEvent.setup();
    const onSaveDraft = vi.fn();
    render(<Wizard steps={steps(undefined)} validateStep={() => false} onSaveDraft={onSaveDraft} onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/fix the issues/i);
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(onSaveDraft).toHaveBeenCalledWith("borrower");
  });

  it("jumps back to a visited step from the stepper", async () => {
    const user = userEvent.setup();
    render(<Wizard steps={steps(() => true)} onSubmit={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /Borrower/ }));
    expect(screen.getByText("Borrower fields")).toBeInTheDocument();
  });
});
