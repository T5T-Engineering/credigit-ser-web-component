"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { CircleHelp, Search } from "lucide-react";

import { Badge } from "../basic/badge";
import type { Tone } from "../basic/tone";
import { cx } from "../../utils/cx";
import { chromeButton, focusRing, isApplePlatform } from "./app-utils";

/** Props for `AppHeader`. */
export type AppHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  /** Page title (hidden below `sm` when a breadcrumb is given). */
  title?: ReactNode;
  /** Breadcrumb node (e.g. `<Breadcrumb />`), shown from `md` up. */
  breadcrumb?: ReactNode;
  /** Opens the command palette / global search. Renders the search trigger when set. */
  onSearchClick?: () => void;
  /** Search trigger placeholder. Default "Search…". */
  searchLabel?: string;
  /** Show the Ctrl/⌘ K hint on the search trigger. Default true. */
  showShortcut?: boolean;
  /** Tenant node (e.g. `<TenantSwitcher />`). */
  tenant?: ReactNode;
  /** Environment badge, e.g. `{ label: "UAT", tone: "warning" }`. */
  environment?: { label: string; tone?: Tone };
  /** Notifications node (e.g. `<NotificationCenter />`). */
  notifications?: ReactNode;
  /** Help link or handler; renders the help button. */
  helpHref?: string;
  onHelpClick?: () => void;
  /** User node (e.g. `<UserMenu />`). */
  userMenu?: ReactNode;
  /** Extra actions placed before notifications. */
  actions?: ReactNode;
};

/**
 * Application top bar content for `AppShell`'s `topbar` slot: title/breadcrumb, global search trigger,
 * tenant and environment, notifications, help and user menu. Collapses gracefully on small screens.
 */
export function AppHeader({
  title,
  breadcrumb,
  onSearchClick,
  searchLabel = "Search…",
  showShortcut = true,
  tenant,
  environment,
  notifications,
  helpHref,
  onHelpClick,
  userMenu,
  actions,
  className,
  ...props
}: AppHeaderProps) {
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => setMod(isApplePlatform() ? "⌘" : "Ctrl"), []);

  return (
    <div className={cx("flex min-w-0 flex-1 items-center gap-2 sm:gap-3", className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {breadcrumb ? <div className="hidden min-w-0 md:block">{breadcrumb}</div> : null}
        {title ? (
          <div className={cx("truncate font-display text-lg leading-tight font-bold tracking-tight text-fg", Boolean(breadcrumb) && "md:text-base")}>{title}</div>
        ) : null}
      </div>

      {onSearchClick ? (
        <>
          <button
            type="button"
            onClick={onSearchClick}
            aria-keyshortcuts={showShortcut ? "Control+K Meta+K" : undefined}
            className={cx(
              "squircle hidden h-control-md w-56 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-fg/5 pr-2 pl-4 text-sm text-fg-muted transition-colors duration-150 ease-bolt hover:bg-fg/10 md:inline-flex lg:w-72",
              focusRing,
            )}
          >
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1 truncate text-left">{searchLabel}</span>
            {showShortcut ? (
              <kbd aria-hidden="true" className="rounded-full bg-surface px-2 py-0.5 font-mono text-xs text-fg-muted shadow-sm">
                {mod} K
              </kbd>
            ) : null}
          </button>
          <button type="button" onClick={onSearchClick} aria-label={searchLabel.replace(/…$/, "")} className={cx(chromeButton, "md:hidden")}>
            <Search aria-hidden="true" className="size-5" />
          </button>
        </>
      ) : null}

      {tenant ? <div className="shrink-0">{tenant}</div> : null}
      {environment ? (
        <Badge tone={environment.tone ?? "warning"} dot className="hidden shrink-0 sm:inline-flex" title={`Environment: ${environment.label}`}>
          {environment.label}
        </Badge>
      ) : null}
      {actions}
      {notifications ? <div className="shrink-0">{notifications}</div> : null}
      {helpHref ? (
        <a href={helpHref} aria-label="Help" title="Help" className={cx(chromeButton, "hidden sm:inline-grid")}>
          <CircleHelp aria-hidden="true" className="size-5" />
        </a>
      ) : onHelpClick ? (
        <button type="button" onClick={onHelpClick} aria-label="Help" title="Help" className={cx(chromeButton, "hidden sm:inline-grid")}>
          <CircleHelp aria-hidden="true" className="size-5" />
        </button>
      ) : null}
      {userMenu ? <div className="shrink-0">{userMenu}</div> : null}
    </div>
  );
}
