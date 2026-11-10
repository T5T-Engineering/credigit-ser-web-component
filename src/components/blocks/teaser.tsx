import type { ComponentProps, ElementType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cx } from "../../utils/cx";
import { eyebrowText, iconTileClass, toneTile, type BlockTone, type HeadingTag } from "./block-utils";

/** Props for `Teaser`. */
export type TeaserProps = Omit<ComponentProps<"article">, "title"> & {
  /** Small mono label above the title. */
  eyebrow?: ReactNode;
  /** Tile heading. */
  title: ReactNode;
  /** Supporting copy. */
  description?: ReactNode;
  /** Icon rendered in a square brand tile. */
  icon?: ReactNode;
  /** Makes the whole tile a link. */
  href?: string;
  /** Call-to-action label shown with an arrow (e.g. "Explore module"). */
  cta?: string;
  /** Stacked (default) or side-by-side icon/media. */
  layout?: "vertical" | "horizontal";
  /** Image / illustration / chart shown above (vertical) or beside (horizontal) the copy. */
  media?: ReactNode;
  /** Icon tile colour. Default `"accent"`. */
  tone?: BlockTone;
  /** Heading level. Default `h3`. */
  titleAs?: HeadingTag;
  /** Router link component used with `href`. */
  linkComponent?: ElementType;
  /** Surface style. Default `"outlined"` (Bolt soft grey panel); `"plain"` removes the panel (for dense grids). */
  variant?: "outlined" | "plain";
  /** Panel fill for the `"outlined"` variant. `"sunken"` (default) = grey panel; `"raised"` = white panel for grey bands. */
  surface?: "sunken" | "raised";
};

/** Feature / module tile with icon, copy and optional link (Bolt teaser). */
export function Teaser({
  eyebrow,
  title,
  description,
  icon,
  href,
  cta,
  layout = "vertical",
  media,
  tone = "accent",
  titleAs: Title = "h3",
  linkComponent,
  variant = "outlined",
  surface = "sunken",
  className,
  ...props
}: TeaserProps) {
  const horizontal = layout === "horizontal";
  const Link: ElementType = linkComponent ?? "a";

  const heading = (
    <Title className="font-display text-subtitle font-bold text-balance text-fg sm:text-2xl sm:leading-tight sm:tracking-[-0.015em]">
      {href ? (
        <Link
          href={href}
          className={cx(
            "no-underline outline-none after:absolute after:inset-0 after:rounded-4xl after:squircle",
            "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus",
          )}
        >
          {title}
        </Link>
      ) : (
        title
      )}
    </Title>
  );

  return (
    <article
      className={cx(
        "group/teaser squircle relative isolate flex rounded-4xl text-fg",
        horizontal ? "flex-col gap-6 sm:flex-row sm:items-center sm:gap-10" : "flex-col gap-6",
        variant === "outlined" && "p-6 sm:p-8 lg:p-10",
        variant === "outlined" && (surface === "raised" ? "bg-surface shadow-sm" : "bg-surface-sunken"),
        href && "transition duration-200 ease-bolt hover:-translate-y-0.5 active:scale-[0.99]",
        href && variant === "outlined" && "hover:shadow-md",
        className,
      )}
      {...props}
    >
      {media ? (
        <div
          className={cx(
            "squircle overflow-hidden rounded-3xl [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
            surface === "raised" || variant === "plain" ? "bg-surface-sunken" : "bg-surface",
            horizontal ? "sm:w-2/5 sm:shrink-0" : "",
          )}
        >
          {media}
        </div>
      ) : null}
      {icon ? (
        <span
          aria-hidden="true"
          className={cx(
            iconTileClass,
            "size-14 transition-colors [&>svg]:size-7",
            toneTile[tone],
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {eyebrow ? <p className={cx(eyebrowText, "text-accent-text")}>{eyebrow}</p> : null}
        {heading}
        {description ? <div className="text-base leading-7 text-pretty text-fg-muted sm:text-lg sm:leading-7">{description}</div> : null}
        {cta ? (
          <span
            aria-hidden={href ? "true" : undefined}
            className="mt-auto inline-flex items-center gap-2 pt-2 text-base font-semibold text-fg"
          >
            {cta}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover/teaser:translate-x-1"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>
    </article>
  );
}
