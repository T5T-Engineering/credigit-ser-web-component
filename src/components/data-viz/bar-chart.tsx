import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { baselineColor, chartToneColor, defaultFormatter, gridColor, niceCeil, trackColor, type ChartTone } from "./chart-utils";

/** One bar. `caption` overrides the hover/description text. */
export type BarDatum = { label: string; value: number; caption?: string };

/** Props for {@link BarChart}. */
export type BarChartProps = Omit<ComponentProps<"figure">, "children"> & {
  data: BarDatum[];
  /** Plot height in px (vertical orientation). Default 220. */
  height?: number;
  tone?: ChartTone;
  orientation?: "vertical" | "horizontal";
  valueFormatter?: (value: number) => string;
  /** Print values on/next to bars. Default true for horizontal, false for vertical. */
  showValues?: boolean;
  /** Accessible name. */
  label?: string;
};

/** Bar chart (vertical columns or horizontal bars) with Bolt-style rounded bars on a soft grid; HTML marks keep corners and labels crisp at any width. */
export function BarChart({
  data,
  height = 220,
  tone = "accent",
  orientation = "vertical",
  valueFormatter = defaultFormatter,
  showValues,
  label = "Bar chart",
  className,
  ...props
}: BarChartProps) {
  const color = chartToneColor[tone];
  const max = niceCeil(Math.max(...data.map((d) => d.value), 0));
  const n = Math.max(data.length, 1);
  const values = showValues ?? orientation === "horizontal";
  const summary = data.map((d) => `${d.label}: ${valueFormatter(d.value)}`).join(", ");

  const table = (
    <table className="sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Label</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={`${d.label}-${i}`}>
            <th scope="row">{d.label}</th>
            <td>{d.caption ?? valueFormatter(d.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (orientation === "horizontal") {
    return (
      <figure className={cx("m-0 w-full", className)} {...props}>
        <div role="img" aria-label={`${label}. ${summary}`} className="flex flex-col gap-3.5">
          {data.map((d, i) => {
            const pct = max > 0 ? Math.max(0, (d.value / max) * 100) : 0;
            return (
              <div key={`${d.label}-${i}`} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3">
                <span className="truncate text-sm font-medium text-fg" title={d.label}>
                  {d.label}
                </span>
                <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: trackColor }} aria-hidden="true">
                  <div
                    title={d.caption ?? `${d.label}: ${valueFormatter(d.value)}`}
                    className="h-full rounded-full transition-[width,opacity] duration-500 ease-bolt hover:opacity-85"
                    style={{ width: `${pct}%`, minWidth: d.value > 0 ? "0.75rem" : undefined, backgroundColor: color }}
                  />
                </div>
                {values && <span className="min-w-[4ch] text-right font-mono text-sm font-medium text-fg tabular-nums">{valueFormatter(d.value)}</span>}
              </div>
            );
          })}
        </div>
        {table}
      </figure>
    );
  }

  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div role="img" aria-label={`${label}. ${summary}`}>
        {values && (
          <div className="mb-1.5 grid" style={cols} aria-hidden="true">
            {data.map((d, i) => (
              <span key={`${d.label}-${i}`} className="truncate text-center font-mono text-xs font-medium text-fg tabular-nums">
                {valueFormatter(d.value)}
              </span>
            ))}
          </div>
        )}
        {/* Bars are HTML so their rounded (pill) tops never distort as the chart stretches. */}
        <div className="relative w-full" style={{ height }} aria-hidden="true">
          {[0, 25, 50, 75].map((y) => (
            <span key={y} className="absolute inset-x-0 h-px" style={{ top: `${y}%`, backgroundColor: gridColor }} />
          ))}
          <span className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: baselineColor }} />
          <div className="absolute inset-0 grid" style={cols}>
            {data.map((d, i) => {
              const h = max > 0 ? Math.max((Math.max(d.value, 0) / max) * 100, d.value > 0 ? 1.5 : 0) : 0;
              return (
                <div key={`${d.label}-${i}`} className="flex h-full items-end justify-center px-[18%]">
                  {h > 0 && (
                    <div
                      title={d.caption ?? `${d.label}: ${valueFormatter(d.value)}`}
                      data-value={d.value}
                      className="w-full max-w-14 rounded-t-xl rounded-b-sm transition-[height,opacity] duration-500 ease-bolt hover:opacity-85"
                      style={{ height: `${h}%`, minHeight: "0.5rem", backgroundColor: color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2.5 grid" style={cols} aria-hidden="true">
          {data.map((d, i) => (
            <span key={`${d.label}-${i}`} className="truncate px-0.5 text-center text-xs font-medium text-fg-muted" title={d.label}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
      {table}
    </figure>
  );
}
