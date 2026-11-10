"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { joinIds, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `Radio`. */
export type RadioProps = Omit<ComponentProps<"input">, "type" | "size"> & {
  label?: ReactNode;
  /** Secondary text under the label (linked with aria-describedby). */
  description?: ReactNode;
  size?: FormControlSize;
  invalid?: boolean;
};

const ringSize: Record<FormControlSize, string> = { small: "size-4", medium: "size-5", large: "size-6" };
const dotSize: Record<FormControlSize, string> = { small: "size-1.5", medium: "size-2", large: "size-2.5" };
const labelText: Record<FormControlSize, string> = { small: "text-sm", medium: "text-base", large: "text-lg" };
// Vertically centres the box on the first 24px label line.
const boxOffset: Record<FormControlSize, string> = { small: "mt-1", medium: "mt-0.5", large: "mt-0" };

/** Single radio button with label and description. Usually rendered by `RadioGroup`. */
export function Radio({
  label,
  description,
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  id: idProp,
  className,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: RadioProps) {
  // Radios never take the Field's id (a group has many); they only inherit size / invalid / disabled.
  const ctl = useFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const autoId = useId();
  const id = idProp ?? `cg-radio-${autoId}`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cx("inline-flex min-h-6 items-start gap-3", ctl.disabled && "cursor-not-allowed opacity-50", className)}>
      <span className={cx("relative inline-flex shrink-0", boxOffset[ctl.size])}>
        <input
          type="radio"
          id={id}
          disabled={ctl.disabled}
          aria-invalid={ariaInvalidProp ?? (invalidProp ? true : undefined)}
          aria-describedby={joinIds(describedByProp, descriptionId)}
          className={cx(
            // Bolt: circle; when selected the ring fills with the action colour around a white dot.
            "peer m-0 shrink-0 cursor-pointer appearance-none rounded-full border-2 bg-surface transition-colors duration-150 ease-bolt",
            "checked:border-action checked:bg-action checked:hover:border-action-hover checked:hover:bg-action-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed",
            ctl.invalid ? "border-danger" : "border-line-strong hover:border-fg-subtle",
            ringSize[ctl.size],
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-0 m-auto scale-0 rounded-full bg-on-action transition-transform duration-150 ease-bolt peer-checked:scale-100",
            dotSize[ctl.size],
          )}
        />
      </span>
      {label || description ? (
        <span className="flex flex-col gap-0.5">
          {label ? (
            <label htmlFor={id} className={cx("cursor-pointer leading-6 font-medium text-fg", labelText[ctl.size], ctl.disabled && "cursor-not-allowed")}>
              {label}
            </label>
          ) : null}
          {description ? (
            <span id={descriptionId} className="text-sm leading-5 text-fg-muted">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
