"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Clock } from "lucide-react";

import { Button } from "../basic/button";
import { Modal } from "../blocks/modal";

/** Props for `SessionTimeoutDialog`. */
export type SessionTimeoutDialogProps = {
  open: boolean;
  /** Seconds left when the dialog opens. Default 120. Ignored when `expiresAt` is set. */
  secondsRemaining?: number;
  /** Absolute expiry (ms epoch or Date); the countdown follows the clock. */
  expiresAt?: number | Date;
  onStaySignedIn: () => void;
  onSignOut: () => void;
  /** Called once when the countdown reaches zero (default: `onSignOut`). */
  onTimeout?: () => void;
  title?: ReactNode;
  description?: ReactNode;
};

/** mm:ss for a number of seconds. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** "You'll be signed out in mm:ss" warning with Stay signed in / Sign out. Escape counts as "Stay signed in". */
export function SessionTimeoutDialog({
  open,
  // TD-001: fallback only; apps pass the session rule value.
  secondsRemaining = 120,
  expiresAt,
  onStaySignedIn,
  onSignOut,
  onTimeout,
  title = "Are you still there?",
  description = "For your security, you'll be signed out soon because of inactivity.",
}: SessionTimeoutDialogProps) {
  const deadline = useRef(0);
  const [left, setLeft] = useState(secondsRemaining);
  const fired = useRef(false);
  const timeoutRef = useRef(onTimeout ?? onSignOut);
  timeoutRef.current = onTimeout ?? onSignOut;
  const expiry = expiresAt instanceof Date ? expiresAt.getTime() : expiresAt;

  useEffect(() => {
    if (!open) return;
    fired.current = false;
    deadline.current = expiry ?? Date.now() + secondsRemaining * 1000;
    const tick = () => {
      const s = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0 && !fired.current) {
        fired.current = true;
        timeoutRef.current();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [open, expiry, secondsRemaining]);

  // Coarse announcements for screen readers (the visible timer is not live to avoid noise).
  const announce = left === 60 || left === 30 || left === 10 ? `${left} seconds remaining` : "";

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onStaySignedIn();
      }}
      title={title}
      description={description}
      size="small"
      closeOnBackdrop={false}
      closeLabel="Stay signed in"
      footer={
        <>
          <Button variant="tertiary" onClick={onSignOut}>
            Sign out
          </Button>
          <Button onClick={onStaySignedIn}>
            Stay signed in
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-warning-soft text-warning-strong">
          <Clock className="size-7" />
        </span>
        <p className="text-sm text-fg-muted">You'll be signed out in</p>
        <p role="timer" aria-atomic="true" className="font-mono text-headline leading-none font-bold text-fg tabular-nums">
          {formatCountdown(left)}
        </p>
        <span className="sr-only" aria-live="polite">
          {announce}
        </span>
      </div>
    </Modal>
  );
}
