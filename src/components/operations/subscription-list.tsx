"use client";

import type { ComponentProps, ReactNode } from "react";
import { CircleCheck, CircleSlash, CircleX, Clock, ShieldBan } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { Switch } from "../forms/switch";
import { cx } from "../../utils/cx";
import { labelText, toneText } from "./ops-utils";

/** Kind of extension registration. */
export type SubscriptionKind = "before" | "after" | "event";

/** Outcome of the last run of a hook / subscriber. */
export type SubscriptionRunStatus = "success" | "failed" | "vetoed" | "skipped" | "never";

/** Label and tone per subscription kind. */
export const subscriptionKindMeta: Record<SubscriptionKind, { label: string; tone: Tone }> = {
  before: { label: "Before hook", tone: "brand" },
  after: { label: "After hook", tone: "info" },
  event: { label: "Event subscriber", tone: "accent" },
};

/** Label, tone and icon per run status. */
export const subscriptionRunMeta: Record<SubscriptionRunStatus, { label: string; tone: Tone; icon: typeof Clock }> = {
  success: { label: "Succeeded", tone: "success", icon: CircleCheck },
  failed: { label: "Failed", tone: "danger", icon: CircleX },
  vetoed: { label: "Vetoed", tone: "warning", icon: ShieldBan },
  skipped: { label: "Skipped", tone: "neutral", icon: CircleSlash },
  never: { label: "Never run", tone: "neutral", icon: Clock },
};

/** A registered hook or event subscription. */
export type HookSubscription = {
  id: string;
  /** Hook point (e.g. `credit.facility.approve`) or event pattern (e.g. `credit.*`). */
  pattern: string;
  kind: SubscriptionKind;
  /** Handler / extension name, e.g. `fraud-screen.v2`. */
  handler: string;
  description?: ReactNode;
  /** Execution order (lower runs first). */
  priority?: number;
  enabled: boolean;
  lastRun?: { status: SubscriptionRunStatus; time?: ReactNode; message?: ReactNode };
};

/** Labels (i18n). */
export type SubscriptionListLabels = {
  priority: string;
  enabled: (handler: string) => string;
  lastRun: string;
  empty: string;
  pattern: string;
  handler: string;
};

const defaultLabels: SubscriptionListLabels = {
  priority: "Priority",
  enabled: (h) => `Enable ${h}`,
  lastRun: "Last run",
  empty: "No hooks or subscriptions registered.",
  pattern: "Point / pattern",
  handler: "Handler",
};

/** Props for `SubscriptionList`. */
export type SubscriptionListProps = Omit<ComponentProps<"ul">, "children" | "onToggle"> & {
  subscriptions: HookSubscription[];
  /** Enables the toggle; omit (or `readOnly`) to show the state only. */
  onToggle?: (id: string, enabled: boolean) => void;
  readOnly?: boolean;
  /** Per-row actions (e.g. "Run test", "Logs"). */
  actions?: (subscription: HookSubscription) => ReactNode;
  kindLabels?: Partial<Record<SubscriptionKind, string>>;
  runStatusLabels?: Partial<Record<SubscriptionRunStatus, string>>;
  labels?: Partial<SubscriptionListLabels>;
};

/**
 * Registered hooks and event subscriptions: hook point / event pattern (mono), kind (before / after hook,
 * event subscriber), handler, priority, enabled toggle and last run status.
 */
export function SubscriptionList({
  subscriptions,
  onToggle,
  readOnly = false,
  actions,
  kindLabels,
  runStatusLabels,
  labels,
  className,
  ...props
}: SubscriptionListProps) {
  const l = { ...defaultLabels, ...labels };
  if (subscriptions.length === 0) {
    return <p className="squircle rounded-3xl bg-surface-sunken p-6 text-center text-sm text-fg-muted">{l.empty}</p>;
  }
  return (
    <ul className={cx("flex flex-col gap-2", className)} {...props}>
      {subscriptions.map((s) => {
        const kind = subscriptionKindMeta[s.kind];
        const run = s.lastRun ? subscriptionRunMeta[s.lastRun.status] : undefined;
        const RunIcon = run?.icon;
        return (
          <li
            key={s.id}
            data-enabled={s.enabled}
            className={cx(
              "squircle grid min-w-0 gap-x-4 gap-y-3 rounded-2xl bg-surface p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center",
              !s.enabled && "bg-surface-sunken/60 shadow-none",
            )}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="small" tone={kind.tone}>
                  {kindLabels?.[s.kind] ?? kind.label}
                </Badge>
                <code className="min-w-0 font-code text-sm font-medium break-all text-fg">
                  <span className="sr-only">{l.pattern}: </span>
                  {s.pattern}
                </code>
              </div>
              <p className="text-sm text-fg-muted">
                <span className="sr-only">{l.handler}: </span>
                <span className="font-code text-xs text-fg">{s.handler}</span>
                {s.priority !== undefined ? (
                  <span className="ml-2 font-mono text-xs text-fg-subtle tabular-nums">
                    {l.priority} {s.priority}
                  </span>
                ) : null}
              </p>
              {s.description ? <p className="text-sm leading-5 text-fg-muted">{s.description}</p> : null}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 md:items-end">
              <span className={cx(labelText, "text-[10px] text-fg-subtle")}>{l.lastRun}</span>
              {run && RunIcon ? (
                <span className={cx("inline-flex items-center gap-1 text-sm font-semibold", toneText[run.tone])} data-testid="last-run">
                  <RunIcon aria-hidden="true" className="size-4" />
                  {runStatusLabels?.[s.lastRun!.status] ?? run.label}
                  {s.lastRun?.time ? <span className="font-mono text-xs font-normal text-fg-subtle">· {s.lastRun.time}</span> : null}
                </span>
              ) : (
                <span className="text-sm text-fg-subtle">{runStatusLabels?.never ?? subscriptionRunMeta.never.label}</span>
              )}
              {s.lastRun?.message ? <span className="text-xs text-fg-muted">{s.lastRun.message}</span> : null}
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              {actions?.(s)}
              <Switch
                size="small"
                hideLabel
                label={l.enabled(s.handler)}
                checked={s.enabled}
                disabled={readOnly || !onToggle}
                onCheckedChange={(enabled) => onToggle?.(s.id, enabled)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
