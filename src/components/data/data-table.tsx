"use client";

import {
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, SearchX } from "lucide-react";

import { cx } from "../../utils/cx";
import { Button } from "../basic/button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../basic/table";
import { EmptyState } from "../blocks/empty-state";
import { Checkbox } from "../forms/checkbox";
import { Pagination } from "../navigation/pagination";
import { Skeleton } from "../utilities/skeleton";
import { exportCsv, getColumnValue, type CsvColumn } from "./csv";
import { FilterBar, type FilterBarSelect, type FilterOption } from "./filter-bar";

/** Column definition for {@link DataTable}. */
export type DataTableColumn<T> = CsvColumn<T> & {
  id: string;
  /** Header content. Use a string where possible (it is also the CSV header and mobile label). */
  header: ReactNode;
  /** Property key or getter for the raw value (used for display, sort, search, faceting and CSV). */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell renderer; defaults to the accessor value as text. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  /** Value used for sorting when it differs from the accessor value. */
  sortValue?: (row: T) => unknown;
  align?: "start" | "center" | "end";
  /** Mono, tabular, right-aligned figures. */
  numeric?: boolean;
  /** CSS width of the column, e.g. `120` or `"12rem"`. */
  width?: number | string;
  /** Hide the column (still available to filters). */
  hidden?: boolean;
  /** Include the column in global search. Default true when it has an accessor. */
  searchable?: boolean;
  /** Classes for this column's body cells. */
  className?: string;
};

/** Sort state. */
export type DataTableSort = { id: string; direction: "asc" | "desc" };

/** Select filter shown as a pill above the table. Options are faceted from the data when omitted. */
export type DataTableFilter<T> = {
  id: string;
  label: string;
  /** Column whose value is matched (default: the filter `id`). */
  columnId?: string;
  options?: FilterOption[];
  /** Controlled value (`""` = all). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Custom match; default compares the column value as a string. */
  filterFn?: (row: T, value: string) => boolean;
  allLabel?: string;
};

