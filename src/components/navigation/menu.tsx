"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, type ElementType, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/** A menu entry. `divider` draws a separator above the item. */
export type MenuItem = {
  label: ReactNode;
  onSelect?: () => void;
  href?: string;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
};

/** Props for {@link Menu}. */
export type MenuProps = {
  /** Content of the trigger button (text and/or icon). */
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  /** Accessible name for an icon-only trigger. */
  triggerLabel?: string;
  /** Classes for the trigger button (e.g. `buttonStyles({ variant: "tertiary" })`). */
  triggerClassName?: string;
  /** Classes for the menu panel. */
  menuClassName?: string;
  linkComponent?: ElementType;
  className?: string;
};

const itemSelector = '[role="menuitem"]:not([aria-disabled="true"])';

/** Dropdown menu button implementing the WAI-ARIA menu button pattern. */
export function Menu({ trigger, items, align = "start", triggerLabel, triggerClassName, menuClassName, linkComponent, className }: MenuProps) {
  const Link = linkComponent ?? "a";
  const [open, setOpen] = useState(false);
  const [initialFocus, setInitialFocus] = useState<"first" | "last">("first");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const triggerId = useId();

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const list = menuItems();
    (initialFocus === "last" ? list[list.length - 1] : list[0])?.focus();
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, initialFocus, close]);

  const openWith = (focus: "first" | "last") => {
    setInitialFocus(focus);
    setOpen(true);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openWith("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openWith("last");
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = menuItems();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => list[(i + list.length) % list.length]?.focus();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(list.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        // Typeahead: jump to the next item starting with the typed character.
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const char = event.key.toLowerCase();
          const ordered = [...list.slice(index + 1), ...list.slice(0, index + 1)];
          ordered.find((el) => el.textContent?.trim().toLowerCase().startsWith(char))?.focus();
        }
    }
  };

  const activate = (item: MenuItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    close();
  };

  const itemClass = (item: MenuItem) =>
    cx(
      "squircle flex w-full min-h-10 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium outline-none transition-colors duration-150 ease-bolt",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
      item.disabled
        ? "cursor-not-allowed opacity-40"
        : item.danger
          ? "text-danger hover:bg-danger-soft focus:bg-danger-soft"
          : "text-fg hover:bg-fg/5 focus:bg-fg/5",
    );

  return (
    <div ref={rootRef} className={cx("relative inline-block", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => (open ? close(false) : openWith("first"))}
        onKeyDown={onTriggerKeyDown}
        className={cx(
          triggerClassName ??
            "squircle inline-flex h-control-md min-w-10 items-center justify-center gap-2 rounded-full bg-fg/5 px-4 text-sm font-semibold text-fg transition-colors hover:bg-fg/10",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
      >
        {trigger}
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={onMenuKeyDown}
          className={cx(
            "squircle absolute top-full z-50 mt-2 min-w-56 rounded-2xl bg-surface p-1.5 shadow-md",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item, index) => {
            const content = (
              <>
                {item.icon ? (
                  <span aria-hidden="true" className={cx("inline-flex shrink-0 [&>svg]:size-4", !item.danger && "text-fg-muted")}>
                    {item.icon}
                  </span>
                ) : null}
                <span className="flex-1">{item.label}</span>
              </>
            );
            return (
              <Fragment key={index}>
                {item.divider && index > 0 ? <div role="separator" className="-mx-1.5 my-1.5 h-px bg-line" /> : null}
                {item.href && !item.disabled ? (
                  <Link href={item.href} role="menuitem" tabIndex={-1} className={itemClass(item)} onClick={() => activate(item)}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    aria-disabled={item.disabled || undefined}
                    className={itemClass(item)}
                    onClick={() => activate(item)}
                  >
                    {content}
                  </button>
                )}
              </Fragment>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
