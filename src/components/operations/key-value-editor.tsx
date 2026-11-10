"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "../basic/button";
import { IconButton } from "../basic/icon-button";
import { FieldMessage } from "../forms/field-message";
import { Input } from "../forms/input";
import { cx } from "../../utils/cx";
import { createLocalId, labelText } from "./ops-utils";

/** One editable key / value row. */
export type KeyValuePair = { id: string; key: string; value: string };

/** Record → rows (ids from the keys). */
export function toKeyValuePairs(record: Record<string, string | number | boolean>): KeyValuePair[] {
  return Object.entries(record).map(([key, value]) => ({ id: `kv-${key}`, key, value: String(value) }));
}

/** Rows → record (blank keys skipped; later duplicates win). */
export function fromKeyValuePairs(pairs: KeyValuePair[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of pairs) if (p.key.trim() !== "") out[p.key.trim()] = p.value;
  return out;
}

/** Default key check: required and unique (trimmed). Returns an error per row id. */
export function validateKeyValuePairs(pairs: KeyValuePair[], messages: { required?: string; duplicate?: string } = {}): Record<string, string> {
  const { required = "Key is required", duplicate = "Duplicate key" } = messages;
  const errors: Record<string, string> = {};
  const seen = new Map<string, number>();
  for (const p of pairs) seen.set(p.key.trim(), (seen.get(p.key.trim()) ?? 0) + 1);
  for (const p of pairs) {
    const k = p.key.trim();
    if (k === "") {
      if (p.value.trim() !== "") errors[p.id] = required;
    } else if ((seen.get(k) ?? 0) > 1) errors[p.id] = duplicate;
  }
  return errors;
}

/** Props for `KeyValueEditor`. */
export type KeyValueEditorProps = Omit<ComponentProps<"div">, "onChange" | "children"> & {
  value: KeyValuePair[];
  onChange?: (value: KeyValuePair[]) => void;
  /** Accessible name of the editor (e.g. "Test data"). */
  label: string;
  keyLabel?: string;
  valueLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
  removeLabel?: (key: string, index: number) => string;
  readOnly?: boolean;
  /** Mono (code) keys, default true. */
  monoKeys?: boolean;
  /** Row validation (default `validateKeyValuePairs`): error message per row id. */
  validate?: (pairs: KeyValuePair[]) => Record<string, string>;
  /** Maximum number of rows (add hidden at the limit). */
  maxRows?: number;
};

/**
 * Simple editable key / value rows (workflow conditions, template test data, headers): add, remove,
 * required + unique keys by default, focus moves to the new row's key.
 */
export function KeyValueEditor({
  value,
  onChange,
  label,
  keyLabel = "Key",
  valueLabel = "Value",
  keyPlaceholder,
  valuePlaceholder,
  addLabel = "Add row",
  removeLabel = (key, i) => `Remove ${key || `row ${i + 1}`}`,
  readOnly = false,
  monoKeys = true,
  validate = validateKeyValuePairs,
  maxRows,
  className,
  ...props
}: KeyValueEditorProps) {
  const errors = validate(value);
  const focusId = useRef<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusId.current) return;
    root.current?.querySelector<HTMLInputElement>(`[data-kv-key="${focusId.current}"]`)?.focus();
    focusId.current = null;
  });
  const patch = (id: string, p: Partial<KeyValuePair>) => onChange?.(value.map((row) => (row.id === id ? { ...row, ...p } : row)));
  const add = () => {
    const id = createLocalId("kv");
    focusId.current = id;
    onChange?.([...value, { id, key: "", value: "" }]);
  };

  return (
    <div ref={root} role="group" aria-label={label} className={cx("flex min-w-0 flex-col gap-2", className)} {...props}>
      {value.length > 0 ? (
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_2.5rem] gap-2 px-1 sm:grid">
          <span className={cx(labelText, "text-fg-muted")}>{keyLabel}</span>
          <span className={cx(labelText, "text-fg-muted")}>{valueLabel}</span>
        </div>
      ) : null}
      {value.map((row, i) => (
        <div key={row.id} className="flex flex-col gap-1">
          <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_2.5rem]">
            <Input
              size="small"
              className="col-start-1 row-start-1"
              data-kv-key={row.id}
              aria-label={`${keyLabel} ${i + 1}`}
              value={row.key}
              placeholder={keyPlaceholder}
              readOnly={readOnly}
              invalid={Boolean(errors[row.id])}
              aria-describedby={errors[row.id] ? `${row.id}-error` : undefined}
              spellCheck={false}
              inputClassName={monoKeys ? "font-code text-xs" : undefined}
              onChange={(e) => patch(row.id, { key: e.target.value })}
            />
            <Input
              size="small"
              className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1"
              aria-label={`${valueLabel} ${i + 1}`}
              value={row.value}
              placeholder={valuePlaceholder}
              readOnly={readOnly}
              onChange={(e) => patch(row.id, { value: e.target.value })}
            />
            {!readOnly ? (
              <IconButton
                size="small"
                variant="text"
                className="col-start-2 row-start-1 sm:col-start-3"
                label={removeLabel(row.key, i)}
                icon={<Trash2 className="size-4" />}
                onClick={() => onChange?.(value.filter((r) => r.id !== row.id))}
              />
            ) : null}
          </div>
          {errors[row.id] ? (
            <FieldMessage id={`${row.id}-error`} tone="error">
              {errors[row.id]}
            </FieldMessage>
          ) : null}
        </div>
      ))}
      {!readOnly && (maxRows === undefined || value.length < maxRows) ? (
        <div>
          <Button size="small" variant="tertiary" iconBefore={<Plus className="size-4" />} onClick={add}>
            {addLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
