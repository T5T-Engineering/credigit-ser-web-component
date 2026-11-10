"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { X } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing } from "./block-utils";
import { useDialog } from "./use-dialog";

/** Props for `Modal`. */
export type ModalProps = Omit<ComponentProps<"dialog">, "open" | "title"> & {
  /** Whether the modal is shown. */
  open: boolean;
  /** Called with `false` when the user requests close (Escape, backdrop, close button). */
  onOpenChange: (open: boolean) => void;
  /** Dialog heading (labels the dialog). */
  title: ReactNode;
  /** Supporting text (describes the dialog). */
  description?: ReactNode;
  /** Action row (buttons). */
  footer?: ReactNode;
  /** Max width. Default `"medium"`. */
  size?: "small" | "medium" | "large";
  /** Close on backdrop click. Default true. */
  closeOnBackdrop?: boolean;
  /** Accessible label for the close button. Default "Close". */
  closeLabel?: string;
};

const sizeClass = {
  small: "max-w-md",
  medium: "max-w-xl",
  large: "max-w-3xl",
} as const;

/** Shared close button for dialogs (internal). */
export function DialogCloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cx(
        "-mt-1 -mr-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-fg/5 text-fg transition duration-150 ease-out hover:bg-fg/10 active:scale-[0.96]",
        focusRing,
      )}
    >
      <X aria-hidden="true" className="size-5" />
    </button>
  );
}

/** Centered modal dialog built on native `<dialog>`: focus trap, Escape closes, focus returns. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = "medium",
  closeOnBackdrop = true,
  closeLabel = "Close",
  className,
  children,
  onMouseDown,
  ...props
}: ModalProps) {
  const id = useId();
  const { dialogProps, requestClose } = useDialog(open, onOpenChange);
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  return (
    <dialog
      {...props}
      {...dialogProps}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-modal="true"
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (closeOnBackdrop) dialogProps.onMouseDown(event);
      }}
      className={cx(
        "m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-visible bg-transparent p-0 text-fg",
        "backdrop:bg-primary-900/60 backdrop:backdrop-blur-[2px]",
        "opacity-100 transition-[opacity,translate,scale] duration-200 ease-bolt open:translate-y-0 open:scale-100 starting:open:translate-y-2 starting:open:scale-[0.98] starting:open:opacity-0",
        sizeClass[size],
        className,
      )}
    >
      <div className="squircle flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-4xl bg-surface shadow-lg">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 id={titleId} className="font-display text-[1.5rem] leading-[1.2] font-bold tracking-[-0.015em] text-balance text-fg">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-base leading-6 text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <DialogCloseButton label={closeLabel} onClick={requestClose} />
        </div>
        {children ? (
          <div data-dialog-body="" className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 text-base leading-6 text-fg-muted sm:px-8">
            {children}
          </div>
        ) : null}
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 pt-2 pb-6 sm:px-8 sm:pb-8">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
