import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import {
  baselineColor,
  chartToneColor,
  defaultFormatter,
  gridColor,
  legendChipClass,
  legendDotClass,
  niceCeil,
  seriesColor,
  type ChartTone,
} from "./chart-utils";

/** One point. `size` turns the series into bubbles (area ∝ size); `label` names the point (e.g. obligor). */
export type ScatterPoint = { x: number; y: number; size?: number; label?: string };
/** One point series. */
export type ScatterSeries = { name: string; points: ScatterPoint[]; tone?: ChartTone };
/** Horizontal (`axis: "y"`) or vertical (`axis: "x"`) reference line, e.g. a hurdle rate. */
export type ScatterReferenceLine = { axis: "x" | "y"; value: number; label?: string; tone?: ChartTone };

/** Props for {@link ScatterChart}. */
export type ScatterChartProps = Omit<ComponentProps<"figure">, "children"> & {
  series: ScatterSeries[];
  /** Plot height in px. Default 260. */
  height?: number;
  xFormatter?: (value: number) => string;
  yFormatter?: (value: number) => string;
  /** Axis titles. */
  xLabel?: string;
  yLabel?: string;
  /** Explicit axis domains `[min, max]` (otherwise nice bounds including 0). */
  xDomain?: [number, number];
  yDomain?: [number, number];
  referenceLines?: ScatterReferenceLine[];
  /** Print point labels next to the marks. Default false. */
  showLabels?: boolean;
  /** Bubble radius range in px when points have `size`. Default `[6, 26]`. */
  bubbleRange?: [number, number];
  showLegend?: boolean;
  /** Accessible name. */
  label?: string;
};

function niceDomain(min: number, max: number): [number, number] {
  const lo = min < 0 ? -niceCeil(-min) : 0;
  const hi = max > 0 ? niceCeil(max) : 0;
  return hi === lo ? [lo, lo + 1] : [lo, hi];
}

const POINT_R = 6;

