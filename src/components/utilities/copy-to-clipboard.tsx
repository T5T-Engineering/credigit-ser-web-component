"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link CopyToClipboard}. */
export type CopyToClipboardProps = Omit<ComponentProps<"button">, "value" | "children"> & {
  value: string;
  /** Button text / accessible name. Default "Copy". */
  label?: string;
  /** Announced (and shown) after copying. Default "Copied". */
  copiedLabel?: string;
  /** Hide the visible text (icon-only, name kept via aria-label). */
  iconOnly?: boolean;
  onCopy?: (value: string) => void;
};

async function writeClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

/** Button that copies `value` to the clipboard and announces "Copied" via a polite live region. */
export function CopyToClipboard({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  iconOnly = false,
  onCopy,
  className,
  onClick,
  ...props
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <button
        type="button"
        aria-label={iconOnly ? label : undefined}
        className={cx(
          "squircle inline-flex min-h-7 min-w-7 items-center justify-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted transition-[background-color,color,transform] duration-150 ease-bolt hover:bg-fg/10 hover:text-fg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          className,
        )}
        onClick={async (event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          try {
            await writeClipboard(value);
            setCopied(true);
            onCopy?.(value);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        {...props}
      >
        {copied ? <Check aria-hidden="true" className="size-3.5 text-success-strong" /> : <Copy aria-hidden="true" className="size-3.5" />}
        {!iconOnly && <span>{copied ? copiedLabel : label}</span>}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
