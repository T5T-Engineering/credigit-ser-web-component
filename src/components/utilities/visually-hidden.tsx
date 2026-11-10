import type { ComponentProps, ElementType } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link VisuallyHidden}. */
export type VisuallyHiddenProps = ComponentProps<"span"> & {
  as?: ElementType;
};

/** Content available to screen readers but not shown visually. */
export function VisuallyHidden({ as: Component = "span", className, ...props }: VisuallyHiddenProps) {
  return <Component className={cx("sr-only", className)} {...props} />;
}
