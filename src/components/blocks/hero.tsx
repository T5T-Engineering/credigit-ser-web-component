import type { ComponentProps, ReactNode } from "react";

import type { SurfaceTheme } from "../../theme/tokens";
import { cx } from "../../utils/cx";
import { backgroundStyle, containerClass, eyebrowText, type BlockBackground } from "./block-utils";

/** Props for `Hero`. */
export type HeroProps = Omit<ComponentProps<"section">, "title"> & {
  /** Short label shown as a pill above the title. */
  eyebrow?: ReactNode;
  /** Main headline (rendered as `h1`). Wrap words in `<em>` / `<span className="text-accent-500">` to highlight. */
  title: ReactNode;
  /** Lead paragraph. */
  description?: ReactNode;
  /** Call-to-action buttons. */
  actions?: ReactNode;
  /** Product visual (screenshot, chart, illustration) shown beside or below the copy. */
  media?: ReactNode;
  /** Copy alignment. Default `"start"`; with `media` start-aligned heroes use two columns. */
  align?: "start" | "center";
  /** Surface theme applied to the section. */
  theme?: SurfaceTheme;
  /** Small print under the actions (e.g. compliance note, trust line). */
  footnote?: ReactNode;
  /** Subtle brand-coloured decorative background. Default `"none"`. */
  background?: BlockBackground;
  /** Vertical rhythm. Default `"large"`. */
  spacing?: "medium" | "large" | "xlarge";
  /** Media frame. `"sunken"` wraps media in a large grey squircle frame with padding; `"none"` (default) only rounds it. */
  mediaFrame?: "sunken" | "none";
};

const spacingClass = {
  medium: "py-12 sm:py-16 lg:py-20",
  large: "py-14 sm:py-20 lg:py-24",
  xlarge: "py-16 sm:py-24 lg:py-32",
} as const;

/** Top-of-page marketing hero with headline, lead, actions and optional media. */
export function Hero({
  eyebrow,
  title,
  description,
  actions,
  media,
  align = "start",
  theme,
  footnote,
  background = "none",
  spacing = "large",
  mediaFrame = "none",
  className,
  ...props
}: HeroProps) {
  const centered = align === "center";
  const split = Boolean(media) && !centered;

  return (
    <section
      data-cg-theme={theme}
      className={cx("relative isolate overflow-hidden bg-bg text-fg", spacingClass[spacing], className)}
      {...props}
    >
      {background !== "none" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={backgroundStyle(background)}
        />
      ) : null}
      <div
        className={cx(
          containerClass,
          split ? "grid items-center gap-10 lg:grid-cols-12 lg:gap-16" : "flex flex-col gap-12 lg:gap-16",
          centered && "items-center",
        )}
      >
        <div
          className={cx(
            "flex flex-col gap-5 sm:gap-6",
            split && "lg:col-span-6",
            centered && "mx-auto max-w-4xl items-center text-center",
            !centered && !split && "max-w-4xl",
          )}
        >
          {eyebrow ? (
            <p
              className={cx(
                eyebrowText,
                "inline-flex w-fit items-center gap-2 rounded-full bg-accent-tint px-3.5 py-1.5 text-accent-text",
              )}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-500" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-[2.75rem] leading-[1.05] font-bold tracking-[-0.025em] text-balance text-fg sm:text-6xl sm:leading-[1.05] lg:text-display [&_em]:text-accent-500 [&_em]:not-italic">
            {title}
          </h1>
          {description ? (
            <div
              className={cx(
                "text-lg leading-[1.55] text-pretty text-fg-muted sm:text-lead",
                centered ? "max-w-2xl" : "max-w-xl",
              )}
            >
              {description}
            </div>
          ) : null}
          {actions ? (
            <div className={cx("mt-2 flex flex-wrap items-center gap-3", centered && "justify-center")}>
              {actions}
            </div>
          ) : null}
          {footnote ? <div className="text-sm leading-6 text-fg-subtle">{footnote}</div> : null}
        </div>
        {media ? (
          <div className={cx("relative w-full", split ? "lg:col-span-6" : "mx-auto max-w-5xl")}>
            {mediaFrame === "sunken" ? (
              <div className="squircle rounded-4xl bg-surface-sunken p-3 sm:p-5 lg:rounded-5xl lg:p-8">
                <div className="squircle overflow-hidden rounded-3xl [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
                  {media}
                </div>
              </div>
            ) : (
              <div className="squircle overflow-hidden rounded-4xl bg-surface-sunken lg:rounded-5xl [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
                {media}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
