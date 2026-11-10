import type { ComponentProps, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cx } from "../../utils/cx";

/** Direction of change. */
export type DeltaDirection = "up" | "down" | "flat";
/** Whether a change is good, bad or neither. */
export type DeltaIntent = "positive" | "negative" | "neutral";

/** Props for {@link MetricDelta}. */
export type MetricDeltaProps = Omit<ComponentProps<"span">, "children"> & {
  /** Change as a number (sign gives the direction) or a pre-formatted string like "+1.2pp". */
  delta: number | string;
  /** Formats numeric deltas (default: signed, 2 decimals max). */
  format?: (delta: number) => string;
  direction?: DeltaDirection;
  intent?: DeltaIntent;
  /** Higher is worse (NPL ratio, ECL, cost of risk): an increase reads as negative. */
  invert?: boolean;
  /** `pill` (tinted pill) or `inline` (coloured text). Default `pill`. */
  variant?: "pill" | "inline";
  size?: "small" | "medium";
};

const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(Math.abs(n))}`;

/** Direction from a number or signed string. */
export function deltaDirection(delta: number | string): DeltaDirection {
  if (typeof delta === "number") return delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const t = delta.trim();
  if (/^[-−–]/.test(t)) return "down";
  if (/^\+/.test(t)) return "up";
  if (/^0([.,]0+)?\D*$/.test(t)) return "flat";
  return "up";
}

const intentClass = {
  pill: { positive: "bg-success-soft text-success-strong", negative: "bg-danger-soft text-danger-strong", neutral: "bg-fg/[0.06] text-fg-muted" },
  inline: { positive: "text-success-strong", negative: "text-danger-strong", neutral: "text-fg-muted" },
} as const;
const directionLabel = { up: "Up", down: "Down", flat: "Unchanged" } as const;

/** Inline change indicator: arrow + delta coloured by intent (never colour alone: the arrow and a hidden word carry direction). */
export function MetricDelta({
  delta,
  format = signed,
  direction: directionProp,
  intent: intentProp,
  invert = false,
  variant = "pill",
  size = "medium",
  className,
  ...props
}: MetricDeltaProps) {
  const direction = directionProp ?? deltaDirection(delta);
  const intent =
    intentProp ?? (direction === "flat" ? "neutral" : (direction === "up") !== invert ? "positive" : "negative");
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <span
      data-intent={intent}
      data-direction={direction}
      className={cx(
        "inline-flex items-center gap-0.5 font-mono font-medium whitespace-nowrap tabular-nums",
        variant === "pill" && "squircle rounded-full",
        variant === "pill" && (size === "small" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"),
        variant === "inline" && (size === "small" ? "text-xs" : "text-sm"),
        intentClass[variant][intent],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={size === "small" ? "size-3" : "size-3.5"} />
      <span className="sr-only">{directionLabel[direction]} </span>
      {typeof delta === "number" ? format(delta) : delta}
    </span>
  );
}

/** Props for {@link TrendValue}. */
export type TrendValueProps = Omit<ComponentProps<"div">, "children"> & {
  /** Pre-formatted figure, e.g. "₦12.4bn" or "4.7%". */
  value: ReactNode;
  /** Optional caption above the value. */
  label?: ReactNode;
  delta?: MetricDeltaProps["delta"];
  /** Props forwarded to the `MetricDelta` (invert, intent, format …). */
  deltaProps?: Omit<MetricDeltaProps, "delta">;
  /** Comparison context, e.g. "vs Q2". */
  hint?: ReactNode;
  size?: "small" | "medium" | "large";
};

const valueSize = { small: "text-lg", medium: "text-2xl", large: "text-[2rem] leading-none" } as const;

/** Figure with its change and context in one line (tables, cards, headers). */
export function TrendValue({ value, label, delta, deltaProps, hint, size = "medium", className, ...props }: TrendValueProps) {
  return (
    <div className={cx("flex flex-col gap-1", className)} {...props}>
      {label ? <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{label}</span> : null}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={cx("font-mono font-semibold tracking-tight text-fg tabular-nums", valueSize[size])}>{value}</span>
        {delta !== undefined ? <MetricDelta delta={delta} size={size === "small" ? "small" : "medium"} {...deltaProps} /> : null}
        {hint ? <span className="text-sm text-fg-muted">{hint}</span> : null}
      </div>
    </div>
  );
}
