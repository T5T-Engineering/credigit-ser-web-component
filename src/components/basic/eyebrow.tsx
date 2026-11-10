import type { ComponentProps, ElementType } from "react";

import { cx } from "../../utils/cx";

/** Props for `Eyebrow`. */
export type EyebrowProps = Omit<ComponentProps<"span">, "ref"> & {
  tone?: "accent" | "muted";
  /** Element to render (default `span`; use `p` above headings when it should be its own block). */
  as?: ElementType;
};

/** Small mono uppercase label shown above headings, KPIs and sections. */
export function Eyebrow({ tone = "accent", as: Component = "span", className, ...props }: EyebrowProps) {
  return (
    <Component
      className={cx(
        "inline-block font-mono text-xs font-medium uppercase tracking-[0.08em]",
        tone === "accent" ? "text-link" : "text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}
