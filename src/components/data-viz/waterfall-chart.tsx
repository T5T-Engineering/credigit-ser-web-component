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
  resolveYDomain,
  type ChartTone,
} from "./chart-utils";

/**
 * One waterfall step. `start` = opening absolute value, `delta` (default) = signed movement,
 * `total` = absolute subtotal/closing bar (omit `value` to use the running total).
 */
export type WaterfallStep = { label: string; value?: number; type?: "start" | "delta" | "total"; caption?: string };

/** A computed waterfall bar: spans `from` → `to`; `running` is the cumulative total after the step. */
export type WaterfallBar = {
  label: string;
  type: "start" | "delta" | "total";
  /** Signed movement for deltas; absolute value for start/total. */
  value: number;
  from: number;
  to: number;
  running: number;
  direction: "up" | "down" | "flat";
  caption?: string;
};

/** Pure layout helper: turns steps into floating bars with running totals. */
export function computeWaterfall(steps: WaterfallStep[]): WaterfallBar[] {
  let running = 0;
  return steps.map((step) => {
    const type = step.type ?? "delta";
    const raw = Number.isFinite(step.value) ? (step.value as number) : 0;
    if (type === "delta") {
      const from = running;
      running += raw;
      return { label: step.label, type, value: raw, from, to: running, running, direction: raw > 0 ? "up" : raw < 0 ? "down" : "flat", caption: step.caption };
    }
    // start / total: absolute bars from zero. A total without a value shows the running total.
    const value = type === "total" && step.value === undefined ? running : raw;
    running = value;
    return { label: step.label, type, value, from: 0, to: value, running, direction: "flat", caption: step.caption };
  });
}

/**
 * Value-axis range for a waterfall with a broken (non-zero) baseline.
 * `baseline` = a number (axis minimum) or `"auto"` (padded range of the running levels, so small movements stay visible
 * next to large totals). Returns `null` when no break is needed (the axis already reaches 0).
 */
export function waterfallAxis(bars: WaterfallBar[], baseline: number | "auto"): { min: number; max: number } | null {
  const levels = bars.flatMap((b) => (b.type === "delta" ? [b.from, b.to] : [b.to]));
  if (levels.length === 0) return null;
  const [autoMin, autoMax] = resolveYDomain(levels, "auto");
  const min = baseline === "auto" ? autoMin : baseline;
  const top = Math.max(...levels);
  const max = autoMax > min ? Math.max(autoMax, top) : min + (Math.abs(min) * 0.1 || 1);
  // Only a positive floor is a break; at or below 0 the normal zero-based axis is used.
  if (!(min > 0) || min >= top) return null;
  return { min, max };
}

/** Props for {@link WaterfallChart}. */
export type WaterfallChartProps = Omit<ComponentProps<"figure">, "children"> & {
  steps: WaterfallStep[];
  /** Plot height in px. Default 240. */
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Whether an increase is good (`positive`, default) or bad (`negative`, e.g. ECL or capital consumption). */
  increaseIntent?: "positive" | "negative";
  /** Override the increase / decrease colours (otherwise derived from `increaseIntent`: success / danger). */
  increaseTone?: ChartTone;
  decreaseTone?: ChartTone;
  /** Colour of start and total bars. Default `brand`. */
  totalTone?: ChartTone;
  /** Print values above bars. Default true. */
  showValues?: boolean;
  showLegend?: boolean;
  /** Legend / table names. */
  legendLabels?: { increase?: string; decrease?: string; total?: string };
  /**
   * Start the value axis above 0 so movements aren't dwarfed by large opening/closing values:
   * a number (axis minimum) or `"auto"`. Start/total bars are drawn truncated with an axis-break mark and a note.
   * Default: axis starts at 0.
   */
  baseline?: number | "auto";
  /** Note shown under a broken axis. Default: `Axis starts at {min}; opening and closing bars are truncated.` */
  axisBreakNote?: (formattedMin: string) => string;
  /** Accessible name. */
  label?: string;
};

