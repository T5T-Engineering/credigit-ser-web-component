import { ChevronRight } from "lucide-react";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** A breadcrumb step; the last item (or one without `href`) is the current page. */
export type BreadcrumbItem = { label: ReactNode; href?: string };

/** Props for {@link Breadcrumb}. */
export type BreadcrumbProps = Omit<ComponentProps<"nav">, "children"> & {
  items: BreadcrumbItem[];
  linkComponent?: ElementType;
};

/** Trail of links showing where the current page sits in the hierarchy. */
export function Breadcrumb({ items, linkComponent, className, "aria-label": ariaLabel = "Breadcrumb", ...props }: BreadcrumbProps) {
  const Link = linkComponent ?? "a";
  return (
    <nav aria-label={ariaLabel} className={cx("text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-full font-medium text-fg-muted transition-colors underline-offset-4 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-medium text-fg" : "text-fg-muted"}>
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight aria-hidden="true" className="size-3.5 text-fg-subtle" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
