"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Check, Paperclip } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./app-utils";

/** Status of a checklist item / condition. */
export type ChecklistStatus = "met" | "pending" | "waived" | "deferred" | "breached";

/** Tone and label per checklist status. */
export const checklistStatusMeta: Record<ChecklistStatus, { tone: Tone; label: string }> = {
  met: { tone: "success", label: "Met" },
  pending: { tone: "neutral", label: "Pending" },
  waived: { tone: "info", label: "Waived" },
  deferred: { tone: "warning", label: "Deferred" },
  breached: { tone: "danger", label: "Breached" },
};

/** One condition / checklist item. */
export type ChecklistItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status: ChecklistStatus;
  owner?: ReactNode;
  /** Pre-formatted due date. */
  dueDate?: ReactNode;
  /** Overdue flag (highlights the due date). */
  overdue?: boolean;
  evidence?: { label: ReactNode; href: string };
  /** Disable the toggle for this item. */
  locked?: boolean;
};

/** Counts per status plus satisfied total (met + waived). */
export function checklistSummary(items: ChecklistItem[]) {
  const counts: Record<ChecklistStatus, number> = { met: 0, pending: 0, waived: 0, deferred: 0, breached: 0 };
  for (const i of items) counts[i.status] += 1;
  const satisfied = counts.met + counts.waived;
  return { counts, satisfied, total: items.length, ratio: items.length ? satisfied / items.length : 0 };
}

/** Props for `ChecklistPanel`. */
export type ChecklistPanelProps = Omit<ComponentProps<"section">, "title" | "onToggle"> & {
  items: ChecklistItem[];
  title?: ReactNode;
  description?: ReactNode;
  /** Toggle handler: called with `met` or `pending`. Renders a checkbox per item when set. */
  onToggle?: (id: string, status: ChecklistStatus) => void;
  /** Right-aligned header action. */
  action?: ReactNode;
  /** Labels (i18n). */
  labels?: { satisfied?: (n: number, total: number) => string; owner?: string; due?: string };
};

/**
 * Conditions / checklist with status (met, pending, waived, deferred, breached), owner, due date,
 * evidence link, optional toggle and a progress summary. Satisfied = met + waived.
 */
export function ChecklistPanel({ items, title = "Checklist", description, onToggle, action, labels = {}, className, ...props }: ChecklistPanelProps) {
  const id = useId();
  const { counts, satisfied, total, ratio } = checklistSummary(items);
  const satisfiedText = (labels.satisfied ?? ((n: number, t: number) => `${n} of ${t} satisfied`))(satisfied, total);

  return (
    <section aria-labelledby={`${id}-t`} className={cx("squircle flex flex-col gap-5 rounded-3xl bg-surface-sunken p-5 sm:p-6", className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 id={`${id}-t`} className="font-display text-lg leading-tight font-bold tracking-tight text-fg">
            {title}
          </h3>
          {description ? <p className="text-sm text-fg-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-fg" data-testid="checklist-summary">
            {satisfiedText}
          </p>
          <p className="font-mono text-sm font-semibold text-fg">{Math.round(ratio * 100)}%</p>
        </div>
        <div
          role="progressbar"
          aria-label={typeof title === "string" ? `${title} progress` : "Checklist progress"}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={satisfied}
          aria-valuetext={satisfiedText}
          className="flex h-2 overflow-hidden rounded-full bg-fg/10"
        >
          {total > 0
            ? (["met", "waived", "deferred", "breached"] as const).map((s) =>
                counts[s] > 0 ? (
                  <span
                    key={s}
                    className={cx("h-full", { met: "bg-success", waived: "bg-info", deferred: "bg-warning", breached: "bg-danger" }[s])}
                    style={{ width: `${(counts[s] / total) * 100}%` }}
                  />
                ) : null,
              )
            : null}
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Status counts">
          {(Object.keys(counts) as ChecklistStatus[]).map((s) =>
            counts[s] > 0 ? (
              <li key={s}>
                <Badge tone={checklistStatusMeta[s].tone} dot size="small">
                  {counts[s]} {checklistStatusMeta[s].label}
                </Badge>
              </li>
            ) : null,
          )}
        </ul>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const meta = checklistStatusMeta[item.status];
          const done = item.status === "met";
          const toggleable = onToggle && !item.locked && (item.status === "met" || item.status === "pending");
          return (
            <li key={item.id} className={cx("squircle flex items-start gap-3 rounded-2xl bg-surface p-3.5 shadow-sm", item.status === "breached" && "ring-1 ring-danger/40")}>
              {onToggle ? (
                <label className={cx("relative mt-0.5 grid size-6 shrink-0 place-items-center", toggleable ? "cursor-pointer" : "cursor-not-allowed opacity-50")}>
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={!toggleable}
                    onChange={(e) => onToggle(item.id, e.target.checked ? "met" : "pending")}
                    className={cx("peer absolute inset-0 cursor-[inherit] appearance-none rounded-full", focusRing)}
                    aria-labelledby={`${id}-${item.id}-t`}
                  />
                  <span
                    aria-hidden="true"
                    className={cx(
                      "pointer-events-none grid size-6 place-items-center rounded-full transition-colors",
                      done ? "bg-success text-on-status" : "ring-2 ring-line-strong ring-inset peer-hover:ring-fg-subtle",
                    )}
                  >
                    {done ? <Check className="size-4" /> : null}
                  </span>
                </label>
              ) : (
                <span aria-hidden="true" className={cx("mt-1.5 size-2.5 shrink-0 rounded-full", { met: "bg-success", pending: "bg-fg-subtle", waived: "bg-info", deferred: "bg-warning", breached: "bg-danger" }[item.status])} />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span id={`${id}-${item.id}-t`} className={cx("text-sm font-semibold text-fg", done && "text-fg-muted")}>
                    {item.title}
                  </span>
                  <Badge tone={meta.tone} size="small">
                    {meta.label}
                  </Badge>
                </div>
                {item.description ? <p className="text-sm text-fg-muted">{item.description}</p> : null}
                {item.owner || item.dueDate || item.evidence ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                    {item.owner ? (
                      <span>
                        <span className={cx(labelText, "mr-1 text-[10px]")}>{labels.owner ?? "Owner"}</span>
                        {item.owner}
                      </span>
                    ) : null}
                    {item.dueDate ? (
                      <span className={cx(item.overdue && "font-semibold text-danger-strong")}>
                        <span className={cx(labelText, "mr-1 text-[10px]")}>{labels.due ?? "Due"}</span>
                        <span className="font-mono">{item.dueDate}</span>
                        {item.overdue ? " (overdue)" : null}
                      </span>
                    ) : null}
                    {item.evidence ? (
                      <a href={item.evidence.href} className={cx("inline-flex items-center gap-1 font-semibold text-link underline-offset-2 hover:underline", focusRing)}>
                        <Paperclip aria-hidden="true" className="size-3.5" />
                        {item.evidence.label}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
