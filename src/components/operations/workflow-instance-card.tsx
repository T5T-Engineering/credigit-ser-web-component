"use client";

import { useEffect, useState, type ComponentProps, type ElementType, type ReactNode } from "react";
import { Ban, CircleAlert, CircleCheck, CircleDot, CircleX, Clock, Hourglass, MessageSquare, SkipForward, ThumbsUp, Undo2 } from "lucide-react";

import { Avatar } from "../basic/avatar";
import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";
import { labelText, toneText, toneTile } from "./ops-utils";

/** Status of a running operation (workflow instance). */
export type OperationStatus = "pending" | "in_progress" | "approved" | "rejected" | "returned" | "cancelled" | "expired" | "failed";

/** Tone, label and icon per operation status. */
export const operationStatusMeta: Record<OperationStatus, { tone: Tone; label: string; icon: typeof Clock }> = {
  pending: { tone: "neutral", label: "Pending", icon: Clock },
  in_progress: { tone: "info", label: "In progress", icon: CircleDot },
  approved: { tone: "success", label: "Approved", icon: CircleCheck },
  rejected: { tone: "danger", label: "Rejected", icon: CircleX },
  returned: { tone: "warning", label: "Returned", icon: Undo2 },
  cancelled: { tone: "neutral", label: "Cancelled", icon: Ban },
  expired: { tone: "danger", label: "Expired", icon: Hourglass },
  /** Approved, but applying the change failed (e.g. the target system rejected it) — needs follow-up. */
  failed: { tone: "danger", label: "Failed", icon: CircleAlert },
};

/** Decision recorded on a step. */
export type OperationDecisionKind = "approved" | "rejected" | "returned" | "recommended" | "commented" | "pending" | "delegated";

/** Tone, label and icon per step decision. */
export const operationDecisionMeta: Record<OperationDecisionKind, { tone: Tone; label: string; icon: typeof Clock }> = {
  approved: { tone: "success", label: "Approved", icon: CircleCheck },
  rejected: { tone: "danger", label: "Rejected", icon: CircleX },
  returned: { tone: "warning", label: "Returned", icon: Undo2 },
  recommended: { tone: "info", label: "Recommended", icon: ThumbsUp },
  commented: { tone: "neutral", label: "Commented", icon: MessageSquare },
  pending: { tone: "neutral", label: "Pending", icon: Clock },
  delegated: { tone: "brand", label: "Delegated", icon: SkipForward },
};

/** Person acting in an operation. */
export type OperationActor = string | { name: string; role?: string; avatarSrc?: string };

/** One decision on a step. */
export type OperationDecision = {
  id?: string;
  actor: OperationActor;
  decision: OperationDecisionKind;
  /** Pre-formatted time (or `<time>`). */
  time?: ReactNode;
  comment?: ReactNode;
};

/** State of a step within a running operation. */
export type OperationStepStatus = "pending" | "current" | "approved" | "rejected" | "returned" | "skipped";

const stepStatusMeta: Record<OperationStepStatus, { tone: Tone; label: string; icon: typeof Clock }> = {
  pending: { tone: "neutral", label: "Waiting", icon: Clock },
  current: { tone: "info", label: "In progress", icon: CircleDot },
  approved: { tone: "success", label: "Approved", icon: CircleCheck },
  rejected: { tone: "danger", label: "Rejected", icon: CircleX },
  returned: { tone: "warning", label: "Returned", icon: Undo2 },
  skipped: { tone: "neutral", label: "Skipped", icon: SkipForward },
};

/** A step of a running operation. */
export type OperationStep = {
  id: string;
  name: ReactNode;
  status: OperationStepStatus;
  mode?: "any" | "all";
  /** Pre-formatted approver roles. */
  approvers?: ReactNode;
  decisions?: OperationDecision[];
  /** SLA deadline of the step (Date, ISO string or epoch ms) — shows a countdown / overdue. */
  dueAt?: Date | string | number;
  /** Extra line (e.g. "Skipped: condition false"). */
  meta?: ReactNode;
};

