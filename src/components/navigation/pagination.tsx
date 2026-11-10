"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** A page number or an ellipsis gap. */
export type PaginationEntry = number | "ellipsis";

/**
 * Page list with first/last always visible and `siblingCount` pages either side of `page`,
 * e.g. (5, 10, 1) → [1, "ellipsis", 4, 5, 6, "ellipsis", 10].
 */
export function paginationRange(page: number, pageCount: number, siblingCount = 1): PaginationEntry[] {
  const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  if (pageCount <= 0) return [];
  const totalSlots = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (pageCount <= totalSlots) return range(1, pageCount);

  const current = Math.min(Math.max(page, 1), pageCount);
  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, pageCount);
  const showLeftGap = left > 3;
  const showRightGap = right < pageCount - 2;
  const edgeCount = 3 + 2 * siblingCount;

  if (!showLeftGap && showRightGap) return [...range(1, edgeCount), "ellipsis", pageCount];
  if (showLeftGap && !showRightGap) return [1, "ellipsis", ...range(pageCount - edgeCount + 1, pageCount)];
  return [1, "ellipsis", ...range(left, right), "ellipsis", pageCount];
}

/** Props for {@link Pagination}. */
export type PaginationProps = Omit<ComponentProps<"nav">, "children" | "onChange"> & {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current page. Default 1. */
  siblingCount?: number;
  previousLabel?: string;
  nextLabel?: string;
};

const itemBase =
  "squircle inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors duration-150 ease-bolt active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40";

/** Page navigation with previous/next buttons and a condensed page list. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  previousLabel = "Previous page",
  nextLabel = "Next page",
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: PaginationProps) {
  if (pageCount <= 1) return null;
  const entries = paginationRange(page, pageCount, siblingCount);
  const go = (target: number) => {
    if (target >= 1 && target <= pageCount && target !== page) onPageChange(target);
  };

  return (
    <nav aria-label={ariaLabel} className={cx("flex", className)} {...props}>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          <button type="button" className={cx(itemBase, "bg-fg/5 text-fg hover:bg-fg/10")} onClick={() => go(page - 1)} disabled={page <= 1} aria-label={previousLabel}>
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
        </li>
        {entries.map((entry, index) =>
          entry === "ellipsis" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="inline-flex h-10 min-w-8 items-center justify-center font-mono text-sm text-fg-subtle">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => go(entry)}
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Page ${entry}`}
                className={cx(
                  itemBase,
                  "font-mono tabular-nums",
                  entry === page ? "bg-emphasis font-semibold text-on-emphasis hover:bg-emphasis-hover" : "text-fg hover:bg-fg/5",
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
        <li>
          <button type="button" className={cx(itemBase, "bg-fg/5 text-fg hover:bg-fg/10")} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label={nextLabel}>
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
