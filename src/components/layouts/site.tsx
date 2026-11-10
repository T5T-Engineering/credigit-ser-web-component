import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link Site}. */
export type SiteProps = ComponentProps<"div"> & {
  header?: ReactNode;
  footer?: ReactNode;
  /** Skip link text. Default "Skip to content". */
  skipLabel?: string;
  /** Id of the main element. Default "main". */
  mainId?: string;
};

/** Page frame: skip link, header, `<main>` and footer, with the footer pushed to the bottom. */
export function Site({ header, footer, skipLabel = "Skip to content", mainId = "main", className, children, ...props }: SiteProps) {
  return (
    <div className={cx("flex min-h-screen flex-col bg-bg text-fg", className)} {...props}>
      <a
        href={`#${mainId}`}
        className="sr-only squircle rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-on-action shadow-md focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {skipLabel}
      </a>
      {header}
      <main id={mainId} tabIndex={-1} className="flex-1 scroll-mt-24 focus:outline-none">
        {children}
      </main>
      {footer}
    </div>
  );
}
