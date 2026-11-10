import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkflowDiagram } from "./workflow-diagram";
import { moveWorkflowStep, validateWorkflowStep, validateWorkflowSteps, WorkflowStepEditor, type WorkflowStep } from "./workflow-step-editor";
import { formatSlaDuration, OperationTimeline, slaState, WorkflowInstanceCard, type OperationStep } from "./workflow-instance-card";

const roleOptions = [
  { value: "maker", label: "Relationship manager" },
  { value: "credit", label: "Credit analyst" },
  { value: "cro", label: "Chief Risk Officer" },
  { value: "md", label: "Managing Director" },
];

const initialSteps: WorkflowStep[] = [
  { id: "s1", name: "Credit review", approverRoles: ["credit"], mode: "any", slaHours: 24 },
  { id: "s2", name: "Risk sign-off", approverRoles: ["cro", "md"], mode: "all", slaHours: 48, adjudicatorRole: "md", condition: "amount > rule('credit.tier2.limit')" },
  { id: "s3", name: "Booking", approverRoles: ["maker"], mode: "any", slaHours: 8 },
];

function Editor({ spy, ...props }: { spy?: (s: WorkflowStep[]) => void } & Partial<Parameters<typeof WorkflowStepEditor>[0]>) {
  const [steps, setSteps] = useState(initialSteps);
  return (
    <WorkflowStepEditor
      roleOptions={roleOptions}
      createStep={() => ({ id: `new-${Math.random()}`, name: "", approverRoles: [], mode: "any", slaHours: 0 })}
      {...props}
      steps={steps}
      onChange={(next) => {
        setSteps(next);
        spy?.(next);
      }}
    />
  );
}

const names = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.replace(/^Step \d+: /, ""));

describe("workflow step helpers", () => {
  it("validates name, roles and SLA", () => {
    expect(validateWorkflowStep({ id: "x", name: " ", approverRoles: [], mode: "any", slaHours: 0 })).toEqual({
      name: "Step name is required",
      approverRoles: "Choose at least one approver role",
      slaHours: "SLA must be greater than 0 hours",
    });
    expect(validateWorkflowSteps(initialSteps)).toEqual({});
    expect(moveWorkflowStep(initialSteps, 0, 2).map((s) => s.id)).toEqual(["s2", "s3", "s1"]);
    expect(moveWorkflowStep(initialSteps, 0, 5).map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
  });
});

describe("WorkflowStepEditor", () => {
  it("reorders with buttons and announces the move", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    expect(names()).toEqual(["Credit review", "Risk sign-off", "Booking"]);
    expect(screen.getByRole("button", { name: "Move Credit review up" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Move Credit review down" }));
    expect(names()).toEqual(["Risk sign-off", "Credit review", "Booking"]);
    expect(screen.getByRole("status")).toHaveTextContent("Credit review moved to position 2 of 3");
    expect(screen.getByRole("button", { name: "Move Credit review down" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Move Booking up" }));
    expect(names()).toEqual(["Risk sign-off", "Booking", "Credit review"]);
  });

  it("reorders with Alt+Arrow keys on the step", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    const booking = screen.getByRole("listitem", { name: /Booking/ });
    booking.focus();
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(names()).toEqual(["Credit review", "Booking", "Risk sign-off"]);
    expect(screen.getByRole("listitem", { name: /Booking/ })).toHaveFocus();
  });

  it("adds and removes steps; respects minSteps", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Editor spy={spy} minSteps={2} />);
    await user.click(screen.getByRole("button", { name: "Add step" }));
    expect(spy.mock.calls.at(-1)?.[0]).toHaveLength(4);
    expect(screen.getAllByRole("textbox", { name: /Step name/ }).at(-1)).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Remove untitled step" }));
    await user.click(screen.getByRole("button", { name: "Remove Booking" }));
    expect(names()).toEqual(["Credit review", "Risk sign-off"]);
    expect(screen.getByRole("button", { name: "Remove Credit review" })).toBeDisabled();
  });

  it("shows inline validation after editing and reports validity", async () => {
    const user = userEvent.setup();
    const onValidityChange = vi.fn();
    render(<Editor onValidityChange={onValidityChange} />);
    const name = screen.getAllByRole("textbox", { name: /Step name/ })[0]!;
    await user.clear(name);
    expect(screen.getByText("Step name is required")).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ s1: { name: "Step name is required" } }));
    const sla = screen.getAllByRole("textbox", { name: /SLA/ })[0]!;
    await user.clear(sla);
    expect(screen.getByText("SLA must be greater than 0 hours")).toBeInTheDocument();
    const firstRoles = screen.getByRole("group", { name: "Approver roles: untitled step" });
    await user.click(within(firstRoles).getByRole("button", { name: "Credit analyst" }));
    expect(screen.getByText("Choose at least one approver role")).toBeInTheDocument();
  });

  it("shows all errors with showErrors and switches mode / adjudicator", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Editor spy={spy} showErrors />);
    await user.click(screen.getByRole("button", { name: "Add step" }));
    expect(screen.getByText("Step name is required")).toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: "Decision: Credit review" });
    await user.click(within(group).getByRole("radio", { name: "All of (co-sign)" }));
    expect(spy.mock.calls.at(-1)?.[0][0].mode).toBe("all");
    expect(screen.getAllByRole("combobox", { name: /Adjudicator/ })).toHaveLength(2);
  });

  it("read-only mode renders values without controls", () => {
    render(<WorkflowStepEditor steps={initialSteps} roleOptions={roleOptions} readOnly />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add step" })).not.toBeInTheDocument();
    expect(screen.getByText("Chief Risk Officer, Managing Director")).toBeInTheDocument();
    expect(screen.getByText("48 hours")).toBeInTheDocument();
  });
});

