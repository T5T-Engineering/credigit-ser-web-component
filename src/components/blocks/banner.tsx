"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Megaphone, X } from "lucide-react";

import { cx } from "../../utils/cx";
import { containerClass, focusRing, toneSolidText, type BlockTone } from "./block-utils";
import { statusIcons } from "./alert";

/** Props for `Banner`. */
export type BannerProps = Omit<ComponentProps<"div">, "title"> & {
  /** Colour. Default `"brand"`. */
  tone?: BlockTone;
  /** Bold lead-in. */
  title?: ReactNode;
  /** Action (link/button) shown after the message. */
  action?: ReactNode;
  /** Show a dismiss button. */
  dismissible?: boolean;
  /** Called after the user dismisses the banner. */
  onDismiss?: () => void;
  /** Override the default icon; pass `null` to hide it. */
  icon?: ReactNode;
  /** Accessible label for the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
};

/** Theme + background per tone. Solid tones switch to a dark surface so text stays legible. */
const toneSurface: Record<BlockTone, { theme: "xlight" | "dark"; className: string }> = {
  neutral: { theme: "xlight", className: "bg-surface-sunken" },
  brand: { theme: "dark", className: "bg-bg" },
  accent: { theme: "dark", className: "bg-action text-on-action [&_*]:text-inherit" },
  info: { theme: "xlight", className: "bg-info-soft" },
  success: { theme: "xlight", className: "bg-success-soft" },
  warning: { theme: "xlight", className: "bg-warning-soft" },
  danger: { theme: "xlight", className: "bg-danger-soft" },
};

/** Page-level announcement bar. */
export function Banner({
  tone = "brand",
  title,
  action,
  dismissible,
  onDismiss,
  icon,
  dismissLabel = "Dismiss",
  className,
  children,
  ...props
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const surface = toneSurface[tone];
  const StatusIcon =
    tone === "info" || tone === "success" || tone === "warning" || tone === "danger" ? statusIcons[tone] : Megaphone;
  const iconColor = tone === "brand" ? "text-accent-400" : tone === "accent" ? "" : toneSolidText[tone];

  return (
    <div
      data-cg-theme={surface.theme}
      className={cx("w-full text-sm text-fg sm:text-base", surface.className, className)}
      {...props}
    >
      <div className={cx(containerClass, "flex items-center gap-3 py-3.5")}>
        {icon === null ? null : (
          <span aria-hidden="true" className={cx("shrink-0 [&>svg]:size-5", iconColor)}>
            {icon ?? <StatusIcon />}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 leading-6">
          {title ? <p className="font-semibold">{title}</p> : null}
          {children ? <div className={tone === "accent" ? "" : "text-fg-muted"}>{children}</div> : null}
          {action ? <div className="font-semibold">{action}</div> : null}
        </div>
        {dismissible ? (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            className={cx(
              "-mr-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-fg/5 opacity-90 transition duration-150 ease-out hover:bg-fg/10 hover:opacity-100 active:scale-[0.96]",
              focusRing,
            )}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
