import type { ComponentProps, ElementType, ReactNode } from "react";

import { Logo } from "../../brand";
import type { SurfaceTheme } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { Container, type ContainerSize } from "../layouts";

/** A footer link. */
export type PageFooterLink = { label: ReactNode; href: string };
/** A titled column of footer links. */
export type PageFooterColumn = { title: ReactNode; links: PageFooterLink[] };

/** Props for {@link PageFooter}. */
export type PageFooterProps = Omit<ComponentProps<"footer">, "children"> & {
  /** Brand slot. Defaults to `<Logo />` (recolours for the surface theme). */
  logo?: ReactNode;
  tagline?: ReactNode;
  columns: PageFooterColumn[];
  /** Legal line, e.g. "© 2026 Credigit Analytical Limited". */
  legal?: ReactNode;
  bottomLinks?: PageFooterLink[];
  theme?: SurfaceTheme;
  linkComponent?: ElementType;
  containerSize?: ContainerSize;
  /** Extra content under the tagline (e.g. contact details, social links). */
  extra?: ReactNode;
};

const linkClass =
  "rounded-sm text-base text-fg-muted transition-colors duration-150 ease-bolt hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Bolt-style dark site footer: brand column, multi-column simple links and a legal bar. Put rounded social icon buttons (`IconButton`) in `extra`. */
export function PageFooter({
  logo,
  tagline,
  columns,
  legal,
  bottomLinks,
  theme = "xdark",
  linkComponent,
  containerSize = "xlarge",
  extra,
  className,
  ...props
}: PageFooterProps) {
  const Link = linkComponent ?? "a";
  return (
    <footer data-cg-theme={theme} className={cx("bg-bg text-fg", className)} {...props}>
      <Container size={containerSize} className="py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-20">
          <div className="max-w-sm">
            {logo ?? <Logo size="small" />}
            {tagline ? <p className="mt-6 text-base leading-relaxed text-fg-muted">{tagline}</p> : null}
            {extra ? <div className="mt-8">{extra}</div> : null}
          </div>
          {columns.length > 0 ? (
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {columns.map((column, index) => (
                <div key={index}>
                  <h2 className="text-base font-bold tracking-tight text-fg">{column.title}</h2>
                  <ul className="mt-5 space-y-4">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          ) : null}
        </div>
      </Container>
      {legal || (bottomLinks && bottomLinks.length > 0) ? (
        <div className="border-t border-line">
          <Container size={containerSize} className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            {legal ? <div className="text-sm text-fg-subtle">{legal}</div> : <span />}
            {bottomLinks && bottomLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {bottomLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={cx(linkClass, "text-sm")}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </div>
      ) : null}
    </footer>
  );
}
