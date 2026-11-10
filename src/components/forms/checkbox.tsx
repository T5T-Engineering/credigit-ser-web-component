"use client";

import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";

import { cx } from "../../utils/cx";
import { joinIds, mergeRefs, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `Checkbox`. */
export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "size"> & {
  /** Visible label rendered next to the box. Omit when used inside a `Field` (the Field label applies). */
  label?: ReactNode;
  /** Secondary text under the label (linked with aria-describedby). */
  description?: ReactNode;
  size?: FormControlSize;
  invalid?: boolean;
  /** Mixed state (e.g. "select all" with some rows selected). */
  indeterminate?: boolean;
};

const boxSize: Record<FormControlSize, string> = { small: "size-4", medium: "size-5", large: "size-6" };
const glyph: Record<FormControlSize, number> = { small: 12, medium: 14, large: 16 };
const labelText: Record<FormControlSize, string> = { small: "text-sm", medium: "text-base", large: "text-lg" };
// Vertically centres the box on the first 24px label line.
const boxOffset: Record<FormControlSize, string> = { small: "mt-1", medium: "mt-0.5", large: "mt-0" };

/** Checkbox with label, description, invalid and indeterminate states. */
export function Checkbox({
  label,
  description,
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  indeterminate = false,
  className,
  ref,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: CheckboxProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const autoId = useId();
  const id = ctl.id ?? `cg-checkbox-${autoId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const innerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx("inline-flex min-h-6 items-start gap-3", ctl.disabled && "cursor-not-allowed opacity-50", className)}>
      <span className={cx("relative inline-flex shrink-0", boxOffset[ctl.size])}>
        <input
          ref={mergeRefs(innerRef, ref)}
          type="checkbox"
          id={id}
          disabled={ctl.disabled}
          required={ctl.required}
          aria-invalid={ctl.ariaInvalid}
          aria-describedby={joinIds(descriptionId, ctl.describedBy)}
          className={cx(
            // Bolt: rounded square, soft hairline at rest, filled with the action colour when checked.
            "peer m-0 shrink-0 cursor-pointer appearance-none rounded-md squircle border-2 bg-surface transition-colors duration-150 ease-bolt",
            "checked:border-action checked:bg-action indeterminate:border-action indeterminate:bg-action",
            "checked:hover:border-action-hover checked:hover:bg-action-hover active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed",
            ctl.invalid ? "border-danger" : "border-line-strong hover:border-fg-subtle",
            boxSize[ctl.size],
          )}
          {...props}
        />
        <Check
          aria-hidden="true"
          size={glyph[ctl.size]}
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto text-on-action opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        />
        <Minus
          aria-hidden="true"
          size={glyph[ctl.size]}
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto text-on-action opacity-0 peer-indeterminate:opacity-100"
        />
      </span>
      {label || description ? (
        <span className="flex flex-col gap-0.5">
          {label ? (
            <label htmlFor={id} className={cx("cursor-pointer leading-6 font-medium text-fg", labelText[ctl.size], ctl.disabled && "cursor-not-allowed")}>
              {label}
              {ctl.required ? (
                <span aria-hidden="true" className="ml-1 text-danger-strong">
                  *
                </span>
              ) : null}
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
