"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";

import { cx } from "../../utils/cx";

/** Props for {@link ScrollToTop}. */
export type ScrollToTopProps = Omit<ComponentProps<"button">, "children"> & {
  /** Show after scrolling this many px. Default 400. */
  threshold?: number;
  /** Accessible name. Default "Back to top". */
  label?: string;
  /** CSS selector of an element to focus after scrolling (e.g. "#main"), so keyboard users land at the top too. */
  focusTarget?: string;
};

/** Floating "back to top" button. Smooth scroll, instant when the user prefers reduced motion. */
export function ScrollToTop({ threshold = 400, label = "Back to top", focusTarget, className, onClick, ...props }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "fixed bottom-6 right-6 z-40 squircle inline-flex size-12 items-center justify-center rounded-full bg-emphasis text-on-emphasis shadow-lg transition-[background-color,transform] duration-150 ease-bolt hover:bg-emphasis-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        if (focusTarget) {
          const el = document.querySelector<HTMLElement>(focusTarget);
          if (el) {
            if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
            el.focus({ preventScroll: true });
          }
        }
      }}
      {...props}
    >
      <ArrowUp aria-hidden="true" className="size-5" />
    </button>
  );
}
