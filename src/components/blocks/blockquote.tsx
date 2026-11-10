import type { ComponentProps, ReactNode } from "react";
import { Quote } from "lucide-react";

import { cx } from "../../utils/cx";

/** Props for `Blockquote`. Use only with real, attributable quotes. */
export type BlockquoteProps = ComponentProps<"figure"> & {
  /** Quoted text. */
  quote: ReactNode;
  /** Person quoted. */
  author?: ReactNode;
  /** Author's role / organisation. */
  role?: ReactNode;
  /** Source URL for the `cite` attribute. */
  cite?: string;
  /** Visual scale. Default `"medium"`. */
  size?: "medium" | "large";
  /** Alignment. Default `"start"`. */
  align?: "start" | "center";
};

/** Pull quote with attribution. */
export function Blockquote({
  quote,
  author,
  role,
  cite,
  size = "medium",
  align = "start",
  className,
  ...props
}: BlockquoteProps) {
  const centered = align === "center";
  return (
    <figure
      className={cx(
        "flex flex-col gap-6",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="squircle grid size-12 place-items-center rounded-2xl bg-accent-tint text-accent-text">
        <Quote className="size-6" strokeWidth={2} />
      </span>
      <blockquote
        cite={cite}
        className={cx(
          "font-display font-bold text-balance text-fg",
          size === "large" ? "text-[1.75rem] leading-[1.2] tracking-[-0.015em] sm:text-title lg:text-[2.25rem]" : "text-subtitle",
        )}
      >
        {quote}
      </blockquote>
      {author || role ? (
        <figcaption className="flex flex-col gap-0.5 text-base">
          {author ? <span className="font-semibold text-fg">{author}</span> : null}
          {role ? <span className="text-fg-muted">{role}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
