import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";

const asideEnd = {
  narrow: "lg:grid-cols-[minmax(0,1fr)_14rem]",
  medium: "lg:grid-cols-[minmax(0,1fr)_18rem]",
  wide: "lg:grid-cols-[minmax(0,1fr)_24rem]",
} as const;

const asideStart = {
  narrow: "lg:grid-cols-[14rem_minmax(0,1fr)]",
  medium: "lg:grid-cols-[18rem_minmax(0,1fr)]",
  wide: "lg:grid-cols-[24rem_minmax(0,1fr)]",
} as const;

/** Props for {@link Layout}. */
export type LayoutProps = ComponentProps<"div"> & {
  aside: ReactNode;
  asidePosition?: "start" | "end";
  asideWidth?: "narrow" | "medium" | "wide";
  /** Accessible label for the aside landmark. */
  asideLabel?: string;
  /** Keep the aside in view while scrolling (lg and up). */
  stickyAside?: boolean;
};

/** Two-column content + aside layout; stacks on small screens (content first). */
export function Layout({
  aside,
  asidePosition = "end",
  asideWidth = "medium",
  asideLabel,
  stickyAside = false,
  className,
  children,
  ...props
}: LayoutProps) {
  const start = asidePosition === "start";
  return (
    <div className={cx("grid grid-cols-1 gap-10 lg:gap-16", start ? asideStart[asideWidth] : asideEnd[asideWidth], className)} {...props}>
      <div className={cx("min-w-0", start && "lg:order-2")}>{children}</div>
      <aside aria-label={asideLabel} className={cx("min-w-0", start && "lg:order-1")}>
        <div className={cx(stickyAside && "lg:sticky lg:top-28")}>{aside}</div>
      </aside>
    </div>
  );
}