/** Scatter / bubble chart (e.g. RAROC vs capital) with round HTML marks, soft grid, reference lines and a pill legend. */
export function ScatterChart({
  series,
  height = 260,
  xFormatter = defaultFormatter,
  yFormatter = defaultFormatter,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  referenceLines = [],
  showLabels = false,
  bubbleRange = [6, 26],
  showLegend,
  label = "Scatter chart",
  className,
  ...props
}: ScatterChartProps) {
  const pts = series.flatMap((s) => s.points);
  const refX = referenceLines.filter((r) => r.axis === "x").map((r) => r.value);
  const refY = referenceLines.filter((r) => r.axis === "y").map((r) => r.value);
  const xs = [...pts.map((p) => p.x), ...refX];
  const ys = [...pts.map((p) => p.y), ...refY];
  const [x0, x1] = xDomain ?? niceDomain(Math.min(0, ...xs), Math.max(0, ...xs));
  const [y0, y1] = yDomain ?? niceDomain(Math.min(0, ...ys), Math.max(0, ...ys));
  const xPct = (v: number) => ((v - x0) / (x1 - x0 || 1)) * 100;
  const yPct = (v: number) => ((v - y0) / (y1 - y0 || 1)) * 100;
  const maxSize = Math.max(0, ...pts.map((p) => p.size ?? 0));
  const radius = (p: ScatterPoint) =>
    p.size !== undefined && maxSize > 0
      ? bubbleRange[0] + Math.sqrt(Math.max(0, p.size) / maxSize) * (bubbleRange[1] - bubbleRange[0])
      : POINT_R;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const legend = showLegend ?? series.length > 1;
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s.tone, i) }));
  const describe = (p: ScatterPoint) =>
    `${p.label ? `${p.label}: ` : ""}${xLabel ?? "x"} ${xFormatter(p.x)}, ${yLabel ?? "y"} ${yFormatter(p.y)}${p.size !== undefined ? `, size ${defaultFormatter(p.size)}` : ""}`;
  const summary = colored.map((s) => `${s.name}: ${s.points.map(describe).join("; ")}`).join(". ");

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        {yLabel && (
          <p aria-hidden="true" className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
            {yLabel}
          </p>
        )}
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums" style={{ bottom: `${t * 100}%` }}>
                {yFormatter(y0 + (y1 - y0) * t)}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative w-full" style={{ height }} aria-hidden="true">
              {ticks.map((t) => (
                <span key={`h${t}`} className="absolute inset-x-0 h-px" style={{ bottom: `${t * 100}%`, backgroundColor: t === 0 ? baselineColor : gridColor }} />
              ))}
              {ticks.map((t) => (
                <span key={`v${t}`} className="absolute inset-y-0 w-px" style={{ left: `${t * 100}%`, backgroundColor: gridColor }} />
              ))}
              {referenceLines.map((r, i) => {
                const color = chartToneColor[r.tone ?? "neutral"];
                return r.axis === "y" ? (
                  <div key={`ref-${i}`} className="absolute inset-x-0" style={{ bottom: `${yPct(r.value)}%` }}>
                    <span className="block h-0.5 rounded-full" style={{ backgroundColor: color }} />
                    {r.label && <span className="absolute right-1 bottom-1 font-mono text-xs font-medium text-fg-muted">{r.label}</span>}
                  </div>
                ) : (
                  <div key={`ref-${i}`} className="absolute inset-y-0" style={{ left: `${xPct(r.value)}%` }}>
                    <span className="block h-full w-0.5 rounded-full" style={{ backgroundColor: color }} />
                    {r.label && <span className="absolute top-1 left-1.5 font-mono text-xs font-medium whitespace-nowrap text-fg-muted">{r.label}</span>}
                  </div>
                );
              })}
              {colored.map((s) =>
                s.points.map((p, pi) => {
                  const r = radius(p);
                  return (
                    <span
                      key={`${s.name}-${pi}`}
                      title={describe(p)}
                      data-series={s.name}
                      className="absolute -translate-x-1/2 translate-y-1/2 rounded-full ring-2 ring-surface transition-opacity duration-150 ease-bolt hover:opacity-100"
                      style={{
                        left: `${xPct(p.x)}%`,
                        bottom: `${yPct(p.y)}%`,
                        width: r * 2,
                        height: r * 2,
                        backgroundColor: s.color,
                        opacity: p.size !== undefined ? 0.8 : 1,
                      }}
                    />
                  );
                }),
              )}
              {showLabels &&
                colored.map((s) =>
                  s.points.map((p, pi) =>
                    p.label ? (
                      <span
                        key={`${s.name}-l${pi}`}
                        className="absolute translate-y-1/2 text-xs font-medium whitespace-nowrap text-fg"
                        style={{ left: `calc(${xPct(p.x)}% + ${radius(p) + 4}px)`, bottom: `${yPct(p.y)}%` }}
                      >
                        {p.label}
                      </span>
                    ) : null,
                  ),
                )}
            </div>
            <div className="relative mt-2.5 h-4" aria-hidden="true">
              {ticks.map((t) => (
                <span
                  key={t}
                  className={cx(
                    "absolute font-mono text-xs whitespace-nowrap text-fg-muted tabular-nums",
                    t === 0 ? "translate-x-0" : t === 1 ? "-translate-x-full" : "-translate-x-1/2",
                  )}
                  style={{ left: `${t * 100}%` }}
                >
                  {xFormatter(x0 + (x1 - x0) * t)}
                </span>
              ))}
            </div>
            {xLabel && (
              <p aria-hidden="true" className="mt-2 text-center font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
                {xLabel}
              </p>
            )}
          </div>
        </div>
      </div>
      {legend && (
        <figcaption aria-hidden="true" className="mt-4 flex flex-wrap gap-2 pl-14">
          {colored.map((s) => (
            <span key={s.name} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          ))}
        </figcaption>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            <th scope="col">Point</th>
            <th scope="col">{xLabel ?? "X"}</th>
            <th scope="col">{yLabel ?? "Y"}</th>
            {maxSize > 0 && <th scope="col">Size</th>}
          </tr>
        </thead>
        <tbody>
          {series.flatMap((s) =>
            s.points.map((p, pi) => (
              <tr key={`${s.name}-${pi}`}>
                <th scope="row">{s.name}</th>
                <td>{p.label ?? pi + 1}</td>
                <td>{xFormatter(p.x)}</td>
                <td>{yFormatter(p.y)}</td>
                {maxSize > 0 && <td>{p.size !== undefined ? defaultFormatter(p.size) : ""}</td>}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </figure>
  );
}
