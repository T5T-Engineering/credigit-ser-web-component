import { useId, type ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { chartToneColor, defaultFormatter, round, svgId, type ChartTone } from "./chart-utils";

/** Props for {@link Sparkline}. */
export type SparklineProps = Omit<ComponentProps<"svg">, "children" | "values"> & {
  values: number[];
  tone?: ChartTone;
  /** Height in px. Default 32. */
  height?: number;
  /** Fill under the line. Default true. */
  area?: boolean;
  /** Accessible name prefix. Default "Trend". */
  label?: string;
};

/** Compact inline trend line for KPI tiles and table cells. */
export function Sparkline({ values, tone = "accent", height = 32, area = true, label = "Trend", className, ...props }: SparklineProps) {
  const uid = svgId(useId());
  const color = chartToneColor[tone];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const h = 100;
  const n = values.length;
  const pts = values.map((v, i) => ({
    x: n <= 1 ? 50 : round((i / (n - 1)) * 100),
    y: round(pad + (1 - (v - min) / span) * (h - pad * 2)),
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const last = values[n - 1];
  const name =
    n > 0
      ? `${label}: ${n} values from ${defaultFormatter(values[0] ?? 0)} to ${defaultFormatter(last ?? 0)}, low ${defaultFormatter(min)}, high ${defaultFormatter(max)}`
      : `${label}: no data`;

  return (
    <svg
      viewBox={`0 0 100 ${h}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      role="img"
      aria-label={name}
      className={cx("block overflow-visible", className)}
      {...props}
    >
      <title>{name}</title>
      <defs>
        <linearGradient id={`${uid}-spark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {area && n > 1 && <polygon points={`0,${h} ${line} 100,${h}`} fill={`url(#${uid}-spark)`} />}
      {n > 0 && (
        <polyline
          points={line}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
