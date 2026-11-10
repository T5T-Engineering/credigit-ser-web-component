import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { defaultFormatter, legendDotClass, round, seriesColor, trackColor, type ChartTone } from "./chart-utils";

/** One slice of the donut. */
export type DonutSegment = { label: string; value: number; tone?: ChartTone };

/** Props for {@link DonutChart}. */
export type DonutChartProps = Omit<ComponentProps<"figure">, "children"> & {
  segments: DonutSegment[];
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  /** Accessible name. */
  label?: string;
};

const R = 48;
const STROKE = 16;
const C = 2 * Math.PI * R;

/** Donut chart with rounded segment caps, optional centre figure and a pill legend (values + share). */
export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  showLegend = true,
  valueFormatter = defaultFormatter,
  label = "Donut chart",
  className,
  ...props
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const multi = segments.filter((s) => s.value > 0).length > 1;
  // Bolt-style rounded caps: shorten each arc by the cap overhang (STROKE) plus a visible gap.
  const gap = multi ? 3 : 0;
  const cap = multi ? STROKE : 0;
  let offset = 0;
  const arcs = segments.map((s, i) => {
    const len = total > 0 ? (Math.max(0, s.value) / total) * C : 0;
    const arc = { ...s, color: seriesColor(s.tone, i), len, offset, share: total > 0 ? s.value / total : 0 };
    offset += len;
    return arc;
  });
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  const summary = arcs.map((a) => `${a.label}: ${valueFormatter(a.value)} (${pct(a.share)})`).join(", ");

  return (
    <figure className={cx("m-0 flex w-full flex-col items-center gap-5 sm:flex-row sm:items-center", className)} {...props}>
      <div className="relative w-full max-w-56 shrink-0">
        <svg viewBox="0 0 120 120" width="100%" role="img" aria-label={`${label}. ${summary}`} className="block h-auto">
          <title>{`${label}. ${summary}`}</title>
          <circle cx="60" cy="60" r={R} fill="none" style={{ stroke: trackColor }} strokeWidth={STROKE} />
          <g transform="rotate(-90 60 60)">
            {arcs.map((a, i) =>
              a.len > 0 ? (
                <circle
                  key={`${a.label}-${i}`}
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  style={{ stroke: a.color }}
                  strokeWidth={STROKE}
                  strokeLinecap={multi ? "round" : "butt"}
                  strokeDasharray={`${round(Math.max(a.len - gap - cap, 0.01))} ${round(C)}`}
                  strokeDashoffset={round(-(a.offset + (gap + cap) / 2))}
                  className="transition-opacity hover:opacity-80"
                >
                  <title>{`${a.label}: ${valueFormatter(a.value)} (${pct(a.share)})`}</title>
                </circle>
              ) : null,
            )}
          </g>
        </svg>
        {(centerValue !== undefined || centerLabel !== undefined) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
            {centerValue !== undefined && (
              <span className="font-mono text-3xl font-semibold tracking-tight text-fg tabular-nums">{centerValue}</span>
            )}
            {centerLabel !== undefined && (
              <span className="mt-1 max-w-[60%] text-xs font-medium text-fg-muted">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      {showLegend && (
        <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0" aria-hidden="true">
          {arcs.map((a, i) => (
            <li key={`${a.label}-${i}`} className="squircle flex h-10 items-center gap-3 rounded-full bg-fg/5 px-4 text-sm">
              <span className={legendDotClass} style={{ backgroundColor: a.color }} />
              <span className="min-w-0 flex-1 truncate font-medium text-fg">{a.label}</span>
              <span className="font-mono text-sm font-medium text-fg tabular-nums">{valueFormatter(a.value)}</span>
              <span className="w-12 text-right font-mono text-xs text-fg-muted tabular-nums">{pct(a.share)}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
