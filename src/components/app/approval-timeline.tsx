import type { ComponentProps, ReactNode } from "react";
import { ChevronsUp, CircleCheck, CircleX, Clock, Scale, Split, ThumbsUp, Undo2 } from "lucide-react";

import { Avatar } from "../basic/avatar";
import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";
import { labelText, toneTile } from "./app-utils";

/** Decision recorded by an approver. */
export type ApprovalDecision = "pending" | "approved" | "declined" | "recommended" | "dissent" | "adjudicated" | "escalated" | "returned";

/** Tone, icon and label per decision. */
export const approvalDecisionMeta: Record<ApprovalDecision, { tone: Tone; label: string; icon: typeof Clock }> = {
  pending: { tone: "neutral", label: "Pending", icon: Clock },
  approved: { tone: "success", label: "Approved", icon: CircleCheck },
  declined: { tone: "danger", label: "Declined", icon: CircleX },
  recommended: { tone: "info", label: "Recommended", icon: ThumbsUp },
  dissent: { tone: "warning", label: "Dissent", icon: Split },
  adjudicated: { tone: "brand", label: "Adjudicated", icon: Scale },
  escalated: { tone: "accent", label: "Escalated", icon: ChevronsUp },
  returned: { tone: "warning", label: "Returned for rework", icon: Undo2 },
};

/** A person acting on a tier (maker, checker, co-signer, adjudicator). */
export type ApprovalParticipant = {
  id?: string;
  name: string;
  /** Role / designation, e.g. "Head, Credit Risk". */
  role?: string;
  avatarSrc?: string;
  decision: ApprovalDecision;
  /** Pre-formatted decision time (or a `<time>` element). */
  decidedAt?: ReactNode;
  comment?: ReactNode;
  /** Extra line, e.g. "Delegated from A. Bello" or "Step-up verified". */
  note?: ReactNode;
};

/** One approval tier (level of authority). */
export type ApprovalTier = {
  id: string;
  /** Tier name, e.g. "Tier 2 · Credit Committee". */
  title: ReactNode;
  /** Required role for the tier. */
  role?: ReactNode;
  /** Pre-formatted approval limit, e.g. "≤ ₦250,000,000". */
  limit?: ReactNode;
  /** Approvers. More than one renders side by side as co-signers. */
  participants: ApprovalParticipant[];
  /** Adjudicator (shown as a branch when co-signers dissent). */
  adjudicator?: ApprovalParticipant;
  /** Override the derived tier decision. */
  decision?: ApprovalDecision;
  /** Extra info (SLA, due time). */
  meta?: ReactNode;
};

/** Props for `ApprovalTimeline`. */
export type ApprovalTimelineProps = Omit<ComponentProps<"ol">, "children"> & {
  tiers: ApprovalTier[];
  /** Highlighted tier. Default: the first pending tier. */
  currentTierId?: string;
  /** Label overrides per decision (i18n). */
  decisionLabels?: Partial<Record<ApprovalDecision, string>>;
  /** Label above co-signers. Default "Co-signers". */
  coSignLabel?: string;
  /** Label of the adjudicator branch. Default "Adjudicator · dissent resolution". */
  adjudicatorLabel?: string;
  /** Limit label. Default "Limit". */
  limitLabel?: string;
};

/** Whether co-signers disagree (any dissent, or a mix of positive and negative decisions). */
export function hasDissent(participants: ApprovalParticipant[]): boolean {
  if (participants.some((p) => p.decision === "dissent")) return true;
  const positive = participants.some((p) => p.decision === "approved" || p.decision === "recommended");
  const negative = participants.some((p) => p.decision === "declined");
  return positive && negative;
}

/** Overall decision of a tier derived from its participants and adjudicator. */
export function deriveTierDecision(tier: ApprovalTier): ApprovalDecision {
  if (tier.decision) return tier.decision;
  const ds = tier.participants.map((p) => p.decision);
  if (hasDissent(tier.participants)) {
    if (tier.adjudicator && tier.adjudicator.decision !== "pending") return "adjudicated";
    return "dissent";
  }
  for (const d of ["declined", "returned", "escalated"] as const) if (ds.includes(d)) return d;
  if (ds.length === 0 || ds.includes("pending")) return "pending";
  if (ds.every((d) => d === "recommended")) return "recommended";
  return "approved";
}

function DecisionBadge({ decision, labels }: { decision: ApprovalDecision; labels?: Partial<Record<ApprovalDecision, string>> }) {
  const meta = approvalDecisionMeta[decision];
  return (
    <Badge tone={meta.tone} dot>
      {labels?.[decision] ?? meta.label}
    </Badge>
  );
}

