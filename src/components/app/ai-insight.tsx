"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Check, ExternalLink, Pencil, Sparkles, UserCheck, X } from "lucide-react";

import { Button } from "../basic/button";
import { Textarea } from "../forms/textarea";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./app-utils";

/** Kind of AI output (drives the label). */
export type AiOutputKind = "drafted" | "flagged" | "insight";

/** A source the AI used. */
export type AiSource = { label: ReactNode; href?: string; detail?: ReactNode };

const kindLabel: Record<AiOutputKind, string> = { drafted: "AI-drafted", flagged: "AI-flagged", insight: "AI insight" };

/** Shared props of the AI co-pilot surfaces. */
type AiBaseProps = {
  kind?: AiOutputKind;
  title?: ReactNode;
  /** Model name and version, e.g. "Credigit Risk Copilot v2.3". */
  model?: ReactNode;
  /** Pre-formatted generation time. */
  generatedAt?: ReactNode;
  /** Model confidence 0–1. */
  confidence?: number;
  sources?: AiSource[];
  /** Human sign-off notice. Pass `null` to hide (not recommended). */
  signOffNote?: ReactNode;
  /** Who signed off (shown instead of the notice once accepted). */
  signedOffBy?: ReactNode;
  onDismiss?: () => void;
  labels?: { accept?: string; edit?: string; dismiss?: string; sources?: string; confidence?: string };
};

const defaultNote = "AI output is advisory. A named, authorised person must review and sign off before it is used in a decision.";

function confidenceTone(c: number) {
  if (c >= 0.8) return "bg-success";
  if (c >= 0.5) return "bg-warning";
  return "bg-danger";
}

function AiMeta({ kind, model, generatedAt, confidence, confidenceLabel }: { kind: AiOutputKind; model?: ReactNode; generatedAt?: ReactNode; confidence?: number; confidenceLabel: string }) {
  const pct = confidence !== undefined ? Math.round(Math.max(0, Math.min(1, confidence)) * 100) : undefined;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span
        className={cx(
          "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase",
          kind === "flagged" ? "bg-warning-soft text-warning-strong" : "bg-surface text-accent-text shadow-sm",
        )}
      >
        <Sparkles aria-hidden="true" className="size-3.5" />
        {kindLabel[kind]}
      </span>
      {model || generatedAt ? (
        <span className="font-mono text-xs text-fg-muted">
          {model}
          {model && generatedAt ? " · " : null}
          {generatedAt}
        </span>
      ) : null}
      {pct !== undefined ? (
        <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
          {confidenceLabel}
          <span
            role="meter"
            aria-label={confidenceLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={`${pct}%`}
            className="h-1.5 w-16 overflow-hidden rounded-full bg-fg/10"
          >
            <span className={cx("block h-full rounded-full", confidenceTone(pct / 100))} style={{ width: `${pct}%` }} />
          </span>
          <span className="font-semibold text-fg">{pct}%</span>
        </span>
      ) : null}
    </div>
  );
}

