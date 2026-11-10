import type { ComponentProps, ElementType, ReactNode } from "react";
import { BookOpen, Clock, History } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { CopyToClipboard } from "../utilities/copy-to-clipboard";
import { cx } from "../../utils/cx";
import { labelText } from "./ops-utils";
import { formatRuleValue, type FormatRuleValueOptions, type RuleValue, type RuleValueOption, type RuleValueType } from "./rule-value-input";

/** A pending (not yet approved) change to a rule. */
export type RulePendingChange = {
  /** Proposed value (formatted with the rule's type) or pre-formatted text. */
  value?: RuleValue;
  formattedValue?: ReactNode;
  requestedBy?: ReactNode;
  requestedAt?: ReactNode;
  /** Link to the workflow instance routing the change. */
  href?: string;
};

/** Display data of one business rule. */
export type RuleSummary = {
  /** Stable rule key, e.g. `credit.approval.tier2.limit` (mono, copyable). */
  key: string;
  label: ReactNode;
  description?: ReactNode;
  type: RuleValueType;
  value: RuleValue | undefined;
  defaultValue?: RuleValue;
  /** Pre-formatted current value (overrides automatic formatting). */
  formattedValue?: ReactNode;
  formattedDefault?: ReactNode;
  unit?: string;
  currency?: string;
  currencySymbol?: string;
  options?: RuleValueOption[];
  /** Scope badge, e.g. "Tenant", "Global", "Branch: Lagos". */
  scope?: string | { label: string; tone?: Tone };
  /** Source / PRD reference, e.g. "PRD §7.3". */
  source?: ReactNode;
  sourceHref?: string;
  /** Pending change awaiting approval (`true` = pending with no details). */
  pending?: boolean | RulePendingChange;
  changedBy?: ReactNode;
  changedAt?: ReactNode;
};

/** Labels for rule display (i18n). */
export type RuleDisplayLabels = {
  current: string;
  default: string;
  pending: string;
  proposed: string;
  modified: string;
  changed: (by: ReactNode, at: ReactNode) => ReactNode;
  copyKey: string;
  source: string;
  viewRequest: string;
};

const defaultLabels: RuleDisplayLabels = {
  current: "Current value",
  default: "Default",
  pending: "Awaiting approval",
  proposed: "Proposed",
  modified: "Modified",
  changed: (by, at) => (
    <>
      Changed{by ? <> by {by}</> : null}
      {at ? <> · {at}</> : null}
    </>
  ),
  copyKey: "Copy rule key",
  source: "Source",
  viewRequest: "View request",
};

type Shared = {
  rule: RuleSummary;
  /** Right-aligned actions (Edit, History…). */
  actions?: ReactNode;
  /** Formatting options (locale, boolean labels…). */
  formatOptions?: Omit<FormatRuleValueOptions, "currency" | "currencySymbol" | "unit" | "options">;
  labels?: Partial<RuleDisplayLabels>;
  /** Link component for `sourceHref` / pending `href` (router Link). */
  linkComponent?: ElementType;
};

function valuesEqual(a: RuleValue | undefined, b: RuleValue | undefined): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function useRuleParts({ rule, formatOptions, labels }: Shared) {
  const l = { ...defaultLabels, ...labels };
  const fmt = (v: RuleValue | undefined) =>
    formatRuleValue(rule.type, v, {
      ...formatOptions,
      currency: rule.currency,
      currencySymbol: rule.currencySymbol,
      unit: rule.unit,
      options: rule.options,
    });
  const current = rule.formattedValue ?? fmt(rule.value);
  const hasDefault = rule.defaultValue !== undefined || rule.formattedDefault !== undefined;
  const defaultText = rule.formattedDefault ?? (rule.defaultValue !== undefined ? fmt(rule.defaultValue) : undefined);
  const modified = rule.defaultValue !== undefined && !valuesEqual(rule.value, rule.defaultValue);
  const pending = rule.pending === true ? {} : rule.pending || undefined;
  const proposed = pending ? (pending.formattedValue ?? (pending.value !== undefined ? fmt(pending.value) : undefined)) : undefined;
  const scope = typeof rule.scope === "string" ? { label: rule.scope, tone: "neutral" as Tone } : rule.scope;
  return { l, current, hasDefault, defaultText, modified, pending, proposed, scope };
}

function Key({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-0.5">
      <code className="truncate font-code text-xs text-fg-muted">{value}</code>
      <CopyToClipboard value={value} label={`${label} ${value}`} iconOnly className="min-h-6 min-w-6 px-1.5 py-0.5" />
    </span>
  );
}

function SourceRef({ rule, label, linkComponent: Link = "a" }: { rule: RuleSummary; label: string; linkComponent?: Shared["linkComponent"] }) {
  if (!rule.source) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
      <BookOpen aria-hidden="true" className="size-3.5" />
      <span className="sr-only">{label}: </span>
      {rule.sourceHref ? (
        <Link href={rule.sourceHref} className="text-link underline-offset-2 hover:underline">
          {rule.source}
        </Link>
      ) : (
        rule.source
      )}
    </span>
  );
}

