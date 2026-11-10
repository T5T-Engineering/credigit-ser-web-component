import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import {
  baselineColor,
  defaultFormatter,
  gridColor,
  legendChipClass,
  legendDotClass,
  niceCeil,
  seriesColor,
  trackColor,
  type ChartTone,
} from "./chart-utils";

/** One series: `values[i]` belongs to `categories[i]`. Negative values are drawn as 0. */
export type StackedBarSeries = { name: string; values: number[]; tone?: ChartTone };

/** Props for {@link StackedBarChart}. */
export type StackedBarChartProps = Omit<ComponentProps<"figure">, "children"> & {
  /** Category labels (x axis for vertical, rows for horizontal). */
  categories: string[];
  series: StackedBarSeries[];
  /** `stacked` (default) piles series on top of each other; `grouped` draws them side by side. */
  mode?: "stacked" | "grouped";
  orientation?: "vertical" | "horizontal";
  /** Plot height in px (vertical orientation). Default 220. */
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Print category totals (stacked mode). Default true for horizontal, false for vertical. */
  showTotals?: boolean;
  /** Pill legend. Default: shown when there is more than one series. */
  showLegend?: boolean;
  /** Accessible name. */
  label?: string;
};

const pos = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

/** Stacked or grouped bar chart (vertical columns or horizontal bars) with a Bolt pill legend; HTML marks keep rounded ends crisp. */
export function StackedBarChart({
  categories,
  series,
  mode = "stacked",
  orientation = "vertical",
  height = 220,
  valueFormatter = defaultFormatter,
  showTotals,
  showLegend,
  label = "Stacked bar chart",
  className,
  ...props
}: StackedBarChartProps) {
  const colored = series.map((s, i) => ({ ...s, color: seriesColor(s.tone, i) }));
  const valueAt = (si: number, ci: number) => pos(series[si]?.values[ci] ?? 0);
  const totals = categories.map((_, ci) => series.reduce((sum, _s, si) => sum + valueAt(si, ci), 0));
  const rawMax = mode === "stacked" ? Math.max(0, ...totals) : Math.max(0, ...series.flatMap((s) => s.values.map(pos)));
  const max = niceCeil(rawMax);
  const pct = (v: number) => (max > 0 ? (v / max) * 100 : 0);
  const legend = showLegend ?? series.length > 1;
  const totalsShown = mode === "stacked" && (showTotals ?? orientation === "horizontal");
  const summary = categories
    .map((c, ci) => `${c}: ${colored.map((s, si) => `${s.name} ${valueFormatter(valueAt(si, ci))}`).join(", ")}`)
    .join(". ");
  const tip = (si: number, ci: number) => `${categories[ci]} · ${colored[si]?.name}: ${valueFormatter(valueAt(si, ci))}`;

  const legendNode = legend ? (
    <figcaption aria-hidden="true" className={cx("mt-4 flex flex-wrap gap-2", orientation === "vertical" && "pl-14")}>
      {colored.map((s) => (
        <span key={s.name} className={legendChipClass}>
          <span className={legendDotClass} style={{ backgroundColor: s.color }} />
          {s.name}
        </span>
      ))}
    </figcaption>
  ) : null;

  const table = (
    <table className="sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          {series.map((s) => (
            <th key={s.name} scope="col">
              {s.name}
            </th>
          ))}
          {mode === "stacked" && <th scope="col">Total</th>}
        </tr>
      </thead>
      <tbody>
        {categories.map((c, ci) => (
          <tr key={`${c}-${ci}`}>
            <th scope="row">{c}</th>
            {series.map((s, si) => (
              <td key={s.name}>{valueFormatter(valueAt(si, ci))}</td>
            ))}
            {mode === "stacked" && <td>{valueFormatter(totals[ci] ?? 0)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (orientation === "horizontal") {
    return (
      <figure className={cx("m-0 w-full", className)} {...props}>
        <div role="img" aria-label={`${label}. ${summary}`} className="flex flex-col gap-3.5">
          {categories.map((c, ci) => (
            <div key={`${c}-${ci}`} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3" aria-hidden="true">
              <span className="truncate text-sm font-medium text-fg" title={c}>
                {c}
              </span>
              {mode === "stacked" ? (
                <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
                  {colored.map((s, si) => {
                    const v = valueAt(si, ci);
                    return v > 0 ? (
                      <div
                        key={s.name}
                        title={tip(si, ci)}
                        data-value={v}
                        className="h-full transition-[width,opacity] duration-500 ease-bolt first:rounded-s-full last:rounded-e-full hover:opacity-85"
                        style={{ width: `${pct(v)}%`, backgroundColor: s.color }}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {colored.map((s, si) => {
                    const v = valueAt(si, ci);
                    return (
                      <div key={s.name} className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
                        <div
                          title={tip(si, ci)}
                          data-value={v}
                          className="h-full rounded-full transition-[width,opacity] duration-500 ease-bolt hover:opacity-85"
                          style={{ width: `${pct(v)}%`, minWidth: v > 0 ? "0.5rem" : undefined, backgroundColor: s.color }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {totalsShown ? (
                <span className="min-w-[4ch] text-right font-mono text-sm font-medium text-fg tabular-nums">{valueFormatter(totals[ci] ?? 0)}</span>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        {legendNode}
        {table}
      </figure>
    );
  }

  const n = Math.max(categories.length, 1);
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        {totalsShown && (
          <div className="mb-1.5 ml-14 grid" style={cols} aria-hidden="true">
            {categories.map((c, ci) => (
              <span key={`${c}-${ci}`} className="truncate text-center font-mono text-xs font-medium text-fg tabular-nums">
                {valueFormatter(totals[ci] ?? 0)}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2 font-mono text-xs text-fg-muted tabular-nums" style={{ top: `${100 - t * 100}%` }}>
                {valueFormatter(max * t)}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative w-full" style={{ height }} aria-hidden="true">
              {[0, 25, 50, 75].map((y) => (
                <span key={y} className="absolute inset-x-0 h-px" style={{ top: `${y}%`, backgroundColor: gridColor }} />
              ))}
              <span className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: baselineColor }} />
              <div className="absolute inset-0 grid" style={cols}>
                {categories.map((c, ci) =>
                  mode === "stacked" ? (
                    <div key={`${c}-${ci}`} className="flex h-full flex-col-reverse items-center px-[18%]">
                      {(() => {
                        const drawn = colored.map((s, si) => ({ s, si, v: valueAt(si, ci) })).filter((d) => d.v > 0);
                        return drawn.map(({ s, si, v }, k) => (
                          <div
                            key={s.name}
                            title={tip(si, ci)}
                            data-value={v}
                            className={cx(
                              // Bottom-up (flex-col-reverse): a surface-coloured hairline separates each segment from the one below.
                              "w-full max-w-14 shrink-0 transition-[height,opacity] duration-500 ease-bolt hover:opacity-85",
                              k === 0 ? "rounded-b-sm" : "border-b-2 border-surface",
                              k === drawn.length - 1 && "rounded-t-xl",
                            )}
                            style={{ height: `${pct(v)}%`, backgroundColor: s.color }}
                          />
                        ));
                      })()}
                    </div>
                  ) : (
                    <div key={`${c}-${ci}`} className="flex h-full items-end justify-center gap-1 px-[10%]">
                      {colored.map((s, si) => {
                        const v = valueAt(si, ci);
                        return (
                          <div
                            key={s.name}
                            title={tip(si, ci)}
                            data-value={v}
                            className="max-w-6 min-w-1 flex-1 rounded-t-lg rounded-b-sm transition-[height,opacity] duration-500 ease-bolt hover:opacity-85"
                            style={{ height: `${pct(v)}%`, minHeight: v > 0 ? "0.375rem" : undefined, backgroundColor: s.color }}
                          />
                        );
                      })}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="mt-2.5 grid" style={cols} aria-hidden="true">
              {categories.map((c, ci) => (
                <span key={`${c}-${ci}`} className="truncate px-0.5 text-center text-xs font-medium text-fg-muted" title={c}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {legendNode}
      {table}
    </figure>
  );
}
