"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";

import { cx } from "../../utils/cx";
import { CodeInput } from "./step-up-auth-dialog";
import { formatCountdown } from "./session-timeout-dialog";

/** Props for `OtpVerification`. */
export type OtpVerificationProps = Omit<ComponentProps<"div">, "onSubmit"> & {
  /** Where the code was sent, e.g. a masked email "a•••@bank.ng". */
  destination?: ReactNode;
  length?: number;
  /** Resolve `true` when the code is accepted. Rejected codes show `errorMessage`. */
  onVerify: (code: string) => Promise<boolean> | boolean;
  /** Send a new code. */
  onResend?: () => void | Promise<void>;
  /** Seconds before "Resend code" is available again. Default 30. */
  resendCooldown?: number;
  errorMessage?: ReactNode;
  /** Extra content under the input, e.g. a demo-mode code hint. */
  hint?: ReactNode;
  /** Submit label. Default "Verify". */
  submitLabel?: string;
  /** Verify automatically when all digits are entered. Default true. */
  autoSubmit?: boolean;
};

/** Inline one-time-code verification: digit boxes, verify button, resend with cooldown, error state. */
export function OtpVerification({
  destination,
  length = 6,
  onVerify,
  onResend,
  resendCooldown = 30,
  errorMessage = "That code isn't right or has expired. Check it and try again.",
  hint,
  submitLabel = "Verify",
  autoSubmit = true,
  className,
  ...props
}: OtpVerificationProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [cooldown, setCooldown] = useState(resendCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const verify = async (value = code) => {
    if (value.length !== length || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const ok = await onVerify(value);
      if (!ok) {
        setFailed(true);
        setCode("");
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setFailed(false);
    setCode("");
    setCooldown(resendCooldown);
    await onResend?.();
  };

  return (
    <div className={cx("flex flex-col items-center gap-5", className)} {...props}>
      {destination ? (
        <p className="m-0 text-center text-sm text-fg-muted">
          We sent a {length}-digit code to <span className="font-semibold text-fg">{destination}</span>
        </p>
      ) : null}
      <CodeInput length={length} value={code} onChange={(v) => { setCode(v); setFailed(false); }} onComplete={autoSubmit ? (v) => void verify(v) : undefined} invalid={failed} disabled={busy} autoFocus />
      {failed ? (
        <p role="alert" className="m-0 flex items-center gap-2 text-sm font-medium text-danger-strong">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {errorMessage}
        </p>
      ) : null}
      {hint ? <div className="w-full">{hint}</div> : null}
      <button
        type="button"
        onClick={() => void verify()}
        disabled={code.length !== length || busy}
        className="squircle inline-flex h-control-lg w-full cursor-pointer items-center justify-center rounded-full bg-action px-6 text-lg font-semibold text-on-action transition-[background-color,transform] duration-150 ease-bolt hover:bg-action-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50"
      >
        {busy ? "Verifying…" : submitLabel}
      </button>
      {onResend ? (
        <p className="m-0 text-sm text-fg-muted">
          Didn&apos;t get it?{" "}
          {cooldown > 0 ? (
            <span>
              Resend in <span className="font-mono">{formatCountdown(cooldown)}</span>
            </span>
          ) : (
            <button type="button" onClick={() => void resend()} className="cursor-pointer rounded-full font-semibold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              Resend code
            </button>
          )}
        </p>
      ) : null}
    </div>
  );
}
