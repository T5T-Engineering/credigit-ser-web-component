"use client";

import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { ValidationScope, useValidation, type ValidationLabels } from "./validation";

/** Props for `Form`. */
export type FormProps = ComponentProps<"form"> & {
  /** Vertical spacing between fields. */
  spacing?: "small" | "medium" | "large";
  /** Copy of the required-field message. */
  validationLabels?: Partial<ValidationLabels>;
};

const spacingClasses: Record<NonNullable<FormProps["spacing"]>, string> = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-8",
};

/**
 * `<form>` that stacks its fields vertically. On submit it checks every `Field required` inside: when one is empty the
 * submit is stopped, each empty field shows its message and the first one is scrolled to and focused; `onSubmit` runs
 * only when all are filled.
 */
export function Form({ spacing = "medium", validationLabels, className, onSubmit, noValidate = true, ...props }: FormProps) {
  const validation = useValidation(validationLabels);
  return (
    <ValidationScope value={validation}>
      <form
        noValidate={noValidate}
        className={cx("flex flex-col", spacingClasses[spacing], className)}
        onSubmit={(event) => {
          if (!validation.validate()) {
            event.preventDefault();
            return;
          }
          onSubmit?.(event);
        }}
        {...props}
      />
    </ValidationScope>
  );
}

/** Props for `FormActions`. */
export type FormActionsProps = ComponentProps<"div"> & {
  /** Button alignment (default "end"); "between" pushes the first child to the start. */
  align?: "start" | "end" | "between";
  /** Draw a divider above the actions. */
  divider?: boolean;
};

const alignClasses: Record<NonNullable<FormActionsProps["align"]>, string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

/** Row of form buttons (submit / cancel), right-aligned by default. */
export function FormActions({ align = "end", divider, className, ...props }: FormActionsProps) {
  return (
    <div
      className={cx("flex flex-wrap items-center gap-3", alignClasses[align], divider && "border-t border-line pt-6", className)}
      {...props}
    />
  );
}
