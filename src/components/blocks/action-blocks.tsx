import type { ComponentProps, ElementType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing, iconTileClass, toneTile, type BlockTone } from "./block-utils";

/** One linked action in `ActionBlocks`. */
export type ActionBlockItem = {
  /** Action label. */
  title: ReactNode;
  /** One-line explanation. */
  description?: ReactNode;
  /** Icon in a square tile. */
  icon?: ReactNode;
  /** Destination. */
  href: string;
};

/** Props for `ActionBlocks`. */
export type ActionBlocksProps = ComponentProps<"ul"> & {
  /** Actions to display. */
  items: ActionBlockItem[];
  /** Columns at wide breakpoints. Default 3. */
  columns?: 1 | 2 | 3 | 4;
  /** Icon tile colour. Default `"accent"`. */
  tone?: BlockTone;
  /** Router link component. */
  linkComponent?: ElementType;
};

const columnClass = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Grid of large linked actions (Bolt action blocks). */
export function ActionBlocks({
  items,
  columns = 3,
  tone = "accent",
  linkComponent,
  className,
  ...props
}: ActionBlocksProps) {
  const Link: ElementType = linkComponent ?? "a";
  return (
    <ul className={cx("grid grid-cols-1 gap-4", columnClass[columns], className)} {...props}>
      {items.map((item, index) => (
        <li key={index} className="flex">
          <Link
            href={item.href}
            className={cx(
              "group/action squircle flex w-full items-center gap-4 rounded-3xl bg-surface-sunken p-5 text-fg no-underline sm:p-6",
              "transition duration-200 ease-bolt hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
              focusRing,
            )}
          >
            {item.icon ? (
              <span
                aria-hidden="true"
                className={cx(iconTileClass, "size-12 [&>svg]:size-6", toneTile[tone])}
              >
                {item.icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-display text-lg leading-snug font-bold tracking-[-0.01em] text-fg">{item.title}</span>
              {item.description ? (
                <span className="text-base leading-6 text-fg-muted">{item.description}</span>
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-fg shadow-sm transition duration-200 ease-bolt group-hover/action:bg-emphasis group-hover/action:text-on-emphasis"
            >
              <ArrowRight className="size-5 transition-transform duration-200 group-hover/action:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
