import type { ComponentProps, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cx } from "../../utils/cx";
import { toneSolidText, type StatusTone } from "./block-utils";

/** Props for `Alert`. */
export type AlertProps = Omit<ComponentProps<"div">, "title"> & {
  /** Message severity. Default `"info"`. */
  tone?: StatusTone;
  /** Bold first line. */
  title?: ReactNode;
  /** Inline action (link or small button). */
  action?: ReactNode;
  /** Override the default tone icon; pass `null` to hide it. */
  icon?: ReactNode;
};

/**
 * Tinted fills mixed from the tone and the *current* surface, so the alert is a soft tint on light
 * surfaces and a dark tinted panel inside dark bands (`data-cg-theme="dark|xdark"`).
 */
const toneSurface: Record<StatusTone, string> = {
  info: "bg-[color-mix(in_oklab,var(--cg-info)_12%,var(--cg-surface))]",
  success: "bg-[color-mix(in_oklab,var(--cg-success)_12%,var(--cg-surface))]",
  warning: "bg-[color-mix(in_oklab,var(--cg-warning)_14%,var(--cg-surface))]",
  danger: "bg-[color-mix(in_oklab,var(--cg-danger)_12%,var(--cg-surface))]",
};

/** Default icon per status tone. */
export const statusIcons: Record<StatusTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

/** Inline contextual message (info, success, warning, danger). */
export function Alert({ tone = "info", title, action, icon, className, children, ...props }: AlertProps) {
  const ToneIcon = statusIcons[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cx(
        "squircle relative flex items-start gap-3 overflow-hidden rounded-2xl px-4 py-4 text-sm text-fg sm:px-5 sm:text-base",
        toneSurface[tone],
        className,
      )}
      {...props}
    >
      {icon === null ? null : (
        <span aria-hidden="true" className={cx("mt-px shrink-0 [&>svg]:size-5 sm:mt-0.5", toneSolidText[tone])}>
          {icon ?? <ToneIcon />}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5 leading-6">
          {title ? <p className="font-semibold text-fg">{title}</p> : null}
          {children ? <div className="text-fg-muted">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0 font-semibold">{action}</div> : null}
      </div>
    </div>
  );
}
