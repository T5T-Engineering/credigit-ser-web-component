"use client";

import type { ElementType } from "react";
import { Check, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar } from "../basic/avatar";
import { Menu, type MenuItem } from "../navigation/menu";
import { cx } from "../../utils/cx";
import { focusRing } from "./app-utils";

/** Signed-in user shown by `UserMenu`. */
export type AppUser = {
  name: string;
  /** Current role / persona, e.g. "Credit Analyst". */
  role?: string;
  email?: string;
  avatarSrc?: string;
};

/** A role the user may switch to. */
export type UserMenuRole = { id: string; label: string };

/** Props for `UserMenu`. */
export type UserMenuProps = {
  user: AppUser;
  /** Profile link or handler (item hidden when both are absent). */
  profileHref?: string;
  onProfile?: () => void;
  /** Settings link or handler (item hidden when both are absent). */
  settingsHref?: string;
  onSettings?: () => void;
  /** Sign out handler (item hidden when absent and no `signOutHref`). */
  onSignOut?: () => void;
  signOutHref?: string;
  /** Roles the user can switch between; renders a "Switch role" section. */
  roles?: UserMenuRole[];
  activeRoleId?: string;
  onSwitchRole?: (role: UserMenuRole) => void;
  /** Additional items appended before Sign out. */
  extraItems?: MenuItem[];
  /** Hide name/role next to the avatar below `md` (default true). */
  compact?: boolean;
  /** Labels (i18n). */
  labels?: { profile?: string; settings?: string; signOut?: string; switchRole?: string; menu?: string };
  linkComponent?: ElementType;
  className?: string;
};

/** Avatar + name + role trigger with a dropdown: profile, switch role, settings, sign out. */
export function UserMenu({
  user,
  profileHref,
  onProfile,
  settingsHref,
  onSettings,
  onSignOut,
  signOutHref,
  roles,
  activeRoleId,
  onSwitchRole,
  extraItems = [],
  compact = true,
  labels = {},
  linkComponent,
  className,
}: UserMenuProps) {
  const items: MenuItem[] = [];
  if (profileHref || onProfile) items.push({ label: labels.profile ?? "Profile", href: profileHref, onSelect: onProfile, icon: <UserRound /> });
  if (roles && roles.length > 0) {
    roles.forEach((role, index) => {
      const active = role.id === activeRoleId;
      items.push({
        divider: index === 0 && items.length > 0,
        label: (
          <span className="flex items-center justify-between gap-3">
            <span className="flex flex-col">
              {index === 0 ? (
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-fg-muted">
                  {labels.switchRole ?? "Switch role"}
                </span>
              ) : null}
              <span>{role.label}</span>
            </span>
            {active ? (
              <>
                <Check aria-hidden="true" className="size-4 text-accent-text" />
                <span className="sr-only">(current)</span>
              </>
            ) : null}
          </span>
        ),
        onSelect: active ? undefined : () => onSwitchRole?.(role),
      });
    });
  }
  if (settingsHref || onSettings) {
    items.push({ divider: items.length > 0, label: labels.settings ?? "Settings", href: settingsHref, onSelect: onSettings, icon: <Settings /> });
  }
  extraItems.forEach((item) => items.push(item));
  if (onSignOut || signOutHref) {
    items.push({ divider: items.length > 0, label: labels.signOut ?? "Sign out", href: signOutHref, onSelect: onSignOut, icon: <LogOut />, danger: true });
  }

  return (
    <Menu
      align="end"
      className={className}
      linkComponent={linkComponent}
      triggerLabel={`${labels.menu ?? "Account menu"}: ${user.name}${user.role ? `, ${user.role}` : ""}`}
      triggerClassName={cx(
        "squircle inline-flex h-11 max-w-64 cursor-pointer items-center gap-2.5 rounded-full py-1 pr-2 pl-1 text-left text-fg transition-colors duration-150 ease-bolt hover:bg-fg/5",
        focusRing,
      )}
      trigger={
        <>
          <Avatar name={user.name} src={user.avatarSrc} size="small" aria-hidden="true" className="bg-accent-tint text-accent-text" />
          <span className={cx("min-w-0 flex-col leading-tight", compact ? "hidden md:flex" : "flex")}>
            <span className="truncate text-sm font-semibold text-fg">{user.name}</span>
            {user.role ? <span className="truncate text-xs text-fg-muted">{user.role}</span> : null}
          </span>
          <ChevronDown aria-hidden="true" className={cx("size-4 shrink-0 text-fg-muted", compact && "hidden md:block")} />
        </>
      }
      items={items}
    />
  );
}
