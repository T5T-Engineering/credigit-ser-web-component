import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Logo } from "../../brand/Logo";
import { cx } from "../../utils/cx";

/*
 * Microsoft sign-in branding. Microsoft's identity platform branding guidelines require the
 * four-square logo in its own colours and a neutral button (light: white fill, #8C8C8C border,
 * #5E5E5E text; dark: #2F2F2F fill, white text) that is NOT recoloured by the app brand.
 * These are the only hard-coded colours in the library and are deliberately exempt from the
 * theme-token rule (third-party trademark requirement).
 */
// TD-005: Microsoft brand colours (accepted exception, see TECH-DEBT.md).
const MS = {
  red: "#F25022",
  green: "#7FBA00",
  blue: "#00A4EF",
  yellow: "#FFB900",
  light: { bg: "#FFFFFF", hover: "#F3F3F3", border: "#8C8C8C", text: "#5E5E5E" },
  dark: { bg: "#2F2F2F", hover: "#3B3B3B", border: "#2F2F2F", text: "#FFFFFF" },
} as const;

/** The Microsoft four-square logo (21×21, decorative). */
export function MicrosoftLogo({ size = 21, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" aria-hidden="true" focusable="false" className={className}>
      <rect x="1" y="1" width="9" height="9" fill={MS.red} />
      <rect x="11" y="1" width="9" height="9" fill={MS.green} />
      <rect x="1" y="11" width="9" height="9" fill={MS.blue} />
      <rect x="11" y="11" width="9" height="9" fill={MS.yellow} />
    </svg>
  );
}

/** Props for `MicrosoftSignInButton`. */
export type MicrosoftSignInButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** `light` (white, default) or `dark` (#2F2F2F) per Microsoft's guidance. */
  theme?: "light" | "dark";
  /** Renders a link (e.g. to the server's OIDC start endpoint) instead of a button. */
  href?: string;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  /** Button text. Default "Sign in with Microsoft" (keep Microsoft's wording). */
  label?: string;
  /** Pill (default, Bolt) or Microsoft's standard rectangular shape. */
  shape?: "pill" | "rectangle";
  fullWidth?: boolean;
};

/** "Sign in with Microsoft" button following Microsoft's branding guidance (neutral colours, four-square logo). */
export function MicrosoftSignInButton({
  theme = "light",
  href,
  loading = false,
  label = "Sign in with Microsoft",
  shape = "pill",
  fullWidth = false,
  className,
  style,
  disabled,
  type,
  ...props
}: MicrosoftSignInButtonProps) {
  const c = MS[theme];
  const vars = {
    "--ms-bg": c.bg,
    "--ms-hover": c.hover,
    "--ms-border": c.border,
    "--ms-text": c.text,
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    ...style,
  } as CSSProperties;
  const cls = cx(
    "inline-flex h-[41px] cursor-pointer items-center justify-center gap-3 border px-3 text-[15px] font-semibold no-underline select-none",
    "border-[var(--ms-border)] bg-[var(--ms-bg)] text-[var(--ms-text)] transition-colors duration-150 hover:bg-[var(--ms-hover)] active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    shape === "pill" ? "squircle rounded-full px-5" : "rounded-none",
    fullWidth && "w-full",
    className,
  );
  const content = (
    <>
      {loading ? <LoaderCircle aria-hidden="true" className="size-[21px] animate-spin" /> : <MicrosoftLogo />}
      <span>{label}</span>
    </>
  );
  if (href !== undefined) {
    return (
      <a href={loading || disabled ? undefined : href} aria-disabled={loading || disabled || undefined} aria-busy={loading || undefined} className={cls} style={vars}>
        {content}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} disabled={disabled || loading} aria-busy={loading || undefined} className={cls} style={vars} {...props}>
      {content}
    </button>
  );
}

/** Props for `SignInCard`. */
export type SignInCardProps = Omit<ComponentProps<"div">, "title"> & {
  /** Product name, e.g. "Smart Enterprise Risk 360°". */
  productName?: ReactNode;
  tagline?: ReactNode;
  /** Custom logo node. Default `<Logo />`. */
  logo?: ReactNode;
  /** Microsoft sign-in click handler. */
  onMicrosoftSignIn?: () => void;
  /** Or a link to the server's sign-in endpoint. */
  microsoftHref?: string;
  /** Spinner on the Microsoft button. */
  loading?: boolean;
  /** Error message (e.g. "Your account is not enabled for this tenant"). */
  error?: ReactNode;
  /** Microsoft button theme. Default `light`. */
  microsoftTheme?: "light" | "dark";
  /**
   * Show the Microsoft (Entra ID) button. Default true. Pass `false` in local sign-in mode (`/auth/config`
   * `mode: "Local"`): `children` (e.g. the e-mail + password form) then render without a divider.
   */
  microsoft?: boolean;
  /** Divider text above `children`. Default "or". Pass `null` to hide the divider. */
  dividerLabel?: ReactNode;
  /** Secondary area (e.g. demo access / RolePicker). */
  children?: ReactNode;
  /** Footer (legal, help, support contact). */
  footer?: ReactNode;
};

/** Sign-in screen block: logo, product name, tagline, Microsoft SSO button, optional demo access area and footer. */
export function SignInCard({
  productName,
  tagline,
  logo,
  onMicrosoftSignIn,
  microsoftHref,
  loading,
  error,
  microsoftTheme = "light",
  microsoft = true,
  dividerLabel = "or",
  children,
  footer,
  className,
  ...props
}: SignInCardProps) {
  return (
    <div className={cx("squircle mx-auto flex w-full max-w-md flex-col gap-7 rounded-4xl bg-surface p-6 shadow-lg sm:p-10", className)} {...props}>
      <div className="flex flex-col items-center gap-4 text-center">
        {logo ?? <Logo size="medium" />}
        {productName ? <h1 className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-[-0.015em] text-balance text-fg">{productName}</h1> : null}
        {tagline ? <p className="text-base leading-6 text-pretty text-fg-muted">{tagline}</p> : null}
      </div>
      <div className="flex flex-col gap-3 empty:hidden">
        {error ? (
          <p role="alert" className="squircle rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger-strong">
            {error}
          </p>
        ) : null}
        {microsoft ? <MicrosoftSignInButton theme={microsoftTheme} onClick={onMicrosoftSignIn} href={microsoftHref} loading={loading} fullWidth /> : null}
      </div>
      {children ? (
        <>
          {microsoft && dividerLabel !== null ? (
            <div className="flex items-center gap-3" role="separator" aria-label={typeof dividerLabel === "string" ? dividerLabel : undefined}>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
              <span aria-hidden="true" className="font-mono text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">
                {dividerLabel}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </div>
          ) : null}
          <div>{children}</div>
        </>
      ) : null}
      {footer ? <div className="border-t border-line pt-5 text-center text-xs leading-5 text-fg-muted">{footer}</div> : null}
    </div>
  );
}
