"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CornerDownLeft, Search } from "lucide-react";

import { useDialog } from "../blocks/use-dialog";
import { cx } from "../../utils/cx";
import { isApplePlatform } from "./app-utils";

/** A command palette entry (page, record or action). */
export type CommandItem = {
  id: string;
  label: string;
  /** Group id, e.g. "pages", "records", "actions". */
  group?: string;
  description?: string;
  icon?: ReactNode;
  /** Extra search terms (synonyms, reference numbers). */
  keywords?: string[];
  /** Shortcut hint shown on the right, e.g. "G A". */
  shortcut?: string;
  /** Route for the app to navigate to in `onSelect` (informational; the palette never navigates itself). */
  href?: string;
  disabled?: boolean;
};

/** Group heading definition (also sets display order). */
export type CommandGroup = { id: string; label: string };

/** Props for `CommandPalette`. */
export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /** Group headings and order. Groups not listed follow in order of first appearance. */
  groups?: CommandGroup[];
  /** Called when an item is chosen (Enter or click). The palette closes afterwards. */
  onSelect: (item: CommandItem) => void;
  /** Controlled query (for server-side search). */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Filter `items` locally by the query. Default true; set false when items come pre-filtered. */
  filter?: boolean;
  /** Shows a loading row. */
  loading?: boolean;
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Listen for Ctrl/Cmd+K globally to toggle the palette. Default true. */
  enableShortcut?: boolean;
  /** Accessible name of the dialog. Default "Command palette". */
  label?: string;
  /** Max results rendered. Default 50. */
  limit?: number;
  className?: string;
};

/** Case-insensitive token match score (higher is better, 0 = no match). */
export function scoreCommand(item: CommandItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const label = item.label.toLowerCase();
  const hay = [label, item.description ?? "", ...(item.keywords ?? []), item.group ?? ""].join(" ").toLowerCase();
  const tokens = q.split(/\s+/);
  if (!tokens.every((t) => hay.includes(t))) return 0;
  if (label.startsWith(q)) return 4;
  if (label.includes(q)) return 3;
  if (tokens.every((t) => label.includes(t))) return 2;
  return 1;
}

