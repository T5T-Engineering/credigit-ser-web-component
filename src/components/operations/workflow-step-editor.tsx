"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { Badge } from "../basic/badge";
import { Button } from "../basic/button";
import { IconButton } from "../basic/icon-button";
import { SegmentedControl } from "../basic/segmented-control";
import { Field } from "../forms/field";
import { Input } from "../forms/input";
import { Select } from "../forms/select";
import { cx } from "../../utils/cx";
import { createLocalId, labelText, moveItem, optionLabel } from "./ops-utils";
import { RoleMultiSelect, type MultiSelectOption } from "./role-multi-select";

/** How the approvers of a step decide: any one of them, or all of them (co-sign). */
export type WorkflowStepMode = "any" | "all";

/** One step of an Operations workflow definition. */
export type WorkflowStep = {
  id: string;
  name: string;
  /** Roles allowed to act on the step (values of `roleOptions`). */
  approverRoles: string[];
  mode: WorkflowStepMode;
  /** Service level in hours (from the workflow definition / business rules). */
  slaHours: number;
  /** Optional rule expression that decides whether the step applies, e.g. `amount > rule('credit.tier2.limit')`. */
  condition?: string;
  /** Role resolving dissent between co-signers (mode "all"). */
  adjudicatorRole?: string;
  /** Roles / channels notified when the step starts. */
  notify?: string[];
};

/** Validation errors of one step. */
export type WorkflowStepErrors = Partial<Record<"name" | "approverRoles" | "slaHours", string>>;

/** Validation messages (i18n). */
export type WorkflowStepMessages = { name: string; approverRoles: string; slaHours: string };

const defaultMessages: WorkflowStepMessages = {
  name: "Step name is required",
  approverRoles: "Choose at least one approver role",
  slaHours: "SLA must be greater than 0 hours",
};

/** Validate one step: name required, at least one approver role, SLA > 0. */
export function validateWorkflowStep(step: WorkflowStep, messages: Partial<WorkflowStepMessages> = {}): WorkflowStepErrors {
  const m = { ...defaultMessages, ...messages };
  const errors: WorkflowStepErrors = {};
  if (step.name.trim() === "") errors.name = m.name;
  if (step.approverRoles.length === 0) errors.approverRoles = m.approverRoles;
  if (!Number.isFinite(step.slaHours) || step.slaHours <= 0) errors.slaHours = m.slaHours;
  return errors;
}

/** Validate all steps; returns errors keyed by step id (steps without errors are omitted). */
export function validateWorkflowSteps(steps: WorkflowStep[], messages?: Partial<WorkflowStepMessages>): Record<string, WorkflowStepErrors> {
  const result: Record<string, WorkflowStepErrors> = {};
  for (const step of steps) {
    const e = validateWorkflowStep(step, messages);
    if (Object.keys(e).length > 0) result[step.id] = e;
  }
  return result;
}

/** Move a step (new array); out-of-range moves are ignored. */
export function moveWorkflowStep(steps: WorkflowStep[], from: number, to: number): WorkflowStep[] {
  return moveItem(steps, from, to);
}

/** Labels of the step editor (i18n). */
export type WorkflowStepEditorLabels = {
  step: (n: number) => string;
  name: string;
  approverRoles: string;
  mode: string;
  modeAny: string;
  modeAll: string;
  slaHours: string;
  hoursSuffix: string;
  condition: string;
  conditionDescription: string;
  adjudicatorRole: string;
  adjudicatorNone: string;
  notify: string;
  addStep: string;
  moveUp: (name: string) => string;
  moveDown: (name: string) => string;
  remove: (name: string) => string;
  moved: (name: string, position: number, total: number) => string;
  removed: (name: string) => string;
  added: (position: number) => string;
  untitled: string;
  reorderHint: string;
  empty: string;
};

const defaultLabels: WorkflowStepEditorLabels = {
  step: (n) => `Step ${n}`,
  name: "Step name",
  approverRoles: "Approver roles",
  mode: "Decision",
  modeAny: "Any of",
  modeAll: "All of (co-sign)",
  slaHours: "SLA",
  hoursSuffix: "hours",
  condition: "Condition",
  conditionDescription: "Optional rule expression; the step is skipped when it is false.",
  adjudicatorRole: "Adjudicator (on dissent)",
  adjudicatorNone: "None",
  notify: "Notify",
  addStep: "Add step",
  moveUp: (name) => `Move ${name} up`,
  moveDown: (name) => `Move ${name} down`,
  remove: (name) => `Remove ${name}`,
  moved: (name, p, t) => `${name} moved to position ${p} of ${t}`,
  removed: (name) => `${name} removed`,
  added: (p) => `Step ${p} added`,
  untitled: "untitled step",
  reorderHint: "Alt + Arrow Up / Down moves the step.",
  empty: "No steps yet.",
};

