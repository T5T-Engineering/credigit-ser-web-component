"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "../basic/button";
import { Modal } from "../blocks/modal";
import { cx } from "../../utils/cx";

/** Props for `CodeInput`. */
export type CodeInputProps = {
  /** Number of boxes. Default 6. */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Called once all boxes are filled. */
  onComplete?: (value: string) => void;
  /** Mask characters (transaction PIN). */
  mask?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Accessible group label. Default "Verification code". */
  label?: string;
  /** id of an element describing the input (error text). */
  describedBy?: string;
  autoFocus?: boolean;
  className?: string;
};

/** One-time code / PIN entry as separate digit boxes; supports paste, Backspace and arrow keys. */
export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  mask = false,
  invalid = false,
  disabled = false,
  label = "Verification code",
  describedBy,
  autoFocus = false,
  className,
}: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) refs.current[Math.min(value.length, length - 1)]?.focus();
  }, [autoFocus]);

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const setAt = (i: number, char: string) => {
    const arr = digits.slice();
    arr[i] = char;
    // Keep the code contiguous: everything after a cleared box shifts left.
    return commit(arr.join(""));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const clean = commit((value.slice(0, i) + pasted).slice(0, length));
    focusAt(clean.length);
  };

  return (
    <div role="group" aria-label={label} aria-describedby={describedBy} className={cx("flex justify-center gap-2 sm:gap-3", className)}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type={mask ? "password" : "text"}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, "").slice(-1);
            if (!char) return;
            // Typing into an empty box after a gap fills the first empty slot.
            const target = Math.min(i, value.length);
            setAt(target, char);
            focusAt(target + 1);
          }}
          className={cx(
            "squircle h-14 w-11 rounded-2xl bg-fg/5 text-center font-mono text-2xl font-bold text-fg outline-none sm:w-12",
            "transition-[background-color,box-shadow] duration-150 ease-bolt focus:bg-surface focus:shadow-sm focus:ring-2",
            invalid ? "ring-2 ring-danger focus:ring-danger" : "hover:bg-fg/10 focus:ring-focus",
            disabled && "cursor-not-allowed opacity-50",
          )}
        />
      ))}
    </div>
  );
}

/** Props for `StepUpAuthDialog`. */
export type StepUpAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Verify the code; resolve `true` on success (dialog closes), `false` to show the error. */
  onVerify: (code: string) => Promise<boolean>;
  /** Called after a successful verification. */
  onVerified?: () => void;
  /** Resend the OTP; the resend button is hidden when absent or for `pin`. */
  onResend?: () => void | Promise<void>;
  /** `otp` (sent code) or `pin` (masked transaction PIN). Default `otp`. */
  method?: "otp" | "pin";
  length?: number;
  title?: ReactNode;
  description?: ReactNode;
  /** What is being confirmed, e.g. "Approve ₦480,000,000 term loan". */
  summary?: ReactNode;
  /** Error shown after a failed verification. */
  errorMessage?: string;
  /** Seconds before Resend is enabled again. Default 30. */
  resendCooldown?: number;
  /** Submit automatically when all digits are entered. Default true. */
  autoSubmit?: boolean;
};

/** Re-authentication prompt for high-value approvals: 6-box OTP / PIN entry, resend, error state. UI only. */
export function StepUpAuthDialog({
  open,
  onOpenChange,
  onVerify,
  onVerified,
  onResend,
  method = "otp",
  length = 6,
  title = "Confirm it's you",
  description,
  summary,
  errorMessage = "That code is incorrect or has expired. Try again.",
  resendCooldown = 30,
  autoSubmit = true,
}: StepUpAuthDialogProps) {
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setError(false);
      setResent(false);
      setCooldown(method === "otp" ? resendCooldown : 0);
    }
  }, [open, method, resendCooldown]);

  useEffect(() => {
    if (!open || cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, cooldown]);

  const verify = async (value = code) => {
    if (value.length !== length || verifying) return;
    setVerifying(true);
    setError(false);
    try {
      const ok = await onVerify(value);
      if (ok) {
        onOpenChange(false);
        onVerified?.();
      } else {
        setError(true);
        setCode("");
      }
    } catch {
      setError(true);
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (!onResend) return;
    await onResend();
    setResent(true);
    setError(false);
    setCode("");
    setCooldown(resendCooldown);
  };

  const desc =
    description ??
    (method === "pin" ? `Enter your ${length}-digit transaction PIN to continue.` : `Enter the ${length}-digit code we sent to your registered device.`);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={desc}
      size="small"
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="tertiary" onClick={() => onOpenChange(false)} disabled={verifying}>
            Cancel
          </Button>
          <Button onClick={() => verify()} loading={verifying} disabled={code.length !== length}>
            Verify
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 pt-2">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-accent-tint text-accent-text">
          <ShieldCheck className="size-7" />
        </span>
        {summary ? <div className="squircle w-full rounded-2xl bg-surface-sunken px-4 py-3 text-center text-sm font-semibold text-fg">{summary}</div> : null}
        <CodeInput
          length={length}
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(false);
          }}
          onComplete={autoSubmit ? (v) => void verify(v) : undefined}
          mask={method === "pin"}
          invalid={error}
          disabled={verifying}
          label={method === "pin" ? "Transaction PIN" : "Verification code"}
          describedBy={error ? `${id}-err` : undefined}
        />
        <div aria-live="polite" className="min-h-5 text-center text-sm">
          {error ? (
            <p id={`${id}-err`} className="font-medium text-danger-strong">
              {errorMessage}
            </p>
          ) : resent ? (
            <p className="text-fg-muted">A new code has been sent.</p>
          ) : null}
        </div>
        {method === "otp" && onResend ? (
          <Button variant="text" size="small" onClick={resend} disabled={cooldown > 0 || verifying}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}
