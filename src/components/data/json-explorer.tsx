"use client";

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cx } from "../../utils/cx";

/** A value of a JSON document with its path (dot names, `[n]` indexes, e.g. `data.accounts[0].balance`). */
export type JsonPathEntry = { path: string; value: unknown; kind: JsonKind };

/** JSON value kinds. */
export type JsonKind = "object" | "array" | "string" | "number" | "boolean" | "null";

/** The kind of a JSON value. */
export function jsonKind(value: unknown): JsonKind {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

/** Child path: `parent.key` for properties, `parent[n]` for list items (root: `key` / `[n]`). */
export function jsonChildPath(parent: string, key: string | number): string {
  if (typeof key === "number") return `${parent}[${key}]`;
  return parent === "" ? key : `${parent}.${key}`;
}

/** Every value of a document in document order, containers included (the root is skipped). */
export function jsonPaths(value: unknown, parent = ""): JsonPathEntry[] {
  const out: JsonPathEntry[] = [];
  const walk = (v: unknown, path: string) => {
    const kind = jsonKind(v);
    if (path !== "") out.push({ path, value: v, kind });
    if (kind === "array") (v as unknown[]).forEach((item, i) => walk(item, jsonChildPath(path, i)));
    else if (kind === "object") Object.entries(v as Record<string, unknown>).forEach(([k, item]) => walk(item, jsonChildPath(path, k)));
  };
  walk(value, parent);
  return out;
}

/** Parses JSON text; `{ ok: false, error }` when it is not JSON. */
export function parseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Props for {@link JsonExplorer}. */
export type JsonExplorerProps = Omit<ComponentProps<"div">, "children" | "onSelect"> & {
  /** Parsed JSON, or JSON text (shown as plain text with a notice when it does not parse). */
  value: unknown;
  /** Accessible name, e.g. "Response body". */
  label: string;
  /** Makes values pickable (buttons): called with the value's path. */
  onPick?: (path: string, value: unknown, kind: JsonKind) => void;
  /** Which values can be picked: leaves only (default) or lists and objects too. */
  pickable?: "leaves" | "all";
  /** Marks shown next to values (e.g. the field a path is mapped to), keyed by path. */
  marks?: Record<string, ReactNode>;
  /** Levels open at first (default 2). */
  defaultExpandDepth?: number;
  /** Notice shown when `value` is text that is not JSON. */
  notJsonLabel?: string;
};

/**
 * Collapsible JSON tree (API responses, payloads). Each value shows its key and type-coloured value; with `onPick` values become buttons
 * that report their path (dot names and `[n]` indexes) — used to map a provider response to application fields.
 */
export function JsonExplorer({
  value,
  label,
  onPick,
  pickable = "leaves",
  marks,
  defaultExpandDepth = 2,
  notJsonLabel = "Not JSON — shown as text.",
  className,
  ...props
}: JsonExplorerProps) {
  const parsed = useMemo(() => (typeof value === "string" ? parseJson(value) : ({ ok: true, value } as const)), [value]);
  if (!parsed.ok) {
    return (
      <div className={cx("flex min-w-0 flex-col gap-2", className)} {...props}>
        <p className="text-xs text-fg-muted">{notJsonLabel}</p>
        <pre aria-label={label} tabIndex={0} className="squircle m-0 overflow-auto rounded-2xl bg-surface-sunken p-4 font-code text-xs text-fg">
          {String(value)}
        </pre>
      </div>
    );
  }
  return (
    <div role="group" aria-label={label} className={cx("squircle min-w-0 overflow-auto rounded-2xl bg-surface-sunken p-3 font-code text-xs", className)} {...props}>
      <Node name={null} path="" value={parsed.value} depth={0} ctx={{ onPick, pickable, marks, defaultExpandDepth }} />
    </div>
  );
}

type Ctx = Pick<JsonExplorerProps, "onPick" | "pickable" | "marks"> & { defaultExpandDepth: number };

const valueTone: Record<JsonKind, string> = {
  string: "text-accent-text",
  number: "text-fg",
  boolean: "text-fg-subtle",
  null: "text-fg-subtle",
  object: "text-fg-muted",
  array: "text-fg-muted",
};

function preview(value: unknown, kind: JsonKind): string {
  if (kind === "array") return `[${(value as unknown[]).length}]`;
  if (kind === "object") return `{${Object.keys(value as object).length}}`;
  if (kind === "string") return JSON.stringify(value);
  return String(value ?? "null");
}

function Node({ name, path, value, depth, ctx }: { name: string | number | null; path: string; value: unknown; depth: number; ctx: Ctx }) {
  const kind = jsonKind(value);
  const container = kind === "object" || kind === "array";
  const [open, setOpen] = useState(depth < ctx.defaultExpandDepth);
  const children: [string | number, unknown][] =
    kind === "array" ? (value as unknown[]).map((v, i) => [i, v]) : kind === "object" ? Object.entries(value as Record<string, unknown>) : [];
  const canPick = Boolean(ctx.onPick) && path !== "" && (!container || ctx.pickable === "all");
  const mark = ctx.marks?.[path];

  const keyLabel = name === null ? null : <span className="text-fg-muted">{typeof name === "number" ? `[${name}]` : name}</span>;
  const content = (
    <>
      {keyLabel}
      {keyLabel ? <span className="text-fg-subtle">:</span> : null}
      <span className={cx("min-w-0 break-all", valueTone[kind])}>{preview(value, kind)}</span>
    </>
  );

  return (
    <div data-json-path={path || "$"} data-json-kind={kind}>
      <div className={cx("flex min-h-7 items-center gap-1.5 rounded-lg px-1", mark ? "bg-accent-tint" : null)}>
        {container && children.length > 0 ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${path || "root"}`}
            className="grid size-5 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronRight aria-hidden="true" className={cx("size-3.5 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0" />
        )}
        {canPick ? (
          <button
            type="button"
            title={path}
            aria-label={`Pick ${path}`}
            className="flex min-w-0 items-center gap-1.5 rounded-md px-1 text-start hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => ctx.onPick?.(path, value, kind)}
          >
            {content}
          </button>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5 px-1">{content}</span>
        )}
        {mark ? <span className="ms-auto shrink-0 rounded-full bg-surface px-2 py-0.5 font-sans text-xs font-semibold text-fg">{mark}</span> : null}
      </div>
      {container && open && children.length > 0 ? (
        <div className="ms-2.5 border-s border-line ps-2">
          {children.map(([k, v]) => (
            <Node key={String(k)} name={k} path={jsonChildPath(path, k)} value={v} depth={depth + 1} ctx={ctx} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
