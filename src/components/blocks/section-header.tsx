import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { eyebrowText, type HeadingTag } from "./block-utils";

/** Props for `SectionHeader`. */
export type SectionHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  /** Mono label above the title. */
  eyebrow?: ReactNode;
  /** Section heading. */
  title: ReactNode;
  /** Lead paragraph. */
  description?: ReactNode;
  /** Text alignment. Default `"start"`. */
  align?: "start" | "center";
  /** Trailing action (e.g. "View all" link); placed beside the copy when aligned start. */
  action?: ReactNode;
  /** Visual scale. `"large"` for marketing sections, `"medium"` (default) for app sections. */
  size?: "medium" | "large";
  /** Heading level. Default `h2`. */
  as?: HeadingTag;
};

/** Heading block that introduces a page section (eyebrow, title, lead, action). */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  action,
  size = "medium",
  as: Heading = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  const centered = align === "center";
  const large = size === "large";
  return (
    <div
      className={cx(
        "flex gap-6",
        centered
          ? "mx-auto max-w-3xl flex-col items-center text-center"
          : "flex-col sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cx("flex flex-col", large ? "gap-4" : "gap-2", !centered && "max-w-3xl")}>
        {eyebrow ? (
          <p
            className={cx(
              eyebrowText,
              "text-accent-text",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading
          className={cx(
            "font-display leading-[1.1] font-bold tracking-[-0.02em] text-balance text-fg",
            large ? "text-[2rem] sm:text-[2.5rem] lg:text-headline" : "text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem]",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <div
            className={cx(
              "text-pretty text-fg-muted",
              large ? "text-lg leading-[1.55] sm:text-lead" : "text-base leading-7 sm:text-lg",
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className={cx("flex shrink-0 flex-wrap items-center gap-3", centered && "justify-center")}>{action}</div> : null}
    </div>
  );
}