/** Props for {@link DataTable}. */
export type DataTableProps<T> = Omit<ComponentProps<"div">, "children" | "onChange"> & {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable row id (used for keys and selection). */
  getRowId: (row: T, index: number) => string;
  /** Accessible name of the table. */
  label?: string;
  /** Visible caption (also the accessible name when `label` is absent). */
  caption?: ReactNode;

  /** Show the global search box. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Controlled search text. */
  search?: string;
  onSearchChange?: (value: string) => void;
  filters?: DataTableFilter<T>[];
  /** Controlled sort (`null` = unsorted). */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Server-side mode: data is shown as given (no client sort/search/filter/paging); pair with `totalRows`. */
  manual?: boolean;
  /** Total rows across all pages in `manual` mode. */
  totalRows?: number;

  /** Paginate rows. Default true. */
  paginate?: boolean;
  /** Controlled page (1-based). */
  page?: number;
  onPageChange?: (page: number) => void;
  defaultPageSize?: number;
  /** Controlled page size. */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Page size choices; `[]` hides the selector. Default [10, 25, 50, 100]. */
  pageSizeOptions?: number[];

  /** Row checkboxes. */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Bulk actions shown while rows are selected. */
  bulkActions?: (selectedRows: T[], clearSelection: () => void) => ReactNode;
  /** Rows that cannot be selected. */
  isRowSelectable?: (row: T) => boolean;

  /** Row activation by click, Enter or Space. */
  onRowClick?: (row: T, event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  /** Makes the first visible cell a link that covers the row. */
  getRowHref?: (row: T) => string | undefined;
  /** Router link component for `getRowHref` (receives `href`). */
  linkComponent?: ElementType;

  loading?: boolean;
  /** Skeleton rows while loading. Default 5. */
  loadingRows?: number;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;
  stickyHeader?: boolean;
  /** Max height of the scroll area (enables the sticky header), e.g. `480` or `"60vh"`. */
  maxHeight?: number | string;
  striped?: boolean;
  /** Sets `data-cg-density` on the table (row padding follows `py-cell-y`). */
  density?: "compact" | "regular" | "spacious";
  /** Right-side toolbar actions. */
  toolbar?: ReactNode;
  /** Adds an "Export CSV" button exporting the filtered, sorted rows (all pages). */
  exportFilename?: string;
  exportLabel?: string;
  /** Card renderer used below the `md` breakpoint instead of the table. */
  mobileCard?: (row: T) => ReactNode;
  /** Extra props per row (classes, data attributes). */
  rowProps?: (row: T) => ComponentProps<"tr">;
};

const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;

function compareValues(a: unknown, b: unknown): number {
  const empty = (v: unknown) => v === null || v === undefined || v === "";
  if (empty(a) || empty(b)) return empty(a) && empty(b) ? 0 : empty(a) ? 1 : -1;
  const norm = (v: unknown) => (v instanceof Date ? v.getTime() : typeof v === "boolean" ? Number(v) : v);
  const x = norm(a);
  const y = norm(b);
  if (typeof x === "number" && typeof y === "number") return x - y;
  return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" });
}

function displayValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-fg-subtle">—</span>;
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "number") return new Intl.NumberFormat("en").format(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Sort, search and filter rows exactly as `DataTable` does on the client (useful for tests and exports). */
export function processRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  options: { search?: string; filters?: Array<{ filter: DataTableFilter<T>; value: string }>; sort?: DataTableSort | null },
): T[] {
  let out = rows;
  for (const { filter, value } of options.filters ?? []) {
    if (!value) continue;
    const column = columns.find((c) => c.id === (filter.columnId ?? filter.id));
    out = out.filter((row) => (filter.filterFn ? filter.filterFn(row, value) : String(column ? getColumnValue(column, row) ?? "" : "") === value));
  }
  const q = options.search?.trim().toLowerCase();
  if (q) {
    const searchCols = columns.filter((c) => c.searchable ?? c.accessor !== undefined);
    out = out.filter((row) =>
      searchCols.some((c) => {
        const v = getColumnValue(c, row);
        return v !== null && v !== undefined && String(v instanceof Date ? v.toISOString() : v).toLowerCase().includes(q);
      }),
    );
  }
  const sort = options.sort;
  const sortCol = sort ? columns.find((c) => c.id === sort.id) : undefined;
  if (sort && sortCol) {
    const get = (row: T) => (sortCol.sortValue ? sortCol.sortValue(row) : getColumnValue(sortCol, row));
    const factor = sort.direction === "asc" ? 1 : -1;
    out = out
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const va = get(a.row);
        const vb = get(b.row);
        const empty = (v: unknown) => v === null || v === undefined || v === "";
        // Empty values always sink to the bottom, whatever the direction.
        if (empty(va) || empty(vb)) return compareValues(va, vb) || a.index - b.index;
        return compareValues(va, vb) * factor || a.index - b.index;
      })
      .map((x) => x.row);
  }
  return out;
}

function isInteractiveTarget(target: EventTarget | null, container: HTMLElement): boolean {
  const el = target instanceof Element ? target.closest("a,button,input,select,textarea,label,[role='menuitem'],[data-row-ignore]") : null;
  return Boolean(el && el !== container && container.contains(el));
}

