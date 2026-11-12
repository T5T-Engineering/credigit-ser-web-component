"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/** Returns whether the signed-in user holds a permission key (resolved by the app's IAM). */
export type PermissionCheck = (permission: string) => boolean;

/** What to check: one key, any of several, all of several. Combined with AND when more than one is given. */
export type PermissionRequirement = {
  /** A single permission key, e.g. `"identity.roles.change-permissions"`. */
  permission?: string;
  /** Allowed when at least one of these keys is held. */
  anyOf?: readonly string[];
  /** Allowed only when every one of these keys is held. */
  allOf?: readonly string[];
};

/** Value of the permission context. */
export type PermissionContextValue = {
  /** The app's check. Without a provider it denies everything. */
  has: PermissionCheck;
  /** False when no `PermissionProvider` is mounted. */
  provided: boolean;
};

const denyAll: PermissionCheck = () => false;
const PermissionContext = createContext<PermissionContextValue>({ has: denyAll, provided: false });

/**
 * Evaluate a requirement against a check. Fails closed: a requirement with nothing to check
 * (no `permission`, empty `anyOf` and `allOf`) is denied. Exact keys only — no wildcards or role names.
 */
export function checkPermissions(has: PermissionCheck, { permission, anyOf, allOf }: PermissionRequirement): boolean {
  const checks: boolean[] = [];
  if (permission !== undefined) checks.push(Boolean(permission) && has(permission));
  if (anyOf && anyOf.length > 0) checks.push(anyOf.some((p) => has(p)));
  if (allOf && allOf.length > 0) checks.push(allOf.every((p) => has(p)));
  return checks.length > 0 && checks.every(Boolean);
}

/** Props for `PermissionProvider`. Pass `has` or `permissions` (if both, `has` wins). */
export type PermissionProviderProps = {
  /** The app's permission check, e.g. `(key) => me.permissions.includes(key)`. */
  has?: PermissionCheck;
  /** Effective permission keys of the signed-in user (e.g. `GET /identity/me` → `permissions`). */
  permissions?: Iterable<string>;
  children: ReactNode;
};

/**
 * Supplies the signed-in user's permission check to `Can` / `useCan`. The library holds no
 * permission catalogue: the app passes the keys or the check. UI only — the backend re-checks every call.
 */
export function PermissionProvider({ has, permissions, children }: PermissionProviderProps) {
  const set = useMemo(() => (has ? null : new Set(permissions ?? [])), [has, permissions]);
  const value = useMemo<PermissionContextValue>(
    () => ({ has: has ?? ((p: string) => set?.has(p) ?? false), provided: true }),
    [has, set],
  );
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/** Read the permission check (denies everything without a provider). */
export function usePermissions(): PermissionContextValue {
  return useContext(PermissionContext);
}

/**
 * `useCan("portfolio.data.export")`, `useCan(["a", "b"])` (any of) or `useCan({ allOf: [...] })`.
 * Uses the nearest `PermissionProvider`.
 */
export function useCan(requirement: string | readonly string[] | PermissionRequirement): boolean {
  const { has } = usePermissions();
  return checkPermissions(has, normalizeRequirement(requirement));
}

function normalizeRequirement(requirement: string | readonly string[] | PermissionRequirement): PermissionRequirement {
  if (typeof requirement === "string") return { permission: requirement };
  if (isStringArray(requirement)) return { anyOf: requirement };
  return requirement;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value);
}

/** Props for `Can`. */
export type CanProps = PermissionRequirement & {
  /** Overrides the context check for this gate (e.g. a check scoped to another record). */
  has?: PermissionCheck;
  /** Rendered when not allowed. Default: nothing. Ignored when `children` is a function. */
  fallback?: ReactNode;
  /** Content when allowed, or a render function receiving `allowed` (to disable instead of hide). */
  children: ReactNode | ((allowed: boolean) => ReactNode);
};

/**
 * Permission gate: `<Can permission="identity.users.deactivate" fallback={…}>…</Can>`.
 * Reads the check from `PermissionProvider` unless `has` is passed. Fails closed. UI only.
 */
export function Can({ permission, anyOf, allOf, has: hasProp, fallback = null, children }: CanProps) {
  const context = usePermissions();
  const allowed = checkPermissions(hasProp ?? context.has, { permission, anyOf, allOf });
  if (typeof children === "function") return <>{children(allowed)}</>;
  return <>{allowed ? children : fallback}</>;
}
