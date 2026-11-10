import type { LucideIcon, LucideProps } from "lucide-react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";

/** Pixel sizes for each Bolt t-shirt size. */
export const iconSizes: Record<Size, number> = {
  xsmall: 12,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
};

/** Props for `Icon`. */
export type IconProps = Omit<LucideProps, "size"> & {
  /** A lucide-react icon component, e.g. `ShieldCheck`. */
  icon: LucideIcon;
  size?: Size;
  /** Accessible name. When absent the icon is decorative (`aria-hidden`). */
  label?: string;
};

/** Renders a lucide icon at a Bolt size; decorative unless a `label` is given. */
export function Icon({ icon: IconComponent, size = "medium", label, className, ...props }: IconProps) {
  return (
    <IconComponent
      size={iconSizes[size]}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cx("inline-block shrink-0", className)}
      {...props}
    />
  );
}
