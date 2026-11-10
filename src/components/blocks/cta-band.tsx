import type { ComponentProps, ReactNode } from "react";

import type { SurfaceTheme } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { backgroundStyle, containerClass, eyebrowText, type BlockBackground, type HeadingTag } from "./block-utils";

/** Props for `CtaBand`. */
export type CtaBandProps = Omit<ComponentProps<"section">, "title"> & {
  /** Optional mono label above the title. */
  eyebrow?: ReactNode;
  /** Call-to-action headline. */
  title: ReactNode;
  /** Supporting sentence. */
  description?: ReactNode;
  /** Buttons. */
  actions: ReactNode;
  /** Surface theme. Default `"dark"`. */
  theme?: SurfaceTheme;
  /** Decorative background. Default `"radial"`. */
  background?: BlockBackground;
  /** Copy alignment. Default `"split"` (copy left, actions right on wide screens). */
  align?: "split" | "center";
  /** Heading level. Default `h2`. */
  titleAs?: HeadingTag;
};

/** Conversion panel closing a page section (Bolt: big rounded coloured panel inside the container). */
export function CtaBand({
  eyebrow,
  title,
  description,
  actions,
  theme = "dark",
  background = "radial",
  align = "split",
  titleAs: Title = "h2",
  className,
  ...props
}: CtaBandProps) {
  const centered = align === "center";
  return (
    <section className={cx("relative py-8 text-fg sm:py-12", className)} {...props}>
      <div className={containerClass}>
        <div
          data-cg-theme={theme}
          className={cx(
            "squircle relative isolate flex flex-col gap-8 overflow-hidden rounded-4xl bg-bg px-6 py-12 text-fg sm:px-12 sm:py-16 lg:rounded-5xl lg:px-16 lg:py-20",
            centered ? "items-center text-center" : "lg:flex-row lg:items-center lg:justify-between lg:gap-16",
          )}
        >
          {background !== "none" ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={backgroundStyle(background)}
            />
          ) : null}
          <div className={cx("flex flex-col gap-4", centered ? "max-w-3xl items-center" : "max-w-2xl")}>
            {eyebrow ? <p className={cx(eyebrowText, "text-link")}>{eyebrow}</p> : null}
            <Title className="font-display text-[2rem] leading-[1.1] font-bold tracking-[-0.02em] text-balance text-fg sm:text-[2.5rem] lg:text-headline">
              {title}
            </Title>
            {description ? (
              <div className="text-lg leading-[1.55] text-pretty text-fg-muted sm:text-lead">{description}</div>
            ) : null}
          </div>
          <div className={cx("flex shrink-0 flex-wrap items-center gap-3", centered && "justify-center")}>
            {actions}
          </div>
        </div>
      </div>
    </section>
  );
}
