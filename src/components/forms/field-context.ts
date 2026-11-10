"use client";

import { createContext, useContext, useState, type Ref, type RefCallback } from "react";

import type { Size } from "../../theme/tokens";

/** Sizes supported by form controls. */
export type FormControlSize = Extract<Size, "small" | "medium" | "large">;

/** Values shared by a `Field` with the control rendered inside it. */
export type FieldContextValue = {
  /** id applied to the control (the label's `htmlFor`). */
  id: string;
  /** id of the visible label element. */
  labelId: string;
  /** id of the description element, when rendered. */
  descriptionId?: string;
  /** id of the error message element, when rendered. */
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  size?: FormControlSize;
};

/** React context linking a `Field` to its control. */
export const FieldContext = createContext<FieldContextValue | null>(null);

/** Read the surrounding `Field` context (null when used standalone). */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

/** Join id lists for aria-describedby / aria-labelledby, skipping empties. */
export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : undefined;
}

type ControlInput = {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  size?: FormControlSize;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
};

/** Merge a control's own props with the surrounding Field's wiring (id, ARIA, required, disabled, size). */
export function useFieldControl(props: ControlInput) {
  const field = useFieldContext();
  const invalid = Boolean(props.invalid ?? field?.invalid ?? false);
  return {
    field,
    id: props.id ?? field?.id,
    invalid,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
    size: props.size ?? field?.size ?? "medium",
    describedBy: joinIds(props["aria-describedby"], field?.descriptionId, field?.errorId),
    ariaInvalid: props["aria-invalid"] ?? (invalid ? true : undefined),
  } as const;
}

/** Controlled/uncontrolled state helper. */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const set = (next: T) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
  };
  return [current, set];
}

/** Combine several refs into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") (ref as { current: T | null }).current = node;
    }
  };
}
