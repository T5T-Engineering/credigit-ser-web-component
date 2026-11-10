import type { ComponentProps } from "react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";

/** Props for {@link Spinner}. */
export type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  size?: Size;
  /** Screen-reader text. Default "Loading". */
  label?: string;
};

const px: Record<Size, number> = { xsmall: 12, small: 16, medium: 24, large: 32, xlarge: 48 };

/** Indeterminate loading indicator (inherits `currentColor`; defaults to the action colour). */
export function Spinner({ size = "medium", label = "Loading", className, ...props }: SpinnerProps) {
  const s = px[size];
  return (
    <span role="status" className={cx("inline-flex items-center justify-center text-action", className)} {...props}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin [animation-duration:0.8s] [animation-timing-function:linear]">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity={0.15} strokeWidth={3} />
        <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
