"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { ArrowRight, Globe, Lock, Monitor } from "lucide-react";

import { cx } from "../../utils/cx";
import { Avatar } from "../basic/avatar";
import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";

/** A field change recorded on an activity. */
export type ActivityChange = { field: ReactNode; before?: ReactNode; after?: ReactNode };

/** One entry of the feed / audit trail. */
export type ActivityItem = {
  id: string;
  /** Who did it (a string is treated as the name). */
  actor: string | { name: string; avatarSrc?: string; role?: string };
  /** What happened, e.g. "approved", "changed the limit of". */
  action: ReactNode;
  /** What it happened to, e.g. a facility reference. */
  target?: ReactNode;
  /** Event type used for filtering, e.g. "approval", "update", "login". */
  type?: string;
  /** ISO string, Date or epoch ms. */
  timestamp: string | number | Date;
  /** Before → after values. */
  changes?: ActivityChange[];
  ip?: string;
  device?: string;
  /** Free text (comment, reason). */
  note?: ReactNode;
  /** Badge tone for the type label. */
  tone?: Tone;
};

/** Props for {@link ActivityFeed}. */
export type ActivityFeedProps = Omit<ComponentProps<"section">, "children"> & {
  items: ActivityItem[];
  /** Type filter pills. `""` value = all. */
  types?: { value: string; label: string }[];
  /** Controlled type filter. */
  type?: string;
  defaultType?: string;
  onTypeChange?: (type: string) => void;
  /** Group entries under day headings. Default true. */
  groupByDay?: boolean;
  formatTimestamp?: (date: Date) => string;
  formatDay?: (date: Date) => string;
  /** Show type badges, IP and device (audit style). Default false. */
  detailed?: boolean;
  /** Accessible name. Default "Activity". */
  label?: string;
  emptyMessage?: ReactNode;
  /** Content under the filters (e.g. an immutability notice). */
  notice?: ReactNode;
};

