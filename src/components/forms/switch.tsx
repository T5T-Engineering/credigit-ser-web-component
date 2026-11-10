"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { joinIds, useControllableState, useFieldControl, type FormControlSize } from "./field-context";

/** Props for `Switch`. */
export type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "value" | "children" | "type"> & {
  /** On/off state (controlled). */
  checked?: boolean;
  /** Initial state (uncontrolled). */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label (also the accessible name). */
  label: ReactNode;
  /** Secondary text under the label (linked with aria-describedby). */
  description?: ReactNode;
  /** Put the label before or after the track. */
  labelPosition?: "start" | "end";
  /** Visually hide the label (kept as the accessible name). */
  hideLabel?: boolean;
  size?: FormControlSize;
  invalid?: boolean;
  /** When set, a hidden input carries the value in native form submissions. */
  name?: string;
  /** Value submitted when on (default "on"). */
  value?: string;
};

// Bolt pill toggle: 2px inset white thumb on a soft grey (off) or action-coloured (on) track.
const track: Record<FormControlSize, string> = { small: "h-5 w-8", medium: "h-6 w-10", large: "h-7 w-12" };
const thumb: Record<FormControlSize, string> = {
  small: "size-4 data-[state=on]:translate-x-3",
  medium: "size-5 data-[state=on]:translate-x-4",
  large: "size-6 data-[state=on]:translate-x-5",
};
const labelText: Record<FormControlSize, string> = { small: "text-sm", medium: "text-base", large: "text-lg" };

/** On/off toggle (`role="switch"`) for settings that apply immediately. Space/Enter toggle. */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  labelPosition = "end",
  hideLabel,
  size: sizeProp,
  invalid: invalidProp,
  disabled: disabledProp,
  id: idProp,
  name,
  value = "on",
  className,
  onClick,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: SwitchProps) {
  const ctl = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    size: sizeProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
  });
  const autoId = useId();
  const id = ctl.id ?? `cg-switch-${autoId}`;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const [checked, setChecked] = useControllableState(checkedProp, defaultChecked, onCheckedChange);
  const state = checked ? "on" : "off";

  const text = (
    <span className={cx("flex flex-col gap-0.5", hideLabel && "sr-only")}>
      <label id={labelId} htmlFor={id} className={cx("cursor-pointer leading-6 font-medium text-fg", labelText[ctl.size], ctl.disabled && "cursor-not-allowed")}>
        {label}
      </label>
      {description ? (
        <span id={descriptionId} className="text-sm leading-5 text-fg-muted">
          {description}
        </span>
      ) : null}
    </span>
  );

  return (
    <div
      className={cx(
        description ? "inline-flex min-h-6 items-start gap-3" : "inline-flex min-h-6 items-center gap-3",
        ctl.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {labelPosition === "start" ? text : null}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={joinIds(descriptionId, ctl.describedBy)}
        aria-invalid={ctl.ariaInvalid}
        disabled={ctl.disabled}
        data-state={state}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setChecked(!checked);
        }}
        className={cx(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full squircle p-0.5 transition-colors duration-200 ease-bolt",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed",
          "after:absolute after:-inset-1 after:content-['']", // enlarges the target to >= 24px
          checked ? "bg-action hover:bg-action-hover" : "bg-fg/20 hover:bg-fg/30",
          ctl.invalid && "ring-2 ring-danger ring-offset-2 ring-offset-surface",
          description ? "mt-0.5" : undefined,
          track[ctl.size],
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          data-state={state}
          className={cx("block rounded-full bg-on-action shadow-sm transition-transform duration-200 ease-bolt", thumb[ctl.size])}
        />
      </button>
      {labelPosition === "end" ? text : null}
      {name ? <input type="hidden" name={name} value={checked ? value : ""} disabled={ctl.disabled} /> : null}
    </div>
  );
}
