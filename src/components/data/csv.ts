import type { ReactNode } from "react";

/** Minimal column shape used by the CSV helpers (a `DataTableColumn` satisfies it). */
export type CsvColumn<T> = {
  id: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => unknown);
  /** Value written to CSV; defaults to the accessor value. */
  csv?: (row: T) => unknown;
  /** Header text in CSV when `header` is not a string. */
  csvHeader?: string;
  hidden?: boolean;
  /** Leave the column out of CSV exports. */
  exportable?: boolean;
};

/** Read a column's raw value from a row. */
export function getColumnValue<T>(column: Pick<CsvColumn<T>, "accessor">, row: T): unknown {
  const { accessor } = column;
  if (typeof accessor === "function") return accessor(row);
  if (accessor !== undefined && row !== null && typeof row === "object") return (row as Record<PropertyKey, unknown>)[accessor as PropertyKey];
  return undefined;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (Array.isArray(value)) return value.map(stringify).join("; ");
  return String(value);
}

/** Escape one CSV field (RFC 4180) and neutralise spreadsheet formula injection in text values. */
export function escapeCsvField(value: unknown): string {
  let text = stringify(value);
  // Text beginning with = + - @ (or tab/CR) is executed as a formula by Excel; plain numbers are left alone.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text) && !/^[-+]?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Build CSV text (header row + one line per row, CRLF line endings). Hidden and `exportable: false` columns are skipped. */
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const cols = columns.filter((c) => !c.hidden && c.exportable !== false);
  const header = cols.map((c) => escapeCsvField(c.csvHeader ?? (typeof c.header === "string" || typeof c.header === "number" ? String(c.header) : c.id)));
  const lines = rows.map((row) => cols.map((c) => escapeCsvField(c.csv ? c.csv(row) : getColumnValue(c, row))).join(","));
  return [header.join(","), ...lines].join("\r\n");
}

/** Build the CSV and download it as `filename` (".csv" appended if missing). Returns the CSV text. */
export function exportCsv<T>(columns: CsvColumn<T>[], rows: T[], filename = "export.csv"): string {
  const csv = toCsv(columns, rows);
  if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return csv;
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return csv;
}
