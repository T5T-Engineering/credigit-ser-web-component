"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { Button, type ButtonProps } from "../basic/button";

/** Overridable copy of the required-field check. */
export type ValidationLabels = {
  /** Shown under a required `Field` whose control is empty after a save attempt. */
  required: string;
};

/** Default English copy. */
export const defaultValidationLabels: ValidationLabels = {
  required: "This field is required.",
};

type Entry = {
  /** Element used for document order, scrolling and focus. */
  element: () => HTMLElement | null;
  /** Re-checks the field and returns true when its value is missing. */
  check: () => boolean;
};

/** State shared by a `ValidationScope` with the required `Field`s inside it. */
export type ValidationContextValue = {
  /** True once a save was attempted; required fields then show their message. */
  attempted: boolean;
  labels: ValidationLabels;
  /** Registers a required field; returns the unregister function. */
  register: (id: string, entry: Entry) => () => void;
};

const ValidationContext = createContext<ValidationController | null>(null);

/** The surrounding validation scope (null outside one). */
export function useValidationContext(): ValidationController | null {
  return useContext(ValidationContext);
}

/** Controller returned by `useValidation()`; pass it to `ValidationScope`. */
export type ValidationController = ValidationContextValue & {
  /**
   * Marks the scope as attempted, re-checks every required field and returns true when all are filled.
   * Otherwise scrolls to and focuses the first empty one (document order) and returns false.
   */
  validate: () => boolean;
  /** Clears the attempted state (e.g. after a successful save or discard). */
  reset: () => void;
};

/** Creates a validation controller for a form area saved by a button rather than a `<form>` submit. */
export function useValidation(labels?: Partial<ValidationLabels>): ValidationController {
  const [attempted, setAttempted] = useState(false);
  const entries = useRef(new Map<string, Entry>());
  const required = labels?.required ?? defaultValidationLabels.required;

  const register = useCallback((id: string, entry: Entry) => {
    entries.current.set(id, entry);
    return () => {
      if (entries.current.get(id) === entry) entries.current.delete(id);
    };
  }, []);

  const validate = useCallback(() => {
    setAttempted(true);
    const missing = [...entries.current.values()]
      .filter((entry) => entry.check())
      .map((entry) => entry.element())
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const first = missing[0];
    if (first) {
      first.scrollIntoView?.({ block: "center", behavior: "smooth" });
      first.focus({ preventScroll: true });
    }
    return [...entries.current.values()].every((entry) => !entry.check());
  }, []);

  const reset = useCallback(() => setAttempted(false), []);

  return useMemo(() => ({ attempted, labels: { required }, register, validate, reset }), [attempted, required, register, validate, reset]);
}

/** Props for `ValidationScope`. */
export type ValidationScopeProps = {
  /** Controller from `useValidation()`. */
  value: ValidationController;
  children: ReactNode;
};

/** Makes the required `Field`s inside it report to the controller (no DOM of its own). */
export function ValidationScope({ value, children }: ValidationScopeProps) {
  return <ValidationContext value={value}>{children}</ValidationContext>;
}

/**
 * `Button` for save / submit actions inside a `ValidationScope` (a page scope, `Modal`, `Drawer` or `Form`): on click it
 * checks the scope's required fields first and runs `onClick` only when all are filled. Outside a scope it is a plain `Button`.
 */
export function SubmitButton({ onClick, ...props }: ButtonProps) {
  const scope = useValidationContext();
  return (
    <Button
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (scope && !scope.validate()) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}

/** Controls in a closed dialog, a hidden panel or an inert region can't be filled in, so they never block a save. */
export function isOutOfView(el: Element): boolean {
  return el.closest("dialog:not([open]), [hidden], [inert], [aria-hidden='true']") !== null;
}

/**
 * Whether the control with this id has no value: unchecked checkbox, empty input / textarea / select (whitespace counts as
 * empty), or a radio group / group element with no checked input inside. Unknown or missing elements count as filled.
 */
export function isValueMissing(id: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(id);
  if (!el || isOutOfView(el)) return false;
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") return !el.checked;
    if (el.type === "file") return (el.files?.length ?? 0) === 0;
    return el.value.trim() === "";
  }
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el.value.trim() === "";
  const inputs = el.querySelectorAll<HTMLInputElement>("input[type=radio], input[type=checkbox]");
  if (inputs.length > 0) return ![...inputs].some((input) => input.checked);
  return false;
}
