"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Save } from "lucide-react";

import { Button } from "../basic/button";
import { cx } from "../../utils/cx";
import { focusRing } from "./app-utils";

/** Result of a step validation: `true` passes; `false` or a message blocks navigation. */
export type WizardValidationResult = boolean | string | undefined | void;

/** One wizard step. */
export type WizardStep = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Step body (form fields). */
  content: ReactNode;
  /** Marks the step optional in the stepper. */
  optional?: boolean;
  /** Force a status (e.g. restored draft): complete or error. */
  status?: "complete" | "error";
  /** Validation run before leaving the step forwards. */
  validate?: () => WizardValidationResult | Promise<WizardValidationResult>;
};

/** Props for `Wizard`. */
export type WizardProps = Omit<ComponentProps<"div">, "onSubmit" | "title"> & {
  steps: WizardStep[];
  /** Controlled current step id. */
  step?: string;
  /** Initial step id (uncontrolled). */
  defaultStep?: string;
  onStepChange?: (id: string) => void;
  /** Global per-step validation (runs after the step's own `validate`). */
  validateStep?: (id: string) => WizardValidationResult | Promise<WizardValidationResult>;
  /** Final submit (from the last step). */
  onSubmit: () => void | Promise<void>;
  /** Save draft action; renders the button when set. */
  onSaveDraft?: (currentStepId: string) => void | Promise<void>;
  /** Review/summary content appended as the last step. */
  summary?: ReactNode;
  /** Title of the summary step. Default "Review & submit". */
  summaryTitle?: ReactNode;
  /** Allow clicking any visited step in the stepper. Default true. */
  allowStepNavigation?: boolean;
  /** Submitting state (spinner on Submit). */
  submitting?: boolean;
  /**
   * Stepper layout. `"auto"` (default): full pills (number + title) while they fit, otherwise compact number-only pills
   * with the current step's title (titles stay available as tooltips and to screen readers). The stepper also scrolls
   * horizontally rather than widening the page. `"full"` / `"compact"` force a layout.
   */
  stepperLayout?: "auto" | "full" | "compact";
  /** Labels (i18n). */
  labels?: { back?: string; next?: string; submit?: string; saveDraft?: string; optional?: string; stepOf?: (n: number, total: number) => string; error?: string };
};

type Status = "complete" | "current" | "upcoming" | "error";

/**
 * Multi-step form container: stepper with complete/error states, progress, Back / Next / Submit,
 * per-step validation (sync or async), save-draft and an optional summary step.
 */
