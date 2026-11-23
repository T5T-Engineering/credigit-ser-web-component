"use client";

import type { ComponentProps, ReactNode } from "react";

import { focusRing } from "../app/app-utils";
import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";

/** One entry of a {@link SelectableList}. */
export type SelectableListItem = {
  id: string;
  label: ReactNode;
  /** Secondary line (e.g. an id or a summary). */
  description?: ReactNode;
  /** Count pill on the right. */
  count?: number | string;
  /** Tone of the count pill. Default `"neutral"`. */
  countTone?: Tone;
  disabled?: boolean;
};

/** Props for {@link SelectableList}. */
export type SelectableListProps = Omit<ComponentProps<"nav">, "onSelect"> & {
  items: SelectableListItem[];
  /** Id of the selected item. */
  value?: string | null;
  onSelect: (id: string) => void;
  /** Accessible name, e.g. "Obligors". */
  label: string;
  /** Shown when there are no items. */
  empty?: ReactNode;
};

/**
 * Master list of a master-detail layout (e.g. obligors beside their documents): one button per item with an optional description and a
 * count pill; the selected item is highlighted and marked `aria-current`.
 */
export function SelectableList({ items, value, onSelect, label, empty, className, ...props }: SelectableListProps) {
  return (
    <nav aria-label={label} className={cx("flex flex-col gap-1", className)} {...props}>
      {items.length === 0 && empty ? <div className="px-3 py-2 text-sm text-fg-muted">{empty}</div> : null}
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(item.id)}
            className={cx(
              "squircle flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition-colors duration-150 ease-bolt disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "bg-primary-100 text-primary-700" : "text-fg hover:bg-fg/5",
              focusRing,
            )}
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">{item.label}</span>
              {item.description ? <span className={cx("truncate text-xs", selected ? "text-primary-700/80" : "text-fg-muted")}>{item.description}</span> : null}
            </span>
            {item.count !== undefined ? (
              <Badge size="small" tone={item.countTone ?? "neutral"}>
                {item.count}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
