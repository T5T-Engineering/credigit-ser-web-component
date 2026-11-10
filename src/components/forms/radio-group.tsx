"use client";

import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { joinIds, useControllableState, useFieldContext, type FormControlSize } from "./field-context";
import { Radio } from "./radio";

/** One option of a `RadioGroup`. */
export type RadioGroupOption = { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean };

/** Props for `RadioGroup`. */
export type RadioGroupProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  options: RadioGroupOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /** Shared `name` for the native radios; generated when omitted. */
  name?: string;
  /** Group label rendered above the options. Omit when inside a `Field` (the Field label is used). */
  label?: ReactNode;
  size?: FormControlSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
};

/** Accessible radio group: arrow keys move and select (wrapping, skipping disabled), Tab enters at the selected option. */
export function RadioGroup({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  orientation = "vertical",
  name: nameProp,
  label,
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  className,
  "aria-describedby": describedByProp,
  ...props
}: RadioGroupProps) {
  const field = useFieldContext();
  const autoId = useId();
  const id = idProp ?? field?.id ?? `cg-radiogroup-${autoId}`;
  const name = nameProp ?? `${id}-name`;
  const labelId = label ? `${id}-legend` : field?.labelId;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const disabled = disabledProp ?? field?.disabled ?? false;
  const required = requiredProp ?? field?.required ?? false;
  const size = sizeProp ?? field?.size ?? "medium";
  const [value, setValue] = useControllableState<string | undefined>(valueProp, defaultValue, (next) => {
    if (next !== undefined) onChange?.(next);
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const enabled = options.filter((option) => !option.disabled && !disabled);
  // Roving tab stop: the selected option, else the first enabled one.
  const tabStop = enabled.some((option) => option.value === value) ? value : enabled[0]?.value;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key) || enabled.length === 0) return;
    event.preventDefault();
    const target = event.target as HTMLElement;
    const currentIndex = enabled.findIndex((option) => option.value === (target as HTMLInputElement).value);
    let nextIndex: number;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabled.length - 1;
    else {
      const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + step + enabled.length) % enabled.length;
    }
    const next = enabled[nextIndex];
    if (!next) return;
    setValue(next.value);
    const inputs = containerRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    inputs?.forEach((input) => {
      if (input.value === next.value) input.focus();
    });
  }

  return (
    <div className={cx("flex flex-col gap-3", className)}>
      {label ? (
        <span id={labelId} className="text-sm font-semibold leading-5 text-fg sm:text-base sm:leading-6">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-danger-strong">
              *
            </span>
          ) : null}
        </span>
      ) : null}
      <div
        ref={containerRef}
        id={id}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={joinIds(describedByProp, field?.descriptionId, field?.errorId)}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cx("flex", orientation === "vertical" ? "flex-col gap-3" : "flex-row flex-wrap gap-x-6 gap-y-3")}
        {...props}
      >
        {options.map((option) => {
          const optionDisabled = disabled || option.disabled;
          return (
            <Radio
              key={option.value}
              id={`${id}-${option.value.replace(/\s+/g, "-")}`}
              name={name}
              value={option.value}
              label={option.label}
              description={option.description}
              size={size}
              invalid={invalid}
              disabled={optionDisabled}
              required={required}
              checked={value === option.value}
              tabIndex={option.value === tabStop ? 0 : -1}
              onChange={() => setValue(option.value)}
            />
          );
        })}
      </div>
    </div>
  );
}
