"use client";

import { useState, type ComponentProps } from "react";

import type { Size } from "../../theme/tokens";
import { cx } from "../../utils/cx";

/** Props for `Avatar`. */
export type AvatarProps = Omit<ComponentProps<"span">, "children"> & {
  /** Person or organisation name; used for initials and the accessible name. */
  name: string;
  /** Image URL. Falls back to initials if missing or it fails to load. */
  src?: string;
  size?: Size;
};

const sizeClasses: Record<Size, string> = {
  xsmall: "size-6 text-[0.625rem]",
  small: "size-8 text-xs",
  medium: "size-10 text-sm",
  large: "size-12 text-base",
  xlarge: "size-16 text-xl",
};

/** Up to two initials from a name ("Ada  Obi-Okafor" → "AO"). */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Circular user avatar showing a photo or the person's initials. */
export function Avatar({ name, src, size = "medium", className, ...props }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      role="img"
      aria-label={name}
      className={cx(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-fg/[0.06] font-semibold leading-none text-fg select-none",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
