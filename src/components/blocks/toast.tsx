"use client";

import { useEffect, useRef, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";
import { Bell, X } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing, toneSolidText, type StatusTone } from "./block-utils";
import { statusIcons } from "./alert";

/** Tone of a notification. */
export type NotificationTone = StatusTone | "neutral";

/** Props for `Notification`. */
export type NotificationProps = Omit<ComponentProps<"div">, "title"> & {
  /** Headline. */
  title: ReactNode;
  /** Detail text. */
  description?: ReactNode;
  /** Colour/icon. Default `"neutral"`. */
  tone?: NotificationTone;
  /** Inline action (link/button). */
  action?: ReactNode;
  /** Shows a close button when given. */
  onClose?: () => void;
  /** Accessible label for the close button. Default "Dismiss notification". */
  closeLabel?: string;
};

/** Presentational notification card (used by `Toaster`, also usable inline). Bolt: dark rounded toast. */
export function Notification({
  title,
  description,
  tone = "neutral",
  action,
  onClose,
  closeLabel = "Dismiss notification",
  className,
  ...props
}: NotificationProps) {
  const Icon = tone === "neutral" ? Bell : statusIcons[tone];
  return (
    <div
      data-cg-theme="xdark"
      className={cx(
        "squircle relative flex w-full items-start gap-3 overflow-hidden rounded-2xl bg-bg py-3.5 pr-2.5 pl-4 text-sm text-fg shadow-lg",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cx("mt-0.5 size-5 shrink-0", tone === "neutral" ? "text-fg" : toneSolidText[tone])} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-6">
        <p className="font-semibold text-fg">{title}</p>
        {description ? <div className="text-fg-muted">{description}</div> : null}
        {action ? <div className="mt-1.5 font-semibold">{action}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className={cx(
            "grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-fg-muted transition duration-150 ease-out hover:bg-fg/10 hover:text-fg active:scale-[0.96]",
            focusRing,
          )}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/* ---------- Toast store (module-level so `toast()` works from anywhere a <Toaster /> is mounted) ---------- */

/** Options for `toast()`. */
export type ToastOptions = {
  /** Headline. */
  title: ReactNode;
  /** Detail text. */
  description?: ReactNode;
  /** Colour/icon. Default `"neutral"`. */
  tone?: NotificationTone;
  /** Auto-dismiss delay in ms. Default 5000; `Infinity` keeps it until dismissed. */
  duration?: number;
  /** Inline action. */
  action?: ReactNode;
  /** Stable id (replaces an existing toast with the same id). */
  id?: string;
};

/** A toast currently in the queue. */
export type ToastRecord = ToastOptions & { id: string };

type Listener = () => void;
let toasts: ToastRecord[] = [];
const listeners = new Set<Listener>();
let counter = 0;
const EMPTY: ToastRecord[] = [];

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Show a toast; returns its id. Requires a mounted `<Toaster />`. */
export function toast(options: ToastOptions): string {
  const id = options.id ?? `cg-toast-${++counter}`;
  const record: ToastRecord = { ...options, id };
  toasts = toasts.some((t) => t.id === id) ? toasts.map((t) => (t.id === id ? record : t)) : [...toasts, record];
  emit();
  return id;
}

/** Dismiss one toast by id, or all toasts when no id is given. */
export function dismissToast(id?: string) {
  toasts = id === undefined ? [] : toasts.filter((t) => t.id !== id);
  emit();
}

/** Hook returning `{ toast, dismiss, toasts }`. */
export function useToast() {
  const current = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  return { toast, dismiss: dismissToast, toasts: current };
}

/** Props for `Toaster`. */
export type ToasterProps = Omit<ComponentProps<"section">, "children"> & {
  /** Screen corner. Default `"bottom-end"`. */
  position?: "top-end" | "bottom-end" | "top-center" | "bottom-center";
  /** Max toasts shown at once (oldest hidden first). Default 4. */
  limit?: number;
  /** Region label. Default "Notifications". */
  label?: string;
};

const positionClass = {
  "top-end": "top-0 end-0 items-end",
  "bottom-end": "bottom-0 end-0 items-end",
  "top-center": "top-0 inset-x-0 items-center",
  "bottom-center": "bottom-0 inset-x-0 items-center",
} as const;

function ToastItem({ record }: { record: ToastRecord }) {
  // TD-007: default auto-dismiss delay.
  const duration = record.duration ?? 5000;
  const paused = useRef(false);
  const remaining = useRef(duration);
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!Number.isFinite(duration)) return;
    remaining.current = duration;
    let start = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => dismissToast(record.id), duration);
    const pause = () => {
      if (paused.current || !timer) return;
      paused.current = true;
      clearTimeout(timer);
      timer = undefined;
      remaining.current -= Date.now() - start;
    };
    const resume = () => {
      if (!paused.current) return;
      paused.current = false;
      start = Date.now();
      timer = setTimeout(() => dismissToast(record.id), Math.max(0, remaining.current));
    };
    const el = itemRef.current;
    el?.addEventListener("mouseenter", pause);
    el?.addEventListener("mouseleave", resume);
    el?.addEventListener("focusin", pause);
    el?.addEventListener("focusout", resume);
    return () => {
      if (timer) clearTimeout(timer);
      el?.removeEventListener("mouseenter", pause);
      el?.removeEventListener("mouseleave", resume);
      el?.removeEventListener("focusin", pause);
      el?.removeEventListener("focusout", resume);
    };
  }, [record, duration]);

  return (
    <li
      ref={itemRef}
      className="pointer-events-auto w-full transition duration-200 ease-bolt starting:translate-y-2 starting:opacity-0"
    >
      <Notification
        title={record.title}
        description={record.description}
        tone={record.tone}
        action={record.action}
        onClose={() => dismissToast(record.id)}
      />
    </li>
  );
}

/** Renders queued toasts in a polite live region. Mount once near the app root. */
export function Toaster({ position = "bottom-end", limit = 4, label = "Notifications", className, ...props }: ToasterProps) {
  const { toasts: current } = useToast();
  const visible = current.slice(-limit);
  return (
    <section
      aria-label={label}
      className={cx(
        "pointer-events-none fixed z-50 flex w-full flex-col p-4 sm:max-w-sm sm:p-6",
        positionClass[position],
        (position === "top-center" || position === "bottom-center") && "mx-auto",
        className,
      )}
      {...props}
    >
      <ol aria-live="polite" aria-relevant="additions text" className="flex w-full flex-col gap-3">
        {visible.map((record) => (
          <ToastItem key={record.id} record={record} />
        ))}
      </ol>
    </section>
  );
}
