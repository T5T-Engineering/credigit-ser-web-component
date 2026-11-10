/**
 * Shared helpers for the data-viz group. Every colour is a CSS variable,
 * so charts recolour live when the brand (or the surface theme) changes.
 */

import type { Tone } from "../basic/tone";

/** Internal alias: chart marks use the library-wide `Tone` vocabulary (not re-exported from the barrel). */
export type ChartTone = Tone;

/** Tone → CSS colour. `brand` uses the emphasis token so it flips to white inside dark bands. */
export const chartToneColor: Record<ChartTone, string> = {
  neutral: "var(--cg-fg-subtle)",
  brand: "var(--cg-emphasis)",
  accent: "var(--cg-accent-500)",
  success: "var(--cg-success)",
  warning: "var(--cg-warning)",
  danger: "var(--cg-danger)",
  info: "var(--cg-info)",
};

/** Categorical sequence for multi-series charts (all token-driven). */
export const categoricalColors = [
  "var(--cg-accent-500)",
  "var(--cg-emphasis)",
  "var(--cg-fg-subtle)",
  "var(--cg-accent-300)",
  "var(--cg-info)",
  "var(--cg-success)",
] as const;

/** Bolt soft grey track (like Bolt's grey fills), derived from the foreground token. */
export const trackColor = "color-mix(in oklab, var(--cg-fg) 7%, transparent)";
/** Soft, solid gridline colour (Bolt avoids dashed or heavy rules). */
export const gridColor = "color-mix(in oklab, var(--cg-border) 70%, transparent)";
/** Baseline colour: one step stronger than the grid. */
export const baselineColor = "var(--cg-border)";
/** Bolt-style stroke width for chart lines (px, non-scaling). */
export const lineStroke = 2.75;

/** Legend chip classes (Bolt pill chip on a soft grey fill). */
export const legendChipClass =
  "squircle inline-flex h-8 items-center gap-2 rounded-full bg-fg/5 px-3 text-sm font-medium text-fg";
/** Legend swatch classes (circle). */
export const legendDotClass = "inline-block size-2.5 shrink-0 rounded-full";

export function seriesColor(tone: ChartTone | undefined, index: number): string {
  return tone ? chartToneColor[tone] : (categoricalColors[index % categoricalColors.length] ?? categoricalColors[0]);
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Round a coordinate to 2 decimals for stable, compact SVG output. */
export function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Smallest "nice" number (1, 2, 2.5, 5 × 10ⁿ) ≥ value. */
export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= value) return m * pow;
  return 10 * pow;
}

export const defaultFormatter = (value: number): string =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);

/** Turn a React useId() value into something safe for url(#id) references. */
export function svgId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Value-axis domain: explicit `[min, max]`, or `"auto"` (padded data min/max, so the baseline need not be 0). */
export type YDomain = [number, number] | "auto";

/** Horizontal reference line on the value axis (target, limit, hurdle …). */
export type ChartReferenceLine = { value: number; label?: string; tone?: Tone };

/**
 * Resolve a value-axis domain `[min, max]` for `values`.
 * - `undefined` (default): nice bounds that always include 0 (the historical behaviour).
 * - `[min, max]`: used as given (a zero-width domain is widened by 1).
 * - `"auto"`: data min/max padded by 10% of the span, then rounded outward to a nice step so the
 *   four grid intervals land on round numbers. A non-zero baseline is allowed.
 */
export function resolveYDomain(values: number[], domain?: YDomain): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (Array.isArray(domain)) {
    const [lo, hi] = domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
    return hi === lo ? [lo, lo + 1] : [lo, hi];
  }
  if (domain === "auto" && finite.length > 0) {
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    const pad = max > min ? (max - min) * 0.1 : Math.abs(max) * 0.1 || 1;
    const pMin = min - pad;
    const pMax = max + pad;
    let step = niceCeil((pMax - pMin) / 4);
    let lo = Math.floor(pMin / step) * step;
    // Never cross zero just because of the padding.
    if (min >= 0 && lo < 0) lo = 0;
    for (let guard = 0; lo + step * 4 < pMax && guard < 20; guard += 1) {
      step = niceCeil(step * 1.0001);
      lo = Math.floor(pMin / step) * step;
      if (min >= 0 && lo < 0) lo = 0;
    }
    const hi = lo + step * 4;
    return [round6(lo), round6(hi)];
  }
  const rawMin = Math.min(0, ...finite);
  const rawMax = Math.max(0, ...finite);
  const maxY = rawMax > 0 ? niceCeil(rawMax) : 0;
  const minY = rawMin < 0 ? -niceCeil(-rawMin) : 0;
  return maxY === minY ? [minY, minY + 1] : [minY, maxY];
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
