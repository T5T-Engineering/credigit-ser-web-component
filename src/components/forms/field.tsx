"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { FieldContext, type FieldContextValue, type FormControlSize } from "./field-context";
import { FieldMessage } from "./field-message";
import { Label } from "./label";
import { isOutOfView, isValueMissing, useValidationContext } from "./validation";

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
  /**
   * Inside a `ValidationScope` / `Form`: whether the value is missing. Pass it for controls the DOM check can't read
   * (custom pickers, chip inputs); by default the control with `htmlFor` / the generated id is inspected.
   */
  valueMissing?: boolean;
  /** Message shown when a required field is empty after a save attempt (default from the scope's labels). */
  requiredMessage?: ReactNode;
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
  valueMissing,
  requiredMessage,
  className,
  children,
  onInput,
  onChange,
  ...props
}: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? `cg-field-${autoId}`;
  const scope = useValidationContext();
  const checks = required && !disabled && scope !== null;
  const [missing, setMissing] = useState(false);
  const missingProp = useRef(valueMissing);
  missingProp.current = valueMissing;

  const check = useRef<() => boolean>(() => false);
  check.current = () => {
    const el = typeof document === "undefined" ? null : document.getElementById(id);
    const value = el && isOutOfView(el) ? false : (missingProp.current ?? isValueMissing(id));
    setMissing(value);
    return value;
  };

  useEffect(() => {
    if (!checks || !scope) return;
    return scope.register(id, { element: () => document.getElementById(id), check: () => check.current() });
  }, [checks, scope, id]);

  // Once a save was attempted, keep the message in step with what the person types or picks.
  useEffect(() => {
    if (checks && scope?.attempted) check.current();
  }, [checks, scope?.attempted, valueMissing]);

  const recheck = () => {
    if (checks && scope?.attempted) check.current();
  };

  const shownError = error ?? (checks && scope?.attempted && missing ? (requiredMessage ?? scope.labels.required) : undefined);
  const hasError = shownError !== undefined && shownError !== null && shownError !== false && shownError !== "";
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
      <div
        className={cx("flex min-w-0 flex-col gap-2", className)}
        data-invalid={hasError || undefined}
        onInput={(event) => {
          onInput?.(event);
          recheck();
        }}
        onChange={(event) => {
          onChange?.(event);
          recheck();
        }}
        {...props}
      >
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
            {shownError}
          </FieldMessage>
        ) : null}
      </div>
    </FieldContext>
  );
}