/** Labels for operations (i18n). */
export type OperationLabels = {
  dueIn: (remaining: string) => string;
  overdueBy: (late: string) => string;
  requestedBy: string;
  currentStep: string;
  submitted: string;
  modeAny: string;
  modeAll: string;
  reference: string;
};

const defaultLabels: OperationLabels = {
  dueIn: (r) => `Due in ${r}`,
  overdueBy: (r) => `Overdue by ${r}`,
  requestedBy: "Requested by",
  currentStep: "Current step",
  submitted: "Submitted",
  modeAny: "Any of",
  modeAll: "All of (co-sign)",
  reference: "Reference",
};

/** Compact duration text: "2d 3h", "3h 20m", "45m", "<1m". */
export function formatSlaDuration(ms: number): string {
  const minutes = Math.floor(Math.abs(ms) / 60000);
  if (minutes < 1) return "<1m";
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return h ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

/** SLA state for a deadline: remaining ms (negative when overdue), overdue flag and text. */
export function slaState(dueAt: Date | string | number, now: Date | number = Date.now(), labels: Pick<OperationLabels, "dueIn" | "overdueBy"> = defaultLabels) {
  const due = new Date(dueAt).getTime();
  const remaining = due - new Date(now).getTime();
  const overdue = remaining < 0;
  return { remaining, overdue, text: overdue ? labels.overdueBy(formatSlaDuration(remaining)) : labels.dueIn(formatSlaDuration(remaining)) };
}

/** Current time, refreshed every `intervalMs` (or the fixed `now` when given). */
// TD-014: display refresh cadence.
function useNow(now: Date | number | undefined, intervalMs = 30000): number {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (now !== undefined) return;
    const id = setInterval(() => setTick(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [now, intervalMs]);
  return now !== undefined ? new Date(now).getTime() : tick;
}

/** Props for `SlaCountdown`. */
export type SlaCountdownProps = Omit<ComponentProps<"span">, "children"> & {
  dueAt: Date | string | number;
  /** Fixed "now" (tests / server rendering); otherwise ticks every 30 s. */
  now?: Date | number;
  /** Remaining time below which the pill turns amber (ms). Pass from business rules; default none. */
  warnWithinMs?: number;
  labels?: Partial<Pick<OperationLabels, "dueIn" | "overdueBy">>;
};

/** SLA pill: "Due in 3h 20m" (amber within `warnWithinMs`) or "Overdue by 2h" (danger), as `role="timer"`. */
export function SlaCountdown({ dueAt, now, warnWithinMs, labels, className, ...props }: SlaCountdownProps) {
  const current = useNow(now);
  const state = slaState(dueAt, current, { ...defaultLabels, ...labels });
  const tone: Tone = state.overdue ? "danger" : warnWithinMs !== undefined && state.remaining <= warnWithinMs ? "warning" : "neutral";
  return (
    <span
      role="timer"
      aria-live="off"
      data-overdue={state.overdue || undefined}
      className={cx("squircle inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums", toneTile[tone], className)}
      {...props}
    >
      {state.overdue ? <Hourglass aria-hidden="true" className="size-3.5" /> : <Clock aria-hidden="true" className="size-3.5" />}
      {state.text}
    </span>
  );
}

function actorOf(actor: OperationActor) {
  return typeof actor === "string" ? { name: actor } : actor;
}

/** Props for `OperationTimeline`. */
export type OperationTimelineProps = Omit<ComponentProps<"ol">, "children"> & {
  steps: OperationStep[];
  now?: Date | number;
  warnWithinMs?: number;
  decisionLabels?: Partial<Record<OperationDecisionKind, string>>;
  stepStatusLabels?: Partial<Record<OperationStepStatus, string>>;
  labels?: Partial<OperationLabels>;
};

/**
 * Steps of a running operation (ApprovalTimeline styling): status rail, current step highlighted,
 * per-step decisions with actor, time and comment, and an SLA countdown on the current step.
 */
export function OperationTimeline({ steps, now, warnWithinMs, decisionLabels, stepStatusLabels, labels, className, ...props }: OperationTimelineProps) {
  const l = { ...defaultLabels, ...labels };
  return (
    <ol className={cx("flex flex-col", className)} {...props}>
      {steps.map((step, i) => {
        const meta = stepStatusMeta[step.status];
        const Icon = meta.icon;
        const current = step.status === "current";
        const last = i === steps.length - 1;
        return (
          <li key={step.id} aria-current={current ? "step" : undefined} data-status={step.status} className={cx("relative flex gap-3", !last && "pb-4")}>
            {!last ? (
              <span aria-hidden="true" className={cx("absolute top-9 bottom-0 left-[15px] w-0.5 rounded-full", step.status === "pending" || current ? "bg-line" : "bg-fg/25")} />
            ) : null}
            <span
              aria-hidden="true"
              className={cx("relative z-10 grid size-8 shrink-0 place-items-center rounded-full", current ? "bg-emphasis text-on-emphasis ring-4 ring-accent-tint" : toneTile[meta.tone])}
            >
              <Icon className="size-4" />
            </span>
            <div className={cx("squircle flex min-w-0 flex-1 flex-col gap-2 rounded-2xl p-3.5", current ? "bg-accent-tint ring-2 ring-accent-500/40" : "bg-surface-sunken/60", step.status === "skipped" && "opacity-70")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="font-display text-sm leading-tight font-bold text-fg">
                    {step.name}
                    {current ? <span className="sr-only"> ({l.currentStep})</span> : null}
                  </span>
                  {step.approvers ? <span className="text-xs text-fg-muted">{step.approvers}</span> : null}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {step.mode ? (
                    <Badge size="small" tone={step.mode === "all" ? "brand" : "neutral"}>
                      {step.mode === "all" ? l.modeAll : l.modeAny}
                    </Badge>
                  ) : null}
                  {current && step.dueAt !== undefined ? <SlaCountdown dueAt={step.dueAt} now={now} warnWithinMs={warnWithinMs} labels={l} /> : null}
                  <Badge size="small" tone={meta.tone} dot>
                    {stepStatusLabels?.[step.status] ?? meta.label}
                  </Badge>
                </div>
              </div>
              {step.meta ? <p className="font-mono text-xs text-fg-muted">{step.meta}</p> : null}
              {step.decisions?.length ? (
                <ul className="flex flex-col gap-2">
                  {step.decisions.map((d, di) => {
                    const actor = actorOf(d.actor);
                    const dm = operationDecisionMeta[d.decision];
                    return (
                      <li key={d.id ?? di} className="squircle flex flex-col gap-1.5 rounded-xl bg-surface px-3 py-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Avatar name={actor.name} src={actor.avatarSrc} size="xsmall" aria-hidden="true" />
                          <span className="text-sm font-semibold text-fg">{actor.name}</span>
                          {actor.role ? <span className="text-xs text-fg-muted">{actor.role}</span> : null}
                          <span className={cx("ml-auto text-xs font-semibold", toneText[dm.tone])}>{decisionLabels?.[d.decision] ?? dm.label}</span>
                        </div>
                        {d.comment ? <blockquote className="text-sm leading-5 text-fg-muted">{d.comment}</blockquote> : null}
                        {d.time ? <span className="font-mono text-xs text-fg-subtle">{d.time}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Subject of an operation (what is being approved). */
export type OperationSubject = {
  title: ReactNode;
  /** Kind, e.g. "Rule change", "Credit facility". */
  type?: ReactNode;
  href?: string;
  /** Mono reference, e.g. "OPS-2026-00412". */
  reference?: string;
};

/** Props for `WorkflowInstanceCard`. */
export type WorkflowInstanceCardProps = Omit<ComponentProps<"article">, "children" | "title"> & {
  subject: OperationSubject;
  status: OperationStatus;
  requester?: OperationActor;
  /** Pre-formatted submit time. */
  submittedAt?: ReactNode;
  /** Name of the current step (default: name of the step with status "current"). */
  currentStep?: ReactNode;
  /** SLA deadline of the current step (default: the current step's `dueAt`). */
  dueAt?: Date | string | number;
  /** Steps; renders an `OperationTimeline`. */
  steps?: OperationStep[];
  /** Show the timeline (default true when `steps` are given). */
  showTimeline?: boolean;
  now?: Date | number;
  warnWithinMs?: number;
  /** Footer actions (Approve, Return…; e.g. open a `DecisionPanel`). */
  actions?: ReactNode;
  statusLabels?: Partial<Record<OperationStatus, string>>;
  decisionLabels?: Partial<Record<OperationDecisionKind, string>>;
  labels?: Partial<OperationLabels>;
  linkComponent?: ElementType;
  /** Heading element for the subject title (default `h3`). */
  titleAs?: "h2" | "h3" | "h4";
};

/**
 * A running operation: subject (type, title link, reference), status badge, requester, current step,
 * SLA countdown / overdue, the step timeline with decisions, and an actions slot.
 */
export function WorkflowInstanceCard({
  subject,
  status,
  requester,
  submittedAt,
  currentStep,
  dueAt,
  steps,
  showTimeline,
  now,
  warnWithinMs,
  actions,
  statusLabels,
  decisionLabels,
  labels,
  linkComponent: Link = "a",
  titleAs: Title = "h3",
  className,
  ...props
}: WorkflowInstanceCardProps) {
  const l = { ...defaultLabels, ...labels };
  const meta = operationStatusMeta[status];
  const active = steps?.find((s) => s.status === "current");
  const stepName = currentStep ?? active?.name;
  const deadline = dueAt ?? active?.dueAt;
  const open = status === "pending" || status === "in_progress";
  const person = requester ? actorOf(requester) : undefined;
  return (
    <article className={cx("squircle flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-sm", className)} data-status={status} {...props}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {subject.type ? <span className={cx(labelText, "text-fg-muted")}>{subject.type}</span> : null}
            {subject.reference ? <code className="font-code text-xs text-fg-subtle">{subject.reference}</code> : null}
          </div>
          <Title className="font-display text-lg leading-tight font-bold text-fg">
            {subject.href ? (
              <Link href={subject.href} className="rounded-sm underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                {subject.title}
              </Link>
            ) : (
              subject.title
            )}
          </Title>
        </div>
        <Badge tone={meta.tone} dot data-testid="operation-status">
          {statusLabels?.[status] ?? meta.label}
        </Badge>
      </header>
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        {person ? (
          <div className="flex items-center gap-2">
            <dt className="sr-only">{l.requestedBy}</dt>
            <dd className="flex items-center gap-2">
              <Avatar name={person.name} src={person.avatarSrc} size="small" aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span className="font-semibold text-fg">{person.name}</span>
                <span className="text-xs text-fg-muted">
                  {person.role ?? l.requestedBy}
                  {submittedAt ? <> · {submittedAt}</> : null}
                </span>
              </span>
            </dd>
          </div>
        ) : submittedAt ? (
          <div className="flex flex-col">
            <dt className={cx(labelText, "text-fg-muted")}>{l.submitted}</dt>
            <dd className="text-fg">{submittedAt}</dd>
          </div>
        ) : null}
        {open && stepName ? (
          <div className="flex flex-col">
            <dt className={cx(labelText, "text-fg-muted")}>{l.currentStep}</dt>
            <dd className="font-semibold text-fg">{stepName}</dd>
          </div>
        ) : null}
        {open && deadline !== undefined ? (
          <div>
            <dt className="sr-only">SLA</dt>
            <dd>
              <SlaCountdown dueAt={deadline} now={now} warnWithinMs={warnWithinMs} labels={l} />
            </dd>
          </div>
        ) : null}
      </dl>
      {steps?.length && showTimeline !== false ? (
        <OperationTimeline steps={steps} now={now} warnWithinMs={warnWithinMs} decisionLabels={decisionLabels} labels={l} />
      ) : null}
      {actions ? <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">{actions}</footer> : null}
    </article>
  );
}
