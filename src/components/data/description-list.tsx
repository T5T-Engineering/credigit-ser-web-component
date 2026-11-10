import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { StatusBadge } from "../basic/status-badge";
import type { Tone } from "../basic/tone";
import { CopyToClipboard } from "../utilities/copy-to-clipboard";

/** One label/value pair. */
export type DescriptionItem = {
  label: ReactNode;
  /** Value; ignored when `status` is set. Empty values render an em dash. */
  value?: ReactNode;
  /** Mono, tabular figures (amounts, ratios, IDs). */
  mono?: boolean;
  /** Renders a `StatusBadge` for this status value. */
  status?: string;
  /** Status → tone mapping for `status` (e.g. `riskStatusTones`). */
  statusTones?: Record<string, Tone>;
  /** Adds a copy button for this text (e.g. account number, BVN). */
  copyValue?: string;
  /** Small helper text under the value. */
  hint?: ReactNode;
  /** Number of columns this item spans (up to the list's columns). */
  span?: 1 | 2 | 3;
};

/** Props for {@link DescriptionList}. */
export type DescriptionListProps = Omit<ComponentProps<"dl">, "children"> & {
  items: DescriptionItem[];
  /** Columns from `sm` up (stacks to one column on phones). Default 2. */
  columns?: 1 | 2 | 3;
  /** `stacked`: label above value; `inline`: label and value side by side. Default `stacked`. */
  layout?: "stacked" | "inline";
  /** Hairline dividers between rows. Default true. */
  divided?: boolean;
};

const colClass = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" } as const;
const spanClass = { 1: "", 2: "sm:col-span-2", 3: "sm:col-span-2 lg:col-span-3" } as const;
const labelClass = "font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-muted";

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === "" || value === false;
}

function ItemValue({ item, large = false }: { item: DescriptionItem; large?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {item.status ? (
          <StatusBadge status={item.status} tones={item.statusTones} />
        ) : (
          <span className={cx("min-w-0 break-words text-fg", large ? "text-lg font-semibold" : "text-base font-medium", item.mono && "font-mono tabular-nums")}>
            {isEmpty(item.value) ? <span className="text-fg-subtle">—</span> : item.value}
          </span>
        )}
        {item.copyValue ? (
          <CopyToClipboard value={item.copyValue} iconOnly label={`Copy ${typeof item.label === "string" ? item.label : "value"}`} className="-my-1" />
        ) : null}
      </div>
      {item.hint ? <span className="text-sm text-fg-muted">{item.hint}</span> : null}
    </div>
  );
}

/** Label/value pairs (`<dl>`) in 1–3 responsive columns, with mono figures, status badges and copy buttons. */
export function DescriptionList({ items, columns = 2, layout = "stacked", divided = true, className, ...props }: DescriptionListProps) {
  return (
    <dl className={cx("m-0 grid grid-cols-1 gap-x-8", colClass[columns], className)} {...props}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cx(
            "min-w-0 py-3",
            divided && "border-b border-line/70",
            layout === "inline" ? "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4" : "flex flex-col gap-1",
            item.span && spanClass[Math.min(item.span, columns) as 1 | 2 | 3],
          )}
        >
          <dt className={labelClass}>{item.label}</dt>
          <dd className="m-0 min-w-0">
            <ItemValue item={item} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Props for {@link KeyValueGrid}. */
export type KeyValueGridProps = Omit<ComponentProps<"dl">, "children"> & {
  items: DescriptionItem[];
  /** Columns at `lg` (2 on tablets, 1 on phones). Default 3. */
  columns?: 2 | 3 | 4;
  /** `sunken` grey tiles on white (default) or `raised` white tiles on grey. */
  surface?: "sunken" | "raised";
};

const gridCols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

/** Key facts as Bolt grey tiles (label above a bold value) — denser than StatCard, for record summaries. */
export function KeyValueGrid({ items, columns = 3, surface = "sunken", className, ...props }: KeyValueGridProps) {
  return (
    <dl className={cx("m-0 grid grid-cols-1 gap-3", gridCols[columns], className)} {...props}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cx(
            "squircle flex min-w-0 flex-col gap-1.5 rounded-2xl px-4 py-3",
            surface === "raised" ? "bg-surface shadow-sm" : "bg-surface-sunken",
            item.span === 2 && "sm:col-span-2",
          )}
        >
          <dt className={labelClass}>{item.label}</dt>
          <dd className="m-0 min-w-0">
            <ItemValue item={item} large />
          </dd>
        </div>
      ))}
    </dl>
  );
}
