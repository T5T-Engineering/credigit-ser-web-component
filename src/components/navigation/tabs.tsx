"use client";

import { useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/** A tab and its panel content. */
export type TabItem = { id: string; label: ReactNode; content: ReactNode; icon?: ReactNode; badge?: ReactNode; disabled?: boolean };

/** Props for {@link Tabs}. */
export type TabsProps = Omit<ComponentProps<"div">, "children" | "defaultValue"> & {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: "underline" | "pill";
  /** Accessible name of the tab list. */
  label?: string;
  /** `automatic` selects on arrow-key focus (default); `manual` requires Enter/Space. */
  activation?: "automatic" | "manual";
  /** Extra classes for the panels. */
  panelClassName?: string;
};

/** Tabbed panels implementing the WAI-ARIA tabs pattern (arrow keys, Home/End, roving tabindex). */
export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  variant = "pill",
  label,
  activation = "automatic",
  panelClassName,
  className,
  ...props
}: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((i) => !i.disabled)?.id;
  const [internal, setInternal] = useState(defaultValue ?? firstEnabled);
  const selected = value ?? internal;
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    if (id !== selected) onValueChange?.(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => ({ item, i })).filter(({ item }) => !item.disabled);
    const pos = enabled.findIndex(({ i }) => i === index);
    let next: TabItem | undefined;
    switch (event.key) {
      case "ArrowRight":
        next = enabled[(pos + 1) % enabled.length]?.item;
        break;
      case "ArrowLeft":
        next = enabled[(pos - 1 + enabled.length) % enabled.length]?.item;
        break;
      case "Home":
        next = enabled[0]?.item;
        break;
      case "End":
        next = enabled[enabled.length - 1]?.item;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (!next) return;
    tabRefs.current.get(next.id)?.focus();
    if (activation === "automatic") select(next.id);
  };

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;
  const pill = variant === "pill";

  return (
    <div className={className} {...props}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        className={cx(
          "flex max-w-full overflow-x-auto",
          pill ? "squircle inline-flex gap-1 rounded-full bg-fg/5 p-1" : "gap-2 border-b border-line",
        )}
      >
        {items.map((item, index) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) tabRefs.current.set(item.id, el);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={isSelected}
              aria-controls={panelId(item.id)}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cx(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-150 ease-bolt",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40",
                pill
                  ? cx("squircle h-control-md rounded-full px-4", isSelected ? "bg-emphasis text-on-emphasis" : "text-fg-muted hover:bg-fg/5 hover:text-fg")
                  : cx(
                      "-mb-px h-control-lg border-b-2 px-1",
                      isSelected ? "border-action text-fg" : "border-transparent text-fg-muted hover:border-line-strong hover:text-fg",
                    ),
              )}
            >
              {item.icon ? (
                <span aria-hidden="true" className="inline-flex [&>svg]:size-4">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
              {item.badge !== undefined ? (
                <span className={cx("rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold", pill && isSelected ? "bg-on-emphasis/15 text-on-emphasis" : "bg-fg/10 text-fg-muted")}>{item.badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={panelId(item.id)}
          aria-labelledby={tabId(item.id)}
          hidden={item.id !== selected}
          tabIndex={0}
          className={cx("pt-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", panelClassName)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
