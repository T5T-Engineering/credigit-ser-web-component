import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { toneStyles, type Tone } from "./tone";

/** Badge fill style. */
export type BadgeVariant = "soft" | "solid" | "outline";

/** Props for `Badge`. */
export type BadgeProps = ComponentProps<"span"> & {
  tone?: Tone;
  variant?: BadgeVariant;
  size?: "small" | "medium";
  /** Shows a leading status dot. */
  dot?: boolean;
};

const sizeClasses = {
  small: "h-5 gap-1 px-2 text-[0.625rem]",
  medium: "h-6 gap-1.5 px-2.5 text-[0.6875rem]",
} as const;

/** Small pill-shaped mono uppercase label for counts, states and categories. */
export function Badge({ tone = "neutral", variant = "soft", size = "medium", dot = false, className, children, ...props }: BadgeProps) {
  const style = toneStyles[tone];
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full squircle font-mono font-medium uppercase leading-none tracking-[0.08em] whitespace-nowrap",
        style[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden="true" className={cx("size-1.5 shrink-0 rounded-full", variant === "solid" ? "bg-current" : style.dot)} />
      ) : null}
      {children}
    </span>
  );
}
