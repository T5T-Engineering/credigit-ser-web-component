import type { ComponentProps, ReactNode } from "react";
import { Check } from "lucide-react";

import { cx } from "../../utils/cx";
import { eyebrowText } from "./block-utils";

/** One step / milestone. */
export type StepItem = {
  /** Step name. */
  title: ReactNode;
  /** Detail copy. */
  description?: ReactNode;
  /** Progress state. Omit for a plain process list (neutral styling, no status announced). */
  status?: "complete" | "current" | "upcoming";
  /** Mono meta label, e.g. "Phase 1" or "Q3 2026". */
  meta?: string;
};

/** Props for `Steps` and `Timeline`. */
export type StepsProps = Omit<ComponentProps<"ol">, "children"> & {
  /** Ordered steps. */
  items: StepItem[];
  /** Layout. `"horizontal"` falls back to vertical below the `md` breakpoint. Default `"vertical"`. */
  orientation?: "vertical" | "horizontal";
  /** Hide the visually hidden status text (when status is conveyed elsewhere). */
  statusLabels?: { complete: string; current: string; upcoming: string };
};

const defaultLabels = { complete: "Completed", current: "Current", upcoming: "Upcoming" };

type Marker = "number" | "dot";

function StepList({
  items,
  orientation = "vertical",
  statusLabels = defaultLabels,
  marker,
  className,
  ...props
}: StepsProps & { marker: Marker }) {
  const horizontal = orientation === "horizontal";
  const dot = marker === "dot";

  return (
    <ol
      className={cx("flex flex-col", horizontal && "md:flex-row md:gap-6", className)}
      {...props}
    >
      {items.map((item, index) => {
        const status = item.status ?? "upcoming";
        // Without an explicit status (e.g. a marketing process list) steps render neutral, not greyed out.
        const muted = item.status === "upcoming";
        const last = index === items.length - 1;
        return (
          <li
            key={index}
            aria-current={status === "current" ? "step" : undefined}
            className={cx(
              "group/step relative flex gap-4",
              horizontal ? "md:flex-1 md:flex-col md:gap-4" : "",
              !last && (horizontal ? "pb-8 md:pb-0" : "pb-8"),
            )}
          >
            {/* connector */}
            {!last ? (
              <span
                aria-hidden="true"
                className={cx(
                  "absolute",
                  dot ? "top-5 left-[7px] w-0.5" : "top-11 left-[19px] w-0.5",
                  "bottom-0",
                  horizontal &&
                    (dot
                      ? "md:top-[7px] md:right-[-1.5rem] md:bottom-auto md:left-6 md:h-0.5 md:w-auto"
                      : "md:top-[19px] md:right-[-1.5rem] md:bottom-auto md:left-13 md:h-0.5 md:w-auto"),
                  status === "complete" ? "bg-fg" : "bg-line",
                )}
              />
            ) : null}
            {/* marker */}
            <span aria-hidden="true" className="relative z-10 shrink-0">
              {dot ? (
                <span
                  className={cx(
                    "mt-1 grid size-4 place-items-center rounded-full border-2 transition-colors",
                    status === "complete" && "border-accent-500 bg-accent-500",
                    status === "current" && "border-accent-500 bg-bg ring-4 ring-accent-500/20",
                    status === "upcoming" && "border-line-strong bg-bg",
                  )}
                />
              ) : (
                <span
                  className={cx(
                    "grid size-10 place-items-center rounded-full font-mono text-sm font-semibold tabular-nums transition-colors",
                    status === "complete" && "bg-emphasis text-on-emphasis",
                    status === "current" && "bg-action text-on-action ring-4 ring-accent-500/20",
                    status === "upcoming" && (muted ? "bg-surface-sunken text-fg-muted ring-1 ring-line" : "bg-surface-sunken text-fg ring-1 ring-line"),
                  )}
                >
                  {status === "complete" ? <Check className="size-5" strokeWidth={2.5} /> : String(index + 1).padStart(2, "0")}
                </span>
              )}
            </span>
            {/* content */}
            <div className={cx("flex min-w-0 flex-col gap-1", dot ? "" : "pt-1.5", horizontal && "md:pt-0 md:pr-4")}>
              {item.meta ? (
                <p className={cx(eyebrowText, muted ? "text-fg-muted" : "text-accent-text")}>
                  {item.meta}
                </p>
              ) : null}
              <p
                className={cx(
                  "font-display text-lg leading-snug font-bold tracking-[-0.01em] sm:text-subtitle",
                  muted ? "text-fg-muted" : "text-fg",
                )}
              >
                {item.status ? <span className="sr-only">{statusLabels[status]}: </span> : null}
                {item.title}
              </p>
              {item.description ? <div className="text-base leading-6 text-fg-muted">{item.description}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Numbered progress steps (e.g. lending lifecycle). */
export function Steps(props: StepsProps) {
  return <StepList {...props} marker="number" />;
}

/** Milestone timeline with dot markers and prominent meta labels (e.g. phase roadmap). */
export function Timeline(props: StepsProps) {
  return <StepList {...props} marker="dot" />;
}
