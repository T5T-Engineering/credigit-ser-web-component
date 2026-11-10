import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { eyebrowText, type HeadingTag } from "./block-utils";

/** Props for `FeatureRow`. */
export type FeatureRowProps = Omit<ComponentProps<"div">, "title"> & {
  /** Mono label above the title. */
  eyebrow?: ReactNode;
  /** Row heading. */
  title: ReactNode;
  /** Lead paragraph. */
  description?: ReactNode;
  /** Extra content under the text (e.g. a List or actions). */
  children?: ReactNode;
  /** Big visual beside the copy. */
  media: ReactNode;
  /** Put the media on the start side (left in LTR) on wide screens. Text always comes first on mobile. */
  reverse?: boolean;
  /** Media frame: `"sunken"` grey squircle (default), `"raised"` white squircle for grey bands, `"none"` rounded only. */
  mediaFrame?: "sunken" | "raised" | "none";
  /** Heading level. Default `h3`. */
  titleAs?: HeadingTag;
};

const frameClass: Record<NonNullable<FeatureRowProps["mediaFrame"]>, string> = {
  sunken: "bg-surface-sunken",
  raised: "bg-surface shadow-sm",
  none: "",
};

/** Split "text + big rounded visual" row (Bolt feature row). */
export function FeatureRow({
  eyebrow,
  title,
  description,
  children,
  media,
  reverse,
  mediaFrame = "sunken",
  titleAs: Title = "h3",
  className,
  ...props
}: FeatureRowProps) {
  return (
    <div
      data-reverse={reverse ? "" : undefined}
      className={cx("grid grid-cols-1 items-center gap-8 text-fg sm:gap-10 lg:grid-cols-2 lg:gap-16", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        {eyebrow ? <p className={cx(eyebrowText, "text-accent-text")}>{eyebrow}</p> : null}
        <Title className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance text-fg sm:text-title lg:text-[2.5rem] lg:leading-[1.1]">
          {title}
        </Title>
        {description ? (
          <div className="max-w-xl text-lg leading-[1.55] text-pretty text-fg-muted sm:text-lead">{description}</div>
        ) : null}
        {children ? <div className="mt-2 flex flex-col gap-4">{children}</div> : null}
      </div>
      <div
        data-feature-media=""
        className={cx(
          "squircle min-w-0 overflow-hidden rounded-4xl lg:rounded-5xl [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
          frameClass[mediaFrame],
          reverse && "lg:order-first",
        )}
      >
        {media}
      </div>
    </div>
  );
}
