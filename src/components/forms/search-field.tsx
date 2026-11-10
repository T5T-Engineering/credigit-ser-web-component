"use client";

import { useRef, useState, type ChangeEvent, type ComponentProps, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";

import { cx } from "../../utils/cx";
import { adornmentClasses, adornmentPadEnd, adornmentPadStart, bareControlClasses, controlFrameClasses, iconSize } from "./control-styles";
import { mergeRefs, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `SearchField`. */
export type SearchFieldProps = Omit<ComponentProps<"input">, "size" | "type" | "value" | "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  /** Called with the new text on every change and with "" on clear. */
  onValueChange?: (value: string) => void;
  /** Called after the clear button (or Escape) empties the field. */
  onClear?: () => void;
  /** Show a clear button when the field has text (default true). */
  clearable?: boolean;
  /** Accessible name when no visible label/Field is present (default "Search"). */
  label?: string;
  /** Accessible name of the clear button (default "Clear search"). */
  clearLabel?: string;
  size?: FormControlSize;
  invalid?: boolean;
};

/** Search input with a leading icon and an optional clear button; Escape also clears. */
export function SearchField({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onClear,
  onChange,
  onKeyDown,
  clearable = true,
  label = "Search",
  clearLabel = "Clear search",
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  className,
  ref,
  placeholder = "Search…",
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  "aria-label": ariaLabelProp,
  "aria-labelledby": ariaLabelledByProp,
  ...props
}: SearchFieldProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internal, setInternal] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internal;
  const needsName = !ctl.field && !ariaLabelledByProp;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!controlled) setInternal(event.target.value);
    onChange?.(event);
    onValueChange?.(event.target.value);
  }

  function clear() {
    if (!controlled) setInternal("");
    onValueChange?.("");
    onClear?.();
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && value !== "" && clearable) {
      event.preventDefault();
      clear();
    }
  }

  const showClear = clearable && value !== "" && !ctl.disabled && !props.readOnly;

  return (
    <div
      className={controlFrameClasses({ size: ctl.size, invalid: ctl.invalid, disabled: ctl.disabled, className })}
      data-invalid={ctl.invalid || undefined}
    >
      <span aria-hidden="true" className={cx(adornmentClasses, adornmentPadStart[ctl.size])}>
        <Search size={iconSize[ctl.size]} />
      </span>
      <input
        ref={mergeRefs(inputRef, ref)}
        type="search"
        id={ctl.id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={ctl.disabled}
        required={ctl.required}
        aria-invalid={ctl.ariaInvalid}
        aria-describedby={ctl.describedBy}
        aria-label={ariaLabelProp ?? (needsName ? label : undefined)}
        aria-labelledby={ariaLabelledByProp}
        className={cx(
          bareControlClasses,
          "pl-2",
          showClear ? "pr-1" : adornmentPadEnd[ctl.size],
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
        )}
        {...props}
      />
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={clear}
          className="my-auto mr-2 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full bg-fg/10 text-fg-muted transition-colors duration-150 ease-bolt hover:bg-fg/20 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
        >
          <X aria-hidden="true" size={iconSize[ctl.size] - 4} />
        </button>
      ) : null}
    </div>
  );
}