/** Props for `RuleCard`. */
export type RuleCardProps = Omit<ComponentProps<"article">, "children"> &
  Shared & {
    /** Extra content under the value (e.g. an inline `RuleValueInput` while editing). */
    children?: ReactNode;
  };

/**
 * Card for one business rule: label, copyable mono key, description, formatted current value, default,
 * scope badge, source / PRD reference, "Awaiting approval" badge with the proposed value, last change and actions.
 */
export function RuleCard({ rule, actions, formatOptions, labels, linkComponent, className, children, ...props }: RuleCardProps) {
  const { l, current, hasDefault, defaultText, modified, pending, proposed, scope } = useRuleParts({ rule, formatOptions, labels });
  const Link = linkComponent ?? "a";
  return (
    <article
      className={cx("squircle flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-sm", pending && "ring-2 ring-info/40", className)}
      data-rule-key={rule.key}
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base leading-tight font-bold text-fg">{rule.label}</h3>
            {scope ? <Badge tone={scope.tone ?? "neutral"}>{scope.label}</Badge> : null}
            {pending ? (
              <Badge tone="info" dot>
                {l.pending}
              </Badge>
            ) : null}
          </div>
          <Key value={rule.key} label={l.copyKey} />
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {rule.description ? <p className="text-sm leading-5 text-fg-muted">{rule.description}</p> : null}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <span className={cx(labelText, "text-fg-muted")}>{l.current}</span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-2xl leading-tight font-bold text-fg tabular-nums" data-testid="rule-value">
              {current}
            </span>
            {modified ? <Badge size="small" tone="accent">{l.modified}</Badge> : null}
          </span>
        </div>
        {hasDefault ? (
          <div className="flex flex-col gap-0.5">
            <span className={cx(labelText, "text-fg-muted")}>{l.default}</span>
            <span className="font-mono text-sm text-fg-muted tabular-nums">{defaultText}</span>
          </div>
        ) : null}
      </div>
      {pending ? (
        <div className="squircle flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-info-soft px-3.5 py-2.5 text-sm text-info-strong">
          <Clock aria-hidden="true" className="size-4 shrink-0" />
          {proposed !== undefined ? (
            <span>
              {l.proposed}: <span className="font-mono font-semibold tabular-nums">{proposed}</span>
            </span>
          ) : (
            <span>{l.pending}</span>
          )}
          {pending.requestedBy || pending.requestedAt ? (
            <span className="text-xs">
              {pending.requestedBy}
              {pending.requestedBy && pending.requestedAt ? " · " : null}
              {pending.requestedAt}
            </span>
          ) : null}
          {pending.href ? (
            <Link href={pending.href} className="ml-auto font-semibold underline underline-offset-2">
              {l.viewRequest}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
      {rule.source || rule.changedBy || rule.changedAt ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3">
          <SourceRef rule={rule} label={l.source} linkComponent={linkComponent} />
          {rule.changedBy || rule.changedAt ? (
            <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
              <History aria-hidden="true" className="size-3.5" />
              {l.changed(rule.changedBy, rule.changedAt)}
            </span>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

/** Props for `RuleRow`. */
export type RuleRowProps = Omit<ComponentProps<"div">, "children"> & Shared;

/**
 * Compact row for a rules list / registry table: label + key + description on the left, value and
 * default in the middle, badges, last change and actions on the right. Stacks on phones.
 */
export function RuleRow({ rule, actions, formatOptions, labels, linkComponent, className, ...props }: RuleRowProps) {
  const { l, current, hasDefault, defaultText, modified, pending, proposed, scope } = useRuleParts({ rule, formatOptions, labels });
  return (
    <div
      className={cx(
        "grid min-w-0 gap-x-6 gap-y-2 border-b border-line py-4 last:border-b-0 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-center",
        className,
      )}
      data-rule-key={rule.key}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-fg">{rule.label}</span>
          {scope ? <Badge size="small" tone={scope.tone ?? "neutral"}>{scope.label}</Badge> : null}
          {pending ? (
            <Badge size="small" tone="info" dot>
              {l.pending}
            </Badge>
          ) : null}
        </div>
        <Key value={rule.key} label={l.copyKey} />
        {rule.description ? <p className="text-sm leading-5 text-fg-muted">{rule.description}</p> : null}
        <div className="flex flex-wrap items-center gap-x-3">
          <SourceRef rule={rule} label={l.source} linkComponent={linkComponent} />
          {rule.changedBy || rule.changedAt ? <span className="text-xs text-fg-subtle">{l.changed(rule.changedBy, rule.changedAt)}</span> : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-fg tabular-nums" data-testid="rule-value">
            {current}
          </span>
          {modified ? <Badge size="small" tone="accent">{l.modified}</Badge> : null}
        </span>
        {hasDefault ? (
          <span className="text-xs text-fg-muted">
            {l.default}: <span className="font-mono tabular-nums">{defaultText}</span>
          </span>
        ) : null}
        {pending && proposed !== undefined ? (
          <span className="text-xs text-info-strong">
            {l.proposed}: <span className="font-mono font-semibold tabular-nums">{proposed}</span>
          </span>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div> : <span />}
    </div>
  );
}
