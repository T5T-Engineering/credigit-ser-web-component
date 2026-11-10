import type { ComponentProps, ElementType, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { chartToneColor, defaultFormatter, trackColor, type ChartTone } from "./chart-utils";

/** One ranked entry (e.g. an obligor and its exposure). */
export type MiniBarItem = { label: string; value: number; href?: string; meta?: ReactNode; tone?: ChartTone };

/** Props for {@link MiniBarList}. */
export type MiniBarListProps = Omit<ComponentProps<"ol">, "children"> & {
  items: MiniBarItem[];
  valueFormatter?: (value: number) => string;
  /** Scale maximum. Default: the largest value. */
  max?: number;
  /** Show only the first N (after sorting), e.g. Top 10. */
  limit?: number;
  /** Sort by value, largest first. Default true. */
  sort?: boolean;
  /** Show rank numbers. Default true. */
  showRank?: boolean;
  /** Default bar colour. Default `accent`. */
  tone?: ChartTone;
  /** Router link component for items with `href`. */
  linkComponent?: ElementType;
  /** Accessible name of the list. */
  label?: string;
};

/** Ranked horizontal bar list (e.g. Top 10 obligors): rank, label/meta, mono value and a pill bar per row. A real `<ol>`, so it reads naturally to screen readers. */
export function MiniBarList({
  items,
  valueFormatter = defaultFormatter,
  max,
  limit,
  sort = true,
  showRank = true,
  tone = "accent",
  linkComponent,
  label = "Ranked list",
  className,
  ...props
}: MiniBarListProps) {
  const Link = linkComponent ?? "a";
  const sorted = sort ? [...items].sort((a, b) => b.value - a.value) : items;
  const rows = limit !== undefined ? sorted.slice(0, Math.max(0, limit)) : sorted;
  const scale = max ?? Math.max(0, ...rows.map((r) => r.value));

  return (
    <ol aria-label={label} className={cx("m-0 flex list-none flex-col gap-3 p-0", className)} {...props}>
      {rows.map((item, i) => {
        const pct = scale > 0 ? Math.min(100, Math.max(0, (item.value / scale) * 100)) : 0;
        const name = item.href ? (
          <Link
            href={item.href}
            className="truncate rounded-full font-semibold text-fg no-underline hover:text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {item.label}
          </Link>
        ) : (
          <span className="truncate font-semibold text-fg">{item.label}</span>
        );
        return (
          <li key={`${item.label}-${i}`} className="flex items-center gap-3">
            {showRank && (
              <span
                aria-hidden="true"
                className="squircle grid size-7 shrink-0 place-items-center rounded-full bg-fg/5 font-mono text-xs font-semibold text-fg tabular-nums"
              >
                {i + 1}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="flex min-w-0 flex-col">
                  {name}
                  {item.meta ? <span className="truncate text-xs text-fg-muted">{item.meta}</span> : null}
                </span>
                <span className="shrink-0 font-mono font-medium text-fg tabular-nums">{valueFormatter(item.value)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: trackColor }} aria-hidden="true">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-bolt"
                  style={{ width: `${pct}%`, minWidth: item.value > 0 ? "0.5rem" : undefined, backgroundColor: chartToneColor[item.tone ?? tone] }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