function Sources({ sources, label }: { sources: AiSource[]; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className={cx(labelText, "text-fg-muted")}>{label}</p>
      <ol className="flex flex-col gap-1.5">
        {sources.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface font-mono text-[10px] font-semibold text-fg-muted shadow-sm">{i + 1}</span>
            <span className="min-w-0">
              {s.href ? (
                <a href={s.href} target="_blank" rel="noreferrer noopener" className={cx("inline-flex items-center gap-1 font-semibold text-link underline-offset-2 hover:underline", focusRing)}>
                  {s.label}
                  <ExternalLink aria-hidden="true" className="size-3" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <span className="font-semibold text-fg">{s.label}</span>
              )}
              {s.detail ? <span className="block text-fg-muted">{s.detail}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SignOff({ note, signedOffBy }: { note: ReactNode; signedOffBy?: ReactNode }) {
  if (signedOffBy) {
    return (
      <p className="flex min-w-[min(100%,16rem)] flex-1 items-start gap-2 text-sm font-medium text-success-strong">
        <UserCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>Signed off by {signedOffBy}</span>
      </p>
    );
  }
  if (note === null) return null;
  return (
    <p className="flex min-w-[min(100%,16rem)] flex-1 items-start gap-2 text-xs leading-5 text-fg-muted">
      <UserCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{note}</span>
    </p>
  );
}

const shell = (kind: AiOutputKind) =>
  cx(
    "squircle flex flex-col gap-4 rounded-3xl p-5 sm:p-6",
    kind === "flagged"
      ? "bg-[color-mix(in_oklab,var(--cg-warning)_10%,var(--cg-surface))] ring-1 ring-warning/30"
      : "bg-accent-tint ring-1 ring-accent-500/20",
  );

/** Props for `AiInsightCard`. */
export type AiInsightCardProps = Omit<ComponentProps<"article">, "title" | "content"> &
  AiBaseProps & {
    /** Paragraphs of text. */
    paragraphs?: ReactNode[];
    /** Bullet points. */
    bullets?: ReactNode[];
    /** Rich content (in addition to paragraphs/bullets). */
    children?: ReactNode;
    onAccept?: () => void;
    onEdit?: () => void;
  };

/** AI co-pilot output card: AI-drafted / AI-flagged label, model + time, confidence, content, sources, actions and a sign-off note. */
export function AiInsightCard({
  kind = "insight",
  title,
  model,
  generatedAt,
  confidence,
  sources,
  signOffNote = defaultNote,
  signedOffBy,
  paragraphs,
  bullets,
  children,
  onAccept,
  onEdit,
  onDismiss,
  labels = {},
  className,
  ...props
}: AiInsightCardProps) {
  const id = useId();
  const hasActions = Boolean(onAccept || onEdit || onDismiss) && !signedOffBy;
  return (
    <article aria-labelledby={title ? `${id}-t` : undefined} aria-label={title ? undefined : kindLabel[kind]} className={cx(shell(kind), className)} {...props}>
      <AiMeta kind={kind} model={model} generatedAt={generatedAt} confidence={confidence} confidenceLabel={labels.confidence ?? "Confidence"} />
      {title ? (
        <h3 id={`${id}-t`} className="font-display text-lg leading-tight font-bold tracking-tight text-fg">
          {title}
        </h3>
      ) : null}
      <div className="flex flex-col gap-3 text-base leading-6 text-fg">
        {paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
        {bullets && bullets.length > 0 ? (
          <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-accent-500">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : null}
        {children}
      </div>
      {sources && sources.length > 0 ? <Sources sources={sources} label={labels.sources ?? "Sources"} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-fg/10 pt-4">
        <SignOff note={signOffNote} signedOffBy={signedOffBy} />
        {hasActions ? (
          <div className="ml-auto flex shrink-0 flex-wrap gap-2">
            {onDismiss ? (
              <Button size="small" variant="text" iconBefore={<X className="size-3.5" />} onClick={onDismiss}>
                {labels.dismiss ?? "Dismiss"}
              </Button>
            ) : null}
            {onEdit ? (
              <Button size="small" variant="tertiary" iconBefore={<Pencil className="size-3.5" />} onClick={onEdit}>
                {labels.edit ?? "Edit"}
              </Button>
            ) : null}
            {onAccept ? (
              <Button size="small" variant="secondary" iconBefore={<Check className="size-3.5" />} onClick={onAccept}>
                {labels.accept ?? "Accept"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Props for `AiDraftPanel`. */
export type AiDraftPanelProps = Omit<ComponentProps<"section">, "title" | "onChange"> &
  AiBaseProps & {
    /** The AI draft text (paragraphs separated by blank lines; lines starting "- " render as bullets). */
    draft: string;
    /** Accept the (possibly edited) text. */
    onAccept?: (text: string) => void;
    /** Called when the edited text changes. */
    onChange?: (text: string) => void;
    /** Start in edit mode. */
    defaultEditing?: boolean;
  };

function renderDraft(text: string) {
  return text
    .split(/\n\s*\n/)
    .filter((b) => b.trim())
    .map((block, i) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
        return (
          <ul key={i} className="flex list-disc flex-col gap-1.5 pl-5 marker:text-accent-500">
            {lines.map((l, j) => (
              <li key={j}>{l.replace(/^\s*[-•*]\s+/, "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="whitespace-pre-line">
          {block}
        </p>
      );
    });
}

/** AI-drafted document section (e.g. credit memo narrative) that a person can edit, accept or dismiss. */
export function AiDraftPanel({
  kind = "drafted",
  title = "Draft",
  model,
  generatedAt,
  confidence,
  sources,
  signOffNote = defaultNote,
  signedOffBy,
  draft,
  onAccept,
  onChange,
  onDismiss,
  defaultEditing = false,
  labels = {},
  className,
  ...props
}: AiDraftPanelProps) {
  const id = useId();
  const [editing, setEditing] = useState(defaultEditing);
  const [text, setText] = useState(draft);
  const [prevDraft, setPrevDraft] = useState(draft);
  if (draft !== prevDraft) {
    setPrevDraft(draft);
    setText(draft);
  }
  const edited = text !== draft;
  return (
    <section aria-labelledby={`${id}-t`} className={cx(shell(kind), className)} {...props}>
      <AiMeta kind={kind} model={model} generatedAt={generatedAt} confidence={confidence} confidenceLabel={labels.confidence ?? "Confidence"} />
      <div className="flex items-center gap-2">
        <h3 id={`${id}-t`} className="font-display text-lg leading-tight font-bold tracking-tight text-fg">
          {title}
        </h3>
        {edited ? <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-fg-muted uppercase shadow-sm">Edited</span> : null}
      </div>
      {editing ? (
        <Textarea
          aria-label={typeof title === "string" ? `Edit ${title}` : "Edit draft"}
          value={text}
          rows={8}
          autoResize
          onChange={(e) => {
            setText(e.target.value);
            onChange?.(e.target.value);
          }}
        />
      ) : (
        <div className="squircle flex flex-col gap-3 rounded-2xl bg-surface p-4 text-base leading-6 text-fg shadow-sm">{renderDraft(text)}</div>
      )}
      {sources && sources.length > 0 ? <Sources sources={sources} label={labels.sources ?? "Sources"} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-fg/10 pt-4">
        <SignOff note={signOffNote} signedOffBy={signedOffBy} />
        {!signedOffBy ? (
          <div className="ml-auto flex shrink-0 flex-wrap gap-2">
            {onDismiss ? (
              <Button size="small" variant="text" iconBefore={<X className="size-3.5" />} onClick={onDismiss}>
                {labels.dismiss ?? "Dismiss"}
              </Button>
            ) : null}
            <Button size="small" variant="tertiary" iconBefore={editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />} onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
              {editing ? "Done editing" : (labels.edit ?? "Edit")}
            </Button>
            {onAccept ? (
              <Button size="small" variant="secondary" iconBefore={<Check className="size-3.5" />} onClick={() => onAccept(text)}>
                {labels.accept ?? "Accept"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
