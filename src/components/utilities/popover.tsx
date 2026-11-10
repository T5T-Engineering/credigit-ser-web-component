"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Popover}. */
export type PopoverProps = Omit<ComponentProps<"div">, "content" | "children"> & {
  /** Element that toggles the popover. A single button element is preferred; other content is wrapped in a button. */
  trigger: ReactNode;
  content: ReactNode;
  align?: "start" | "center" | "end";
  side?: "bottom" | "top";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the popover panel. */
  label?: string;
  panelClassName?: string;
};

const alignClasses = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" } as const;

/** Non-modal popover: click to toggle, closes on Escape (restoring focus) and on outside click. */
export function Popover({
  trigger,
  content,
  align = "start",
  side = "bottom",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label,
  className,
  panelClassName,
  ...props
}: PopoverProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const focusTrigger = () => {
    const el = triggerRef.current?.querySelector<HTMLElement>("button, a[href], [tabindex]");
    el?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        focusTrigger();
      }
    };
    const onPointer = (event: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, setOpen]);

  const triggerProps = {
    "aria-expanded": open,
    "aria-controls": id,
    "aria-haspopup": "dialog" as const,
  };

  let triggerNode: ReactNode;
  if (isValidElement(trigger)) {
    const el = trigger as ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;
    triggerNode = cloneElement(el, {
      ...triggerProps,
      onClick: (event: MouseEvent<HTMLElement>) => {
        el.props.onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      },
    });
  } else {
    triggerNode = (
      <button
        type="button"
        {...triggerProps}
        onClick={() => setOpen(!open)}
        className="squircle inline-flex min-h-6 items-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {trigger}
      </button>
    );
  }

  return (
    <div ref={rootRef} className={cx("relative inline-block", className)} {...props}>
      <span ref={triggerRef} className="contents">
        {triggerNode}
      </span>
      {open && (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={cx(
            "squircle absolute z-50 min-w-56 max-w-sm rounded-2xl bg-surface p-4 text-sm text-fg shadow-md focus:outline-none",
            side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            alignClasses[align],
            panelClassName,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
