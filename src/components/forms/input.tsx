"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import {
  adornmentClasses,
  adornmentPadEnd,
  adornmentPadStart,
  bareControlClasses,
  controlFrameClasses,
  controlPaddingX,
} from "./control-styles";
import { joinIds, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `Input`. */
export type InputProps = Omit<ComponentProps<"input">, "size" | "prefix"> & {
  size?: FormControlSize;
  invalid?: boolean;
  /** Icon rendered inside the frame before the text (decorative). */
  iconBefore?: ReactNode;
  /** Icon or element rendered inside the frame after the text. */
  iconAfter?: ReactNode;
  /** Static segment before the input, e.g. "₦". Announced to screen readers via aria-describedby. */
  prefix?: ReactNode;
  /** Static segment after the input, e.g. "%" or "NGN". Announced via aria-describedby. */
  suffix?: ReactNode;
  /** Monospaced, tabular, right-aligned figures (amounts, rates). */
  numeric?: boolean;
  /** Extra class names for the native input element (`className` goes to the outer frame). */
  inputClassName?: string;
};

/** Text input with optional icons and prefix/suffix segments; wires to `Field` automatically. */
export function Input({
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id: idProp,
  iconBefore,
  iconAfter,
  prefix,
  suffix,
  numeric,
  className,
  inputClassName,
  type = "text",
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: InputProps) {
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
  const baseId = ctl.id ?? `cg-input-${autoId}`;
  const prefixId = prefix ? `${baseId}-prefix` : undefined;
  const suffixId = suffix ? `${baseId}-suffix` : undefined;
  const pad = controlPaddingX[ctl.size];
  // Bolt: segments sit inside the pill as muted text, separated from the value by a hairline.
  const segment = "flex shrink-0 items-center font-mono text-fg-muted";

  return (
    <div
      className={controlFrameClasses({ size: ctl.size, invalid: ctl.invalid, disabled: ctl.disabled, className })}
      data-invalid={ctl.invalid || undefined}
      data-disabled={ctl.disabled || undefined}
    >
      {prefix ? (
        <span id={prefixId} className={cx(segment, adornmentPadStart[ctl.size], "pr-2 after:ml-2 after:h-4 after:w-px after:bg-line after:content-['']")}>
          {prefix}
        </span>
      ) : null}
      {iconBefore ? (
        <span aria-hidden="true" className={cx(adornmentClasses, prefix ? "pl-1" : adornmentPadStart[ctl.size])}>
          {iconBefore}
        </span>
      ) : null}
      <input
        id={ctl.id}
        type={type}
        disabled={ctl.disabled}
        required={ctl.required}
        aria-invalid={ctl.ariaInvalid}
        aria-describedby={joinIds(prefixId, suffixId, ctl.describedBy)}
        className={cx(
          bareControlClasses,
          pad,
          iconBefore || prefix ? "pl-2" : undefined,
          iconAfter || suffix ? "pr-2" : undefined,
          numeric && "text-right font-mono tabular-nums",
          inputClassName,
        )}
        {...props}
      />
      {iconAfter ? <span className={cx(adornmentClasses, suffix ? "pr-1" : adornmentPadEnd[ctl.size])}>{iconAfter}</span> : null}
      {suffix ? (
        <span id={suffixId} className={cx(segment, adornmentPadEnd[ctl.size], "pl-2 before:mr-2 before:h-4 before:w-px before:bg-line before:content-['']")}>
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
