import type { ReactNode } from "react";

import { Button, type ButtonProps } from "./button";

/** Props for `IconButton`: an icon-only Button with a required accessible label. */
export type IconButtonProps = Omit<ButtonProps, "children" | "iconBefore" | "iconAfter" | "fullWidth" | "iconOnly"> & {
  /** Accessible name (rendered as `aria-label` and the native tooltip `title`). */
  label: string;
  /** The icon, e.g. `<Pencil size={16} />`. */
  icon: ReactNode;
};

/** Circular (pill), icon-only button. Defaults to the soft grey `tertiary` variant. */
export function IconButton({ label, icon, variant = "tertiary", size = "medium", loading, title, ...props }: IconButtonProps) {
  return (
    <Button {...props} variant={variant} size={size} loading={loading} iconOnly aria-label={label} title={title ?? label}>
      {loading ? null : (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      )}
    </Button>
  );
}
