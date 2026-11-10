"use client";

import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";

import { cx } from "../../utils/cx";
import { bareControlClasses, controlFrameClasses, controlPaddingX, iconSize } from "./control-styles";
import { useFieldControl, type FormControlSize } from "./field-context";

/** One option of a `Select`. */
export type SelectOption = { value: string | number; label: string; disabled?: boolean };

/** Props for `Select`. */
export type SelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: FormControlSize;
  invalid?: boolean;
  /** Options; alternatively pass `<option>` children. */
  options?: SelectOption[];
  /** Empty first option shown when nothing is selected. */
  placeholder?: string;
};

/** Native styled select; wires to `Field` automatically. */
export function Select({
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  options,
  placeholder,
  className,
  children,
  value,
  defaultValue,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: SelectProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  // With a placeholder and no explicit value, start on the empty option.
  const initial =
    value === undefined && defaultValue === undefined && placeholder !== undefined && !props.multiple
      ? ""
      : defaultValue;

  return (
    <div
      className={controlFrameClasses({ size: ctl.size, invalid: ctl.invalid, disabled: ctl.disabled, className })}
      data-invalid={ctl.invalid || undefined}
    >
      <select
        id={ctl.id}
        value={value}
        defaultValue={initial}
        disabled={ctl.disabled}
        required={ctl.required}
        aria-invalid={ctl.ariaInvalid}
        aria-describedby={ctl.describedBy}
        className={cx(bareControlClasses, controlPaddingX[ctl.size], "cursor-pointer pr-10 [&>option]:bg-surface [&>option]:text-fg")}
        {...props}
      >
        {placeholder !== undefined ? (
          <option value="" disabled={ctl.required}>
            {placeholder}
          </option>
        ) : null}
        {options?.map((option) => (
          <option key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={iconSize[ctl.size]}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}
