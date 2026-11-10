import { Children, isValidElement, type ComponentProps, type ElementType, type ReactElement, type ReactNode } from "react";
import { Check } from "lucide-react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";

/** List presentation styles. */
export type ListVariant = "unordered" | "ordered" | "check" | "inline";

/** Props for `List`. */
export type ListProps = Omit<ComponentProps<"ul">, "children"> & {
  /** Items to render; alternatively pass `<li>` (or any) children. */
  items?: ReactNode[];
  children?: ReactNode;
  variant?: ListVariant;
  /** Space between items. */
  spacing?: Size;
};

const stackSpacing: Record<Size, string> = {
  xsmall: "space-y-1",
  small: "space-y-2",
  medium: "space-y-3",
  large: "space-y-4",
  xlarge: "space-y-6",
};

const inlineSpacing: Record<Size, string> = {
  xsmall: "gap-x-2 gap-y-1",
  small: "gap-x-3 gap-y-1",
  medium: "gap-x-4 gap-y-2",
  large: "gap-x-6 gap-y-2",
  xlarge: "gap-x-8 gap-y-3",
};

type LiElement = ReactElement<ComponentProps<"li">>;

/** Bolt list: bulleted, numbered, check-marked or inline. */
export function List({ items, children, variant = "unordered", spacing = "small", className, ...props }: ListProps) {
  const Tag = (variant === "ordered" ? "ol" : "ul") as ElementType;
  const source = items ?? Children.toArray(children);

  const rendered = source.map((item, index) => {
    const isLi = isValidElement(item) && item.type === "li";
    const liProps: ComponentProps<"li"> = isLi ? (item as LiElement).props : {};
    const content: ReactNode = isLi ? liProps.children : item;
    const key = isValidElement(item) && item.key != null ? item.key : index;

    if (variant === "check") {
      return (
        <li key={key} {...liProps} className={cx("flex items-start gap-3", liProps.className)}>
          <span aria-hidden="true" className="mt-[0.1em] inline-grid size-5 shrink-0 place-items-center rounded-full bg-accent-tint text-accent-text">
            <Check size={12} strokeWidth={3} />
          </span>
          <span className="min-w-0">{content}</span>
        </li>
      );
    }
    return (
      <li key={key} {...liProps} className={cx(variant !== "inline" && "ps-1", liProps.className)}>
        {content}
      </li>
    );
  });

  return (
    <Tag
      // list-style:none removes list semantics in Safari; restore them explicitly.
      role={variant === "check" || variant === "inline" ? "list" : undefined}
      className={cx(
        "text-fg-muted",
        variant === "unordered" && "list-disc ps-5 marker:text-fg-subtle",
        variant === "ordered" && "list-decimal ps-5 marker:font-mono marker:text-fg-subtle",
        variant === "check" && "list-none",
        variant === "inline" ? cx("flex list-none flex-wrap items-center", inlineSpacing[spacing]) : stackSpacing[spacing],
        className,
      )}
      {...props}
    >
      {rendered}
    </Tag>
  );
}
