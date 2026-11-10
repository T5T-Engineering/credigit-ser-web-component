import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for `ChipList`. */
export type ChipListProps = ComponentProps<"div"> & {
  /** Spacing between chips. */
  gap?: "small" | "medium";
};

/** Wraps a set of chips in a wrapping row with consistent gaps. */
export function ChipList({ gap = "small", className, ...props }: ChipListProps) {
  return <div className={cx("flex flex-wrap items-center", gap === "small" ? "gap-2" : "gap-3", className)} {...props} />;
}
