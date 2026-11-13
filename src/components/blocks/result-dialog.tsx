"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { Button } from "../basic/button";
import { cx } from "../../utils/cx";
import { statusIcons } from "./alert";
import { iconTileClass, toneTile, type StatusTone } from "./block-utils";
import { Modal } from "./modal";

/** Props for `ResultDialog`. */
export type ResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Outcome colour and icon. Default `"success"`. */
  tone?: StatusTone;
  /** Headline, e.g. "Saved". */
  title: ReactNode;
  /** What happened, e.g. "The permission change is saved." */
  description?: ReactNode;
  /** Extra content under the description (e.g. a link to track an approval). */
  children?: ReactNode;
  /** Extra footer action next to the close button (e.g. "Track request"). */
  action?: ReactNode;
  /** Close button label. Default "OK". */
  closeLabel?: string;
};

/** Outcome modal after a save or command: tone icon, title, description and an OK button that returns focus. */
export function ResultDialog({ open, onOpenChange, tone = "success", title, description, children, action, closeLabel = "OK" }: ResultDialogProps) {
  const Icon = statusIcons[tone];
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="small"
      title={
        <span className="flex items-center gap-3">
          <span className={cx(iconTileClass, "size-11", toneTile[tone])}>
            <Icon aria-hidden="true" className="size-6" />
          </span>
          <span className="min-w-0">{title}</span>
        </span>
      }
      description={description}
      footer={
        <>
          {action}
          <Button variant={action ? "tertiary" : "primary"} onClick={() => onOpenChange(false)} autoFocus>
            {closeLabel}
          </Button>
        </>
      }
      data-tone={tone}
    >
      {children}
    </Modal>
  );
}

/* ---------- Imperative store (module-level so `showResult()` works anywhere a <ResultDialogHost /> is mounted) ---------- */

/** Options for `showResult()`. */
export type ShowResultOptions = Omit<ResultDialogProps, "open" | "onOpenChange">;

type Listener = () => void;
let current: ShowResultOptions | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Opens the outcome modal (replacing one already open). Requires a mounted `<ResultDialogHost />`. */
export function showResult(options: ShowResultOptions) {
  current = options;
  emit();
}

/** Closes the outcome modal. */
export function closeResult() {
  current = null;
  emit();
}

/** Hook returning `{ showResult, closeResult, current }`. */
export function useResultDialog() {
  const shown = useSyncExternalStore(subscribe, () => current, () => null);
  return { showResult, closeResult, current: shown };
}

/** Renders the outcome modal opened by `showResult()`. Mount once near the app root (next to `<Toaster />`). */
export function ResultDialogHost() {
  const { current: shown } = useResultDialog();
  if (!shown) return null;
  return <ResultDialog {...shown} open onOpenChange={(open) => !open && closeResult()} />;
}
