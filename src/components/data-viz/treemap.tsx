"use client";

import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { defaultFormatter, legendDotClass, seriesColor, type ChartTone } from "./chart-utils";

/** One treemap item (e.g. a sector and its exposure). Non-positive values are skipped. */
export type TreemapItem = { label: string; value: number; tone?: ChartTone; caption?: string };

/** A laid-out tile. `index` points back into the input array. */
export type TreemapRect<T extends { value: number } = TreemapItem> = {
  item: T;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Box = { x: number; y: number; w: number; h: number };
type Entry<T> = { item: T; index: number; area: number };

function worst<T>(row: Entry<T>[], side: number): number {
  if (row.length === 0) return Infinity;
  let sum = 0;
  let min = Infinity;
  let max = 0;
  for (const r of row) {
    sum += r.area;
    min = Math.min(min, r.area);
    max = Math.max(max, r.area);
  }
  const s2 = side * side;
  const sum2 = sum * sum;
  return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
}

function layoutRow<T extends { value: number }>(row: Entry<T>[], box: Box, out: TreemapRect<T>[]): Box {
  const sum = row.reduce((acc, r) => acc + r.area, 0);
  if (box.w >= box.h) {
    // Column along the left edge.
    const colW = box.h > 0 ? sum / box.h : 0;
    let y = box.y;
    for (const r of row) {
      const h = colW > 0 ? r.area / colW : 0;
      out.push({ item: r.item, index: r.index, x: box.x, y, width: colW, height: h });
      y += h;
    }
    return { x: box.x + colW, y: box.y, w: box.w - colW, h: box.h };
  }
  // Row along the top edge.
  const rowH = box.w > 0 ? sum / box.w : 0;
  let x = box.x;
  for (const r of row) {
    const w = rowH > 0 ? r.area / rowH : 0;
    out.push({ item: r.item, index: r.index, x, y: box.y, width: w, height: rowH });
    x += w;
  }
  return { x: box.x, y: box.y + rowH, w: box.w, h: box.h - rowH };
}

/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk). Pure: returns one rect per positive item,
 * largest first, tiling `width × height` exactly with tile area proportional to value.
 */
export function squarify<T extends { value: number }>(items: T[], width: number, height: number): TreemapRect<T>[] {
  const valid = items
    .map((item, index) => ({ item, index }))
    .filter((e) => Number.isFinite(e.item.value) && e.item.value > 0)
    .sort((a, b) => b.item.value - a.item.value);
  const total = valid.reduce((acc, e) => acc + e.item.value, 0);
  if (total <= 0 || width <= 0 || height <= 0) return [];
  const scale = (width * height) / total;
  const entries: Entry<T>[] = valid.map((e) => ({ ...e, area: e.item.value * scale }));

  const out: TreemapRect<T>[] = [];
  let box: Box = { x: 0, y: 0, w: width, h: height };
  let row: Entry<T>[] = [];
  for (const entry of entries) {
    const side = Math.min(box.w, box.h);
    if (row.length === 0 || worst([...row, entry], side) <= worst(row, side)) {
      row.push(entry);
    } else {
      box = layoutRow(row, box, out);
      row = [entry];
    }
  }
  if (row.length) layoutRow(row, box, out);
  return out;
}

/** Props for {@link Treemap}. */
export type TreemapProps = Omit<ComponentProps<"figure">, "children"> & {
  items: TreemapItem[];
  /** Layout aspect ratio (width / height). The figure keeps this ratio unless `height` is set. Default 2. */
  aspectRatio?: number;
  /** Fixed height in px (the layout still uses `aspectRatio`). */
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Show each tile's share of the total. Default true. */
  showShare?: boolean;
  /** Makes tiles buttons. */
  onItemClick?: (item: TreemapItem, index: number) => void;
  /** Accessible name. */
  label?: string;
};

const pctFmt = (n: number) => `${Math.round(n * 1000) / 10}%`;

/** Squarified treemap (e.g. concentration by sector): soft tinted squircle tiles, labels where they fit, optional click. */
export function Treemap({
  items,
  aspectRatio = 2,
  height,
  valueFormatter = defaultFormatter,
  showShare = true,
  onItemClick,
  label = "Treemap",
  className,
  ...props
}: TreemapProps) {
  const W = 100 * aspectRatio;
  const H = 100;
  const rects = squarify(items, W, H);
  const total = rects.reduce((acc, r) => acc + r.item.value, 0);
  const summary = rects.map((r) => `${r.item.label}: ${valueFormatter(r.item.value)} (${pctFmt(r.item.value / total)})`).join(", ");

  return (
    <figure className={cx("m-0 w-full", className)} {...props}>
      <div
        role={onItemClick ? "group" : "img"}
        aria-label={`${label}. ${summary}`}
        className="relative w-full"
        style={height ? { height } : { aspectRatio: String(aspectRatio) }}
      >
        {rects.map((r) => {
          const color = seriesColor(r.item.tone, r.index);
          const wPct = (r.width / W) * 100;
          const hPct = (r.height / H) * 100;
          const roomy = wPct >= 12 && hPct >= 22;
          const share = r.item.value / total;
          const text = `${r.item.label}: ${valueFormatter(r.item.value)} (${pctFmt(share)})`;
          const tileClass = cx(
            "squircle absolute flex flex-col items-start justify-between overflow-hidden rounded-2xl p-2.5 text-left text-fg",
            "transition-[filter,box-shadow] duration-150 ease-bolt",
            onItemClick && "cursor-pointer hover:shadow-md hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          );
          const style = {
            left: `calc(${(r.x / W) * 100}% + 2px)`,
            top: `calc(${(r.y / H) * 100}% + 2px)`,
            width: `calc(${wPct}% - 4px)`,
            height: `calc(${hPct}% - 4px)`,
            // Soft tint of the series colour keeps text at full contrast in every theme.
            backgroundColor: `color-mix(in oklab, ${color} 22%, var(--cg-surface))`,
          };
          const content = roomy ? (
            <>
              <span className="flex max-w-full items-center gap-1.5 text-sm font-semibold leading-tight">
                <span aria-hidden="true" className={legendDotClass} style={{ backgroundColor: color }} />
                <span className="truncate">{r.item.label}</span>
              </span>
              <span className="max-w-full truncate font-mono text-sm font-medium leading-tight tabular-nums">
                {valueFormatter(r.item.value)}
                {showShare && <span className="ml-1 text-fg-muted">{pctFmt(share)}</span>}
              </span>
            </>
          ) : (
            <span aria-hidden="true" className={legendDotClass} style={{ backgroundColor: color }} />
          );
          return onItemClick ? (
            <button
              key={`${r.item.label}-${r.index}`}
              type="button"
              title={r.item.caption ?? text}
              aria-label={r.item.caption ?? text}
              data-index={r.index}
              className={tileClass}
              style={style}
              onClick={() => onItemClick(r.item, r.index)}
            >
              {content}
            </button>
          ) : (
            <div key={`${r.item.label}-${r.index}`} title={r.item.caption ?? text} data-index={r.index} aria-hidden="true" className={tileClass} style={style}>
              {content}
            </div>
          );
        })}
      </div>
      {/* Clipped wrapper: an sr-only <table> alone can widen narrow pages. */}
      <div className="sr-only">
      <table>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {rects.map((r) => (
            <tr key={`${r.item.label}-${r.index}`}>
              <th scope="row">{r.item.label}</th>
              <td>{r.item.caption ?? valueFormatter(r.item.value)}</td>
              <td>{pctFmt(r.item.value / total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
