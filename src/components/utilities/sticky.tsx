import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Sticky}. */
export type StickyProps = ComponentProps<"div"> & {
  /** Offset from the top of the scroll container in px. Default 0. */
  top?: number;
  zIndex?: number;
};

/** Wrapper that sticks to the top of its scroll container (CSS `position: sticky`). */
export function Sticky({ top = 0, zIndex = 10, className, style, ...props }: StickyProps) {
  return <div className={cx("sticky", className)} style={{ top, zIndex, ...style }} {...props} />;
}
