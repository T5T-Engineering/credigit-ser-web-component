import type { ComponentProps, ElementType } from "react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { gapClasses } from "./stack";

/** Supported column counts. */
export type GridColumnCount = 1 | 2 | 3 | 4 | 6 | 12;
/** Responsive column map, mobile first. */
export type GridColumns =
  | GridColumnCount
  | { base?: GridColumnCount; sm?: GridColumnCount; md?: GridColumnCount; lg?: GridColumnCount; xl?: GridColumnCount };

// Complete static class strings so Tailwind can find them when scanning source.
const baseCols: Record<GridColumnCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
};
const smCols: Record<GridColumnCount, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};
const mdCols: Record<GridColumnCount, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};
const lgCols: Record<GridColumnCount, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};
const xlCols: Record<GridColumnCount, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
};

/** Responsive defaults for a plain number: fewer columns on small screens. */
const autoCols: Record<GridColumnCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12",
};

/** Resolve a `columns` prop to static Tailwind classes. */
export function gridColumnClasses(columns: GridColumns): string {
  if (typeof columns === "number") return autoCols[columns];
  return cx(
    baseCols[columns.base ?? 1],
    columns.sm && smCols[columns.sm],
    columns.md && mdCols[columns.md],
    columns.lg && lgCols[columns.lg],
    columns.xl && xlCols[columns.xl],
  );
}

/** Props for {@link Grid}. */
export type GridProps = ComponentProps<"div"> & {
  /** A number gives a responsive default (e.g. 3 → 1 / 2 / 3 columns); an object sets each breakpoint explicitly. */
  columns?: GridColumns;
  gap?: Size;
  as?: ElementType;
};

/** CSS grid with responsive column counts. */
export function Grid({ columns = 1, gap = "large", as: Comp = "div", className, ...props }: GridProps) {
  return <Comp className={cx("grid", gridColumnClasses(columns), gapClasses[gap], className)} {...props} />;
}
