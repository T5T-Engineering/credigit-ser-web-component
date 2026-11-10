import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for `Label`. */
export type LabelProps = ComponentProps<"label"> & {
  /** Show a required indicator (asterisk, hidden from assistive tech; the control carries `required`). */
  required?: boolean;
  /** Show an "(optional)" hint. */
  optional?: boolean;
  /** Visually hide the label but keep it for screen readers. */
  srOnly?: boolean;
};

/** Form label with required / optional indicators. */
export function Label({ required, optional, srOnly, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cx(
        srOnly ? "sr-only" : "inline-flex flex-wrap items-baseline gap-1 text-sm font-semibold leading-5 text-fg sm:text-base sm:leading-6",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="text-danger-strong" data-required-indicator="">
          *
        </span>
      ) : null}
      {optional && !required ? <span className="text-sm font-normal text-fg-muted">(optional)</span> : null}
    </label>
  );
}
