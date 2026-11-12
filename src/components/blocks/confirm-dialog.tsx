"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { Button } from "../basic/button";
import { Field } from "../forms/field";
import { Textarea } from "../forms/textarea";
import { Alert } from "./alert";
import { Modal } from "./modal";

/** Overridable copy of `ConfirmDialog`. */
export type ConfirmDialogLabels = {
  confirm: string;
  cancel: string;
  reason: string;
  reasonTooShort: (min: number) => string;
  reasonRequired: string;
  failed: string;
};

/** Default English copy. */
export const defaultConfirmDialogLabels: ConfirmDialogLabels = {
  confirm: "Confirm",
  cancel: "Cancel",
  reason: "Reason",
  reasonRequired: "Enter a reason.",
  reasonTooShort: (min) => `Enter at least ${min} characters.`,
  failed: "That didn't work. Try again.",
};

/** Props for `ConfirmDialog`. */
export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content between the description and the reason field (e.g. what will change). */
  children?: ReactNode;
  /**
   * Called with the trimmed reason ("" without a reason field). Resolve to close; return / resolve `false`
   * or throw to keep the dialog open (a thrown `Error`'s message, or `labels.failed`, is shown).
   */
  onConfirm: (reason: string) => void | boolean | Promise<void | boolean>;
  /** `danger` uses the danger button (destructive commands). Default `"default"`. */
  tone?: "default" | "danger";
  /** Show a reason field. `"required"` blocks confirming without one. Default none. */
  reason?: "required" | "optional";
  /** Minimum reason length when a reason is entered / required (pass the business-rule value). */
  minReasonLength?: number;
  /** Help text under the reason field (e.g. "Shown to approvers and kept in the audit log"). */
  reasonDescription?: ReactNode;
  /** External error (e.g. the API's problem `detail`). */
  error?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  labels?: Partial<ConfirmDialogLabels>;
  size?: "small" | "medium";
};

/**
 * Confirmation modal for consequential commands (lock, unlock, reset MFA, deactivate, revoke) with an
 * optional or required reason and an async confirm that shows a busy state and keeps the dialog open on failure.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  tone = "default",
  reason,
  minReasonLength = 0,
  reasonDescription,
  error,
  confirmLabel,
  cancelLabel,
  labels: labelsProp,
  size = "small",
}: ConfirmDialogProps) {
  const labels = { ...defaultConfirmDialogLabels, ...labelsProp };
  const id = useId();
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Fresh state every time the dialog opens.
  useEffect(() => {
    if (open) {
      setText("");
      setTouched(false);
      setFailure(null);
      setBusy(false);
    }
  }, [open]);

  const trimmed = text.trim();
  const reasonError = !reason
    ? null
    : reason === "required" && trimmed.length === 0
      ? labels.reasonRequired
      : trimmed.length > 0 && trimmed.length < minReasonLength
        ? labels.reasonTooShort(minReasonLength)
        : null;

  const submit = async () => {
    setTouched(true);
    if (reasonError || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      const result = await onConfirm(reason ? trimmed : "");
      if (result === false) {
        setBusy(false);
        return;
      }
      setBusy(false);
      onOpenChange(false);
    } catch (err) {
      setBusy(false);
      setFailure(err instanceof Error && err.message ? err.message : labels.failed);
    }
  };

  const shownError = error ?? failure;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="tertiary" onClick={() => onOpenChange(false)} disabled={busy}>
            {cancelLabel ?? labels.cancel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} onClick={() => void submit()}>
            {confirmLabel ?? labels.confirm}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {children}
        {reason ? (
          <Field
            label={labels.reason}
            htmlFor={`${id}-reason`}
            required={reason === "required"}
            optional={reason === "optional"}
            description={reasonDescription}
            error={touched ? (reasonError ?? undefined) : undefined}
          >
            <Textarea id={`${id}-reason`} rows={3} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => setTouched(true)} />
          </Field>
        ) : null}
        {shownError ? <Alert tone="danger">{shownError}</Alert> : null}
      </div>
    </Modal>
  );
}
