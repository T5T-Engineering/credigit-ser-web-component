import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { type HeadingTag } from "./block-utils";

/** Props for `EmptyState`. */
export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  /** Illustrative icon. */
  icon?: ReactNode;
  /** What is empty. */
  title: ReactNode;
  /** Why, and what the user can do. */
  description?: ReactNode;
  /** Primary next step (button). */
  action?: ReactNode;
  /** Heading level. Default `h3`. */
  titleAs?: HeadingTag;
  /** Draw the soft grey panel (Bolt). Default true. */
  bordered?: boolean;
};

/** Placeholder shown when a list, table or view has no content. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  titleAs: Title = "h3",
  bordered = true,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-3 px-6 py-14 text-center sm:px-10",
        bordered && "squircle rounded-3xl bg-surface-sunken",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-2 grid size-14 place-items-center rounded-full bg-surface text-fg shadow-sm [&>svg]:size-7"
        >
          {icon}
        </span>
      ) : null}
      <Title className="font-display text-subtitle font-bold text-balance text-fg">{title}</Title>
      {description ? <div className="max-w-md text-base leading-6 text-pretty text-fg-muted">{description}</div> : null}
      {action ? <div className="mt-3 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
