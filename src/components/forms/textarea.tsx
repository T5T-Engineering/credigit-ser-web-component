"use client";

import { useCallback, useLayoutEffect, useRef, type ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { mergeRefs, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `Textarea`. */
export type TextareaProps = ComponentProps<"textarea"> & {
  size?: FormControlSize;
  invalid?: boolean;
  /** Grow with content instead of scrolling. */
  autoResize?: boolean;
};

const textareaSize: Record<FormControlSize, string> = {
  small: "px-3 py-2 text-sm",
  medium: "px-4 py-2.5 text-base",
  large: "px-5 py-3 text-base",
};

/** Multi-line text input with optional auto-resize; wires to `Field` automatically. */
export function Textarea({
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  autoResize = false,
  rows = 3,
  className,
  ref,
  onInput,
  value,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: TextareaProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    required: requiredProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!autoResize || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

  useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  return (
    <textarea
      ref={mergeRefs(innerRef, ref)}
      id={ctl.id}
      rows={rows}
      value={value}
      disabled={ctl.disabled}
      required={ctl.required}
      aria-invalid={ctl.ariaInvalid}
      aria-describedby={ctl.describedBy}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      className={cx(
        // Bolt: soft grey fill, no border at rest; white surface + focus ring on focus.
        "block w-full min-w-0 rounded-3xl squircle bg-fg/5 text-fg outline-none placeholder:text-fg-subtle",
        "transition-[background-color,box-shadow] duration-150 ease-bolt focus:bg-surface focus:shadow-sm focus:ring-2",
        textareaSize[ctl.size],
        autoResize ? "resize-none overflow-hidden" : "resize-y",
        ctl.invalid
          ? "ring-2 ring-danger focus:ring-danger"
          : "hover:bg-fg/10 focus:ring-focus",
        ctl.disabled && "cursor-not-allowed opacity-50 hover:bg-fg/5",
        className,
      )}
      {...props}
    />
  );
}
