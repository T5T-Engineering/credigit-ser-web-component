import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** Props for `Fieldset`. */
export type FieldsetProps = ComponentProps<"fieldset"> & {
  legend: ReactNode;
  description?: ReactNode;
  /** Visually hide the legend (kept for screen readers). */
  hideLegend?: boolean;
};

/** Groups related fields under a legend; `disabled` disables every control inside. */
export function Fieldset({ legend, description, hideLegend, className, children, ...props }: FieldsetProps) {
  return (
    <fieldset className={cx("m-0 flex min-w-0 flex-col gap-5 border-0 p-0", className)} {...props}>
      <legend className={cx(hideLegend ? "sr-only" : "mb-1 font-display text-subtitle font-semibold text-fg")}>
        {legend}
      </legend>
      {description ? <p className="-mt-3 text-base text-fg-muted">{description}</p> : null}
      {children}
    </fieldset>
  );
}
