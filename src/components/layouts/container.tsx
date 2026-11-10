import type { ComponentProps, ElementType } from "react";

import { cx } from "../../utils/cx";

/** Container max-width options (640 / 896 / 1200 / 1440 / none). */
export type ContainerSize = "small" | "medium" | "large" | "xlarge" | "full";

const maxWidths: Record<ContainerSize, string> = {
  small: "max-w-[640px]",
  medium: "max-w-[896px]",
  large: "max-w-[1200px]",
  xlarge: "max-w-[1440px]",
  full: "max-w-none",
};

/** Props for {@link Container}. */
export type ContainerProps = ComponentProps<"div"> & {
  size?: ContainerSize;
  /** Element to render. Default `div`. */
  as?: ElementType;
};

/** Centred, max-width wrapper with responsive horizontal gutters. */
export function Container({ size = "large", as: Comp = "div", className, ...props }: ContainerProps) {
  return <Comp className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidths[size], className)} {...props} />;
}