export function Wizard({
  steps: stepsProp,
  step: stepProp,
  defaultStep,
  onStepChange,
  validateStep,
  onSubmit,
  onSaveDraft,
  summary,
  summaryTitle = "Review & submit",
  allowStepNavigation = true,
  submitting = false,
  labels = {},
  stepperLayout = "auto",
  className,
  ...props
}: WizardProps) {
  const id = useId();
  const steps: WizardStep[] = summary !== undefined ? [...stepsProp, { id: "__summary", title: summaryTitle, content: summary }] : stepsProp;
  const [inner, setInner] = useState(defaultStep ?? steps[0]?.id ?? "");
  const currentId = stepProp ?? inner;
  const index = Math.max(0, steps.findIndex((s) => s.id === currentId));
  const current = steps[index];
  const [visited, setVisited] = useState<Set<string>>(() => new Set([currentId]));
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"next" | "draft" | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStep = useRef(currentId);
  const last = index === steps.length - 1;
  const stepperRef = useRef<HTMLOListElement>(null);
  const fullWidthNeeded = useRef(0);
  const [autoCompact, setAutoCompact] = useState(false);
  const compactRef = useRef(false);
  compactRef.current = autoCompact;
  const compact = stepperLayout === "compact" || (stepperLayout === "auto" && autoCompact);
  const titleKey = steps.map((s) => (typeof s.title === "string" ? s.title : s.id)).join("|");

  // Auto layout: remember how wide the full stepper is and switch to compact pills when it doesn't fit.
  const measuredKey = useRef<string | null>(null);
  useEffect(() => {
    const el = stepperRef.current;
    if (stepperLayout !== "auto" || !el) return;
    // Steps changed while compact: render the full stepper first, then measure it (this effect re-runs).
    if (autoCompact && measuredKey.current !== titleKey) {
      setAutoCompact(false);
      return;
    }
    const measure = () => {
      if (!compactRef.current) {
        fullWidthNeeded.current = el.scrollWidth;
        measuredKey.current = titleKey;
      }
      const next = fullWidthNeeded.current > el.clientWidth + 1;
      if (next !== compactRef.current) {
        compactRef.current = next;
        setAutoCompact(next);
      }
    };
    measure();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [stepperLayout, titleKey, autoCompact]);

  // Keep the current step visible when the stepper scrolls.
  useEffect(() => {
    const item = stepperRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if (item && typeof item.scrollIntoView === "function") item.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index, compact]);

  const L = {
    back: labels.back ?? "Back",
    next: labels.next ?? "Next",
    submit: labels.submit ?? "Submit",
    saveDraft: labels.saveDraft ?? "Save draft",
    optional: labels.optional ?? "Optional",
    stepOf: labels.stepOf ?? ((n: number, t: number) => `Step ${n} of ${t}`),
    error: labels.error ?? "Please fix the issues on this step before continuing.",
  };

  useEffect(() => {
    // Move focus to the new step heading only when the step actually changes (not on mount).
    if (prevStep.current === currentId) return;
    prevStep.current = currentId;
    headingRef.current?.focus();
    setVisited((v) => (v.has(currentId) ? v : new Set(v).add(currentId)));
  }, [currentId]);

  const goTo = (target: string) => {
    if (stepProp === undefined) setInner(target);
    onStepChange?.(target);
  };

  const runValidation = async (step: WizardStep): Promise<string | null> => {
    for (const fn of [step.validate, validateStep ? () => validateStep(step.id) : undefined]) {
      if (!fn) continue;
      const result = await fn();
      if (result === false) return L.error;
      if (typeof result === "string" && result) return result;
    }
    return null;
  };

  const next = async () => {
    if (!current) return;
    setBusy("next");
    try {
      const error = await runValidation(current);
      if (error) {
        setErrors((e) => ({ ...e, [current.id]: error }));
        return;
      }
      setErrors((e) => {
        const copy = { ...e };
        delete copy[current.id];
        return copy;
      });
      setCompleted((c) => new Set(c).add(current.id));
      if (last) await onSubmit();
      else {
        const target = steps[index + 1];
        if (target) goTo(target.id);
      }
    } finally {
      setBusy(null);
    }
  };

  const back = () => {
    const target = steps[index - 1];
    if (target) goTo(target.id);
  };

  const saveDraft = async () => {
    if (!onSaveDraft || !current) return;
    setBusy("draft");
    try {
      await onSaveDraft(current.id);
    } finally {
      setBusy(null);
    }
  };

  const statusOf = (s: WizardStep, i: number): Status => {
    if (errors[s.id] || s.status === "error") return "error";
    if (i === index) return "current";
    if (completed.has(s.id) || s.status === "complete") return "complete";
    return "upcoming";
  };

  const canJump = (s: WizardStep, i: number) =>
    allowStepNavigation && i !== index && (i < index || visited.has(s.id) || completed.has(s.id) || s.status === "complete");

  const progress = steps.length > 1 ? index / (steps.length - 1) : 1;
  const currentError = current ? errors[current.id] : undefined;

  return (
    <div className={cx("flex min-w-0 flex-col gap-6", className)} {...props}>
      <nav aria-label="Progress" className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">{L.stepOf(index + 1, steps.length)}</p>
          <p className="font-mono text-xs text-fg-muted">{Math.round(progress * 100)}%</p>
        </div>
        <div
          role="progressbar"
          aria-label="Wizard progress"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          aria-valuetext={L.stepOf(index + 1, steps.length)}
          className="h-1.5 overflow-hidden rounded-full bg-fg/10"
        >
          <div className="h-full rounded-full bg-action transition-[width] duration-300 ease-bolt" style={{ width: `${Math.max(progress, 0.02) * 100}%` }} />
        </div>
        <ol ref={stepperRef} data-layout={compact ? "compact" : "full"} className={cx("relative flex min-w-0 overflow-x-auto pb-1", compact ? "gap-1" : "gap-2")}>
          {steps.map((s, i) => {
            const status = statusOf(s, i);
            const jump = canJump(s, i);
            const marker = (
              <span
                aria-hidden="true"
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold",
                  status === "current" && "bg-emphasis text-on-emphasis",
                  status === "complete" && "bg-success-soft text-success-strong",
                  status === "error" && "bg-danger-soft text-danger-strong",
                  status === "upcoming" && "bg-fg/5 text-fg-muted",
                )}
              >
                {status === "complete" ? <Check className="size-4" /> : status === "error" ? <CircleAlert className="size-4" /> : i + 1}
              </span>
            );
            const showText = !compact || i === index;
            const text = !showText ? (
              <span className="sr-only">{s.title}</span>
            ) : (
              <span className="flex min-w-0 flex-col text-left leading-tight">
                <span className={cx("truncate text-sm font-semibold", status === "upcoming" ? "text-fg-muted" : "text-fg")}>{s.title}</span>
                {s.optional ? <span className="text-xs text-fg-muted">{L.optional}</span> : null}
              </span>
            );
            const srStatus = <span className="sr-only">{status === "complete" ? " (completed)" : status === "error" ? " (has errors)" : status === "current" ? " (current)" : ""}</span>;
            const cls = cx(
              "squircle flex max-w-56 min-w-0 shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5",
              showText ? "pr-4" : "pr-1.5",
              status === "current" ? "bg-fg/5" : "",
            );
            const tip = !showText && typeof s.title === "string" ? s.title : undefined;
            return (
              <li key={s.id} aria-current={i === index ? "step" : undefined} className="flex shrink-0">
                {jump ? (
                  <button type="button" title={tip} onClick={() => goTo(s.id)} className={cx(cls, "cursor-pointer transition-colors hover:bg-fg/5", focusRing)}>
                    {marker}
                    {text}
                    {srStatus}
                  </button>
                ) : (
                  <span className={cls} title={tip}>
                    {marker}
                    {text}
                    {srStatus}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {current ? (
        <section aria-labelledby={`${id}-title`} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1} className="font-display text-subtitle font-bold tracking-tight text-fg focus:outline-none">
              {current.title}
            </h2>
            {current.description ? <p className="text-base text-fg-muted">{current.description}</p> : null}
          </div>
          {currentError ? (
            <div role="alert" className="squircle flex items-start gap-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger-strong">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{currentError}</span>
            </div>
          ) : null}
          <div>{current.content}</div>
        </section>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          {index > 0 ? (
            <Button variant="tertiary" iconBefore={<ArrowLeft className="size-4" />} onClick={back} disabled={busy !== null || submitting}>
              {L.back}
            </Button>
          ) : null}
          {onSaveDraft ? (
            <Button variant="text" iconBefore={<Save className="size-4" />} onClick={saveDraft} loading={busy === "draft"} disabled={busy === "next" || submitting}>
              {L.saveDraft}
            </Button>
          ) : null}
        </div>
        <div className="sm:ml-auto">
          <Button
            variant="primary"
            fullWidth
            className="sm:w-auto"
            iconAfter={last ? undefined : <ArrowRight className="size-4" />}
            onClick={next}
            loading={busy === "next" || (last && submitting)}
          >
            {last ? L.submit : L.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
