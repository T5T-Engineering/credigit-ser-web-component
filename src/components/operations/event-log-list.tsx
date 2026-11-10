"use client";

import type { ComponentProps, ElementType, ReactNode } from "react";
import { ChevronRight, Radio } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { SearchField } from "../forms/search-field";
import { Select } from "../forms/select";
import { useControllableState } from "../forms/field-context";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./ops-utils";

/** Delivery state of a published event. */
export type EventDeliveryStatus = "delivered" | "partial" | "failed" | "pending";

const deliveryTones: Record<EventDeliveryStatus, Tone> = { delivered: "success", partial: "warning", failed: "danger", pending: "neutral" };
const deliveryLabels: Record<EventDeliveryStatus, string> = { delivered: "Delivered", partial: "Partially delivered", failed: "Failed", pending: "Pending" };

/** A published domain event. */
export type DomainEventEntry = {
  id: string;
  /** Event name, e.g. `credit.facility.approved`. */
  name: string;
  /** Source module, e.g. "Credit". */
  module?: string;
  /** Subject the event is about. */
  subject?: { label: ReactNode; href?: string };
  actor?: ReactNode;
  /** Pre-formatted time (or `<time>`). */
  time: ReactNode;
  /** Payload (object → pretty JSON; string shown as is). */
  payload?: unknown;
  /** Number of subscribers the event was delivered to. */
  deliveredTo?: number;
  status?: EventDeliveryStatus;
};

/** Filter of an `EventLogList`. */
export type EventLogFilter = {
  /** Event name text or pattern (`*` wildcard, e.g. `credit.*`). Case-insensitive substring without `*`. */
  name?: string;
  /** Source module (exact). Empty = all. */
  module?: string;
};

/**
 * Match an event name against a pattern: `*` matches any run of characters (including dots), otherwise
 * a case-insensitive substring match. Empty pattern matches everything.
 */