/** Ctrl/Cmd+K search dialog with grouped results and full keyboard navigation (ARIA combobox + listbox). */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  groups = [],
  onSelect,
  query: queryProp,
  onQueryChange,
  filter = true,
  loading = false,
  placeholder = "Search pages, records and actions…",
  emptyMessage = "No results found.",
  enableShortcut = true,
  label = "Command palette",
  limit = 50,
  className,
}: CommandPaletteProps) {
  const id = useId();
  const [innerQuery, setInnerQuery] = useState("");
  const query = queryProp ?? innerQuery;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const { dialogProps } = useDialog(open, onOpenChange);

  const setQuery = (q: string) => {
    if (queryProp === undefined) setInnerQuery(q);
    onQueryChange?.(q);
    setActive(0);
  };

  useEffect(() => {
    if (!enableShortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChangeRef.current(!openRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableShortcut]);

  // Reset query when reopened.
  useEffect(() => {
    if (open) {
      setActive(0);
    } else if (queryProp === undefined) {
      setInnerQuery("");
    }
  }, [open, queryProp]);

  const sections = useMemo(() => {
    const matched = (filter ? items.map((item) => ({ item, score: scoreCommand(item, query) })).filter((m) => m.score > 0) : items.map((item) => ({ item, score: 1 })))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((m) => m.item);
    const order: string[] = groups.map((g) => g.id);
    for (const item of matched) {
      const g = item.group ?? "";
      if (!order.includes(g)) order.push(g);
    }
    return order
      .map((gid) => ({
        id: gid,
        label: groups.find((g) => g.id === gid)?.label ?? gid,
        items: matched.filter((item) => (item.group ?? "") === gid),
      }))
      .filter((s) => s.items.length > 0);
  }, [items, groups, query, filter, limit]);

  const flat = sections.flatMap((s) => s.items);
  const enabledIndexes = flat.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
  const activeIndex = flat[active]?.disabled ? (enabledIndexes[0] ?? -1) : active < flat.length ? active : (enabledIndexes[0] ?? -1);
  const optionId = (i: number) => `${id}-opt-${i}`;

  useEffect(() => {
    if (activeIndex < 0) return;
    const el = document.getElementById(optionId(activeIndex));
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    onSelect(item);
    onOpenChange(false);
  };

  const move = (delta: number) => {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(activeIndex);
    const next = enabledIndexes[(pos + delta + enabledIndexes.length) % enabledIndexes.length];
    if (next !== undefined) setActive(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "PageDown":
      case "End":
        if (event.key === "End" && !event.ctrlKey) return;
        event.preventDefault();
        setActive(enabledIndexes[enabledIndexes.length - 1] ?? 0);
        break;
      case "PageUp":
      case "Home":
        if (event.key === "Home" && !event.ctrlKey) return;
        event.preventDefault();
        setActive(enabledIndexes[0] ?? 0);
        break;
      case "Enter":
        event.preventDefault();
        choose(flat[activeIndex]);
        break;
    }
  };

  const mod = isApplePlatform() ? "⌘" : "Ctrl";
  let running = -1;

  return (
    <dialog
      {...dialogProps}
      aria-label={label}
      aria-modal="true"
      className={cx(
        "mx-auto mt-[10vh] mb-auto w-[calc(100%-2rem)] max-w-2xl overflow-visible bg-transparent p-0 text-fg",
        "backdrop:bg-primary-900/60 backdrop:backdrop-blur-[2px]",
        "transition-[opacity,translate] duration-200 ease-bolt starting:open:-translate-y-2 starting:open:opacity-0",
        className,
      )}
    >
      <div data-dialog-body="" className="squircle flex max-h-[min(36rem,80dvh)] flex-col overflow-hidden rounded-4xl bg-surface shadow-lg">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search aria-hidden="true" className="size-5 shrink-0 text-fg-muted" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-16 min-w-0 flex-1 bg-transparent text-lg text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd className="hidden rounded-lg bg-fg/5 px-2 py-1 font-mono text-xs text-fg-muted sm:inline">Esc</kbd>
        </div>
        <div ref={listRef} id={`${id}-list`} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto p-2">
          {loading ? (
            <p role="status" className="px-3 py-6 text-center text-sm text-fg-muted">
              Searching…
            </p>
          ) : flat.length === 0 ? (
            <p role="status" className="px-3 py-10 text-center text-sm text-fg-muted">
              {emptyMessage}
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.id} role="group" aria-labelledby={section.label ? `${id}-g-${section.id}` : undefined} className="pb-1">
                {section.label ? (
                  <div id={`${id}-g-${section.id}`} role="presentation" className="px-3 pt-3 pb-1.5 font-mono text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">
                    {section.label}
                  </div>
                ) : null}
                {section.items.map((item) => {
                  running += 1;
                  const i = running;
                  const isActive = i === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={item.disabled || undefined}
                      onMouseMove={() => !item.disabled && i !== activeIndex && setActive(i)}
                      onClick={() => choose(item)}
                      className={cx(
                        "squircle flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2",
                        isActive ? "bg-accent-tint text-fg" : "text-fg",
                        item.disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {item.icon ? (
                        <span aria-hidden="true" className={cx("squircle grid size-8 shrink-0 place-items-center rounded-xl [&>svg]:size-4", isActive ? "bg-surface text-accent-text" : "bg-fg/5 text-fg-muted")}>
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold">{item.label}</span>
                        {item.description ? <span className="truncate text-xs text-fg-muted">{item.description}</span> : null}
                      </span>
                      {item.shortcut ? <kbd className="hidden rounded-lg bg-fg/5 px-2 py-0.5 font-mono text-xs text-fg-muted sm:inline">{item.shortcut}</kbd> : null}
                      {isActive ? <CornerDownLeft aria-hidden="true" className="size-4 shrink-0 text-fg-muted" /> : null}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-line px-5 py-2.5 font-mono text-xs text-fg-muted sm:flex">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span className="ml-auto">{mod} K to toggle</span>
        </div>
      </div>
    </dialog>
  );
}
