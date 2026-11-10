import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Semantic heading level. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** Visual heading size, independent of the level. */
export type HeadingSize = "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";

/* Bolt type scale: xxlarge = display, xlarge = headline, large = title, then smaller titles. */
const sizeClasses: Record<HeadingSize, string> = {
  xxlarge: "text-[2.75rem] leading-[1.05] tracking-[-0.025em] md:text-[3.75rem] lg:text-display",
  xlarge: "text-[2rem] leading-[1.1] tracking-[-0.02em] md:text-headline",
  large: "text-2xl leading-[1.2] tracking-[-0.015em] md:text-title",
  medium: "text-2xl leading-[1.2] tracking-[-0.015em]",
  small: "text-subtitle",
  xsmall: "text-lg leading-[1.4] tracking-[-0.01em]",
};

const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "xxlarge",
  2: "xlarge",
  3: "large",
  4: "medium",
  5: "small",
  6: "xsmall",
};

/** Props for `Heading`. */
export type HeadingProps = ComponentProps<"h2"> & {
  level: HeadingLevel;
  /** Visual size; defaults to the size matching `level`. */
  size?: HeadingSize;
};

/** Semantic heading (`h1`–`h6`) with a visual size decoupled from the level. */
export function Heading({ level, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cx("font-display font-bold text-balance text-fg", sizeClasses[size ?? defaultSize[level]], className)}
      {...props}
    />
  );
}
