import type { ComponentProps, ElementType } from "react";
import { ExternalLink } from "lucide-react";

import { cx } from "../../utils/cx";

/** Props for `TextLink`. */
export type TextLinkProps = ComponentProps<"a"> & {
  href: string;
  /** Opens in a new tab with `rel="noopener noreferrer"` and shows an external-link icon. */
  external?: boolean;
  /** Router link component (e.g. Next.js `Link`); receives `href` and all other props. */
  as?: ElementType;
};

/** Inline, underlined text link using the theme's link colour. */
export function TextLink({ href, external = false, as, className, children, target, rel, ...props }: TextLinkProps) {
  const Component: ElementType = as ?? "a";
  return (
    <Component
      href={href}
      target={external ? (target ?? "_blank") : target}
      rel={external ? cx("noopener noreferrer", rel) : rel}
      className={cx(
        "inline-flex items-baseline gap-1 rounded-sm font-semibold text-link underline decoration-1 underline-offset-4 transition-colors duration-150 ease-bolt hover:decoration-2",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      {...props}
    >
      {children}
      {external ? (
        <>
          <ExternalLink aria-hidden="true" size="0.875em" className="shrink-0 self-center" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </Component>
  );
}
