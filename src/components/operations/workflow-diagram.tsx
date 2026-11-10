import type { ComponentProps } from "react";
import { ArrowDown, ArrowRight, Bell, Check, Clock, GitBranch, Scale, Users } from "lucide-react";

import { Badge } from "../basic/badge";
import { cx } from "../../utils/cx";
import { labelText, optionLabel } from "./ops-utils";
import type { MultiSelectOption } from "./role-multi-select";
import type { WorkflowStep } from "./workflow-step-editor";

/** Layout of a `WorkflowDiagram`. `auto` = vertical on phones, horizontal from `md`. */
export type WorkflowDiagramOrientation = "horizontal" | "vertical" | "auto";

/** Labels of the diagram (i18n). */
export type WorkflowDiagramLabels = {
  modeAny: string;
  modeAll: string;
  sla: (hours: number) => string;
  adjudicator: string;
  condition: string;
  notify: string;
  current: string;
  complete: string;
  start: string;
  end: string;
};

const defaultLabels: WorkflowDiagramLabels = {
  modeAny: "Any of",
  modeAll: "All of (co-sign)",
  sla: (h) => `SLA ${h} h`,
  adjudicator: "Adjudicator",
  condition: "If",
  notify: "Notify",
  current: "Current step",
  complete: "Complete",
  start: "Submitted",
  end: "Done",
};

/** Props for `WorkflowDiagram`. */
export type WorkflowDiagramProps = Omit<ComponentProps<"div">, "children"> & {
  steps: WorkflowStep[];
  /** Labels for role values (default: the raw values). */
  roleOptions?: MultiSelectOption[];
  orientation?: WorkflowDiagramOrientation;
  /** Highlights a step of a running instance. */
  currentStepId?: string;
  /** Steps already completed (check mark, muted). */
  completedStepIds?: string[];
  /** Show the start / end terminals (default true). */
  showTerminals?: boolean;
  /** Accessible name of the step list. Default "Workflow steps". */
  label?: string;
  labels?: Partial<WorkflowDiagramLabels>;
};

/**
 * Visual of a workflow definition: step cards joined by arrows, with "Any of" / "All of (co-sign)" mode
 * badges, approver roles, SLA, condition and an adjudicator branch. Reflows to a vertical list on phones
 * (`orientation="auto"`, default) and scrolls horizontally instead of widening the page.
 */
export function WorkflowDiagram({
  steps,
  roleOptions,
  orientation = "auto",
  currentStepId,
  completedStepIds = [],
  showTerminals = true,
  label = "Workflow steps",
  labels,
  className,
  ...props
}: WorkflowDiagramProps) {
  const l = { ...defaultLabels, ...labels };
  const horizontal = orientation === "horizontal";
  const auto = orientation === "auto";
  const list = cx(
    "flex gap-2",
    horizontal ? "flex-row items-stretch" : auto ? "flex-col md:flex-row md:items-stretch" : "flex-col",
  );
  const arrow = (key: string) => (
    <li key={key} aria-hidden="true" className={cx("flex shrink-0 items-center justify-center text-fg-subtle", horizontal ? "px-0.5" : auto ? "py-0.5 md:px-0.5 md:py-0" : "py-0.5")}>
      {horizontal ? <ArrowRight className="size-5" /> : auto ? (
        <>
          <ArrowDown className="size-5 md:hidden" />
          <ArrowRight className="hidden size-5 md:block" />
        </>
      ) : (
        <ArrowDown className="size-5" />
      )}
    </li>
  );
  const terminal = (key: string, text: string) => (
    <li key={key} className={cx("flex shrink-0 items-center", !horizontal && (auto ? "justify-center md:justify-start" : "justify-center"))}>
      <span className={cx(labelText, "squircle rounded-full bg-fg/5 px-3 py-1.5 text-fg-muted")}>{text}</span>
    </li>
  );

  const items = [];
  if (showTerminals) {
    items.push(terminal("start", l.start));
    if (steps.length) items.push(arrow("a-start"));
  }
  steps.forEach((step, i) => {
    const current = step.id === currentStepId;
    const done = completedStepIds.includes(step.id);
    const roles = step.approverRoles.map((r) => optionLabel(roleOptions, r));
    items.push(
      <li
        key={step.id}
        aria-current={current ? "step" : undefined}
        data-step-id={step.id}
        className={cx(
          "squircle flex min-w-0 shrink-0 flex-col gap-2.5 rounded-3xl p-4",
          horizontal ? "w-60" : auto ? "w-full md:w-60" : "w-full",
          current ? "bg-accent-tint ring-2 ring-accent-500/40" : done ? "bg-surface-sunken/60" : "bg-surface shadow-sm",
        )}
      >
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={cx(
              "grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs font-bold",
              current ? "bg-emphasis text-on-emphasis" : done ? "bg-success-soft text-success-strong" : "bg-fg/5 text-fg",
            )}
          >
            {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-display text-sm leading-tight font-bold text-fg">
              {step.name || `#${i + 1}`}
              {current ? <span className="sr-only"> ({l.current})</span> : null}
              {done ? <span className="sr-only"> ({l.complete})</span> : null}
            </span>
            <span className="flex flex-wrap gap-1.5">
              <Badge size="small" tone={step.mode === "all" ? "brand" : "neutral"}>
                {step.mode === "all" ? l.modeAll : l.modeAny}
              </Badge>
              <Badge size="small" tone="neutral" variant="outline">
                <Clock aria-hidden="true" className="size-3" />
                {l.sla(step.slaHours)}
              </Badge>
            </span>
          </div>
        </div>
        {roles.length ? (
          <p className="flex items-start gap-1.5 text-xs leading-4 text-fg-muted">
            <Users aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>{roles.join(step.mode === "all" ? " + " : " / ")}</span>
          </p>
        ) : null}
        {step.condition ? (
          <p className="flex items-start gap-1.5 text-xs leading-4 text-fg-muted">
            <GitBranch aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>
              {l.condition} <code className="font-code break-all text-fg">{step.condition}</code>
            </span>
          </p>
        ) : null}
        {step.notify?.length ? (
          <p className="flex items-start gap-1.5 text-xs leading-4 text-fg-subtle">
            <Bell aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>
              {l.notify}: {step.notify.map((n) => optionLabel(roleOptions, n)).join(", ")}
            </span>
          </p>
        ) : null}
        {step.mode === "all" && step.adjudicatorRole ? (
          <div className="relative mt-0.5 pl-5" data-branch="adjudicator">
            <span aria-hidden="true" className="absolute top-0 bottom-1/2 left-1.5 w-0.5 rounded-full bg-warning/60" />
            <span aria-hidden="true" className="absolute top-1/2 left-1.5 h-0.5 w-2.5 rounded-full bg-warning/60" />
            <span className="squircle inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-strong">
              <Scale aria-hidden="true" className="size-3.5" />
              {l.adjudicator}: {optionLabel(roleOptions, step.adjudicatorRole)}
            </span>
          </div>
        ) : null}
      </li>,
    );
    if (i < steps.length - 1) items.push(arrow(`a-${step.id}`));
  });
  if (showTerminals) {
    if (steps.length) items.push(arrow("a-end"));
    items.push(terminal("end", l.end));
  }

  return (
    <div className={cx("min-w-0", (horizontal || auto) && "overflow-x-auto pb-1", className)} {...props}>
      <ol aria-label={label} className={list}>
        {items}
      </ol>
    </div>
  );
}