export function matchEventPattern(pattern: string | undefined, name: string): boolean {
  const p = (pattern ?? "").trim().toLowerCase();
  if (p === "") return true;
  const n = name.toLowerCase();
  if (!p.includes("*")) return n.includes(p);
  const re = new RegExp(`^${p.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
  return re.test(n);
}

/** Filter events by name pattern and module. */
export function filterEvents<T extends Pick<DomainEventEntry, "name" | "module">>(events: T[], filter: EventLogFilter = {}): T[] {
  return events.filter((e) => matchEventPattern(filter.name, e.name) && (!filter.module || e.module === filter.module));
}

/** Pretty payload text (2-space JSON; strings as is; unserialisable values as String()). */
export function formatPayload(payload: unknown): string {
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload, null, 2) ?? String(payload);
  } catch {
    return String(payload);
  }
}

/** Labels of the event log (i18n). */
export type EventLogLabels = {
  search: string;
  searchPlaceholder: string;
  module: string;
  allModules: string;
  payload: string;
  deliveredTo: (n: number) => string;
  by: string;
  empty: string;
  count: (shown: number, total: number) => string;
};

const defaultLabels: EventLogLabels = {
  search: "Filter by event name",
  searchPlaceholder: "Event name or pattern, e.g. credit.*",
  module: "Module",
  allModules: "All modules",
  payload: "Payload",
  deliveredTo: (n) => `${n} ${n === 1 ? "subscriber" : "subscribers"}`,
  by: "by",
  empty: "No events match the filter.",
  count: (s, t) => (s === t ? `${t} events` : `${s} of ${t} events`),
};

/** Props for `EventLogList`. */
export type EventLogListProps = Omit<ComponentProps<"section">, "children"> & {
  /** Events in display order (newest first is typical; the list does not re-sort). */
  events: DomainEventEntry[];
  filter?: EventLogFilter;
  defaultFilter?: EventLogFilter;
  onFilterChange?: (filter: EventLogFilter) => void;
  /** Module options (default: distinct modules of `events`). */
  modules?: string[];
  /** Show the filter bar (default true). */
  showFilters?: boolean;
  /** Open payloads initially (default false). */
  defaultPayloadOpen?: boolean;
  /** Server-side filtering: render `events` as given (default false). */
  manual?: boolean;
  linkComponent?: ElementType;
  /** Accessible name of the list. Default "Domain events". */
  label?: string;
  labels?: Partial<EventLogLabels>;
};

/**
 * Chronological domain-event log: mono event name, source module, subject link, actor, time,
 * delivered-to subscriber count and a collapsible JSON payload (`font-code`); filter by name pattern
 * (`credit.*`) and module.
 */
export function EventLogList({
  events,
  filter: filterProp,
  defaultFilter = {},
  onFilterChange,
  modules: modulesProp,
  showFilters = true,
  defaultPayloadOpen = false,
  manual = false,
  linkComponent: Link = "a",
  label = "Domain events",
  labels,
  className,
  ...props
}: EventLogListProps) {
  const l = { ...defaultLabels, ...labels };
  const [filter, setFilter] = useControllableState(filterProp, defaultFilter, onFilterChange);
  const modules = modulesProp ?? [...new Set(events.map((e) => e.module).filter((m): m is string => Boolean(m)))].sort();
  const shown = manual ? events : filterEvents(events, filter);

  return (
    <section aria-label={label} className={cx("flex min-w-0 flex-col gap-4", className)} {...props}>
      {showFilters ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            className="sm:flex-1"
            label={l.search}
            placeholder={l.searchPlaceholder}
            value={filter.name ?? ""}
            onValueChange={(name) => setFilter({ ...filter, name })}
          />
          {modules.length > 0 ? (
            <Select
              className="sm:w-56"
              aria-label={l.module}
              value={filter.module ?? ""}
              onChange={(e) => setFilter({ ...filter, module: e.target.value || undefined })}
              options={[{ value: "", label: l.allModules }, ...modules.map((m) => ({ value: m, label: m }))]}
            />
          ) : null}
        </div>
      ) : null}
      <p className={cx(labelText, "text-fg-muted")} aria-live="polite" data-testid="event-count">
        {l.count(shown.length, events.length)}
      </p>
      {shown.length === 0 ? (
        <p className="squircle rounded-3xl bg-surface-sunken p-6 text-center text-sm text-fg-muted">{l.empty}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {shown.map((event) => (
            <li key={event.id} data-event={event.name} className="squircle flex min-w-0 flex-col gap-2 rounded-2xl bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Radio aria-hidden="true" className="size-4 shrink-0 text-accent-text" />
                <code className="min-w-0 font-code text-sm font-medium break-all text-fg">{event.name}</code>
                {event.module ? <Badge size="small">{event.module}</Badge> : null}
                <span className="ml-auto font-mono text-xs text-fg-subtle">{event.time}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                {event.subject ? (
                  event.subject.href ? (
                    <Link href={event.subject.href} className={cx("rounded-sm font-semibold text-link underline-offset-2 hover:underline", focusRing)}>
                      {event.subject.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-fg">{event.subject.label}</span>
                  )
                ) : null}
                {event.actor ? (
                  <span>
                    {l.by} {event.actor}
                  </span>
                ) : null}
                {event.deliveredTo !== undefined ? (
                  <Badge size="small" tone={event.status ? deliveryTones[event.status] : "neutral"} variant="outline" title={event.status ? deliveryLabels[event.status] : undefined}>
                    {l.deliveredTo(event.deliveredTo)}
                    {event.status && event.status !== "delivered" ? <span className="sr-only"> ({deliveryLabels[event.status]})</span> : null}
                  </Badge>
                ) : event.status ? (
                  <Badge size="small" tone={deliveryTones[event.status]}>
                    {deliveryLabels[event.status]}
                  </Badge>
                ) : null}
              </div>
              {event.payload !== undefined ? (
                <details open={defaultPayloadOpen} className="group">
                  <summary
                    className={cx(
                      "squircle inline-flex cursor-pointer list-none items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-fg-muted hover:bg-fg/5 hover:text-fg [&::-webkit-details-marker]:hidden",
                      focusRing,
                    )}
                  >
                    <ChevronRight aria-hidden="true" className="size-3.5 transition-transform duration-150 group-open:rotate-90" />
                    {l.payload}
                  </summary>
                  <pre className="squircle mt-2 max-h-72 overflow-auto rounded-xl bg-surface-sunken p-3 font-code text-xs leading-5 text-fg">
                    <code className="font-code">{formatPayload(event.payload)}</code>
                  </pre>
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
