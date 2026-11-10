import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** Red / Amber / Green status. */
export type RagStatus = "red" | "amber" | "green";

/** Props for {@link RagIndicator}. */
export type RagIndicatorProps = Omit<ComponentProps<"span">, "children"> & {
  status: RagStatus;
  /** Visible text. Defaults to "Red" / "Amber" / "Green". The status name is always available to screen readers. */
  label?: ReactNode;
  size?: "small" | "medium";
};

const names: Record<RagStatus, string> = { red: "Red", amber: "Amber", green: "Green" };
const pillClass: Record<RagStatus, string> = {
  red: "bg-danger-soft text-danger-strong",
  amber: "bg-warning-soft text-warning-strong",
  green: "bg-success-soft text-success-strong",
};
const colors: Record<RagStatus, string> = {
  red: "var(--cg-danger)",
  amber: "var(--cg-warning)",
  green: "var(--cg-success)",
};

/**
 * RAG status marker as a soft Bolt pill. Colour is never the only signal: each status has its own shape
 * (green circle, amber triangle, red square) plus a text label.
 */
export function RagIndicator({ status, label, size = "medium", className, ...props }: RagIndicatorProps) {
  const px = size === "small" ? 10 : 12;
  const fill = { fill: colors[status] };
  return (
    <span
      className={cx(
        "squircle inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        pillClass[status],
        size === "small" ? "h-6 px-2.5 text-xs" : "h-7 px-3 text-sm",
        className,
      )}
      data-status={status}
      {...props}
    >
      <svg width={px} height={px} viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
        {status === "green" && <circle cx="6" cy="6" r="5.5" style={fill} />}
        {status === "amber" && <path d="M6 1.5 L10.8 10.3 H1.2 Z" style={{ ...fill, stroke: colors[status] }} strokeWidth={1.5} strokeLinejoin="round" />}
        {status === "red" && <rect x="1" y="1" width="10" height="10" rx="2.5" style={fill} />}
      </svg>
      {label === undefined ? (
        <span>{names[status]}</span>
      ) : (
        <span>
          <span className="sr-only">{names[status]}: </span>
          {label}
        </span>
      )}
    </span>
  );
}
