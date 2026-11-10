"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

import { cx } from "../../utils/cx";

/** A section link; `id` is the target element's id. */
export type TableOfContentsItem = { id: string; label: ReactNode };

/** Props for {@link TableOfContents}. */
export type TableOfContentsProps = Omit<ComponentProps<"nav">, "children"> & {
  items: TableOfContentsItem[];
  /** Heading above the list. Default "On this page"; pass null to hide. */
  title?: ReactNode;
  /** Top offset (px) of sticky headers, used when deciding which section is in view. Default 96. */
  offset?: number;
};

/** In-page navigation that highlights the section currently in view. */
export function TableOfContents({ items, title = "On this page", offset = 96, className, "aria-label": ariaLabel, ...props }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Pick the first item (in document order) that is visible.
        const first = items.find((item) => visible.has(item.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, offset]);

  return (
    <nav aria-label={ariaLabel ?? (typeof title === "string" ? title : "Table of contents")} className={cx("text-sm", className)} {...props}>
      {title !== null ? <p className="mb-3 px-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-fg-subtle">{title}</p> : null}
      <ul className="space-y-1">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                onClick={() => setActiveId(item.id)}
                className={cx(
                  "squircle block rounded-full px-3 py-2 transition-colors duration-150 ease-bolt",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  active ? "bg-fg/5 font-semibold text-fg" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
