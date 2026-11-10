import { useId, type ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { ReferenceLineOverlay } from "./chart-overlays";
import {
  baselineColor,
  defaultFormatter,
  gridColor,
  legendChipClass,
  legendDotClass,
  lineStroke,
  resolveYDomain,
  round,
  seriesColor,
  svgId,
  type ChartReferenceLine,
  type ChartTone,
  type YDomain,
} from "./chart-utils";

export { resolveYDomain, type ChartReferenceLine, type YDomain } from "./chart-utils";

/** One line. Points share the x categories of the first series. `axis: "right"` plots it against the secondary axis. */
export type LineSeries = { name: string; points: { x: string; y: number }[]; tone?: ChartTone; axis?: "left" | "right" };

/** Props for {@link LineChart}. */
export type LineChartProps = Omit<ComponentProps<"figure">, "children"> & {
  series: LineSeries[];
  /** Plot height in px. Default 220. */
  height?: number;
  yFormatter?: (value: number) => string;
  /** Left value-axis domain: `[min, max]`, or `"auto"` (padded data range, non-zero baseline). Default: nice bounds including 0. */
  yDomain?: YDomain;
  /** Horizontal reference lines on the left axis (target, limit, appetite …). */
  referenceLines?: ChartReferenceLine[];
  /** Domain of the secondary (right) axis, used by series with `axis: "right"`. Default: nice bounds including 0. */
  yDomainRight?: YDomain;
  /** Tick / table formatter for right-axis series. Default `yFormatter`. */
  yFormatterRight?: (value: number) => string;
  /** Fill the area under the first series. Default true. */
  area?: boolean;
  showLegend?: boolean;
  /** Accessible name. */
  label?: string;
};

/** Multi-series line chart: thick round-capped lines, soft grid, ringed point markers and pill legend (Bolt style). */
export function LineChart({
  series,
  height = 220,
  yFormatter = defaultFormatter,
  yDomain,
  referenceLines = [],
  yDomainRight,
  yFormatterRight,
  area = true,
  showLegend,
  label = "Line chart",
  className,
  ...props
}: LineChartProps) {
  const uid = svgId(useId());
  const categories = series[0]?.points.map((p) => p.x) ?? [];
  const isRight = (s: LineSeries) => s.axis === "right";
  const hasRight = series.some(isRight);
  const leftValues = series.filter((s) => !isRight(s)).flatMap((s) => s.points.map((p) => p.y));
  const rightValues = series.filter(isRight).flatMap((s) => s.points.map((p) => p.y));
  const [minY, maxY] = resolveYDomain([...leftValues, ...referenceLines.map((r) => r.value)], yDomain);
  const [minR, maxR] = resolveYDomain(rightValues, yDomainRight);
  const span = maxY - minY || 1;
  const spanR = maxR - minR || 1;
  const fmtRight = yFormatterRight ?? yFormatter;
  const fmtOf = (s: LineSeries) => (isRight(s) ? fmtRight : yFormatter);
  const fractions = [0, 0.25, 0.5, 0.75, 1];
  const ticks = fractions.map((t) => minY + span * t);
  const ticksRight = fractions.map((t) => minR + spanR * t);
  const n = categories.length;
  const xAt = (i: number) => (n <= 1 ? 50 : round((i / (n - 1)) * 100));
  const yAt = (v: number) => round(100 - ((v - minY) / span) * 100);
  const yAtRight = (v: number) => round(100 - ((v - minR) / spanR) * 100);
  const yOf = (s: LineSeries) => (isRight(s) ? yAtRight : yAt);
  // The bottom gridline doubles as the baseline when 0 is not on the axis.
  const baselineValue = minY <= 0 && maxY >= 0 ? 0 : minY;
  const step = Math.max(1, Math.ceil(n / 8));
  const legend = showLegend ?? series.length > 1;

  const lines = series.map((s, i) => ({
    ...s,
    color: seriesColor(s.tone, i),
    coords: s.points.map((p, pi) => `${xAt(pi)},${yOf(s)(p.y)}`).join(" "),
  }));
  const first = lines[0];
  const summary = series
    .map((s) => `${s.name}${hasRight && isRight(s) ? " (right axis)" : ""}: ${s.points.map((p) => `${p.x} ${fmtOf(s)(p.y)}`).join(", ")}`)
    .join(". ");
  const firstOnLeft = first !== undefined && !isRight(first);
  const areaBase = Math.min(maxY, Math.max(minY, 0));

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums"
                style={{ top: `${yAt(t)}%` }}
              >
                {yFormatter(t)}
              </span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height={height} className="block overflow-visible" aria-hidden="true">
              <defs>
                {first && (
                  <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: first.color, stopOpacity: 0.18 }} />
                    <stop offset="100%" style={{ stopColor: first.color, stopOpacity: 0 }} />
                  </linearGradient>
                )}
              </defs>
              {ticks.map((t) => (
                <line
                  key={t}
                  x1="0"
                  x2="100"
                  y1={yAt(t)}
                  y2={yAt(t)}
                  style={{ stroke: t === baselineValue ? baselineColor : gridColor }}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {area && first && firstOnLeft && first.points.length > 1 && (
                <polygon points={`${xAt(0)},${yAt(areaBase)} ${first.coords} ${xAt(first.points.length - 1)},${yAt(areaBase)}`} fill={`url(#${uid}-area)`} />
              )}
              {lines.map((s) => (
                <polyline
                  key={s.name}
                  data-axis={s.axis ?? "left"}
                  points={s.coords}
                  fill="none"
                  style={{ stroke: s.color }}
                  strokeWidth={lineStroke}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {/* Point markers in HTML so they stay round while the plot stretches. */}
            {n <= 24 && (
              <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height }} aria-hidden="true">
                {lines.map((s) =>
                  s.points.map((p, pi) => (
                    <span
                      key={`${s.name}-${pi}`}
                      className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
                      style={{ left: `${xAt(pi)}%`, top: `${yOf(s)(p.y)}%`, backgroundColor: s.color }}
                    />
                  )),
                )}
              </div>
            )}
            <ReferenceLineOverlay lines={referenceLines} topPct={yAt} height={height} />
            <div className="relative mt-2.5 h-4" aria-hidden="true">
              {categories.map((c, i) =>
                i % step === 0 || i === n - 1 ? (
                  <span
                    key={`${c}-${i}`}
                    className={cx(
                      "absolute whitespace-nowrap text-xs font-medium text-fg-muted",
                      i === 0 ? "translate-x-0" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2",
                    )}
                    style={{ left: `${xAt(i)}%` }}
                  >
                    {c}
                  </span>
                ) : null,
              )}
            </div>
          </div>
          {hasRight && (
            <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true" data-axis-column="right">
              {ticksRight.map((t) => (
                <span key={t} className="absolute left-0 -translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums" style={{ top: `${yAtRight(t)}%` }}>
                  {fmtRight(t)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {legend && (
        <figcaption aria-hidden="true" className="mt-4 flex flex-wrap gap-2 pl-14">
          {lines.map((s) => (
            <span key={s.name} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: s.color }} />
              {s.name}
              {hasRight && <span className="font-mono text-xs text-fg-muted">{isRight(s) ? "R" : "L"}</span>}
            </span>
          ))}
        </figcaption>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            {categories.map((c, i) => (
              <th key={`${c}-${i}`} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.name}>
              <th scope="row">{s.name}</th>
              {s.points.map((p, i) => (
                <td key={`${p.x}-${i}`}>{fmtOf(s)(p.y)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
