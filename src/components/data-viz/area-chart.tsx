import { useId, type ComponentProps } from "react";

import { cx } from "../../utils/cx";
import {
  baselineColor,
  defaultFormatter,
  gridColor,
  legendChipClass,
  legendDotClass,
  lineStroke,
  niceCeil,
  round,
  seriesColor,
  svgId,
  type ChartTone,
} from "./chart-utils";

/** One area series. Points share the x categories of the first series (matched by index). */
export type AreaSeries = { name: string; points: { x: string; y: number }[]; tone?: ChartTone };

/** Props for {@link AreaChart}. */
export type AreaChartProps = Omit<ComponentProps<"figure">, "children"> & {
  series: AreaSeries[];
  /** Stack series cumulatively (negative values are treated as 0 when stacked). Default false (overlapping areas). */
  stacked?: boolean;
  /** Plot height in px. Default 220. */
  height?: number;
  yFormatter?: (value: number) => string;
  /** Pill legend. Default: shown when there is more than one series. */
  showLegend?: boolean;
  /** Accessible name. */
  label?: string;
};

/** Multi-series area chart (overlapping or stacked) with soft gradient fills, thick round lines and a pill legend (Bolt style). */
export function AreaChart({
  series,
  stacked = false,
  height = 220,
  yFormatter = defaultFormatter,
  showLegend,
  label = "Area chart",
  className,
  ...props
}: AreaChartProps) {
  const uid = svgId(useId());
  const categories = series[0]?.points.map((p) => p.x) ?? [];
  const n = categories.length;
  const yOf = (s: AreaSeries, i: number) => s.points[i]?.y ?? 0;

  // Compute top / bottom of every band.
  const running = new Array<number>(n).fill(0);
  const bands = series.map((s, si) => {
    const bottoms = categories.map((_, i) => (stacked ? running[i] ?? 0 : 0));
    const tops = categories.map((_, i) => {
      const v = stacked ? Math.max(0, yOf(s, i)) : yOf(s, i);
      return stacked ? (running[i] ?? 0) + v : v;
    });
    if (stacked) tops.forEach((t, i) => (running[i] = t));
    return { ...s, color: seriesColor(s.tone, si), tops, bottoms };
  });

  const all = bands.flatMap((b) => b.tops);
  const rawMin = Math.min(0, ...all);
  const rawMax = Math.max(0, ...all);
  const maxY = rawMax > 0 ? niceCeil(rawMax) : 0;
  const minY = rawMin < 0 ? -niceCeil(-rawMin) : 0;
  const span = maxY - minY || 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => minY + span * t);
  const xAt = (i: number) => (n <= 1 ? 50 : round((i / (n - 1)) * 100));
  const yAt = (v: number) => round(100 - ((v - minY) / span) * 100);
  const step = Math.max(1, Math.ceil(n / 8));
  const legend = showLegend ?? series.length > 1;
  const summary = series.map((s) => `${s.name}: ${s.points.map((p) => `${p.x} ${yFormatter(p.y)}`).join(", ")}`).join(". ");

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums" style={{ top: `${yAt(t)}%` }}>
                {yFormatter(t)}
              </span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height={height} className="block overflow-visible" aria-hidden="true">
              <defs>
                {bands.map((b, i) => (
                  <linearGradient key={b.name} id={`${uid}-area-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: b.color, stopOpacity: stacked ? 0.5 : 0.24 }} />
                    <stop offset="100%" style={{ stopColor: b.color, stopOpacity: stacked ? 0.22 : 0.02 }} />
                  </linearGradient>
                ))}
              </defs>
              {ticks.map((t) => (
                <line key={t} x1="0" x2="100" y1={yAt(t)} y2={yAt(t)} style={{ stroke: t === 0 ? baselineColor : gridColor }} vectorEffect="non-scaling-stroke" />
              ))}
              {n > 1 &&
                bands.map((b, i) => {
                  const top = b.tops.map((v, pi) => `${xAt(pi)},${yAt(v)}`);
                  const bottom = b.bottoms.map((v, pi) => `${xAt(pi)},${yAt(Math.max(minY, v))}`).reverse();
                  return <polygon key={b.name} data-series={b.name} points={[...top, ...bottom].join(" ")} fill={`url(#${uid}-area-${i})`} />;
                })}
              {bands.map((b) => (
                <polyline
                  key={b.name}
                  points={b.tops.map((v, pi) => `${xAt(pi)},${yAt(v)}`).join(" ")}
                  fill="none"
                  style={{ stroke: b.color }}
                  strokeWidth={lineStroke}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
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
        </div>
      </div>
      {legend && (
        <figcaption aria-hidden="true" className="mt-4 flex flex-wrap gap-2 pl-14">
          {bands.map((b) => (
            <span key={b.name} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: b.color }} />
              {b.name}
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
                <td key={`${p.x}-${i}`}>{yFormatter(p.y)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
