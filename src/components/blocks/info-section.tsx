import type { ComponentProps, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { eyebrowText } from "./block-utils";

/** One label/value pair in an `InfoSection`. */
export type InfoSectionItem = {
  /** Field label. */
  label: ReactNode;
  /** Field value. */
  value: ReactNode;
  /** Secondary note under the value. */
  hint?: ReactNode;
};

/** Props for `InfoSection`. */
export type InfoSectionProps = Omit<ComponentProps<"dl">, "title"> & {
  /** Pairs to display. */
  items: InfoSectionItem[];
  /** Columns at wide breakpoints. Default 2. */
  columns?: 1 | 2 | 3 | 4;
  /** Render values in IBM Plex Mono (figures, IDs, codes). */
  monoValues?: boolean;
};

const columnClass = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Read-only label/value details (description list). */
export function InfoSection({ items, columns = 2, monoValues, className, ...props }: InfoSectionProps) {
  return (
    <dl className={cx("grid grid-cols-1 gap-x-10 gap-y-8", columnClass[columns], className)} {...props}>
      {items.map((item, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-2 border-t border-line pt-5">
          <dt className={cx(eyebrowText, "text-fg-muted")}>{item.label}</dt>
          <dd
            className={cx(
              "text-lg leading-7 font-semibold tracking-[-0.005em] break-words text-fg",
              monoValues && "font-mono tabular-nums",
            )}
          >
            {item.value}
          </dd>
          {item.hint ? <dd className="text-sm text-fg-muted">{item.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
