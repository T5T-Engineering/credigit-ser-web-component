import { cx } from "../../utils/cx";
import type { FormControlSize } from "./field-context";

/** Height / text size per control size (Bolt: 40px default input with 16px text). */
export const controlSizeClasses: Record<FormControlSize, string> = {
  small: "h-control-sm text-sm",
  medium: "h-control-md text-base",
  large: "h-control-lg text-base",
};

/** Horizontal padding per control size (pill controls need a little more side room). */
export const controlPaddingX: Record<FormControlSize, string> = {
  small: "px-3",
  medium: "px-4",
  large: "px-5",
};

/**
 * Outer frame shared by Input, Select, SearchField. Bolt style: a soft grey pill with no visible
 * border at rest; on focus it turns into a white surface with a 2px focus ring. Errors draw a danger ring.
 */
export function controlFrameClasses({
  size,
  invalid,
  disabled,
  className,
}: {
  size: FormControlSize;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cx(
    "relative flex w-full min-w-0 items-stretch overflow-hidden rounded-full squircle bg-fg/5 text-fg",
    "transition-[background-color,box-shadow] duration-150 ease-bolt",
    "focus-within:bg-surface focus-within:shadow-sm focus-within:ring-2",
    controlSizeClasses[size],
    invalid ? "ring-2 ring-danger focus-within:ring-danger" : "hover:bg-fg/10 focus-within:ring-focus",
    disabled && "cursor-not-allowed opacity-50 hover:bg-fg/5",
    className,
  );
}

/** Bare native element inside a frame (frame draws fill/focus). */
export const bareControlClasses =
  "min-w-0 flex-1 appearance-none bg-transparent text-inherit outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed";

/** Adornment (icon, prefix, suffix) inside a frame. */
export const adornmentClasses = "flex shrink-0 items-center text-fg-muted";

/** Leading / trailing adornment padding per control size. */
export const adornmentPadStart: Record<FormControlSize, string> = { small: "pl-3", medium: "pl-4", large: "pl-5" };
export const adornmentPadEnd: Record<FormControlSize, string> = { small: "pr-3", medium: "pr-4", large: "pr-5" };

/** Size of lucide icons per control size. */
export const iconSize: Record<FormControlSize, number> = { small: 14, medium: 18, large: 20 };
