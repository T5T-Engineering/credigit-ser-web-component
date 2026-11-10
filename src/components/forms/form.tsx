import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for `Form`. */
export type FormProps = ComponentProps<"form"> & {
  /** Vertical spacing between fields. */
  spacing?: "small" | "medium" | "large";
};

const spacingClasses: Record<NonNullable<FormProps["spacing"]>, string> = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-8",
};

/** `<form>` that stacks its fields vertically. */
export function Form({ spacing = "medium", className, ...props }: FormProps) {
  return <form className={cx("flex flex-col", spacingClasses[spacing], className)} {...props} />;
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