/** Props for `WorkflowStepEditor`. */
export type WorkflowStepEditorProps = Omit<ComponentProps<"div">, "onChange" | "children"> & {
  steps: WorkflowStep[];
  onChange?: (steps: WorkflowStep[]) => void;
  /** Roles that can approve / adjudicate (from tenant configuration). */
  roleOptions: MultiSelectOption[];
  /** Recipients for "Notify" (default `roleOptions`). */
  notifyOptions?: MultiSelectOption[];
  /** Render values only, no editing. */
  readOnly?: boolean;
  /** Factory for new steps (default: empty name, no roles, mode "any", `defaultSlaHours`). */
  createStep?: () => WorkflowStep;
  /** SLA of new steps when `createStep` is not given. Default 0 (must be set by the user). */
  defaultSlaHours?: number;
  /** Show every validation error immediately (e.g. after a submit attempt). Default: after a field is touched. */
  showErrors?: boolean;
  /** Called with the validation result whenever steps change. */
  onValidityChange?: (valid: boolean, errors: Record<string, WorkflowStepErrors>) => void;
  /** Minimum number of steps (remove is disabled at this count). Default 1. */
  minSteps?: number;
  /** Maximum number of steps (add is hidden at this count). */
  maxSteps?: number;
  /** Show the condition field (default true). */
  showCondition?: boolean;
  /** Enable HTML drag & drop on the grip handle (default true; buttons and Alt+Arrow keys always work). */
  draggable?: boolean;
  labels?: Partial<WorkflowStepEditorLabels>;
  messages?: Partial<WorkflowStepMessages>;
};

type TouchedKey = `${string}:${keyof WorkflowStepErrors}`;

/**
 * Ordered list editor for workflow steps: name, approver roles (toggle pills), Any / All (co-sign) mode,
 * SLA hours, optional condition, adjudicator role and notify recipients. Add, remove and reorder with
 * buttons, Alt+Arrow keys or drag & drop; inline validation; announcements via a polite live region.
 */
