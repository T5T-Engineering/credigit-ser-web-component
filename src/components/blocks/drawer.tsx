"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { DialogCloseButton } from "./modal";
import { useDialog } from "./use-dialog";

/** Props for `Drawer`. */
export type DrawerProps = Omit<ComponentProps<"dialog">, "open" | "title"> & {
  /** Whether the drawer is shown. */
  open: boolean;
  /** Called with `false` when the user requests close. */
  onOpenChange: (open: boolean) => void;
  /** Drawer heading (labels the dialog). */
  title: ReactNode;
  /** Supporting text. */
  description?: ReactNode;
  /** Sticky action row. */
  footer?: ReactNode;
  /** Edge to slide from. Default `"end"`. */
  side?: "start" | "end";
  /** Panel width. Default `"medium"`. */
  size?: "small" | "medium" | "large";
  /** Close on backdrop click. Default true. */
  closeOnBackdrop?: boolean;
  /** Accessible label for the close button. Default "Close". */
  closeLabel?: string;
};

const sizeClass = {
  small: "max-w-sm",
  medium: "max-w-md",
  large: "max-w-2xl",
} as const;

/** Side panel dialog built on native `<dialog>` (same behaviour as `Modal`). */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  footer,
  side = "end",
  size = "medium",
  closeOnBackdrop = true,
  closeLabel = "Close",
  className,
  children,
  onMouseDown,
  ...props
}: DrawerProps) {
  const id = useId();
  const { dialogProps, requestClose } = useDialog(open, onOpenChange);
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const end = side === "end";

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
        "fixed inset-y-0 m-0 h-dvh max-h-none w-full overflow-hidden bg-transparent p-2 text-fg sm:p-3",
        end ? "start-auto end-0" : "start-0 end-auto",
        "backdrop:bg-primary-900/60 backdrop:backdrop-blur-[2px]",
        "translate-x-0 transition-transform duration-300 ease-bolt",
        end ? "starting:open:translate-x-full" : "starting:open:-translate-x-full",
        sizeClass[size],
        className,
      )}
    >
      <div
        className={cx(
          "squircle flex h-full flex-col overflow-hidden rounded-4xl bg-surface shadow-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
          <div className="flex min-w-0 flex-col gap-1">
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
        <div data-dialog-body="" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-base leading-6 text-fg-muted sm:px-8">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-6 py-5 sm:px-8">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
