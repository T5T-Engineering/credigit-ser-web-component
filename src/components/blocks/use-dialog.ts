"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from "react";

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Internal: drives a native `<dialog>` from a controlled `open` prop.
 * Modal semantics (inert background) come from `showModal()`; a Tab wrap adds a belt-and-braces
 * focus trap, Escape / backdrop click request close, and focus returns to the opener on close.
 */
export function useDialog(open: boolean, onOpenChange: (open: boolean) => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = (document.activeElement as HTMLElement | null) ?? null;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      // Focus the first autofocus / focusable element, else the dialog itself.
      const body = dialog.querySelector<HTMLElement>("[data-dialog-body]");
      const target =
        dialog.querySelector<HTMLElement>("[autofocus]") ??
        body?.querySelector<HTMLElement>(FOCUSABLE) ??
        dialog.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? dialog).focus();
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  // Restore focus when the dialog closes or unmounts while open.
  useEffect(() => {
    if (open) return;
    const el = returnFocus.current;
    if (el && typeof el.focus === "function" && el.isConnected) el.focus();
    returnFocus.current = null;
  }, [open]);

  useEffect(
    () => () => {
      const el = returnFocus.current;
      if (el && el.isConnected) el.focus();
    },
    [],
  );

  const requestClose = () => onOpenChangeRef.current(false);

  const dialogProps = {
    ref,
    // React bubbles cancel/close from nested dialogs (e.g. a confirm inside a Drawer) up to parents:
    // only react to events that belong to this dialog.
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      requestClose();
    },
    onClose: (event: SyntheticEvent<HTMLDialogElement>) => {
      if (event.target !== event.currentTarget) return;
      // Closed by the platform (e.g. form method="dialog"): sync state.
      if (open) requestClose();
    },
    onKeyDown: (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("inert") && el.getAttribute("aria-hidden") !== "true",
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === event.currentTarget)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    onMouseDown: (event: MouseEvent<HTMLDialogElement>) => {
      // Clicks on the ::backdrop target the dialog element itself.
      if (event.target === event.currentTarget) requestClose();
    },
  };

  return { dialogProps, requestClose };
}
