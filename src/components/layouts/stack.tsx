import type { ComponentProps, ElementType } from "react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";

/** Gap scale shared by layout primitives. */
export type LayoutGap = Size | "none";

/** Tailwind gap class for each gap size (shared by Stack and Grid). */
export const gapClasses: Record<LayoutGap, string> = {
  none: "gap-0",
  xsmall: "gap-1",
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
  xlarge: "gap-10 lg:gap-12",
};

const aligns = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const justifies = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

/** Props for {@link Stack}. */
export type StackProps = ComponentProps<"div"> & {
  gap?: LayoutGap;
  direction?: "vertical" | "horizontal";
  align?: keyof typeof aligns;
  justify?: keyof typeof justifies;
  wrap?: boolean;
  as?: ElementType;
};

/** Flex stack that spaces its children evenly in one direction. */
export function Stack({
  gap = "medium",
  direction = "vertical",
  align,
  justify,
  wrap = false,
  as: Comp = "div",
  className,
  ...props
}: StackProps) {
  return (
    <Comp
      className={cx(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        align && aligns[align],
        justify && justifies[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}
