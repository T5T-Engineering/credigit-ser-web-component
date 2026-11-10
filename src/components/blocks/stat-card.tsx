import type { ComponentProps, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cx } from "../../utils/cx";
import { eyebrowText, iconTileClass, toneStrongText, toneTile, type BlockTone } from "./block-utils";

/** Props for `StatCard`. */
export type StatCardProps = ComponentProps<"div"> & {
  /** KPI name. */
  label: ReactNode;
  /** Pre-formatted figure, e.g. "₦4.2bn" or "3.8%". Rendered in IBM Plex Mono. */
  value: ReactNode;
  /** Change versus comparison period, e.g. "+12.4%". */
  delta?: string;
  /** Direction of change. Inferred from the delta's sign when omitted. */
  deltaDirection?: "up" | "down" | "flat";
  /** Whether the change is good or bad (e.g. NPL up = negative). Inferred from direction when omitted. */
  deltaIntent?: "positive" | "negative" | "neutral";
  /** Context for the delta / value, e.g. "vs last quarter". */
  hint?: ReactNode;
  /** Icon in the tone tile. */
  icon?: ReactNode;
  /** Icon tile colour. Default `"brand"`. */
  tone?: BlockTone;
  /** Extra content under the figure (sparkline, progress bar). */
  children?: ReactNode;
};

function inferDirection(delta: string): "up" | "down" | "flat" {
  const trimmed = delta.trim();
  if (/^[-−–]/.test(trimmed)) return "down";
  if (/^\+/.test(trimmed)) return "up";
  if (/^0([.,]0+)?\s*%?$/.test(trimmed)) return "flat";
  return "up";
}

const intentPill = {
  positive: cx("bg-success-soft", toneStrongText.success),
  negative: cx("bg-danger-soft", toneStrongText.danger),
  neutral: "bg-neutral-100 text-neutral-700",
} as const;

const directionLabel = { up: "Increase", down: "Decrease", flat: "No change" } as const;

/** KPI tile with mono figure, delta and hint. */
export function StatCard({
  label,
  value,
  delta,
  deltaDirection,
  deltaIntent,
  hint,
  icon,
  tone = "brand",
  className,
  children,
  ...props
}: StatCardProps) {
  const direction = deltaDirection ?? (delta ? inferDirection(delta) : "flat");
  const intent = deltaIntent ?? (direction === "up" ? "positive" : direction === "down" ? "negative" : "neutral");
  const DirectionIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={cx("squircle flex flex-col gap-3 rounded-3xl bg-surface-sunken p-6 text-fg", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cx(eyebrowText, "pt-1 text-fg-muted")}>{label}</p>
        {icon ? (
          <span
            aria-hidden="true"
            className={cx(iconTileClass, "size-11 [&>svg]:size-5", toneTile[tone])}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="font-mono text-[2rem] leading-none font-semibold tracking-tight text-fg tabular-nums sm:text-[2.25rem]">{value}</p>
      {delta || hint ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {delta ? (
            <span
              className={cx(
                "inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 font-mono font-medium tabular-nums",
                intentPill[intent],
              )}
            >
              <DirectionIcon aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{directionLabel[direction]}: </span>
              {delta}
            </span>
          ) : null}
          {hint ? <span className="text-fg-muted">{hint}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
