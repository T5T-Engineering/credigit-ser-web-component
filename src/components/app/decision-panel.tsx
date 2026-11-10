"use client";

import { useId, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { CircleCheck, CircleX, ShieldCheck, ThumbsUp, Undo2 } from "lucide-react";

import { Button, type ButtonVariant } from "../basic/button";
import { Field } from "../forms/field";
import { Textarea } from "../forms/textarea";
import { cx } from "../../utils/cx";
import { labelText } from "./app-utils";

/** Actions an approver can take. */
export type DecisionAction = "approve" | "decline" | "recommend" | "return";

/** Submitted decision. */
export type DecisionSubmission = { decision: DecisionAction; comment: string };

const meta: Record<DecisionAction, { label: string; verb: string; icon: typeof CircleCheck; variant: ButtonVariant; selected: string }> = {
  approve: { label: "Approve", verb: "approve", icon: CircleCheck, variant: "primary", selected: "bg-success-soft text-success-strong ring-2 ring-success" },
  recommend: { label: "Recommend", verb: "recommend", icon: ThumbsUp, variant: "primary", selected: "bg-info-soft text-info-strong ring-2 ring-info" },
  return: { label: "Return for rework", verb: "return this for rework", icon: Undo2, variant: "secondary", selected: "bg-warning-soft text-warning-strong ring-2 ring-warning" },
  decline: { label: "Decline", verb: "decline", icon: CircleX, variant: "danger", selected: "bg-danger-soft text-danger-strong ring-2 ring-danger" },
};

/** Props for `DecisionPanel`. */
export type DecisionPanelProps = Omit<ComponentProps<"form">, "onSubmit" | "title"> & {
  /** Offered actions, in order. Default approve, recommend, return, decline. */
  actions?: DecisionAction[];
  /** Called after validation (and step-up, if required). */
  onDecide: (submission: DecisionSubmission) => void | Promise<void>;
  /** Comment required for which actions. Default `true` (all). */
  commentRequired?: boolean | DecisionAction[];
  /** Minimum trimmed comment length when required. Default 1. */
  minCommentLength?: number;
  /** Whether a decision needs step-up re-authentication. */
  requireStepUp?: boolean | ((decision: DecisionAction) => boolean);
  /** Step-up hook (e.g. opens `StepUpAuthDialog`); resolve `true` to proceed. */
  onStepUp?: (decision: DecisionAction) => Promise<boolean>;
  /** Heading. Default "Your decision". */
  title?: ReactNode;
  /** Context above the actions (e.g. limit / authority notice). */
  notice?: ReactNode;
  /** Label overrides per action. */
  actionLabels?: Partial<Record<DecisionAction, string>>;
  /** Initial action. */
  defaultDecision?: DecisionAction;
  disabled?: boolean;
};

/**
 * Approver decision form: approve / recommend / return for rework / decline, a mandatory comment,
 * and an optional step-up confirmation hook before the decision is recorded.
 */
export function DecisionPanel({
  actions = ["approve", "recommend", "return", "decline"],
  onDecide,
  commentRequired = true,
  minCommentLength = 1,
  requireStepUp = false,
  onStepUp,
  title = "Your decision",
  notice,
  actionLabels = {},
  defaultDecision,
  disabled = false,
  className,
  ...props
}: DecisionPanelProps) {
  const id = useId();
  const [decision, setDecision] = useState<DecisionAction | undefined>(defaultDecision);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const labelOf = (a: DecisionAction) => actionLabels[a] ?? meta[a].label;
  const needsComment = (a: DecisionAction) => (Array.isArray(commentRequired) ? commentRequired.includes(a) : commentRequired);
  const needsStepUp = (a: DecisionAction) => (typeof requireStepUp === "function" ? requireStepUp(a) : requireStepUp);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!decision) {
      setChoiceError("Choose a decision.");
      return;
    }
    if (needsComment(decision) && comment.trim().length < minCommentLength) {
      setError(
        minCommentLength > 1
          ? `A comment of at least ${minCommentLength} characters is required to ${meta[decision].verb}.`
          : `A comment is required to ${meta[decision].verb}.`,
      );
      document.getElementById(`${id}-comment`)?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (needsStepUp(decision) && onStepUp) {
        const ok = await onStepUp(decision);
        if (!ok) return;
      }
      await onDecide({ decision, comment: comment.trim() });
    } finally {
      setBusy(false);
    }
  };

  const required = decision ? needsComment(decision) : commentRequired === true;
  const stepUp = decision ? needsStepUp(decision) && Boolean(onStepUp) : false;

  return (
    <form noValidate onSubmit={submit} className={cx("squircle flex flex-col gap-5 rounded-3xl bg-surface-sunken p-5 sm:p-6", className)} {...props}>
      <fieldset className="flex flex-col gap-3" disabled={disabled || busy} aria-describedby={choiceError ? `${id}-choice-err` : undefined}>
        <legend className="mb-3 font-display text-subtitle font-bold tracking-tight text-fg">{title}</legend>
        {notice ? <div className="text-sm text-fg-muted">{notice}</div> : null}
        <div role="radiogroup" aria-label="Decision" className="flex flex-wrap gap-2">
          {actions.map((a) => {
            const Icon = meta[a].icon;
            const selected = a === decision;
            return (
              <label
                key={a}
                className={cx(
                  "squircle relative inline-flex h-control-md cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-150 ease-bolt has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  selected ? meta[a].selected : "bg-surface text-fg shadow-sm hover:bg-fg/5",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-decision`}
                  value={a}
                  checked={selected}
                  onChange={() => {
                    setDecision(a);
                    setChoiceError(null);
                  }}
                  className="sr-only"
                />
                <Icon aria-hidden="true" className="size-4" />
                {labelOf(a)}
              </label>
            );
          })}
        </div>
        {choiceError ? (
          <p id={`${id}-choice-err`} className="text-sm font-medium text-danger-strong">
            {choiceError}
          </p>
        ) : null}
      </fieldset>
      <Field label="Comment" htmlFor={`${id}-comment`} required={required} error={error ?? undefined} description="Recorded in the approval history and audit log.">
        <Textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (error) setError(null);
          }}
          rows={4}
          autoResize
          disabled={disabled || busy}
          placeholder="State the basis for your decision…"
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {stepUp ? (
          <p className={cx(labelText, "flex items-center gap-1.5 text-fg-muted")}>
            <ShieldCheck aria-hidden="true" className="size-4" />
            Re-authentication required
          </p>
        ) : (
          <span />
        )}
        <Button type="submit" variant={decision ? meta[decision].variant : "primary"} loading={busy} disabled={disabled}>
          {decision ? `Submit: ${labelOf(decision)}` : "Submit decision"}
        </Button>
      </div>
    </form>
  );
}
