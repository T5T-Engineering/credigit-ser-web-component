import type { ComponentProps, ElementType, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { cx } from "../../utils/cx";
import { focusRing } from "./app-utils";

/** Props for `AuthCard`. */
export type AuthCardProps = Omit<ComponentProps<"div">, "title"> & {
  /** Usually `<Logo />`. */
  logo?: ReactNode;
  /** Small icon shown above the title (e.g. a key or mail icon). */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Back link above the card content, e.g. "Back to sign in". */
  back?: { label: string; href: string };
  footer?: ReactNode;
  linkComponent?: ElementType;
  /** Max width: `small` (420px, default) or `medium` (560px). */
  size?: "small" | "medium";
};

/**
 * Frame for authentication screens — registration, forgot password, one-time code, reset and change password.
 * Same visual language as `SignInCard`; put the form in `children`.
 */
export function AuthCard({ logo, icon, title, description, back, footer, linkComponent, size = "small", className, children, ...props }: AuthCardProps) {
  const Link = linkComponent ?? "a";
  return (
    <div
      className={cx(
        "squircle mx-auto flex w-full flex-col gap-6 rounded-4xl bg-surface p-6 shadow-lg sm:p-10",
        size === "medium" ? "max-w-[560px]" : "max-w-[420px]",
        className,
      )}
      {...props}
    >
      {logo ? <div className="flex justify-center">{logo}</div> : null}
      {back ? (
        <Link href={back.href} className={cx("inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-fg-muted transition-colors hover:text-fg", focusRing)}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      ) : null}
      <header className="flex flex-col items-center gap-3 text-center">
        {icon ? (
          <span aria-hidden="true" className="squircle grid size-14 place-items-center rounded-2xl bg-accent-tint text-accent-text [&>svg]:size-6">
            {icon}
          </span>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-[-0.015em] text-fg">{title}</h1>
        {description ? <div className="max-w-[36ch] text-base leading-6 text-fg-muted">{description}</div> : null}
      </header>
      {children ? <div className="flex flex-col gap-5">{children}</div> : null}
      {footer ? <footer className="border-t border-line pt-5 text-center text-sm text-fg-muted">{footer}</footer> : null}
    </div>
  );
}
