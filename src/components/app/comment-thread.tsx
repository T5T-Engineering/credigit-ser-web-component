"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Lock, Send } from "lucide-react";

import { Avatar } from "../basic/avatar";
import { Button } from "../basic/button";
import { Textarea } from "../forms/textarea";
import { cx } from "../../utils/cx";
import type { AppUser } from "./user-menu";

/** One comment. */
export type ThreadComment = {
  id: string;
  author: AppUser;
  /** Plain text; `@mentions` are highlighted. */
  body: string;
  /** Pre-formatted time. */
  time?: ReactNode;
  edited?: boolean;
  /** Internal note (not visible to the customer). */
  internal?: boolean;
};

/** Split text into plain and `@mention` parts. `mentions` restricts highlighting to known names (multi-word supported). */
export function splitMentions(text: string, mentions?: string[]): Array<{ text: string; mention: boolean }> {
  const escaped = (mentions ?? [])
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = escaped.length > 0 ? new RegExp(`@(?:${escaped.join("|")})`, "g") : /@[\p{L}\p{N}_.-]+/gu;
  const out: Array<{ text: string; mention: boolean }> = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ text: text.slice(last, start), mention: false });
    out.push({ text: m[0], mention: true });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), mention: false });
  return out;
}

/** Props for `CommentThread`. */
export type CommentThreadProps = Omit<ComponentProps<"section">, "onSubmit" | "title"> & {
  comments: ThreadComment[];
  /** Known mentionable names (without "@"). Default: highlight any `@word`. */
  mentions?: string[];
  /** Author of new comments (avatar in the compose box). */
  currentUser?: AppUser;
  /** Post a new comment; the compose box is hidden when absent. */
  onSubmit?: (body: string) => void | Promise<void>;
  title?: ReactNode;
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Label for internal notes. Default "Internal". */
  internalLabel?: string;
};

function Body({ text, mentions }: { text: string; mentions?: string[] }) {
  return (
    <p className="text-sm leading-6 whitespace-pre-wrap text-fg">
      {splitMentions(text, mentions).map((part, i) =>
        part.mention ? (
          <span key={i} className="rounded-md bg-accent-tint px-0.5 font-semibold text-accent-text">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

/** Discussion thread with author avatar, role, time, highlighted @mentions and a compose box (Ctrl/⌘+Enter posts). */
export function CommentThread({
  comments,
  mentions,
  currentUser,
  onSubmit,
  title = "Comments",
  placeholder = "Add a comment… use @ to mention a colleague",
  emptyMessage = "No comments yet.",
  internalLabel = "Internal",
  className,
  ...props
}: CommentThreadProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async () => {
    const body = draft.trim();
    if (!body || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(body);
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className={cx("flex flex-col gap-4", className)} {...props}>
      <h3 id={`${id}-title`} className="font-display text-lg font-bold tracking-tight text-fg">
        {title}
        <span className="ml-2 font-mono text-sm font-medium text-fg-muted">{comments.length}</span>
      </h3>
      {comments.length === 0 ? (
        <p className="text-sm text-fg-muted">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.author.name} src={c.author.avatarSrc} size="small" aria-hidden="true" />
              <article className="flex min-w-0 flex-1 flex-col gap-1" aria-label={`Comment by ${c.author.name}`}>
                <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-fg">{c.author.name}</span>
                  {c.author.role ? <span className="text-xs text-fg-muted">{c.author.role}</span> : null}
                  {c.time ? <span className="font-mono text-xs text-fg-subtle">{c.time}</span> : null}
                  {c.edited ? <span className="text-xs text-fg-subtle">(edited)</span> : null}
                  {c.internal ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-warning-strong uppercase">
                      <Lock aria-hidden="true" className="size-3" />
                      {internalLabel}
                    </span>
                  ) : null}
                </header>
                <div className="squircle rounded-2xl rounded-tl-md bg-surface-sunken px-4 py-2.5">
                  <Body text={c.body} mentions={mentions} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      {onSubmit ? (
        <form
          className="flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void post();
          }}
        >
          {currentUser ? <Avatar name={currentUser.name} src={currentUser.avatarSrc} size="small" aria-hidden="true" className="mt-1" /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Textarea
              aria-label="New comment"
              value={draft}
              rows={2}
              autoResize
              placeholder={placeholder}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void post();
                }
              }}
            />
            <div className="flex justify-end">
              <Button type="submit" size="small" iconBefore={<Send className="size-3.5" />} loading={busy} disabled={!draft.trim()}>
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}
