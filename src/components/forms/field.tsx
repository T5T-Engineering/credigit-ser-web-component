"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { FieldContext, type FieldContextValue, type FormControlSize } from "./field-context";
import { FieldMessage } from "./field-message";
import { Label } from "./label";

/** Props for `Field`. */
export type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  /** id of the control; generated when omitted and passed to the control via context. */
  htmlFor?: string;
  description?: ReactNode;
  /** Error message; marks the control `aria-invalid` and links the message via `aria-describedby`. */
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  /** Size passed to the control (controls may override). */
  size?: FormControlSize;
  /** Visually hide the label (kept for screen readers). */
  hideLabel?: boolean;
  children: ReactNode;
};

/** Label + control + description + error, wired together for accessibility via context. */
export function Field({
  label,
  htmlFor,
  description,
  error,
  required = false,
  optional = false,
  disabled = false,
  size,
  hideLabel,
  className,
  children,
  ...props
}: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? `cg-field-${autoId}`;
  const hasError = error !== undefined && error !== null && error !== false && error !== "";
  const value: FieldContextValue = {
    id,
    labelId: `${id}-label`,
    descriptionId: description ? `${id}-description` : undefined,
    errorId: hasError ? `${id}-error` : undefined,
    invalid: hasError,
    required,
    disabled,
    size,
  };

  return (
    <FieldContext value={value}>
      <div className={cx("flex min-w-0 flex-col gap-2", className)} data-invalid={hasError || undefined} {...props}>
        <Label id={value.labelId} htmlFor={id} required={required} optional={optional} srOnly={hideLabel}>
          {label}
        </Label>
        {description ? (
          <p id={value.descriptionId} className="-mt-1 text-sm leading-5 text-fg-muted">
            {description}
          </p>
        ) : null}
        {children}
        {hasError ? (
          <FieldMessage id={value.errorId} tone="error">
            {error}
          </FieldMessage>
        ) : null}
      </div>
    </FieldContext>
  );
}
