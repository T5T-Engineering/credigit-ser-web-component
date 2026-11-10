import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Skeleton}. Shape it with `className` (e.g. `h-32 w-full`), or pass `lines` for a text block. */
export type SkeletonProps = Omit<ComponentProps<"div">, "children"> & {
  lines?: number;
};

const base = "squircle animate-pulse rounded-2xl bg-fg/8 [animation-duration:1.6s]";

/** Loading placeholder. Decorative (aria-hidden); pair with a Spinner or `aria-busy` on the region. */
export function Skeleton({ lines, className, ...props }: SkeletonProps) {
  if (lines && lines > 0) {
    return (
      <div aria-hidden="true" className={cx("flex flex-col gap-2", className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cx(base, "h-3.5 rounded-full",i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")} />
        ))}
      </div>
    );
  }
  return <div aria-hidden="true" className={cx(base, "h-4 w-full", className)} {...props} />;
}
