"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { SearchField } from "../forms/search-field";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./app-utils";

/** A role / persona. */
export type RoleOption = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Group heading, e.g. "Credit origination". */
  group?: string;
  /** Small label, e.g. "Approver". */
  badge?: ReactNode;
  disabled?: boolean;
};

/** Props for `RolePicker`. */
export type RolePickerProps = Omit<ComponentProps<"div">, "onSelect"> & {
  roles: RoleOption[];
  onSelect: (role: RoleOption) => void;
  /** Highlighted role. */
  selectedId?: string;
  /** Show the search box. Default: when more than 6 roles. */
  searchable?: boolean;
  /** `grid` (default) or `list`. */
  layout?: "grid" | "list";
  /** Group order; groups not listed follow in order of appearance. */
  groupOrder?: string[];
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
};

/** Persona / role chooser for demo sign-in: grouped role cards with icon, title, description and search. */
export function RolePicker({
  roles,
  onSelect,
  selectedId,
  searchable,
  layout = "grid",
  groupOrder = [],
  searchPlaceholder = "Search roles…",
  emptyMessage = "No roles match your search.",
  className,
  ...props
}: RolePickerProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const showSearch = searchable ?? roles.length > 6;
  const q = query.trim().toLowerCase();
  const filtered = q ? roles.filter((r) => [r.title, r.description ?? "", r.group ?? ""].join(" ").toLowerCase().includes(q)) : roles;
  const order = [...groupOrder];
  for (const r of filtered) if (!order.includes(r.group ?? "")) order.push(r.group ?? "");
  const groups = order.map((g) => ({ name: g, roles: filtered.filter((r) => (r.group ?? "") === g) })).filter((g) => g.roles.length > 0);

  return (
    <div className={cx("@container flex flex-col gap-5", className)} {...props}>
      {showSearch ? <SearchField value={query} onValueChange={setQuery} placeholder={searchPlaceholder} label="Search roles" /> : null}
      {groups.length === 0 ? <p className="py-6 text-center text-sm text-fg-muted">{emptyMessage}</p> : null}
      {groups.map((g, gi) => (
        <section key={g.name || gi} aria-labelledby={g.name ? `${id}-g${gi}` : undefined} className="flex flex-col gap-2.5">
          {g.name ? (
            <h3 id={`${id}-g${gi}`} className={cx(labelText, "text-fg-muted")}>
              {g.name}
            </h3>
          ) : null}
          <ul className={cx("grid gap-2", layout === "grid" && "@lg:grid-cols-2")}>
            {g.roles.map((role) => {
              const selected = role.id === selectedId;
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    disabled={role.disabled}
                    aria-pressed={selectedId !== undefined ? selected : undefined}
                    onClick={() => onSelect(role)}
                    className={cx(
                      "group squircle flex h-full w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition-[background-color,box-shadow] duration-150 ease-bolt",
                      focusRing,
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      selected ? "bg-accent-tint ring-2 ring-accent-500" : "bg-surface-sunken hover:bg-fg/[0.07]",
                    )}
                  >
                    {role.icon ? (
                      <span aria-hidden="true" className={cx("squircle grid size-10 shrink-0 place-items-center rounded-xl [&>svg]:size-5", selected ? "bg-surface text-accent-text" : "bg-surface text-fg shadow-sm")}>
                        {role.icon}
                      </span>
                    ) : null}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-semibold text-fg">{role.title}</span>
                        {role.badge ? <span className="rounded-full bg-fg/5 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-fg-muted uppercase">{role.badge}</span> : null}
                      </span>
                      {role.description ? <span className="line-clamp-2 text-xs leading-4 text-fg-muted">{role.description}</span> : null}
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
