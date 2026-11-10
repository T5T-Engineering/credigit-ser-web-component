import type { ComponentProps } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { cx } from "../../utils/cx";

/** Props for `FieldMessage`. */
export type FieldMessageProps = ComponentProps<"p"> & {
  tone?: "neutral" | "error" | "success";
};

const toneClasses: Record<NonNullable<FieldMessageProps["tone"]>, string> = {
  neutral: "text-fg-muted",
  error: "text-danger-strong",
  success: "text-success-strong",
};

/** Helper, error or success text under a control. Errors and successes carry an icon so colour is never the only signal. */
export function FieldMessage({ tone = "neutral", className, children, ...props }: FieldMessageProps) {
  const Icon = tone === "error" ? CircleAlert : tone === "success" ? CircleCheck : null;
  return (
    <p className={cx("flex items-start gap-1.5 text-sm leading-5", toneClasses[tone], className)} {...props}>
      {Icon ? <Icon aria-hidden="true" size={16} className="mt-0.5 shrink-0" /> : null}
      <span>{children}</span>
    </p>
  );
}