function ParticipantCard({
  person,
  labels,
  highlight,
}: {
  person: ApprovalParticipant;
  labels?: Partial<Record<ApprovalDecision, string>>;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "squircle flex min-w-0 flex-col gap-2.5 rounded-2xl p-3.5",
        highlight ? "bg-surface shadow-sm" : "bg-surface-sunken",
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={person.name} src={person.avatarSrc} size="small" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-fg">{person.name}</span>
          {person.role ? <span className="truncate text-xs text-fg-muted">{person.role}</span> : null}
        </div>
        <DecisionBadge decision={person.decision} labels={labels} />
      </div>
      {person.comment ? (
        <blockquote className="squircle rounded-xl bg-fg/[0.04] px-3 py-2 text-sm leading-5 text-fg-muted">{person.comment}</blockquote>
      ) : null}
      {person.decidedAt || person.note ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-fg-subtle">
          {person.decidedAt ? <span>{person.decidedAt}</span> : null}
          {person.note ? <span>{person.note}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Credit approval route: tiers with role, limit, approver decisions, co-signers side by side,
 * an adjudicator branch on dissent, comments and timestamps; the current tier is highlighted.
 */
export function ApprovalTimeline({
  tiers,
  currentTierId,
  decisionLabels,
  coSignLabel = "Co-signers",
  adjudicatorLabel = "Adjudicator · dissent resolution",
  limitLabel = "Limit",
  className,
  ...props
}: ApprovalTimelineProps) {
  const decisions = tiers.map(deriveTierDecision);
  const currentId =
    currentTierId ?? tiers[decisions.findIndex((d) => d === "pending" || d === "dissent")]?.id;

  return (
    <ol className={cx("flex flex-col", className)} {...props}>
      {tiers.map((tier, i) => {
        const decision = decisions[i] ?? "pending";
        const meta = approvalDecisionMeta[decision];
        const Icon = meta.icon;
        const current = tier.id === currentId;
        const last = i === tiers.length - 1;
        const dissent = hasDissent(tier.participants);
        const coSign = tier.participants.length > 1;
        return (
          <li key={tier.id} aria-current={current ? "step" : undefined} className={cx("relative flex gap-4", !last && "pb-6")}>
            {!last ? <span aria-hidden="true" className={cx("absolute top-11 bottom-0 left-[19px] w-0.5 rounded-full", decision === "pending" ? "bg-line" : "bg-fg/25")} /> : null}
            <span
              aria-hidden="true"
              className={cx(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full",
                current ? "bg-emphasis text-on-emphasis ring-4 ring-accent-tint" : toneTile[meta.tone],
              )}
            >
              <Icon className="size-5" />
            </span>
            <div
              className={cx(
                "squircle flex min-w-0 flex-1 flex-col gap-3 rounded-3xl p-4 sm:p-5",
                current ? "bg-accent-tint ring-2 ring-accent-500/40" : "bg-surface-sunken/60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="font-display text-base leading-tight font-bold text-fg">
                    {tier.title}
                    {current ? <span className="sr-only"> (current step)</span> : null}
                  </h3>
                  {tier.role ? <p className="text-sm text-fg-muted">{tier.role}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {tier.limit ? (
                    <span className="squircle inline-flex items-baseline gap-1.5 rounded-full bg-surface px-3 py-1 shadow-sm">
                      <span className={cx(labelText, "text-[10px] text-fg-muted")}>{limitLabel}</span>
                      <span className="font-mono text-sm font-semibold text-fg tabular-nums">{tier.limit}</span>
                    </span>
                  ) : null}
                  <DecisionBadge decision={decision} labels={decisionLabels} />
                </div>
              </div>
              {tier.meta ? <div className="font-mono text-xs text-fg-muted">{tier.meta}</div> : null}
              {coSign ? <p className={cx(labelText, "text-fg-muted")}>{coSignLabel}</p> : null}
              <div className={cx("grid gap-3", coSign && "sm:grid-cols-2")}>
                {tier.participants.map((p, pi) => (
                  <ParticipantCard key={p.id ?? pi} person={p} labels={decisionLabels} highlight={current} />
                ))}
              </div>
              {dissent || tier.adjudicator ? (
                <div className="relative flex flex-col gap-2 pl-6" data-branch="adjudicator">
                  <span aria-hidden="true" className="absolute top-0 bottom-4 left-2 w-0.5 rounded-full bg-warning/60" />
                  <span aria-hidden="true" className="absolute bottom-4 left-2 h-0.5 w-3 rounded-full bg-warning/60" />
                  <p className={cx(labelText, "flex items-center gap-1.5 text-warning-strong")}>
                    <Scale aria-hidden="true" className="size-3.5" />
                    {adjudicatorLabel}
                  </p>
                  {tier.adjudicator ? (
                    <ParticipantCard person={tier.adjudicator} labels={decisionLabels} highlight={current} />
                  ) : (
                    <p className="squircle rounded-2xl border border-dashed border-line-strong px-3.5 py-3 text-sm text-fg-muted">Awaiting adjudicator assignment</p>
                  )}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Alias of `ApprovalTimeline` (the approval chain / route). */
export const ApprovalChain = ApprovalTimeline;
/** Props for `ApprovalChain`. */
export type ApprovalChainProps = ApprovalTimelineProps;
