"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Tooltip}. */
export type TooltipProps = Omit<ComponentProps<"span">, "content" | "children"> & {
  /** Short, non-interactive hint text. */
  content: ReactNode;
  /** Trigger. A single focusable element (button, link) is preferred; plain text gets wrapped in a focusable span. */
  children: ReactNode;
  side?: "top" | "bottom" | "start" | "end";
  /** Hover open delay in ms. Default 150. */
  delay?: number;
};

const sideClasses = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  start: "right-full top-1/2 mr-2 -translate-y-1/2",
  end: "left-full top-1/2 ml-2 -translate-y-1/2",
} as const;

/** Tooltip shown on hover and keyboard focus; Escape dismisses. Linked with `aria-describedby`. */
export function Tooltip({ content, children, side = "top", delay = 150, className, ...props }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), ms);
  };
  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimeout(timer.current);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  let trigger: ReactNode;
  if (isValidElement(children)) {
    const child = children as ReactElement<{ "aria-describedby"?: string }>;
    const existing = child.props["aria-describedby"];
    trigger = cloneElement(child, { "aria-describedby": existing ? `${existing} ${id}` : id });
  } else {
    trigger = (
      <span tabIndex={0} aria-describedby={id} className="rounded-md underline decoration-dotted underline-offset-4">
        {children}
      </span>
    );
  }

  return (
    <span
      className={cx("relative inline-flex", className)}
      onMouseEnter={() => schedule(true, delay)}
      onMouseLeave={() => schedule(false, 100)}
      onFocus={show}
      onBlur={() => setOpen(false)}
      {...props}
    >
      {trigger}
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={cx(
          "squircle absolute z-50 w-max max-w-xs rounded-xl bg-emphasis px-3 py-2 text-sm font-medium leading-snug text-on-emphasis shadow-md",
          sideClasses[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
