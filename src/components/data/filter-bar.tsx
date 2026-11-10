"use client";

import type { ComponentProps, ReactNode } from "react";
import { CalendarRange, ChevronDown, X } from "lucide-react";

import { cx } from "../../utils/cx";
import { SearchField } from "../forms/search-field";

/** One option of a select filter pill. */
export type FilterOption = { value: string; label: string; count?: number };

/** A select pill: shows `label: <selected option>` and offers the options in a native select. */
export type FilterBarSelect = {
  type?: "select";
  id: string;
  label: string;
  options: FilterOption[];
  /** Selected value; `""` = no filter. */
  value: string;
  onChange: (value: string) => void;
  /** Text of the "no filter" option. Default "All". */
  allLabel?: string;
};

/** A date range pill with "from" and "to" date inputs (ISO `yyyy-mm-dd` strings). */
export type FilterBarDateRange = {
  type: "dateRange";
  id: string;
  label: string;
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
  min?: string;
  max?: string;
};

/** Any filter rendered by `FilterBar`. */
export type FilterBarFilter = FilterBarSelect | FilterBarDateRange;

/** Props for {@link FilterBar}. */
export type FilterBarProps = Omit<ComponentProps<"div">, "children"> & {
  /** Search box. Omit for no search. */
  search?: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string };
  filters?: FilterBarFilter[];
  /** Shows a "Clear all" pill while any search/filter is active. */
  onClearAll?: () => void;
  clearAllLabel?: string;
  /** Right-aligned actions (export, column toggles, primary button). */
  actions?: ReactNode;
  /** Extra pills/content after the filters. */
  children?: ReactNode;
  /** Accessible name of the filter group. Default "Filters". */
  label?: string;
};

const pillBase =
  "squircle relative inline-flex h-control-sm max-w-full items-center gap-1.5 rounded-full text-sm font-semibold transition-colors duration-150 ease-bolt focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus";
const pillIdle = "bg-fg/5 text-fg hover:bg-fg/10";
const pillActive = "bg-accent-tint text-accent-text";

/** True when a filter currently constrains results. */
export function isFilterActive(filter: FilterBarFilter): boolean {
  return filter.type === "dateRange" ? Boolean(filter.from || filter.to) : filter.value !== "";
}

function SelectPill({ filter }: { filter: FilterBarSelect }) {
  const active = filter.value !== "";
  const allLabel = filter.allLabel ?? "All";
  const current = filter.options.find((o) => o.value === filter.value)?.label ?? allLabel;
  return (
    <span className={cx(pillBase, active ? pillActive : pillIdle, "pl-3.5 pr-8")} data-active={active || undefined}>
      <span aria-hidden="true" className={cx("whitespace-nowrap", active ? "opacity-80" : "text-fg-muted")}>
        {filter.label}:
      </span>
      <span aria-hidden="true" className="truncate">
        {current}
      </span>
      {/* The native select covers the pill so the whole pill is the hit target; it stays transparent. */}
      <select
        aria-label={filter.label}
        value={filter.value}
        onChange={(event) => filter.onChange(event.target.value)}
        className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0 [&>option]:bg-surface [&>option]:text-fg"
      >
        <option value="">{allLabel}</option>
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.count !== undefined ? `${option.label} (${option.count})` : option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4" />
    </span>
  );
}

function DateRangePill({ filter }: { filter: FilterBarDateRange }) {
  const active = isFilterActive(filter);
  const input =
    "min-w-0 bg-transparent font-mono text-sm tabular-nums text-inherit outline-none [color-scheme:inherit] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60";
  return (
    <fieldset className={cx(pillBase, active ? pillActive : pillIdle, "m-0 border-0 px-3.5")} data-active={active || undefined}>
      <legend className="sr-only">{filter.label}</legend>
      <CalendarRange aria-hidden="true" className="size-4 shrink-0" />
      <span aria-hidden="true" className={cx("whitespace-nowrap", active ? "opacity-80" : "text-fg-muted")}>
        {filter.label}:
      </span>
      <input
        type="date"
        aria-label={`${filter.label} from`}
        value={filter.from ?? ""}
        min={filter.min}
        max={filter.to || filter.max}
        onChange={(event) => filter.onChange({ from: event.target.value || undefined, to: filter.to })}
        className={input}
      />
      <span aria-hidden="true">–</span>
      <input
        type="date"
        aria-label={`${filter.label} to`}
        value={filter.to ?? ""}
        min={filter.from || filter.min}
        max={filter.max}
        onChange={(event) => filter.onChange({ from: filter.from, to: event.target.value || undefined })}
        className={input}
      />
    </fieldset>
  );
}

/** Controlled row of Bolt pill filters: search, select pills, date ranges and "Clear all", with right-aligned actions. */
export function FilterBar({
  search,
  filters = [],
  onClearAll,
  clearAllLabel = "Clear all",
  actions,
  children,
  label = "Filters",
  className,
  ...props
}: FilterBarProps) {
  const anyActive = Boolean(search?.value) || filters.some(isFilterActive);
  return (
    <div className={cx("flex flex-wrap items-center gap-2", className)} {...props}>
      <div role="group" aria-label={label} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {search ? (
          <SearchField
            size="small"
            value={search.value}
            onValueChange={search.onChange}
            placeholder={search.placeholder}
            label={search.label ?? "Search"}
            className="w-full sm:w-64"
          />
        ) : null}
        {filters.map((filter) =>
          filter.type === "dateRange" ? <DateRangePill key={filter.id} filter={filter} /> : <SelectPill key={filter.id} filter={filter} />,
        )}
        {children}
        {onClearAll && anyActive ? (
          <button
            type="button"
            onClick={onClearAll}
            className="squircle inline-flex h-control-sm items-center gap-1 rounded-full px-3 text-sm font-semibold text-fg-muted transition-colors duration-150 ease-bolt hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <X aria-hidden="true" className="size-4" />
            {clearAllLabel}
          </button>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
