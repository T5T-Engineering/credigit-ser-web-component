/*
 * Internal helpers shared by the operations group. Not exported from the barrel.
 */
export { focusRing, labelText, toneFill, toneText, toneTile } from "../app/app-utils";

let counter = 0;

/** Locally unique id for new rows / steps (crypto.randomUUID when available). */
export function createLocalId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : undefined;
  counter += 1;
  return `${prefix}-${uuid ?? `${Date.now().toString(36)}-${counter}`}`;
}

/** Move an item of an array from one index to another (returns a new array; out-of-range is a no-op). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/** Label lookup for option values; unknown values fall back to the value itself. */
export function optionLabel(options: ReadonlyArray<{ value: string; label: string }> | undefined, value: string): string {
  return options?.find((o) => o.value === value)?.label ?? value;
}
