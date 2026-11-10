import type { ComponentProps, ElementType } from "react";

import type { SurfaceTheme } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { Container, type ContainerSize } from "./container";

/** Vertical padding scale for {@link Band}. */
export type BandSpacing = "none" | "small" | "medium" | "large" | "xlarge";
/** Decorative background for {@link Band}. */
export type BandBackground = "none" | "grid" | "radial";

const spacings: Record<BandSpacing, string> = {
  none: "",
  small: "py-10 sm:py-12 lg:py-16",
  medium: "py-14 sm:py-16 lg:py-24",
  large: "py-16 sm:py-24 lg:py-32",
  xlarge: "py-20 sm:py-28 lg:py-40",
};

/** Props for {@link Band}. */
export type BandProps = ComponentProps<"section"> & {
  theme?: SurfaceTheme;
  spacing?: BandSpacing;
  /** Element to render. Default `section`. */
  as?: ElementType;
  /** Wrap children in a `Container`. Default true. */
  contained?: boolean;
  containerSize?: ContainerSize;
  background?: BandBackground;
};

/** Full-width page section (Bolt band: generous 96–128px rhythm; `light` = soft grey section) with a surface theme, vertical rhythm and optional decorative background. */
export function Band({
  theme,
  spacing = "large",
  as: Comp = "section",
  contained = true,
  containerSize,
  background = "none",
  className,
  children,
  ...props
}: BandProps) {
  return (
    <Comp
      data-cg-theme={theme}
      className={cx("relative isolate bg-bg text-fg", background !== "none" && "overflow-hidden", spacings[spacing], className)}
      {...props}
    >
      {background === "grid" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 text-line [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
      ) : null}
      {background === "radial" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(60%_50%_at_80%_0%,color-mix(in_oklab,var(--cg-accent-500)_18%,transparent),transparent),radial-gradient(50%_45%_at_0%_100%,color-mix(in_oklab,var(--cg-primary-400)_16%,transparent),transparent)]"
        />
      ) : null}
      {contained ? <Container size={containerSize}>{children}</Container> : children}
    </Comp>
  );
}
