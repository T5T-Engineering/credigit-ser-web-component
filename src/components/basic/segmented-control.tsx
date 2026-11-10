"use client";

import { useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/** One option of a `SegmentedControl`. */
export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

/** Props for `SegmentedControl`. */
export type SegmentedControlProps<T extends string = string> = Omit<ComponentProps<"div">, "onChange" | "children"> & {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "small" | "medium" | "large";
  /** Accessible name of the radiogroup. */
  label: string;
  /** Stretch segments to fill the container width. */
  fullWidth?: boolean;
  disabled?: boolean;
};

const sizeClasses = {
  small: "h-[calc(var(--cg-control-h-sm)-0.5rem)] px-3 text-xs",
  medium: "h-[calc(var(--cg-control-h-md)-0.5rem)] px-4 text-sm",
  large: "h-[calc(var(--cg-control-h-lg)-0.5rem)] px-5 text-base",
} as const;

/** Bolt segmented control: grey pill track with a raised pill thumb (ARIA radiogroup, roving focus, arrow keys). */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "medium",
  label,
  fullWidth = false,
  disabled = false,
  className,
  ...props
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = (i: number) => !disabled && !options[i]?.disabled;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = selectedIndex >= 0 && enabled(selectedIndex) ? selectedIndex : options.findIndex((_, i) => enabled(i));

  function move(from: number, step: 1 | -1) {
    const n = options.length;
    for (let k = 1; k <= n; k++) {
      const i = (((from + step * k) % n) + n) % n;
      if (enabled(i)) return i;
    }
    return -1;
  }

  function select(i: number) {
    const option = options[i];
    if (i < 0 || !option) return;
    refs.current[i]?.focus();
    if (option.value !== value) onChange(option.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = move(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = move(index, -1);
        break;
      case "Home":
        next = move(-1, 1);
        break;
      case "End":
        next = move(options.length, -1);
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cx(
        "items-center gap-1 rounded-full squircle bg-fg/5 p-1",
        fullWidth ? "flex w-full" : "inline-flex",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        const isDisabled = !enabled(index);
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={isDisabled}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "inline-flex min-w-6 items-center justify-center gap-1.5 rounded-full squircle font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ease-bolt",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              fullWidth && "flex-1",
              checked ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
            )}
          >
            {option.icon ? (
              <span aria-hidden="true" className="inline-flex shrink-0">
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
