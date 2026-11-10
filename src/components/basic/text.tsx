import type { ComponentProps, ElementType } from "react";

import { cx } from "../../utils/cx";

/** Typographic roles (Bolt type scale, Credigit fonts). */
export type TextVariant = "display" | "headline" | "title" | "subtitle" | "lead" | "body" | "small" | "caption" | "eyebrow" | "figure";
/** Text colour roles; all theme-aware. */
export type TextTone = "default" | "muted" | "subtle" | "accent" | "inverse";
/** Logical text alignment. */
export type TextAlign = "start" | "center" | "end";

/* Bolt type scale (docs/BOLT-DESIGN.md): display and headline scale down on mobile. */
const variantClasses: Record<TextVariant, string> = {
  display:
    "font-display text-[2.75rem] font-bold leading-[1.05] tracking-[-0.025em] text-balance md:text-[3.75rem] lg:text-display",
  headline: "font-display text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] text-balance md:text-headline",
  title: "font-display text-2xl font-bold leading-[1.2] tracking-[-0.015em] text-balance md:text-title",
  subtitle: "font-display text-subtitle font-semibold",
  lead: "text-lg leading-[1.55] md:text-lead",
  body: "text-base leading-normal",
  small: "text-sm leading-[1.45]",
  caption: "text-xs leading-normal",
  eyebrow: "font-mono text-xs font-medium uppercase tracking-[0.08em]",
  figure: "font-mono font-semibold tabular-nums tracking-tight",
};

const defaultTone: Record<TextVariant, TextTone> = {
  display: "default",
  headline: "default",
  title: "default",
  subtitle: "default",
  lead: "muted",
  body: "muted",
  small: "muted",
  caption: "subtle",
  eyebrow: "accent",
  figure: "default",
};

const defaultElement: Record<TextVariant, ElementType> = {
  display: "p",
  headline: "p",
  title: "p",
  subtitle: "p",
  lead: "p",
  body: "p",
  small: "p",
  caption: "span",
  eyebrow: "span",
  figure: "span",
};

/** Theme-aware text colour classes, shared by typography components. */
export const textToneClasses: Record<TextTone, string> = {
  default: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
  accent: "text-link",
  inverse: "text-bg",
};

const alignClasses: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/** Props for `Text`. */
export type TextProps = Omit<ComponentProps<"p">, "ref"> & {
  /** Element or component to render (defaults depend on the variant: `p` or `span`). */
  as?: ElementType;
  variant?: TextVariant;
  /** Colour role; defaults to the variant's natural tone (headings `default`, body `muted`, eyebrow `accent`). */
  tone?: TextTone;
  align?: TextAlign;
  /** Truncate to one line with an ellipsis. */
  truncate?: boolean;
  ref?: ComponentProps<"p">["ref"];
};

/** Polymorphic text primitive implementing the Credigit type scale. */
export function Text({ as, variant = "body", tone, align, truncate = false, className, ...props }: TextProps) {
  const Component = as ?? defaultElement[variant];
  return (
    <Component
      className={cx(
        variantClasses[variant],
        textToneClasses[tone ?? defaultTone[variant]],
        align && alignClasses[align],
        truncate && "truncate",
        className,
      )}
      {...props}
    />
  );
}
