/**
 * JavaScript mirror of the Credigit tokens, for places that cannot read CSS variables
 * (canvas charts, emails, PDFs). In the browser, prefer the CSS variables / Tailwind utilities:
 * they follow runtime brand changes, these constants do not. Use readBrandColor() for live values.
 */
import { defaultBrand } from "../brand/brand";

export const colors = {
  primary: defaultBrand.colors.primary, // Credigit Ink
  accent: defaultBrand.colors.accent, // Credigit Ember
  accentStrong: "#C2330F",
  neutral: defaultBrand.colors.neutral, // Credigit Slate
  mist: "#AEB8C4",
  line: "#D5DBE1",
  white: "#FFFFFF",
  // Provisional status colours (not in the brand kit) - pending brand-owner approval.
  success: "#1E8E5A",
  warning: "#B7791F",
  danger: "#C8233B",
  info: "#2563EB",
} as const;

export const fonts = {
  sans: '"Archivo", ui-sans-serif, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

/** Bolt-style t-shirt sizes used by component `size` props. */
export const sizes = ["xsmall", "small", "medium", "large", "xlarge"] as const;
export type Size = (typeof sizes)[number];

/** Bolt surface themes, applied with data-cg-theme="...". */
export const surfaceThemes = ["xlight", "light", "dark", "xdark"] as const;
export type SurfaceTheme = (typeof surfaceThemes)[number];

export type Density = "compact" | "regular" | "spacious";

/** Read the live value of a CSS variable, e.g. readBrandColor("--cg-brand-accent"). */
export function readBrandColor(variable: string, el?: Element): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(el ?? document.documentElement).getPropertyValue(variable).trim();
}
