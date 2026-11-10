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
