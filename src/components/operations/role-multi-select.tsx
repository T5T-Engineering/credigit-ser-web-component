"use client";

import type { ComponentProps } from "react";
import { Check } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing } from "./ops-utils";

/** One selectable option (role, recipient, …). */
export type MultiSelectOption = { value: string; label: string; description?: string; disabled?: boolean };

/** Props for `RoleMultiSelect`. */
export type RoleMultiSelectProps = Omit<ComponentProps<"div">, "onChange" | "children"> & {
  options: MultiSelectOption[];
  value: string[];
  onChange?: (value: string[]) => void;
  /** Accessible name of the group (e.g. "Approver roles"). */
  label: string;
  disabled?: boolean;
  /** Draws a danger ring around the group. */
  invalid?: boolean;
  size?: "small" | "medium";
};

const sizeClasses = { small: "h-7 gap-1 px-3 text-xs", medium: "h-control-sm gap-1.5 px-3.5 text-sm" } as const;

/**
 * Multi-select as toggle pills (`aria-pressed`) for approver roles, notification recipients and
 * `roles` rule values. Selected pills use the accent tint; the result keeps the options' order.
 */
export function RoleMultiSelect({
  options,
  value,
  onChange,
  label,
  disabled = false,
  invalid = false,
  size = "medium",
  className,
  ...props
}: RoleMultiSelectProps) {
  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange?.(value.filter((x) => x !== v));
      return;
    }
    const known = options.filter((o) => o.value === v || value.includes(o.value)).map((o) => o.value);
    // Values not present in options (e.g. retired roles) are kept at the end.
    const unknown = value.filter((x) => !options.some((o) => o.value === x));
    onChange?.([...known, ...unknown]);
  };
  return (
    <div
      role="group"
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={cx("flex flex-wrap gap-2 rounded-3xl", invalid && "p-1.5 ring-2 ring-danger", className)}
      {...props}
    >
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            title={option.description}
            disabled={disabled || option.disabled}
            onClick={() => toggle(option.value)}
            className={cx(
              "squircle inline-flex min-w-6 items-center rounded-full font-semibold whitespace-nowrap transition-[background-color,color,transform] duration-150 ease-bolt active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
              focusRing,
              sizeClasses[size],
              selected ? "bg-accent-tint text-accent-text ring-1 ring-inset ring-accent-500/40" : "bg-fg/5 text-fg hover:bg-fg/10",
            )}
          >
            {selected ? <Check aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.5} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
