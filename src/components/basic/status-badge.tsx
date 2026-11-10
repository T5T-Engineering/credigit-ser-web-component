import { Badge, type BadgeProps } from "./badge";
import type { Tone } from "./tone";

/** Common credit-risk / lending status → tone mapping. Pass as `tones` to StatusBadge. */
export const riskStatusTones: Record<string, Tone> = {
  PERFORMING: "success",
  WATCHLIST: "warning",
  SUBSTANDARD: "warning",
  DOUBTFUL: "danger",
  LOST: "danger",
  PENDING_APPROVAL: "info",
  APPROVED: "success",
  DECLINED: "danger",
  DISBURSED: "brand",
};

/** Props for `StatusBadge`. */
export type StatusBadgeProps = Omit<BadgeProps, "tone" | "children"> & {
  /** Raw status value, e.g. `"PENDING_APPROVAL"`. */
  status: string;
  /** Status → tone mapping (e.g. `riskStatusTones`). Unknown statuses are `neutral`. */
  tones?: Record<string, Tone>;
  /** Visible label. Defaults to the status with `_` replaced by spaces. */
  label?: string;
};

/** Resolve the tone for a status (exact match first, then case-insensitive). */
export function resolveStatusTone(status: string, tones: Record<string, Tone> = {}): Tone {
  return tones[status] ?? tones[status.toUpperCase()] ?? "neutral";
}

/** Badge whose tone is derived from a status value via a supplied mapping. */
export function StatusBadge({ status, tones, label, dot = true, ...props }: StatusBadgeProps) {
  return (
    <Badge tone={resolveStatusTone(status, tones)} dot={dot} data-status={status} {...props}>
      {label ?? status.replaceAll("_", " ")}
    </Badge>
  );
}
