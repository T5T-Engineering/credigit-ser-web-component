import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";
import { CopyToClipboard } from "./copy-to-clipboard";

/** Props for {@link CodeSnippet}. */
export type CodeSnippetProps = Omit<ComponentProps<"figure">, "children"> & {
  code: string;
  /** Shown as a mono eyebrow, e.g. "tsx", "json". */
  language?: string;
  copyable?: boolean;
  /** Accessible name for the scrollable code region. Default "Code" (+ language). */
  label?: string;
};

/** Block of code on a sunken surface with optional language label and copy button. */
export function CodeSnippet({ code, language, copyable = true, label, className, ...props }: CodeSnippetProps) {
  const showHeader = Boolean(language) || copyable;
  return (
    <figure className={cx("squircle m-0 overflow-hidden rounded-2xl bg-surface-sunken", className)} {...props}>
      {showHeader && (
        <div className="flex items-center justify-between gap-3 px-4 pt-2.5 pb-0">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">{language ?? ""}</span>
          {copyable && <CopyToClipboard value={code} label="Copy code" />}
        </div>
      )}
      <pre
        tabIndex={0}
        aria-label={label ?? (language ? `${language} code` : "Code")}
        className="squircle m-0 overflow-x-auto rounded-2xl p-4 font-mono text-sm leading-relaxed text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        <code>{code}</code>
      </pre>
    </figure>
  );
}