const toDate = (t: ActivityItem["timestamp"]) => (t instanceof Date ? t : new Date(t));
const defaultTime = (d: Date) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(d);
const defaultDay = (d: Date) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function Entry({
  item,
  detailed,
  formatTimestamp,
  formatDay,
  showDate,
}: {
  item: ActivityItem;
  detailed: boolean;
  formatTimestamp: (d: Date) => string;
  formatDay: (d: Date) => string;
  showDate: boolean;
}) {
  const actor = typeof item.actor === "string" ? { name: item.actor } : item.actor;
  const date = toDate(item.timestamp);
  const valid = !Number.isNaN(date.getTime());
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0 before:absolute before:start-4 before:top-10 before:bottom-1 before:w-px before:bg-line last:before:hidden" data-type={item.type}>
      <Avatar name={actor.name} src={actor.avatarSrc} size="small" className="relative" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="m-0 min-w-0 text-sm text-fg-muted">
            <span className="font-semibold text-fg">{actor.name}</span>
            {actor.role ? <span className="text-fg-subtle"> · {actor.role}</span> : null} {item.action}
            {item.target ? <span className="font-semibold text-fg"> {item.target}</span> : null}
          </p>
          {valid ? (
            <time dateTime={date.toISOString()} className="shrink-0 font-mono text-xs text-fg-muted tabular-nums">
              {showDate ? `${formatDay(date)}, ` : ""}
              {formatTimestamp(date)}
            </time>
          ) : null}
        </div>
        {item.changes && item.changes.length > 0 ? (
          <ul className="squircle m-0 flex list-none flex-col gap-1 rounded-2xl bg-surface-sunken p-3 text-sm" aria-label="Changes">
            {item.changes.map((change, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{change.field}</span>
                <span className="font-mono text-fg-muted tabular-nums line-through decoration-fg-subtle">
                  <span className="sr-only">from </span>
                  {change.before ?? "—"}
                </span>
                <ArrowRight aria-hidden="true" className="size-3.5 text-fg-subtle" />
                <span className="font-mono font-semibold text-fg tabular-nums">
                  <span className="sr-only">to </span>
                  {change.after ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {item.note ? <div className="text-sm text-fg-muted">{item.note}</div> : null}
        {detailed && (item.type || item.ip || item.device) ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
            {item.type ? (
              <Badge size="small" tone={item.tone ?? "neutral"}>
                {item.type.replaceAll("_", " ")}
              </Badge>
            ) : null}
            {item.ip ? (
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Globe aria-hidden="true" className="size-3.5" />
                <span className="sr-only">IP address </span>
                {item.ip}
              </span>
            ) : null}
            {item.device ? (
              <span className="inline-flex items-center gap-1">
                <Monitor aria-hidden="true" className="size-3.5" />
                <span className="sr-only">Device </span>
                {item.device}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** Chronological activity list: avatar, actor, action, target, before → after changes, timestamp, optional IP/device, with type filter pills and day grouping. */
export function ActivityFeed({
  items,
  types,
  type: typeProp,
  defaultType = "",
  onTypeChange,
  groupByDay = true,
  formatTimestamp = defaultTime,
  formatDay = defaultDay,
  detailed = false,
  label = "Activity",
  emptyMessage = "No activity to show.",
  notice,
  className,
  ...props
}: ActivityFeedProps) {
  const [typeState, setTypeState] = useState(defaultType);
  const active = typeProp ?? typeState;
  const setType = (value: string) => {
    if (typeProp === undefined) setTypeState(value);
    onTypeChange?.(value);
  };
  const visible = active ? items.filter((i) => i.type === active) : items;

  const groups: { key: string; date?: Date; items: ActivityItem[] }[] = [];
  for (const item of visible) {
    const d = toDate(item.timestamp);
    const key = groupByDay && !Number.isNaN(d.getTime()) ? dayKey(d) : "all";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, date: groupByDay ? d : undefined, items: [item] });
  }

  const pill = (selected: boolean) =>
    cx(
      "squircle inline-flex h-control-sm items-center rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 ease-bolt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
      selected ? "bg-emphasis text-on-emphasis" : "bg-fg/5 text-fg hover:bg-fg/10",
    );

  return (
    <section aria-label={label} className={cx("flex flex-col gap-4", className)} {...props}>
      {types && types.length > 0 ? (
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
          {[{ value: "", label: "All" }, ...types.filter((t) => t.value !== "")].map((t) => (
            <button key={t.value || "all"} type="button" aria-pressed={active === t.value} onClick={() => setType(t.value)} className={pill(active === t.value)}>
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      {notice}
      {visible.length === 0 ? (
        <p className="squircle m-0 rounded-3xl bg-surface-sunken px-6 py-10 text-center text-fg-muted">{emptyMessage}</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            {group.date && groupByDay ? (
              <h3 className="m-0 font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">{formatDay(group.date)}</h3>
            ) : null}
            <ol className="m-0 list-none p-0">
              {group.items.map((item) => (
                <Entry key={item.id} item={item} detailed={detailed} formatTimestamp={formatTimestamp} formatDay={formatDay} showDate={!groupByDay} />
              ))}
            </ol>
          </div>
        ))
      )}
    </section>
  );
}

/** Props for {@link AuditTrail}. */
export type AuditTrailProps = ActivityFeedProps & {
  /** Immutability notice. Set `null` to hide. */
  immutableNotice?: ReactNode;
};

/** Immutable audit log: `ActivityFeed` in detailed mode (type badges, IP, device) with an append-only notice. */
export function AuditTrail({
  label = "Audit trail",
  immutableNotice = "Audit entries are append-only and cannot be edited or deleted.",
  ...props
}: AuditTrailProps) {
  return (
    <ActivityFeed
      label={label}
      detailed
      notice={
        immutableNotice ? (
          <p className="m-0 inline-flex items-center gap-2 text-sm text-fg-muted">
            <Lock aria-hidden="true" className="size-4" />
            {immutableNotice}
          </p>
        ) : null
      }
      {...props}
    />
  );
}
