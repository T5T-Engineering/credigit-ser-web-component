import type { ComponentProps, ElementType, ReactNode } from "react";

import { Logo } from "../../brand";
import { Avatar } from "../basic";
import { cx } from "../../utils/cx";

/** A link in the side navigation. */
export type SideNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  /** Permission key(s) needed to see the item (any of). Checked with the `can` prop. */
  permission?: string | readonly string[];
};
/** A labelled group of side navigation links. */
export type SideNavGroup = { label: string; items: SideNavItem[] };
/** Signed-in user shown at the bottom of the side navigation. */
export type SideNavUser = { name: string; role: string; avatarSrc?: string };

/** Props for {@link SideNav}. */
export type SideNavProps = Omit<ComponentProps<"aside">, "children"> & {
  groups: SideNavGroup[];
  activeHref: string;
  /** Brand slot. Defaults to `<Logo tone="reverse" />` (symbol only when collapsed). */
  header?: ReactNode;
  /** Environment name, e.g. "Production" or "UAT". */
  environment?: string;
  user?: SideNavUser;
  footer?: ReactNode;
  linkComponent?: ElementType;
  /** Icon-only rail; labels stay available to assistive tech and as tooltips. */
  collapsed?: boolean;
  /** Accessible name of the `<nav>` landmark. Default "Main". */
  navLabel?: string;
  /** Custom active matcher. Default: exact for "/", prefix match otherwise. */
  isActive?: (href: string, activeHref: string) => boolean;
  /**
   * Permission check (e.g. from `usePermissions().has`). Items with a `permission` the user lacks are not
   * rendered and empty groups are hidden. Without it every item renders. UI only; routes must also be guarded.
   */
  can?: (permission: string) => boolean;
};

/** Groups with the items the user may see (items without `permission` always stay). */
export function filterSideNavGroups(groups: SideNavGroup[], can?: (permission: string) => boolean): SideNavGroup[] {
  if (!can) return groups;
  const visible = (item: SideNavItem) => {
    if (item.permission === undefined) return true;
    const keys: readonly string[] = typeof item.permission === "string" ? [item.permission] : item.permission;
    return keys.some((k) => can(k));
  };
  return groups.map((g) => ({ ...g, items: g.items.filter(visible) })).filter((g) => g.items.length > 0);
}

function defaultIsActive(href: string, activeHref: string): boolean {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/** Application side navigation on the `xdark` surface: brand, environment, grouped links and user card. */
export function SideNav({
  groups,
  activeHref,
  header,
  environment,
  user,
  footer,
  linkComponent,
  collapsed = false,
  navLabel = "Main",
  isActive = defaultIsActive,
  can,
  className,
  ...props
}: SideNavProps) {
  const Link = linkComponent ?? "a";

  return (
    <aside
      data-cg-theme="xdark"
      data-collapsed={collapsed || undefined}
      className={cx("flex h-full flex-col bg-surface py-5 text-fg", collapsed ? "w-16 px-2" : "w-64 px-4", className)}
      {...props}
    >
      <div className={cx("flex min-h-9 items-center", collapsed ? "justify-center" : "px-2")}>
        {header ?? <Logo tone="reverse" variant={collapsed ? "symbol" : "horizontal"} size="small" />}
      </div>

      {environment ? (
        collapsed ? (
          <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-accent-300" title={`Environment: ${environment}`}>
            <span className="sr-only">Environment: </span>
            {environment.slice(0, 3)}
          </p>
        ) : (
          <div className="squircle mt-5 rounded-2xl bg-fg/5 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-subtle">Environment</p>
            <p className="mt-0.5 text-xs font-semibold text-accent-300">{environment}</p>
          </div>
        )
      ) : null}

      <nav aria-label={navLabel} className="-mx-1 mt-6 flex-1 space-y-6 overflow-y-auto px-1">
        {filterSideNavGroups(groups, can).map((group) => (
          <div key={group.label}>
            <p className={cx("font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle", collapsed ? "sr-only" : "px-3")}>
              {group.label}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href, activeHref);
                return (
                  <li key={`${group.label}-${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cx(
                        "squircle group relative flex min-h-10 items-center gap-3 rounded-full text-sm font-medium transition-colors duration-150 ease-bolt",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                        collapsed ? "justify-center px-0" : "px-3",
                        active
                          ? "bg-fg/10 font-semibold text-fg"
                          : "text-fg-muted hover:bg-fg/5 hover:text-fg active:bg-fg/10",
                      )}
                    >
                      {item.icon ? (
                        <span aria-hidden="true" className={cx("grid size-5 shrink-0 place-items-center [&>svg]:size-4", active && "text-accent-300")}>
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={cx("flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
                      {item.badge !== undefined && item.badge !== "" ? (
                        <span
                          className={cx(
                            "rounded-full font-mono text-[10px] font-semibold",
                            collapsed ? "absolute right-1 top-1 size-2 bg-action text-[0px]" : "px-1.5 py-0.5",
                            !collapsed && (active ? "bg-action text-on-action" : "bg-fg/10 text-fg-muted"),
                          )}
                        >
                          {collapsed ? <span className="sr-only">{item.badge}</span> : item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user ? (
        <div className={cx("squircle mt-4 rounded-2xl bg-fg/5", collapsed ? "p-1.5" : "p-3")}>
          <div className={cx("flex items-center gap-2.5", collapsed && "justify-center")}>
            <Avatar name={user.name} src={user.avatarSrc} size="small" aria-hidden="true" className="bg-accent-500 text-on-action" />
            <div className={cx("min-w-0", collapsed && "sr-only")}>
              <p className="truncate text-xs font-semibold text-fg">{user.name}</p>
              <p className="truncate text-[11px] text-fg-muted">{user.role}</p>
            </div>
          </div>
          {footer && !collapsed ? <div className="mt-3">{footer}</div> : null}
        </div>
      ) : footer ? (
        <div className="mt-4">{footer}</div>
      ) : null}
    </aside>
  );
}
