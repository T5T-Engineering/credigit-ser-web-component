"use client";

import {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing, type HeadingTag } from "./block-utils";

type AccordionContextValue = {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  headingAs: HeadingTag;
  variant: "plain" | "boxed";
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

/** Props for `Accordion`. */
export type AccordionProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  /** One panel open at a time (default) or many. */
  type?: "single" | "multiple";
  /** Initially open item value(s) (uncontrolled). */
  defaultValue?: string | string[];
  /** Open item value(s) (controlled). */
  value?: string | string[];
  /** Called with the new open values. */
  onValueChange?: (value: string[]) => void;
  /** In `single` mode, allow closing the open item. Default true. */
  collapsible?: boolean;
  /** Heading level wrapping each trigger. Default `h3`. */
  headingAs?: HeadingTag;
  /** `"plain"` (divided rows, default) or `"boxed"` (each item a card). */
  variant?: "plain" | "boxed";
};

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/** Vertically stacked disclosure panels (ARIA accordion pattern). */
export function Accordion({
  type = "single",
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  headingAs = "h3",
  variant = "plain",
  className,
  children,
  onKeyDown,
  ...props
}: AccordionProps) {
  const [internal, setInternal] = useState<string[]>(() => toArray(defaultValue));
  const controlled = value !== undefined;
  const open = controlled ? toArray(value) : internal;

  const toggle = useCallback(
    (item: string) => {
      const isOpen = open.includes(item);
      let next: string[];
      if (type === "multiple") next = isOpen ? open.filter((v) => v !== item) : [...open, item];
      else if (isOpen) next = collapsible ? [] : open;
      else next = [item];
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [open, type, collapsible, controlled, onValueChange],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ isOpen: (v) => open.includes(v), toggle, headingAs, variant }),
    [open, toggle, headingAs, variant],
  );

  // Arrow-key navigation between triggers.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const target = event.target as HTMLElement;
    if (!target.matches("[data-accordion-trigger]")) return;
    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]:not(:disabled)"),
    );
    const index = triggers.indexOf(target as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowDown") next = triggers[(index + 1) % triggers.length];
    else if (event.key === "ArrowUp") next = triggers[(index - 1 + triggers.length) % triggers.length];
    else if (event.key === "Home") next = triggers[0];
    else if (event.key === "End") next = triggers[triggers.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  return (
    <AccordionContext value={ctx}>
      <div
        className={cx(variant === "plain" ? "border-t border-line" : "flex flex-col gap-3", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </AccordionContext>
  );
}

/** Props for `AccordionItem`. */
export type AccordionItemProps = Omit<ComponentProps<"div">, "title"> & {
  /** Unique key within the accordion. */
  value: string;
  /** Trigger label. */
  title: ReactNode;
  /** Disable the trigger. */
  disabled?: boolean;
};

/** One collapsible section of an `Accordion`. */
export function AccordionItem({ value, title, disabled, className, children, ...props }: AccordionItemProps) {
  const ctx = use(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used inside <Accordion>.");
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const open = ctx.isOpen(value);
  const Heading = ctx.headingAs;
  const boxed = ctx.variant === "boxed";

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cx(
        "group/acc",
        boxed
          ? "squircle rounded-3xl bg-surface-sunken px-5 transition-colors duration-200 sm:px-8"
          : "border-b border-line",
        className,
      )}
      {...props}
    >
      <Heading className="m-0">
        <button
          type="button"
          id={triggerId}
          data-accordion-trigger=""
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => ctx.toggle(value)}
          className={cx(
            "flex w-full cursor-pointer items-center justify-between gap-6 rounded-2xl py-5 text-left sm:py-6",
            "font-display text-lg leading-snug font-bold tracking-[-0.01em] text-fg sm:text-subtitle",
            "disabled:cursor-not-allowed disabled:opacity-50",
            focusRing,
          )}
        >
          <span>{title}</span>
          <span
            aria-hidden="true"
            className={cx(
              "grid size-10 shrink-0 place-items-center rounded-full text-fg transition duration-200 ease-bolt",
              boxed ? "bg-surface" : "bg-fg/5 group-hover/acc:bg-fg/10",
              open && "rotate-180",
            )}
          >
            <ChevronDown className="size-5" />
          </span>
        </button>
      </Heading>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        inert={!open}
        className={cx(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pr-4 pb-6 text-base leading-7 text-fg-muted sm:pr-16 sm:text-lg sm:leading-[1.55]">{children}</div>
        </div>
      </div>
    </div>
  );
}
