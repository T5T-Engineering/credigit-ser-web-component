import type { ComponentProps, ReactNode } from "react";
import { X } from "lucide-react";

import { cx } from "../../utils/cx";
import { toneStyles, type Tone } from "./tone";

/** Props for `Chip`. */
export type ChipProps = Omit<ComponentProps<"span">, "children"> & {
  tone?: Tone;
  size?: "small" | "medium";
  /** Leading icon (decorative). */
  icon?: ReactNode;
  /** When set, renders a remove button that calls this handler. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to "Remove <text>" when children is a string. */
  removeLabel?: string;
  children?: ReactNode;
};

const sizeClasses = {
  small: "h-7 gap-1 px-3 text-xs",
  medium: "h-control-sm gap-1.5 px-3.5 text-sm",
} as const;

/** Compact pill for tags, filters and selections, optionally removable. */
export function Chip({ tone = "neutral", size = "medium", icon, onRemove, removeLabel, className, children, ...props }: ChipProps) {
  const removeName = removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-full squircle font-semibold leading-none whitespace-nowrap",
        toneStyles[tone].soft,
        sizeClasses[size],
        onRemove && "pe-1",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeName}
          className={cx(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full opacity-70 transition duration-150 ease-bolt hover:bg-fg/10 hover:opacity-100 active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
          )}
        >
          <X aria-hidden="true" size={size === "small" ? 12 : 14} strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  );
}
