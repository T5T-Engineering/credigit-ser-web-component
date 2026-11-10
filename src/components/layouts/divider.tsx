import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Divider}. */
export type DividerProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  label?: ReactNode;
};

/** Thin separator line, optionally with a centred label. */
export function Divider({ orientation = "horizontal", label, className, ...props }: DividerProps) {
  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" className={cx("w-px self-stretch bg-line", className)} {...props} />;
  }
  if (label) {
    return (
      <div role="separator" className={cx("flex items-center gap-3", className)} {...props}>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{label}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return <div role="separator" className={cx("h-px w-full bg-line", className)} {...props} />;
}
