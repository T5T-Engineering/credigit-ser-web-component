import type { ComponentProps, ElementType, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { focusRing, type HeadingTag } from "./block-utils";

/** Props for `Card`. Renders an `<a>` when `href` is given. */
export type CardProps = ComponentProps<"div"> & {
  /** Visual treatment. Default `"outlined"`. */
  variant?: "outlined" | "elevated" | "filled";
  /** Hover lift + focus ring. Implied when `href` is set. */
  interactive?: boolean;
  /** Make the whole card a link. */
  href?: string;
  /** Inner padding shared by all card sections. Default `"medium"`. */
  padding?: "none" | "small" | "medium" | "large";
  /** Custom element (e.g. router Link) used when `href` is set. */
  as?: ElementType;
  /** Link target (only with `href`). */
  target?: string;
  /** Link rel (only with `href`). */
  rel?: string;
  /** Corner radius: `"medium"` (24px, default), `"large"` (32px) or `"xlarge"` (40px). */
  radius?: "medium" | "large" | "xlarge";
};

const radiusClass: Record<NonNullable<CardProps["radius"]>, string> = {
  medium: "rounded-3xl",
  large: "rounded-4xl",
  xlarge: "rounded-5xl",
};

const variantClass: Record<NonNullable<CardProps["variant"]>, string> = {
  // Bolt: hairline ring instead of a stroke; elevated lifts softly; filled is the grey panel.
  outlined: "bg-surface shadow-sm",
  elevated: "bg-surface shadow-md",
  filled: "bg-surface-sunken",
};

const paddingClass: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "[--card-pad:0px]",
  small: "[--card-pad:1.25rem]",
  medium: "[--card-pad:1.5rem] sm:[--card-pad:2rem]",
  large: "[--card-pad:2rem] sm:[--card-pad:2.5rem]",
};

/** Surface container for grouped content (Bolt card). */
export function Card({
  variant = "outlined",
  interactive,
  href,
  padding = "medium",
  radius = "medium",
  as,
  className,
  children,
  ...props
}: CardProps) {
  const isLink = Boolean(href);
  const Component: ElementType = isLink ? (as ?? "a") : (as ?? "div");
  const lift = interactive || isLink;
  return (
    <Component
      href={href}
      className={cx(
        "group/card squircle relative flex flex-col gap-4 overflow-hidden p-(--card-pad) text-fg",
        radiusClass[radius],
        variantClass[variant],
        paddingClass[padding],
        lift &&
          "transition duration-200 ease-bolt hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
        isLink && cx("no-underline", focusRing),
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Props for `CardHeader`. */
export type CardHeaderProps = ComponentProps<"div"> & {
  /**
   * `"row"` (default): children sit side by side (title block + trailing action).
   * `"stack"`: children (title, description …) stack vertically on the left and `actions` sit on the right.
   */
  layout?: "row" | "stack";
  /** Trailing actions (buttons, menu, badge), aligned to the top right. */
  actions?: ReactNode;
};

/** Top row of a card: title block plus optional trailing action. */
export function CardHeader({ layout = "row", actions, className, children, ...props }: CardHeaderProps) {
  if (layout === "stack") {
    return (
      <div data-layout="stack" className={cx("flex items-start justify-between gap-4", className)} {...props}>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        {actions != null && actions !== false ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div> : null}
      </div>
    );
  }
  return (
    <div className={cx("flex items-start justify-between gap-4", className)} {...props}>
      {children}
      {actions != null && actions !== false ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div> : null}
    </div>
  );
}

/** Props for `CardTitle`. */
export type CardTitleProps = ComponentProps<"h3"> & {
  /** Heading level. Default `h3`. */
  as?: HeadingTag;
};

/** Card heading. */
export function CardTitle({ as: Tag = "h3", className, ...props }: CardTitleProps) {
  return (
    <Tag
      className={cx("font-display text-subtitle font-bold text-balance text-fg", className)}
      {...props}
    />
  );
}

/** Supporting text under a card title. */
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("mt-1.5 text-base leading-6 text-fg-muted", className)} {...props} />;
}

/** Main card body. */
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("flex-1 text-base leading-6 text-fg-muted", className)} {...props} />;
}

/** Bottom action row (Bolt: no rule, actions sit at the foot of the card). */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        "mt-auto flex flex-wrap items-center gap-3 pt-2",
        "empty:hidden",
        className,
      )}
      {...props}
    />
  );
}

/** Props for `CardMedia`. */
export type CardMediaProps = ComponentProps<"div"> & {
  /** Media to render edge-to-edge (image, chart, illustration). */
  children?: ReactNode;
  /** CSS aspect ratio, e.g. `"16 / 9"`. */
  aspectRatio?: string;
};

/** Edge-to-edge media at the top of a card (clipped by the card's rounded corners). */
export function CardMedia({ aspectRatio, className, style, ...props }: CardMediaProps) {
  return (
    <div
      className={cx(
        "-mx-(--card-pad) -mt-(--card-pad) overflow-hidden bg-surface-sunken [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
        className,
      )}
      style={aspectRatio ? { aspectRatio, ...style } : style}
      {...props}
    />
  );
}