/** Data table: sort, global search, select filters, pagination, row selection with bulk actions, row links, CSV export, loading and empty states. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  label,
  caption,
  searchable = false,
  searchPlaceholder = "Search…",
  search: searchProp,
  onSearchChange,
  filters = [],
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manual = false,
  totalRows,
  paginate = true,
  page: pageProp,
  onPageChange,
  defaultPageSize = 10,
  pageSize: pageSizeProp,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  selectable = false,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectionChange,
  bulkActions,
  isRowSelectable,
  onRowClick,
  getRowHref,
  linkComponent,
  loading = false,
  loadingRows = 5,
  emptyState,
  stickyHeader = false,
  maxHeight,
  striped = false,
  density,
  toolbar,
  exportFilename,
  exportLabel = "Export CSV",
  mobileCard,
  rowProps,
  className,
  style,
  ...props
}: DataTableProps<T>) {
  const Link = linkComponent ?? "a";
  const [searchState, setSearchState] = useState("");
  const [sortState, setSortState] = useState<DataTableSort | null>(defaultSort);
  const [pageState, setPageState] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(defaultPageSize);
  const [selectedState, setSelectedState] = useState<string[]>(defaultSelectedIds);
  const [filterState, setFilterState] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.id, f.defaultValue ?? ""])),
  );

  const search = searchProp ?? searchState;
  const sort = sortProp !== undefined ? sortProp : sortState;
  const pageSize = pageSizeProp ?? pageSizeState;
  const selectedIds = selectedProp ?? selectedState;
  const filterValue = (f: DataTableFilter<T>) => f.value ?? filterState[f.id] ?? "";

  const visibleColumns = columns.filter((c) => !c.hidden);
  const columnCount = visibleColumns.length + (selectable ? 1 : 0);

  const resetPage = () => {
    if (pageProp === undefined) setPageState(1);
    else if (pageProp !== 1) onPageChange?.(1);
  };
  const setSearch = (value: string) => {
    if (searchProp === undefined) setSearchState(value);
    onSearchChange?.(value);
    resetPage();
  };
  const setFilter = (f: DataTableFilter<T>, value: string) => {
    if (f.value === undefined) setFilterState((s) => ({ ...s, [f.id]: value }));
    f.onChange?.(value);
    resetPage();
  };
  const setSort = (next: DataTableSort | null) => {
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
  };
  const setSelected = (ids: string[]) => {
    if (selectedProp === undefined) setSelectedState(ids);
    onSelectionChange?.(ids);
  };

  const filterKey = filters.map(filterValue).join("\u0000");
  const processed = useMemo(
    () =>
      manual
        ? data
        : processRows(data, columns, { search, sort, filters: filters.map((filter) => ({ filter, value: filterValue(filter) })) }),
    [data, columns, search, sort?.id, sort?.direction, filterKey, manual],
  );

  const total = manual ? (totalRows ?? data.length) : processed.length;
  const pageCount = paginate ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const page = Math.min(Math.max(pageProp ?? pageState, 1), pageCount);
  const pageRows = paginate && !manual ? processed.slice((page - 1) * pageSize, page * pageSize) : processed;
  const setPage = (next: number) => {
    if (pageProp === undefined) setPageState(next);
    onPageChange?.(next);
  };

  const indexOf = useMemo(() => new Map(data.map((row, i) => [row, i] as const)), [data]);
  const rowId = (row: T) => getRowId(row, indexOf.get(row) ?? -1);
  const selectedSet = new Set(selectedIds);
  const selectableRows = pageRows.filter((row) => !isRowSelectable || isRowSelectable(row));
  const pageIds = selectableRows.map(rowId);
  const pageSelected = pageIds.filter((id) => selectedSet.has(id)).length;
  const selectedRows = data.filter((row) => selectedSet.has(rowId(row)));
  const toggleRow = (id: string) => setSelected(selectedSet.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  const togglePage = () =>
    setSelected(
      pageSelected === pageIds.length
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : [...selectedIds, ...pageIds.filter((id) => !selectedSet.has(id))],
    );
  const clearSelection = () => setSelected([]);

  const facetOptions = (f: DataTableFilter<T>): FilterOption[] => {
    if (f.options) return f.options;
    const column = columns.find((c) => c.id === (f.columnId ?? f.id));
    if (!column) return [];
    const counts = new Map<string, number>();
    for (const row of data) {
      const v = getColumnValue(column, row);
      if (v === null || v === undefined || v === "") continue;
      counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([value, count]) => ({ value, label: value.replaceAll("_", " "), count }));
  };

  const barFilters: FilterBarSelect[] = filters.map((f) => ({
    id: f.id,
    label: f.label,
    options: facetOptions(f),
    value: filterValue(f),
    onChange: (v) => setFilter(f, v),
    allLabel: f.allLabel,
  }));
  const clearAll = () => {
    if (searchProp === undefined) setSearchState("");
    if (search) onSearchChange?.("");
    setFilterState(Object.fromEntries(filters.map((f) => [f.id, ""])));
    for (const f of filters) if (filterValue(f)) f.onChange?.("");
    resetPage();
  };

  const exportButton = exportFilename ? (
    <Button variant="tertiary" size="small" iconBefore={<Download size={16} />} onClick={() => exportCsv(visibleColumns, processed, exportFilename)}>
      {exportLabel}
    </Button>
  ) : null;
  const hasToolbar = searchable || filters.length > 0 || toolbar || exportButton;

  const activate = (row: T, event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    if (!onRowClick || isInteractiveTarget(event.target, event.currentTarget)) return;
    if ("key" in event) {
      if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
    }
    onRowClick(row, event);
  };

  const cellContent = (column: DataTableColumn<T>, row: T, first: boolean) => {
    const content = column.cell ? column.cell(row) : displayValue(getColumnValue(column, row));
    const href = first ? getRowHref?.(row) : undefined;
    if (!href) return content;
    return (
      <Link
        href={href}
        className="font-semibold text-fg no-underline after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
      >
        {content}
      </Link>
    );
  };

  const sortIcon = (column: DataTableColumn<T>) => {
    if (sort?.id !== column.id) return <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />;
    return sort.direction === "asc" ? <ArrowUp aria-hidden="true" className="size-3.5" /> : <ArrowDown aria-hidden="true" className="size-3.5" />;
  };
  const cycleSort = (column: DataTableColumn<T>) => {
    if (sort?.id !== column.id) setSort({ id: column.id, direction: "asc" });
    else if (sort.direction === "asc") setSort({ id: column.id, direction: "desc" });
    else setSort(null);
  };

  const empty = emptyState ?? (
    <EmptyState
      bordered={false}
      icon={<SearchX />}
      title="No results"
      description={search || filters.some(filterValue) ? "Try a different search or clear the filters." : "There is nothing to show yet."}
      className="py-10"
    />
  );

  const rangeStart = total === 0 ? 0 : paginate ? (page - 1) * pageSize + 1 : 1;
  const rangeEnd = paginate ? Math.min(page * pageSize, total) : total;
  const accessibleName = label ?? (typeof caption === "string" ? caption : undefined);
  const scrollStyle = maxHeight !== undefined ? ({ "--cg-dt-max-h": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } as CSSProperties) : undefined;
  const sticky = stickyHeader || maxHeight !== undefined;

  return (
    <div className={cx("flex flex-col gap-4", className)} style={{ ...scrollStyle, ...style }} data-cg-density={density} {...props}>
      {caption ? <div className="font-display text-subtitle font-bold tracking-tight text-fg">{caption}</div> : null}
      {hasToolbar ? (
        <FilterBar
          label={accessibleName ? `${accessibleName} filters` : "Table filters"}
          search={searchable ? { value: search, onChange: setSearch, placeholder: searchPlaceholder, label: accessibleName ? `Search ${accessibleName}` : "Search table" } : undefined}
          filters={barFilters}
          onClearAll={searchable || filters.length > 0 ? clearAll : undefined}
          actions={
            toolbar || exportButton ? (
              <>
                {toolbar}
                {exportButton}
              </>
            ) : undefined
          }
        />
      ) : null}

      {selectable && selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions"
          className="squircle flex flex-wrap items-center gap-3 rounded-2xl bg-emphasis px-4 py-2 text-on-emphasis"
        >
          <span className="font-mono text-sm font-semibold tabular-nums">{selectedIds.length} selected</span>
          <div className="flex flex-1 flex-wrap items-center gap-2">{bulkActions?.(selectedRows, clearSelection)}</div>
          <button
            type="button"
            onClick={clearSelection}
            className="squircle inline-flex h-control-sm items-center rounded-full px-3 text-sm font-semibold hover:bg-on-emphasis/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Clear selection
          </button>
        </div>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {loading ? "Loading" : `${total} ${total === 1 ? "result" : "results"}`}
      </span>

      <div className={cx(mobileCard && "hidden md:block")}>
        <Table
          aria-label={accessibleName}
          aria-busy={loading || undefined}
          aria-rowcount={paginate || manual ? total + 1 : undefined}
          striped={striped}
          stickyHeader={sticky}
          containerClassName={cx("bg-surface", maxHeight !== undefined && "max-h-(--cg-dt-max-h)")}
        >
          <TableHead>
            <tr>
              {selectable ? (
                <TableHeaderCell className="w-12 pe-0">
                  <Checkbox
                    size="small"
                    aria-label="Select all rows on this page"
                    checked={pageIds.length > 0 && pageSelected === pageIds.length}
                    indeterminate={pageSelected > 0 && pageSelected < pageIds.length}
                    disabled={pageIds.length === 0 || loading}
                    onChange={togglePage}
                    className="align-middle"
                  />
                </TableHeaderCell>
              ) : null}
              {visibleColumns.map((column) => {
                const align = column.align ?? (column.numeric ? "end" : "start");
                const active = sort?.id === column.id;
                return (
                  <TableHeaderCell
                    key={column.id}
                    numeric={column.numeric}
                    aria-sort={column.sortable ? (active ? (sort.direction === "asc" ? "ascending" : "descending") : "none") : undefined}
                    className={alignClass[align]}
                    style={column.width !== undefined ? { width: column.width } : undefined}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(column)}
                        className={cx(
                          "-mx-2 inline-flex min-h-6 items-center gap-1.5 rounded-full px-2 font-mono text-xs font-medium uppercase tracking-[0.08em] hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
                          active && "text-fg",
                          align === "end" && "flex-row-reverse",
                        )}
                      >
                        {column.header}
                        {sortIcon(column)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHeaderCell>
                );
              })}
            </tr>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: loadingRows }, (_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {Array.from({ length: columnCount }, (_, c) => (
                    <TableCell key={c}>
                      <Skeleton className={cx("h-4 rounded-full", c === 0 && selectable ? "w-4" : i % 2 ? "w-2/3" : "w-4/5")} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="p-0">
                  {empty}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = rowId(row);
                const selected = selectedSet.has(id);
                const extra = rowProps?.(row) ?? {};
                const clickable = Boolean(onRowClick);
                const linked = Boolean(getRowHref?.(row));
                return (
                  <TableRow
                    key={id}
                    {...extra}
                    selected={selectable ? selected : undefined}
                    data-row-id={id}
                    tabIndex={clickable && !linked ? 0 : extra.tabIndex}
                    onClick={clickable ? (event) => activate(row, event) : extra.onClick}
                    onKeyDown={clickable ? (event) => activate(row, event) : extra.onKeyDown}
                    className={cx(
                      (clickable || linked) && "cursor-pointer",
                      linked && "relative",
                      clickable && "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                      extra.className,
                    )}
                  >
                    {selectable ? (
                      <TableCell className="relative z-[1] w-12 pe-0">
                        <Checkbox
                          size="small"
                          aria-label={`Select row ${id}`}
                          checked={selected}
                          disabled={isRowSelectable ? !isRowSelectable(row) : false}
                          onChange={() => toggleRow(id)}
                          className="align-middle"
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((column, ci) => (
                      <TableCell
                        key={column.id}
                        numeric={column.numeric}
                        className={cx(
                          alignClass[column.align ?? (column.numeric ? "end" : "start")],
                          ci === 0 && "text-fg",
                          linked && ci > 0 && "[&_a]:relative [&_a]:z-[1] [&_button]:relative [&_button]:z-[1]",
                          column.className,
                        )}
                      >
                        {cellContent(column, row, ci === 0)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {mobileCard ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden" aria-label={accessibleName} aria-busy={loading || undefined}>
          {loading
            ? Array.from({ length: Math.min(loadingRows, 3) }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-24 rounded-3xl" />
                </li>
              ))
            : pageRows.length === 0
              ? <li>{empty}</li>
              : pageRows.map((row) => {
                  const id = rowId(row);
                  const href = getRowHref?.(row);
                  const card = mobileCard(row);
                  return (
                    <li
                      key={id}
                      tabIndex={onRowClick && !href ? 0 : undefined}
                      onClick={onRowClick ? (event) => activate(row, event) : undefined}
                      onKeyDown={onRowClick ? (event) => activate(row, event) : undefined}
                      className={cx(
                        "squircle relative flex items-start gap-3 rounded-3xl p-4",
                        selectedSet.has(id) ? "bg-accent-tint" : "bg-surface-sunken",
                        (onRowClick || href) && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                      )}
                    >
                      {selectable ? (
                        <Checkbox size="small" aria-label={`Select row ${id}`} checked={selectedSet.has(id)} onChange={() => toggleRow(id)} className="relative z-[1]" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        {href ? (
                          <Link href={href} className="block text-inherit no-underline after:absolute after:inset-0 after:rounded-3xl after:content-['']">
                            {card}
                          </Link>
                        ) : (
                          card
                        )}
                      </div>
                    </li>
                  );
                })}
        </ul>
      ) : null}

      {paginate && !loading && total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
            <span className="font-mono tabular-nums">
              {rangeStart}–{rangeEnd} of {total}
            </span>
            {pageSizeOptions.length > 0 ? (
              <label className="inline-flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    const size = Number(event.target.value);
                    if (pageSizeProp === undefined) setPageSizeState(size);
                    onPageSizeChange?.(size);
                    resetPage();
                  }}
                  className="squircle h-control-sm cursor-pointer appearance-none rounded-full bg-fg/5 px-3 font-mono text-sm font-semibold text-fg tabular-nums hover:bg-fg/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&>option]:bg-surface"
                >
                  {[...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} aria-label={accessibleName ? `${accessibleName} pages` : "Table pages"} />
        </div>
      ) : null}
    </div>
  );
}
