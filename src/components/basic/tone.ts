/**
 * Shared tone vocabulary for status-coloured components (Badge, Chip, StatusBadge …).
 * Every class maps to a theme token, so tones follow runtime brand changes.
 */

/** Semantic colour intent shared across components. */
export type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

/** Ordered list of all tones (useful for docs and playgrounds). */
export const tones: readonly Tone[] = ["neutral", "brand", "accent", "success", "warning", "danger", "info"];

/** Class sets per tone: `soft` (tinted bg), `solid` (filled), `outline` (hairline ring), `text` (foreground only), `dot` (indicator fill). */
export type ToneStyle = { soft: string; solid: string; outline: string; text: string; dot: string };

/*
 * The provisional status colours do not reach 4.5:1 as text on their soft backgrounds,
 * so text uses a token-derived darker mix (color-mix with black) instead of a hex value.
 */
const strong = {
  success: "text-[color-mix(in_oklab,var(--cg-success)_78%,black)]",
  warning: "text-[color-mix(in_oklab,var(--cg-warning)_62%,black)]",
  danger: "text-[color-mix(in_oklab,var(--cg-danger)_85%,black)]",
  info: "text-[color-mix(in_oklab,var(--cg-info)_85%,black)]",
} as const;

/** Tone → class map used by Badge, Chip and StatusBadge. */
export const toneStyles: Record<Tone, ToneStyle> = {
  neutral: {
    soft: "bg-fg/[0.06] text-fg",
    solid: "bg-fg text-bg",
    outline: "ring-1 ring-inset ring-line-strong text-fg",
    text: "text-fg-muted",
    dot: "bg-fg-subtle",
  },
  brand: {
    soft: "bg-primary-100 text-primary-700",
    solid: "bg-emphasis text-on-emphasis",
    outline: "ring-1 ring-inset ring-current text-fg",
    text: "text-fg",
    dot: "bg-primary-500",
  },
  accent: {
    soft: "bg-accent-tint text-accent-text",
    solid: "bg-action text-on-action",
    outline: "ring-1 ring-inset ring-current text-link",
    text: "text-link",
    dot: "bg-accent-500",
  },
  success: {
    soft: `bg-success-soft ${strong.success}`,
    solid: "bg-[color-mix(in_oklab,var(--cg-success)_85%,black)] text-on-action",
    outline: `ring-1 ring-inset ring-current ${strong.success}`,
    text: strong.success,
    dot: "bg-success",
  },
  warning: {
    soft: `bg-warning-soft ${strong.warning}`,
    solid: "bg-[color-mix(in_oklab,var(--cg-warning)_70%,black)] text-on-action",
    outline: `ring-1 ring-inset ring-current ${strong.warning}`,
    text: strong.warning,
    dot: "bg-warning",
  },
  danger: {
    soft: `bg-danger-soft ${strong.danger}`,
    solid: "bg-danger text-on-action",
    outline: `ring-1 ring-inset ring-current ${strong.danger}`,
    text: strong.danger,
    dot: "bg-danger",
  },
  info: {
    soft: `bg-info-soft ${strong.info}`,
    solid: "bg-info text-on-action",
    outline: `ring-1 ring-inset ring-current ${strong.info}`,
    text: strong.info,
    dot: "bg-info",
  },
};