export function WorkflowStepEditor({
  steps,
  onChange,
  roleOptions,
  notifyOptions,
  readOnly = false,
  createStep,
  defaultSlaHours = 0,
  showErrors = false,
  onValidityChange,
  minSteps = 1,
  maxSteps,
  showCondition = true,
  draggable = true,
  labels,
  messages,
  className,
  ...props
}: WorkflowStepEditorProps) {
  const l = { ...defaultLabels, ...labels };
  const hintId = `cg-wse-hint-${useId()}`;
  const [slaDrafts, setSlaDrafts] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<TouchedKey>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const pendingFocus = useRef<{ id: string; control: "up" | "down" | "name" | "card" } | null>(null);
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const errors = validateWorkflowSteps(steps, messages);
  const errorKey = JSON.stringify(errors);

  useEffect(() => {
    onValidityChange?.(Object.keys(errors).length === 0, errors);
    // errors is derived from steps; compared by value via errorKey.
  }, [errorKey]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const card = cardRefs.current.get(target.id);
    if (!card) return;
    const el =
      target.control === "card"
        ? card
        : card.querySelector<HTMLElement>(`[data-control="${target.control}"]:not(:disabled)`) ?? card.querySelector<HTMLElement>('[data-control="card-focus"]') ?? card;
    el.focus();
  });

  const nameOf = (s: WorkflowStep) => (s.name.trim() === "" ? l.untitled : s.name);
  const update = (id: string, patch: Partial<WorkflowStep>, field?: keyof WorkflowStepErrors) => {
    if (field) setTouched((t) => new Set(t).add(`${id}:${field}`));
    onChange?.(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const touch = (id: string, field: keyof WorkflowStepErrors) => setTouched((t) => new Set(t).add(`${id}:${field}`));
  const errorFor = (id: string, field: keyof WorkflowStepErrors) =>
    showErrors || touched.has(`${id}:${field}`) ? errors[id]?.[field] : undefined;

  const move = (index: number, to: number, control: "up" | "down" | "card") => {
    const step = steps[index];
    if (!step || to < 0 || to >= steps.length) return;
    pendingFocus.current = { id: step.id, control };
    onChange?.(moveWorkflowStep(steps, index, to));
    setAnnouncement(l.moved(nameOf(step), to + 1, steps.length));
  };
  const remove = (index: number) => {
    const step = steps[index];
    if (!step || steps.length <= minSteps) return;
    const neighbour = steps[index + 1] ?? steps[index - 1];
    if (neighbour) pendingFocus.current = { id: neighbour.id, control: "card" };
    onChange?.(steps.filter((s) => s.id !== step.id));
    setAnnouncement(l.removed(nameOf(step)));
  };
  const add = () => {
    const step = createStep?.() ?? { id: createLocalId("step"), name: "", approverRoles: [], mode: "any" as const, slaHours: defaultSlaHours };
    pendingFocus.current = { id: step.id, control: "name" };
    onChange?.([...steps, step]);
    setAnnouncement(l.added(steps.length + 1));
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    if (readOnly || !event.altKey) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(index, index - 1, "card");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(index, index + 1, "card");
    }
  };

  const notify = notifyOptions ?? roleOptions;
  const canAdd = !readOnly && (maxSteps === undefined || steps.length < maxSteps);

  return (
    <div className={cx("flex flex-col gap-4", className)} {...props}>
      {!readOnly ? <p className="sr-only" id={hintId}>{l.reorderHint}</p> : null}
      {steps.length === 0 ? <p className="squircle rounded-3xl border border-dashed border-line-strong p-5 text-sm text-fg-muted">{l.empty}</p> : null}
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => {
          const title = l.step(index + 1);
          const headingId = `cg-wse-${step.id}-title`;
          return (
            <li
              key={step.id}
              ref={(el) => {
                if (el) cardRefs.current.set(step.id, el);
                else cardRefs.current.delete(step.id);
              }}
              tabIndex={-1}
              aria-labelledby={headingId}
              aria-describedby={readOnly ? undefined : hintId}
              onKeyDown={(e) => onCardKeyDown(e, index)}
              onDragOver={(e) => {
                if (!dragId || readOnly) return;
                e.preventDefault();
                setOverId(step.id);
              }}
              onDragLeave={() => setOverId((o) => (o === step.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const from = steps.findIndex((s) => s.id === dragId);
                setDragId(null);
                setOverId(null);
                if (from >= 0) move(from, index, "card");
              }}
              data-step-id={step.id}
              className={cx(
                "squircle relative flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:p-5",
                overId === step.id && dragId !== step.id && "ring-2 ring-accent-500/50",
                dragId === step.id && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                {!readOnly && draggable ? (
                  <span
                    draggable
                    onDragStart={(e) => {
                      setDragId(step.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", step.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    aria-hidden="true"
                    className="-ml-1 cursor-grab text-fg-subtle active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </span>
                ) : null}
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-emphasis font-mono text-sm font-bold text-on-emphasis">
                  {index + 1}
                </span>
                <h3 id={headingId} className="min-w-0 flex-1 truncate font-display text-base font-bold text-fg">
                  <span className="sr-only">{title}: </span>
                  {step.name.trim() === "" ? <span className="text-fg-subtle">{title}</span> : step.name}
                </h3>
                <Badge tone={step.mode === "all" ? "brand" : "neutral"}>{step.mode === "all" ? l.modeAll : l.modeAny}</Badge>
                {!readOnly ? (
                  <div className="flex items-center gap-1">
                    <IconButton
                      size="small"
                      variant="text"
                      data-control="up"
                      label={l.moveUp(nameOf(step))}
                      icon={<ArrowUp className="size-4" />}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1, index - 1 === 0 ? "down" : "up")}
                    />
                    <IconButton
                      size="small"
                      variant="text"
                      data-control="down"
                      label={l.moveDown(nameOf(step))}
                      icon={<ArrowDown className="size-4" />}
                      disabled={index === steps.length - 1}
                      onClick={() => move(index, index + 1, index + 1 === steps.length - 1 ? "up" : "down")}
                    />
                    <IconButton
                      size="small"
                      variant="text"
                      label={l.remove(nameOf(step))}
                      icon={<Trash2 className="size-4" />}
                      disabled={steps.length <= minSteps}
                      onClick={() => remove(index)}
                    />
                  </div>
                ) : null}
              </div>

              {readOnly ? (
                <ReadOnlyStep step={step} roleOptions={roleOptions} notifyOptions={notify} labels={l} />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={l.name} required error={errorFor(step.id, "name")}>
                    <Input
                      data-control="name"
                      value={step.name}
                      onChange={(e) => update(step.id, { name: e.target.value }, "name")}
                      onBlur={() => touch(step.id, "name")}
                    />
                  </Field>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <Field label={l.slaHours} required error={errorFor(step.id, "slaHours")}>
                      <Input
                        inputMode="decimal"
                        numeric
                        suffix={l.hoursSuffix}
                        value={slaDrafts[step.id] ?? (Number.isFinite(step.slaHours) && step.slaHours !== 0 ? String(step.slaHours) : "")}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setSlaDrafts((d) => ({ ...d, [step.id]: raw }));
                          const n = raw.trim() === "" ? 0 : /^\d*\.?\d*$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN;
                          update(step.id, { slaHours: n }, "slaHours");
                        }}
                        onBlur={() => touch(step.id, "slaHours")}
                      />
                    </Field>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-fg">
                        {l.mode}
                      </span>
                      <SegmentedControl
                        size="small"
                        label={`${l.mode}: ${nameOf(step)}`}
                        value={step.mode}
                        onChange={(mode) => update(step.id, { mode, adjudicatorRole: mode === "any" ? undefined : step.adjudicatorRole })}
                        options={[
                          { value: "any", label: l.modeAny },
                          { value: "all", label: l.modeAll },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-semibold text-fg">
                      {l.approverRoles}
                      <span aria-hidden="true" className="ml-0.5 text-danger-strong">
                        *
                      </span>
                    </span>
                    <RoleMultiSelect
                      label={`${l.approverRoles}: ${nameOf(step)}`}
                      options={roleOptions}
                      value={step.approverRoles}
                      invalid={Boolean(errorFor(step.id, "approverRoles"))}
                      aria-describedby={errorFor(step.id, "approverRoles") ? `cg-wse-${step.id}-roles-error` : undefined}
                      onChange={(approverRoles) => update(step.id, { approverRoles }, "approverRoles")}
                    />
                    {errorFor(step.id, "approverRoles") ? (
                      <p id={`cg-wse-${step.id}-roles-error`} role="alert" className="text-sm text-danger-strong">
                        {errorFor(step.id, "approverRoles")}
                      </p>
                    ) : null}
                  </div>
                  {step.mode === "all" ? (
                    <Field label={l.adjudicatorRole} optional>
                      <Select
                        value={step.adjudicatorRole ?? ""}
                        onChange={(e) => update(step.id, { adjudicatorRole: e.target.value === "" ? undefined : e.target.value })}
                        options={[{ value: "", label: l.adjudicatorNone }, ...roleOptions.map((o) => ({ value: o.value, label: o.label, disabled: o.disabled }))]}
                      />
                    </Field>
                  ) : null}
                  {showCondition ? (
                    <Field label={l.condition} optional description={l.conditionDescription} className={step.mode === "all" ? undefined : "md:col-span-2"}>
                      <Input
                        value={step.condition ?? ""}
                        inputClassName="font-code text-sm"
                        spellCheck={false}
                        onChange={(e) => update(step.id, { condition: e.target.value === "" ? undefined : e.target.value })}
                      />
                    </Field>
                  ) : null}
                  {notify.length > 0 ? (
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-semibold text-fg">{l.notify}</span>
                      <RoleMultiSelect
                        size="small"
                        label={`${l.notify}: ${nameOf(step)}`}
                        options={notify}
                        value={step.notify ?? []}
                        onChange={(next) => update(step.id, { notify: next.length ? next : undefined })}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {canAdd ? (
        <div>
          <Button variant="tertiary" iconBefore={<Plus className="size-4" />} onClick={add}>
            {l.addStep}
          </Button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

function ReadOnlyStep({
  step,
  roleOptions,
  notifyOptions,
  labels: l,
}: {
  step: WorkflowStep;
  roleOptions: MultiSelectOption[];
  notifyOptions: MultiSelectOption[];
  labels: WorkflowStepEditorLabels;
}) {
  const row = (label: string, value: ReactNode) => (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className={cx(labelText, "text-fg-muted")}>{label}</dt>
      <dd className="text-sm text-fg">{value}</dd>
    </div>
  );
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {row(l.approverRoles, step.approverRoles.map((r) => optionLabel(roleOptions, r)).join(", ") || "—")}
      {row(l.slaHours, <span className="font-mono tabular-nums">{`${step.slaHours} ${l.hoursSuffix}`}</span>)}
      {step.mode === "all" && step.adjudicatorRole ? row(l.adjudicatorRole, optionLabel(roleOptions, step.adjudicatorRole)) : null}
      {step.condition ? row(l.condition, <code className="font-code text-xs break-all">{step.condition}</code>) : null}
      {step.notify?.length ? row(l.notify, step.notify.map((r) => optionLabel(notifyOptions, r)).join(", ")) : null}
    </dl>
  );
}
