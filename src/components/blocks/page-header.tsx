import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { eyebrowText } from "./block-utils";

/** Props for `PageHeader`. */
export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  /** Mono label above the title (e.g. module name). */
  eyebrow?: ReactNode;
  /** Page title, rendered as the page's `h1`. */
  title: ReactNode;
  /** Short explanation of the page. */
  description?: ReactNode;
  /** Primary page actions (buttons). */
  actions?: ReactNode;
  /** Breadcrumb trail shown above the title. */
  breadcrumb?: ReactNode;
  /** Adds a bottom rule and spacing. */
  divider?: boolean;
};

/** Application page title area with breadcrumb, eyebrow, description and actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
  divider,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cx("flex flex-col gap-4", divider && "border-b border-line pb-6", className)}
      {...props}
    >
      {breadcrumb ? <div className="text-sm text-fg-muted">{breadcrumb}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow ? <p className={cx(eyebrowText, "text-accent-text")}>{eyebrow}</p> : null}
          <h1 className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance text-fg lg:text-[2.25rem]">
            {title}
          </h1>
          {description ? (
            <div className="max-w-2xl text-base leading-6 text-fg-muted">{description}</div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
