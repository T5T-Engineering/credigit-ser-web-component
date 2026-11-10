/*
 * Internal helpers shared by the blocks group. Not exported from the barrel.
 */
import type { CSSProperties } from "react";

import type { Tone } from "../basic/tone";

/** Internal alias of the shared `Tone` (defined in the basic group). */
export type BlockTone = Tone;

/** Status-only tones. */
export type StatusTone = "info" | "success" | "warning" | "danger";

/** Heading tags accepted by `as` props. */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Decorative backgrounds for marketing surfaces. */
export type BlockBackground = "none" | "grid" | "radial";

/** Soft tinted icon tile colours per tone (Bolt: tinted circle / rounded square, no outline). */
export const toneTile: Record<BlockTone, string> = {
  neutral: "bg-fg/5 text-fg",
  brand: "bg-primary-100 text-primary-700",
  accent: "bg-accent-tint text-accent-text",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger-strong",
  info: "bg-info-soft text-info-strong",
};

/** Shared rounded icon tile shape (Bolt soft squircle). */
export const iconTileClass = "squircle grid shrink-0 place-items-center rounded-2xl";

/** Solid status colour (icons, borders, markers). */
export const toneSolidText: Record<BlockTone, string> = {
  neutral: "text-fg-muted",
  brand: "text-primary-600",
  accent: "text-accent-500",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

/** AA-contrast status text colours (strong tokens). */
export const toneStrongText: Record<StatusTone | "neutral", string> = {
  neutral: "text-fg-muted",
  success: "text-success-strong",
  warning: "text-warning-strong",
  danger: "text-danger-strong",
  info: "text-info-strong",
};

/** Shared focus ring (WCAG visible focus). */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Eyebrow / label typography. */
export const eyebrowText = "font-mono text-xs font-medium uppercase tracking-[0.08em]";

/** Max-width container used by full-bleed blocks (matches the layouts `Container` "large"). */
export const containerClass = "relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

const line = "color-mix(in oklab, var(--cg-fg) 7%, transparent)";

/** Inline style for a decorative brand background, built only from theme variables. */
export function backgroundStyle(background: BlockBackground | undefined): CSSProperties | undefined {
  if (background === "grid") {
    return {
      backgroundImage: [
        `radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, var(--cg-accent-500) 12%, transparent), transparent 70%)`,
        `linear-gradient(to right, ${line} 1px, transparent 1px)`,
        `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
      ].join(", "),
      backgroundSize: "100% 100%, 56px 56px, 56px 56px",
      backgroundPosition: "center top, center top, center top",
      maskImage: "radial-gradient(ellipse 85% 75% at 50% 0%, black 35%, transparent 100%)",
      WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 0%, black 35%, transparent 100%)",
    };
  }
  if (background === "radial") {
    return {
      backgroundImage: [
        `radial-gradient(55% 60% at 85% 0%, color-mix(in oklab, var(--cg-accent-500) 20%, transparent), transparent 70%)`,
        `radial-gradient(45% 55% at 5% 100%, color-mix(in oklab, var(--cg-fg) 8%, transparent), transparent 70%)`,
        `radial-gradient(35% 40% at 50% 50%, color-mix(in oklab, var(--cg-accent-300) 6%, transparent), transparent 80%)`,
      ].join(", "),
    };
  }
  return undefined;
}
