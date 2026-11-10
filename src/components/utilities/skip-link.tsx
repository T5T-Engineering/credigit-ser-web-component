import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link SkipLink}. */
export type SkipLinkProps = ComponentProps<"a">;

/** "Skip to content" link, hidden until focused. Targets `#main` by default. */
export function SkipLink({ href = "#main", children = "Skip to content", className, ...props }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cx(
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] squircle focus:rounded-full focus:bg-action focus:px-5 focus:py-2.5 focus:text-base focus:font-semibold focus:text-on-action focus:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