/** Waterfall (bridge) chart: opening value, floating signed movements and closing total, with connector hairlines (e.g. ECL movement, capital consumption). */
export function WaterfallChart({
  steps,
  height = 240,
  valueFormatter = defaultFormatter,
  increaseIntent = "positive",
  increaseTone,
  decreaseTone,
  totalTone = "brand",
  showValues = true,
  showLegend = true,
  legendLabels,
  baseline,
  axisBreakNote = (min) => `Axis starts at ${min}; opening and closing bars are truncated.`,
  label = "Waterfall chart",
  className,
  ...props
}: WaterfallChartProps) {
  const bars = computeWaterfall(steps);
  const upTone = increaseTone ?? (increaseIntent === "positive" ? "success" : "danger");
  const downTone = decreaseTone ?? (increaseIntent === "positive" ? "danger" : "success");
  const names = { increase: "Increase", decrease: "Decrease", total: "Total", ...legendLabels };
  const extremes = bars.flatMap((b) => [b.from, b.to]);
  const rawMax = Math.max(0, ...extremes);
  const rawMin = Math.min(0, ...extremes);
  const broken = baseline !== undefined ? waterfallAxis(bars, baseline) : null;
  const maxY = broken ? broken.max : rawMax > 0 ? niceCeil(rawMax) : 0;
  const minY = broken ? broken.min : rawMin < 0 ? -niceCeil(-rawMin) : 0;
  const span = maxY - minY || 1;
  const yPct = (v: number) => ((Math.max(v, minY) - minY) / span) * 100; // from the bottom, clipped at the axis floor
  const baselineValue = broken ? minY : 0;
  const n = Math.max(bars.length, 1);
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => minY + span * t);

  const colorOf = (b: WaterfallBar) =>
    chartToneColor[b.type !== "delta" ? totalTone : b.direction === "down" ? downTone : upTone];
  // Deltas carry an explicit sign before the formatted magnitude ("+₦40bn", "−₦25bn").
  const shown = (b: WaterfallBar) =>
    b.type !== "delta" || b.value === 0 ? valueFormatter(b.value) : `${b.value > 0 ? "+" : "−"}${valueFormatter(Math.abs(b.value))}`;
  const summary = bars.map((b) => `${b.label}: ${shown(b)}${b.type === "delta" ? ` (running ${valueFormatter(b.running)})` : ""}`).join(", ");

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums" style={{ bottom: `${yPct(t)}%` }}>
                {valueFormatter(t)}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative w-full" style={{ height }} aria-hidden="true">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute inset-x-0 h-px"
                  style={{ bottom: `${yPct(t)}%`, backgroundColor: t === baselineValue ? baselineColor : gridColor }}
                />
              ))}
              <div className="absolute inset-0 grid" style={cols}>
                {bars.map((b, i) => {
                  const lo = Math.min(b.from, b.to);
                  const hi = Math.max(b.from, b.to);
                  const bottom = yPct(lo);
                  const h = yPct(hi) - bottom;
                  const next = bars[i + 1];
                  const truncated = broken !== null && lo < minY;
                  return (
                    <div key={`${b.label}-${i}`} className="relative h-full">
                      <div
                        title={b.caption ?? `${b.label}: ${shown(b)}`}
                        data-type={b.type}
                        data-from={b.from}
                        data-to={b.to}
                        data-truncated={truncated || undefined}
                        className={cx(
                          "absolute inset-x-[18%] mx-auto max-w-14 rounded-lg transition-[height,bottom,opacity] duration-500 ease-bolt hover:opacity-85",
                          b.type !== "delta" && "rounded-t-xl rounded-b-sm",
                        )}
                        style={{ bottom: `${bottom}%`, height: `${h}%`, minHeight: "0.25rem", backgroundColor: colorOf(b) }}
                      >
                        {/* Axis break: a slanted surface-coloured gap near the foot of a truncated bar. */}
                        {truncated && <span className="absolute -inset-x-1 bottom-2.5 h-1.5 -skew-y-12 bg-surface" />}
                      </div>
                      {/* Connector: from this bar's end level to the next bar. */}
                      {next && (
                        <span
                          className="absolute h-px"
                          style={{ left: "70%", width: "60%", bottom: `${yPct(b.running)}%`, backgroundColor: baselineColor }}
                        />
                      )}
                      {showValues && (
                        <span
                          className="absolute inset-x-0 truncate text-center font-mono text-xs font-medium text-fg tabular-nums"
                          style={{ bottom: `calc(${yPct(hi)}% + 4px)` }}
                        >
                          {shown(b)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2.5 grid" style={cols} aria-hidden="true">
              {bars.map((b, i) => (
                <span key={`${b.label}-${i}`} className="truncate px-0.5 text-center text-xs font-medium text-fg-muted" title={b.label}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {broken && (
        <p data-axis-break className="mt-2 pl-14 text-xs text-fg-muted">
          {axisBreakNote(valueFormatter(minY))}
        </p>
      )}
      {showLegend && (
        <figcaption aria-hidden="true" className="mt-4 flex flex-wrap gap-2 pl-14">
          {[
            { name: names.increase, color: chartToneColor[upTone] },
            { name: names.decrease, color: chartToneColor[downTone] },
            { name: names.total, color: chartToneColor[totalTone] },
          ].map((l) => (
            <span key={l.name} className={legendChipClass}>
              <span className={legendDotClass} style={{ backgroundColor: l.color }} />
              {l.name}
            </span>
          ))}
        </figcaption>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">Value</th>
            <th scope="col">Running total</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b, i) => (
            <tr key={`${b.label}-${i}`}>
              <th scope="row">{b.label}</th>
              <td>{b.caption ?? shown(b)}</td>
              <td>{valueFormatter(b.running)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
