"use client";

import type { CSSProperties } from "react";

import { cx } from "../utils/cx";
import { useBrand } from "./BrandProvider";
import type { BrandLogos } from "./brand";
import * as svgs from "./logo-svgs";

export type LogoVariant = "horizontal" | "stacked" | "symbol" | "wordmark";
/** `auto` follows the surrounding surface theme (dark/xdark → reverse) via CSS variables. */
export type LogoTone = "auto" | "default" | "reverse";
export type LogoSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

const heights: Record<LogoSize, string> = {
  xsmall: "h-5",
  small: "h-7",
  medium: "h-9",
  large: "h-12",
  xlarge: "h-16",
};

export type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: LogoSize;
  /** Accessible name. Defaults to the brand name. Pass "" for a decorative logo next to visible brand text. */
  label?: string;
  className?: string;
};

function customLogoUrl(logos: BrandLogos, variant: LogoVariant, reverse: boolean): string | undefined {
  switch (variant) {
    case "horizontal":
    case "wordmark":
      return reverse ? (logos.horizontalReverse ?? logos.horizontal) : logos.horizontal;
    case "stacked":
      return reverse
        ? (logos.stackedReverse ?? logos.stacked ?? logos.horizontalReverse ?? logos.horizontal)
        : (logos.stacked ?? logos.horizontal);
    case "symbol":
      return reverse ? (logos.symbolReverse ?? logos.symbol) : logos.symbol;
  }
}

const reverseVars = {
  "--cg-logo-ink": "#FFFFFF",
  "--cg-logo-descriptor": "var(--cg-neutral-300)",
} as CSSProperties;

const defaultVars = {
  "--cg-logo-ink": "var(--cg-brand-primary)",
  "--cg-logo-descriptor": "var(--cg-brand-neutral)",
} as CSSProperties;

/**
 * Brand logo. Uses the uploaded tenant logo when one is set in BrandProvider,
 * otherwise the built-in Credigit logo, which recolours with the brand colours.
 */
export function Logo({ variant = "horizontal", tone = "auto", size = "medium", label, className }: LogoProps) {
  const { brand } = useBrand();
  const name = label ?? brand.name;
  const decorative = name === "";
  const custom = customLogoUrl(brand.logos, variant, tone === "reverse");

  // tone="auto" with a dedicated reverse upload: render both and let the surface theme pick one.
  const customReverse = tone === "auto" ? customLogoUrl(brand.logos, variant, true) : undefined;
  if (custom && customReverse && customReverse !== custom) {
    const imgClass = cx("w-auto max-w-full object-contain", heights[size], className);
    return (
      <>
        <img src={custom} alt={decorative ? "" : name} className={imgClass} style={{ display: "var(--cg-logo-default-display, inline-block)" }} />
        <img src={customReverse} alt={decorative ? "" : name} className={imgClass} style={{ display: "var(--cg-logo-reverse-display, none)" }} />
      </>
    );
  }

  if (custom) {
    return (
      <img
        src={custom}
        alt={decorative ? "" : name}
        className={cx("inline-block w-auto max-w-full object-contain", heights[size], className)}
      />
    );
  }

  const svg = svgs[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={svg.viewBox}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      className={cx("inline-block w-auto max-w-full", heights[size], className)}
      style={tone === "reverse" ? reverseVars : tone === "default" ? defaultVars : undefined}
      dangerouslySetInnerHTML={{ __html: svg.markup }}
    />
  );
}
