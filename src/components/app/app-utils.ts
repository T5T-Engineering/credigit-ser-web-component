/*
 * Internal helpers shared by the app group. Not exported from the barrel.
 */
import type { Tone } from "../basic/tone";

/** Shared focus ring (WCAG visible focus). */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Eyebrow / label typography. */
export const labelText = "font-mono text-xs font-medium uppercase tracking-[0.08em]";

/** Soft tinted icon tile per tone. */
export const toneTile: Record<Tone, string> = {
  neutral: "bg-fg/5 text-fg",
  brand: "bg-primary-100 text-primary-700",
  accent: "bg-accent-tint text-accent-text",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger-strong",
  info: "bg-info-soft text-info-strong",
};

/** AA status text per tone. */
export const toneText: Record<Tone, string> = {
  neutral: "text-fg-muted",
  brand: "text-fg",
  accent: "text-accent-text",
  success: "text-success-strong",
  warning: "text-warning-strong",
  danger: "text-danger-strong",
  info: "text-info-strong",
};

/** Solid indicator fill per tone (dots, bars). */
export const toneFill: Record<Tone, string> = {
  neutral: "bg-fg-subtle",
  brand: "bg-primary-500",
  accent: "bg-accent-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

/** Soft grey icon button used in app chrome (40px pill). */
export const chromeButton =
  "squircle relative inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-fg transition-colors duration-150 ease-bolt hover:bg-fg/5 active:bg-fg/10 " +
  focusRing;

/** True on Apple platforms (for ⌘ vs Ctrl shortcut hints). */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}