describe("WorkflowDiagram", () => {
  it("renders steps with mode badges, roles, SLA and the adjudicator branch", () => {
    const { container } = render(<WorkflowDiagram steps={initialSteps} roleOptions={roleOptions} currentStepId="s2" completedStepIds={["s1"]} />);
    const list = screen.getByRole("list", { name: "Workflow steps" });
    expect(within(list).getAllByText("Any of")).toHaveLength(2);
    expect(within(list).getByText("All of (co-sign)")).toBeInTheDocument();
    expect(within(list).getByText("Chief Risk Officer + Managing Director")).toBeInTheDocument();
    expect(within(list).getByText("SLA 48 h")).toBeInTheDocument();
    expect(within(list).getByText(/Adjudicator: Managing Director/)).toBeInTheDocument();
    expect(container.querySelector('[data-step-id="s2"]')).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("(Complete)")).toBeInTheDocument();
  });
});

describe("Operations instance", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const steps: OperationStep[] = [
    { id: "a", name: "Credit review", status: "approved", decisions: [{ actor: { name: "Ngozi Eze", role: "Credit analyst" }, decision: "approved", time: "09:12", comment: "Within appetite." }] },
    { id: "b", name: "Risk sign-off", status: "current", mode: "all", dueAt: "2026-11-10T15:20:00Z", decisions: [{ actor: "Tunde Bakare", decision: "approved" }, { actor: "Musa Ali", decision: "pending" }] },
    { id: "c", name: "Booking", status: "pending" },
  ];

  it("formats SLA durations and overdue state", () => {
    expect(formatSlaDuration(3 * 3600e3 + 20 * 60e3)).toBe("3h 20m");
    expect(formatSlaDuration(26 * 3600e3)).toBe("1d 2h");
    expect(formatSlaDuration(30e3)).toBe("<1m");
    expect(slaState("2026-11-10T10:00:00Z", now)).toMatchObject({ overdue: true, text: "Overdue by 2h" });
  });

  it("card shows subject, status, requester, current step, SLA, timeline and actions", () => {
    render(
      <WorkflowInstanceCard
        subject={{ title: "Raise Tier 2 limit", type: "Rule change", href: "#op", reference: "OPS-2026-00412" }}
        status="in_progress"
        requester={{ name: "Amina Bello", role: "Head, Credit Risk" }}
        submittedAt="10 Nov 2026, 08:30"
        steps={steps}
        now={now}
        actions={<button type="button">Approve</button>}
      />,
    );
    expect(screen.getByRole("link", { name: "Raise Tier 2 limit" })).toHaveAttribute("href", "#op");
    expect(screen.getByTestId("operation-status")).toHaveTextContent("In progress");
    expect(screen.getByText("Amina Bello")).toBeInTheDocument();
    expect(screen.getAllByText("Risk sign-off").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("timer")[0]).toHaveTextContent("Due in 3h 20m");
    expect(screen.getByText("Within appetite.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("timeline marks overdue and highlights the current step", () => {
    const { container } = render(<OperationTimeline steps={steps} now={new Date("2026-11-10T18:00:00Z")} />);
    expect(screen.getByRole("timer")).toHaveTextContent("Overdue by 2h 40m");
    expect(container.querySelector('[data-status="current"]')).toHaveAttribute("aria-current", "step");
  });

  it("closed operations hide current step and SLA", () => {
    render(<WorkflowInstanceCard subject={{ title: "X" }} status="rejected" steps={steps} showTimeline={false} now={now} />);
    expect(screen.getByTestId("operation-status")).toHaveTextContent("Rejected");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
});
