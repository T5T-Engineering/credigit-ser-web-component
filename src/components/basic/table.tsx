import type { ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for `Table`. */
export type TableProps = ComponentProps<"table"> & {
  /** Alternate row shading in the body. */
  striped?: boolean;
  /** Keeps the header visible while the container scrolls; give the container a height via `containerClassName`. */
  stickyHeader?: boolean;
  /** Classes for the scrolling wrapper (e.g. `max-h-96` with `stickyHeader`, or `bg-surface p-2 shadow-sm`). */
  containerClassName?: string;
};

/** Bolt data table: rounded scrolling wrapper, soft grey rounded header row, hairline row dividers. */
export function Table({ striped = false, stickyHeader = false, containerClassName, className, ...props }: TableProps) {
  return (
    <div className={cx("w-full rounded-2xl squircle", stickyHeader ? "overflow-auto" : "overflow-x-auto", containerClassName)}>
      <table
        className={cx(
          "w-full border-separate border-spacing-0 text-start text-sm text-fg-muted",
          striped && "[&>tbody>tr:nth-child(even)]:bg-fg/[0.025]",
          stickyHeader && "[&>thead_th]:sticky [&>thead_th]:top-0 [&>thead_th]:z-10",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** Props for `TableHead`. */
export type TableHeadProps = ComponentProps<"thead">;

/** Table header section (`thead`). */
export function TableHead({ className, ...props }: TableHeadProps) {
  return <thead className={cx("[&>tr]:bg-transparent [&>tr]:hover:bg-transparent", className)} {...props} />;
}

/** Props for `TableBody`. */
export type TableBodyProps = ComponentProps<"tbody">;

/** Table body section (`tbody`). */
export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cx("[&>tr:last-child>td]:border-b-0", className)} {...props} />;
}

/** Props for `TableRow`. */
export type TableRowProps = ComponentProps<"tr"> & {
  /** Highlights the row as selected (sets `aria-selected`). */
  selected?: boolean;
};

/** Table row with hover highlight. */
export function TableRow({ selected, className, ...props }: TableRowProps) {
  return (
    <tr
      aria-selected={selected}
      className={cx(
        "transition-colors duration-150 ease-bolt hover:bg-fg/[0.03]",
        selected && "bg-accent-tint hover:bg-accent-tint/80",
        className,
      )}
      {...props}
    />
  );
}

/** Props for `TableHeaderCell`. */
export type TableHeaderCellProps = ComponentProps<"th"> & {
  /** Right-align for numeric columns. */
  numeric?: boolean;
};

/** Column header cell (`th`, `scope="col"` by default): mono uppercase on the soft grey header row, rounded at the row ends. */
export function TableHeaderCell({ numeric = false, scope = "col", className, ...props }: TableHeaderCellProps) {
  return (
    <th
      scope={scope}
      className={cx(
        "bg-surface-sunken px-4 py-3 align-middle font-mono text-xs font-medium uppercase tracking-[0.08em] whitespace-nowrap text-fg-muted",
        "first:rounded-s-2xl last:rounded-e-2xl",
        numeric ? "text-end" : "text-start",
        className,
      )}
      {...props}
    />
  );
}

/** Props for `TableCell`. */
export type TableCellProps = ComponentProps<"td"> & {
  /** Mono, tabular, right-aligned figures. */
  numeric?: boolean;
};

/** Body cell; row padding follows information density (`py-cell-y`). */
export function TableCell({ numeric = false, className, ...props }: TableCellProps) {
  return (
    <td
      className={cx(
        "border-b border-line/70 px-4 py-cell-y align-middle",
        numeric ? "text-end font-mono tabular-nums text-fg" : "text-start",
        className,
      )}
      {...props}
    />
  );
}
