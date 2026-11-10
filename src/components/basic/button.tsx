import type { ComponentProps, ElementType, ReactNode, Ref } from "react";
import { LoaderCircle } from "lucide-react";

import { cx } from "../../utils/cx";

/** Bolt button hierarchy: primary (action fill), secondary (high-contrast ink), tertiary (soft grey fill), text (ghost), danger. */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "text" | "danger";
/** Button sizes (Bolt subset). */
export type ButtonSize = "small" | "medium" | "large";

const base =
  "relative inline-flex shrink-0 items-center justify-center squircle font-sans font-semibold tracking-[-0.005em] no-underline " +
  "transition-[background-color,color,box-shadow,transform] duration-150 ease-bolt active:scale-[0.98] select-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-busy:cursor-progress";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  secondary: "bg-emphasis text-on-emphasis hover:bg-emphasis-hover",
  tertiary: "bg-fg/5 text-fg hover:bg-fg/10 active:bg-fg/15",
  text: "bg-transparent text-fg hover:bg-fg/5 active:bg-fg/10",
  danger: "bg-danger-strong text-on-status hover:bg-[color-mix(in_oklab,var(--cg-danger)_68%,black)]",
};

/* Single-line pill (default) vs. multi-line chip (`wrap`): auto height, squircle corners instead of a pill. */
const singleLine = "whitespace-nowrap rounded-full leading-none";
const multiLine = "h-auto whitespace-normal text-balance rounded-3xl leading-snug";
const wrapSizeClasses: Record<ButtonSize, string> = {
  small: "min-h-control-sm min-w-6 gap-1.5 px-3 py-1.5 text-sm",
  medium: "min-h-control-md min-w-6 gap-2 px-4 py-2 text-base",
  large: "min-h-control-lg min-w-6 gap-3 px-6 py-3 text-lg",
};

/* Bolt sizes: small 32px / 14px, medium 40px / 16px, large 48px / 18px with 24px padding. */
const sizeClasses: Record<ButtonSize, string> = {
  small: "h-control-sm min-w-6 gap-1.5 px-3 text-sm",
  medium: "h-control-md min-w-6 gap-2 px-4 text-base",
  large: "h-control-lg min-w-6 gap-3 px-6 text-lg",
};

const textSizeClasses: Record<ButtonSize, string> = {
  small: "h-control-sm min-w-6 gap-1.5 px-2.5 text-sm",
  medium: "h-control-md min-w-6 gap-2 px-3 text-base",
  large: "h-control-lg min-w-6 gap-3 px-4 text-lg",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  small: "size-control-sm gap-0 px-0",
  medium: "size-control-md gap-0 px-0",
  large: "size-control-lg gap-0 px-0",
};

/** Options for `buttonStyles()`. */
export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Circular button sized for a single icon (used by IconButton). */
  iconOnly?: boolean;
  /** Allow the label to wrap onto several lines (auto height, `rounded-3xl`), e.g. suggestion chips. Ignored with `iconOnly`. */
  wrap?: boolean;
  className?: string;
};

/** Returns the button class string, for styling links or other elements as buttons. */
export function buttonStyles({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  iconOnly = false,
  wrap = false,
  className,
}: ButtonStyleOptions = {}): string {
  const multi = wrap && !iconOnly;
  const sizing = iconOnly
    ? iconOnlySizeClasses[size]
    : multi
      ? wrapSizeClasses[size]
      : variant === "text"
        ? textSizeClasses[size]
        : sizeClasses[size];
  return cx(base, multi ? multiLine : singleLine, variantClasses[variant], sizing, fullWidth && "w-full", className);
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label (replaced by a spinner while loading). */
  iconBefore?: ReactNode;
  /** Icon rendered after the label. */
  iconAfter?: ReactNode;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Circular, icon-only sizing (prefer `IconButton`). */
  iconOnly?: boolean;
  /** Multi-line label: auto height and `rounded-3xl` instead of a pill (suggestion chips, long prompts). Default false. */
  wrap?: boolean;
  /** Shows a spinner, sets `aria-busy` and blocks interaction. */
  loading?: boolean;
  /** Renders an `<a>` (or the `as` component) instead of a `<button>`. */
  href?: string;
  /** Custom element/component to render, e.g. a router `Link`. */
  as?: ElementType;
  target?: string;
  rel?: string;
  download?: ComponentProps<"a">["download"];
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
};

/** Props for `Button`: native button props plus Bolt variants, icons, loading and link rendering. */
export type ButtonProps = ButtonOwnProps & Omit<ComponentProps<"button">, keyof ButtonOwnProps>;

/** Bolt button. Renders `<button>`, or `<a>` / `as` when `href` or `as` is given. */
export function Button({
  variant = "primary",
  size = "medium",
  iconBefore,
  iconAfter,
  fullWidth = false,
  iconOnly = false,
  wrap = false,
  loading = false,
  href,
  as,
  type,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const inactive = Boolean(disabled || loading);
  const classes = buttonStyles({ variant, size, fullWidth, iconOnly, wrap, className });
  const spinnerSize = size === "large" ? 20 : size === "small" ? 14 : 16;

  const content = (
    <>
      {loading ? (
        <LoaderCircle aria-hidden="true" size={spinnerSize} className="shrink-0 animate-spin" />
      ) : iconBefore ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {iconBefore}
        </span>
      ) : null}
      {children}
      {iconAfter ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {iconAfter}
        </span>
      ) : null}
    </>
  );

  if (href !== undefined || as !== undefined) {
    // A disabled/loading link renders as a plain <a> without href, so it cannot navigate.
    const Component: ElementType = inactive ? "a" : (as ?? "a");
    const linkProps = props as Record<string, unknown>;
    return (
      <Component
        {...linkProps}
        href={inactive ? undefined : href}
        role={inactive && href !== undefined ? "link" : linkProps.role}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        tabIndex={inactive ? -1 : linkProps.tabIndex}
        className={classes}
      >
        {content}
      </Component>
    );
  }

  return (
    <button
      {...props}
      ref={props.ref as Ref<HTMLButtonElement> | undefined}
      type={type ?? "button"}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={classes}
    >
      {content}
    </button>
  );
}
