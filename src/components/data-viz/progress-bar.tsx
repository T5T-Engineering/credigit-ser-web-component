import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { chartToneColor, clamp, trackColor, type ChartTone } from "./chart-utils";

/** Props for {@link ProgressBar}. */
export type ProgressBarProps = Omit<ComponentProps<"div">, "children"> & {
  /** Progress from 0 to 1 (clamped). */
  value: number;
  tone?: ChartTone;
  /** Visible label; also the accessible name. */
  label?: ReactNode;
  /** Accessible name when no visible label is given. Default "Progress". */
  ariaLabel?: string;
  showValue?: boolean;
  size?: "small" | "medium";
};

/** Linear progress / utilisation bar (e.g. limit utilisation, task completion). */
export function ProgressBar({
  value,
  tone = "accent",
  label,
  ariaLabel = "Progress",
  showValue = false,
  size = "medium",
  className,
  ...props
}: ProgressBarProps) {
  const v = clamp(value, 0, 1);
  const pct = Math.round(v * 100);
  const hasHeader = label !== undefined || showValue;
  return (
    <div className={cx("w-full", className)} {...props}>
      {hasHeader && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label !== undefined && <span className="text-sm font-medium text-fg">{label}</span>}
          {showValue && <span className="ml-auto font-mono text-sm font-medium text-fg tabular-nums">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={typeof label === "string" ? label : ariaLabel}
        className={cx("w-full overflow-hidden rounded-full", size === "small" ? "h-2" : "h-3")}
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-bolt"
          style={{ width: `${pct}%`, minWidth: pct > 0 ? (size === "small" ? "0.5rem" : "0.75rem") : undefined, backgroundColor: chartToneColor[tone] }}
        />
      </div>
    </div>
  );
}
