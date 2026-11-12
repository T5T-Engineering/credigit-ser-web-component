"use client";

import { Fragment, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Lock, ShieldAlert } from "lucide-react";

import { Badge } from "../basic/badge";
import { Button } from "../basic/button";
import { Checkbox } from "../forms/checkbox";
import { SearchField } from "../forms/search-field";
import { cx } from "../../utils/cx";
import { focusRing, labelText } from "./app-utils";

/** One permission of the catalogue (a subset of the backend `Permission`). */
export type PermissionDefinition = {
  /** Unique key, e.g. `"identity.roles.change-permissions"`. */
  key: string;
  label: string;
  description?: string;
  /** Module id used for grouping (e.g. `"identity"`). */
  module: string;
  /** Optional sub-group inside the module (e.g. `"Roles"`). */
  group?: string;
  /** Shows a "Sensitive" badge. */
  sensitive?: boolean;
  /** View or change permission; shown as a small badge when set. */
  level?: "view" | "edit";
};

/** A role column of the matrix. */
export type PermissionMatrixRole = {
  id: string;
  label: string;
  description?: string;
  /** Holds every permission (e.g. System Admin): shown fully granted and not editable. */
  grantsAll?: boolean;
  /** Column cannot be edited (e.g. a role with a pending change). */
  readOnly?: boolean;
};

/** Module heading (label and order). */
export type PermissionModule = { id: string; label: string; description?: string };

/** Granted permission keys per role id. */
export type PermissionGrants = Record<string, readonly string[]>;

/** Keys to grant and revoke, e.g. the body of `POST /identity/roles/{id}/permission-changes`. */
export type GrantDiff = { grant: string[]; revoke: string[] };

/** A single user change, passed with the new grants. */
export type PermissionGrantChange = { roleId: string; keys: string[]; granted: boolean };

/** Overridable copy of `PermissionMatrix`. */
export type PermissionMatrixLabels = {
  permission: string;
  search: string;
  searchPlaceholder: string;
  expandAll: string;
  collapseAll: string;
  sensitive: string;
  grantsAll: string;
  locked: string;
  changed: string;
  view: string;
  edit: string;
  noResults: string;
  cell: (role: string, permission: string) => string;
  moduleToggle: (role: string, module: string) => string;
  moduleCount: (count: number) => string;
  roleCount: (granted: number, total: number) => string;
  summary: (shown: number, total: number) => string;
  changes: (count: number) => string;
};

/** Default English copy. */
export const defaultPermissionMatrixLabels: PermissionMatrixLabels = {
  permission: "Permission",
  search: "Search permissions",
  searchPlaceholder: "Search by name, key or module",
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  sensitive: "Sensitive",
  grantsAll: "All permissions",
  locked: "Locked",
  changed: "changed",
  view: "View",
  edit: "Change",
  noResults: "No permissions match your search.",
  cell: (role, permission) => `${role}: ${permission}`,
  moduleToggle: (role, module) => `${role}: all ${module} permissions`,
  moduleCount: (count) => `${count} ${count === 1 ? "permission" : "permissions"}`,
  roleCount: (granted, total) => `${granted} / ${total}`,
  summary: (shown, total) => (shown === total ? `${total} permissions` : `${shown} of ${total} permissions`),
  changes: (count) => `${count} unsaved ${count === 1 ? "change" : "changes"}`,
};

/** Props for `PermissionMatrix`. */
export type PermissionMatrixProps = Omit<ComponentProps<"div">, "children" | "onChange"> & {
  /** Permission catalogue (e.g. `GET /identity/permissions` → `permissions`). */
  permissions: readonly PermissionDefinition[];
  /** Role columns. One role gives a single-role checklist. */
  roles: readonly PermissionMatrixRole[];
  /** Current grants per role id (controlled). */
  grants: PermissionGrants;
  /** Called with the new grants after a cell or module toggle. Omit (or `readOnly`) for a read-only view. */
  onGrantsChange?: (next: PermissionGrants, change: PermissionGrantChange) => void;
  /** Saved grants; cells that differ are marked as changed and counted. */
  initialGrants?: PermissionGrants;
  /** Module labels and order. Modules not listed follow in catalogue order, labelled by id. */
  modules?: readonly PermissionModule[];
  /** Cells that cannot change (e.g. protected administrator permissions). */
  isLocked?: (roleId: string, permissionKey: string) => boolean;
  readOnly?: boolean;
  /** Controlled search text. */
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  /** Modules open at first render: ids or `"all"`. Default none (all collapsed). Searching opens matching modules. */
  defaultExpandedModules?: readonly string[] | "all";
  /** Show `group` sub-headings inside modules. Default true. */
  showGroups?: boolean;
  /** Scroll height of the grid (sticky header). */
  maxHeight?: number | string;
  /** Accessible name of the table. Default "Permissions". */
  label?: string;
  /** Extra toolbar content (right side), e.g. a Save button. */
  actions?: ReactNode;
  labels?: Partial<PermissionMatrixLabels>;
};

/** Keys added and removed between two grant lists (order follows the inputs). */
export function diffGrants(before: Iterable<string>, after: Iterable<string>): GrantDiff {
  const b = new Set(before);
  const a = new Set(after);
  return { grant: [...a].filter((k) => !b.has(k)), revoke: [...b].filter((k) => !a.has(k)) };
}

/** Per-role diffs; roles without changes are omitted. */
export function diffRoleGrants(before: PermissionGrants, after: PermissionGrants): Record<string, GrantDiff> {
  const out: Record<string, GrantDiff> = {};
  for (const roleId of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const diff = diffGrants(before[roleId] ?? [], after[roleId] ?? []);
    if (diff.grant.length || diff.revoke.length) out[roleId] = diff;
  }
  return out;
}

/** Case-insensitive search: every whitespace-separated term must match the label, key, description, group or module label. */
export function filterPermissions<P extends PermissionDefinition>(
  permissions: readonly P[],
  query: string,
  moduleLabels: Record<string, string> = {},
): P[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...permissions];
  return permissions.filter((p) => {
    const text = [p.label, p.key, p.description, p.group, p.module, moduleLabels[p.module]].filter(Boolean).join(" ").toLowerCase();
    return terms.every((t) => text.includes(t));
  });
}

type ModuleSection = { module: PermissionModule; permissions: PermissionDefinition[] };

/**
 * Roles × permissions grid grouped by module: search, collapsible modules, a grant / revoke checkbox
 * per cell, a tri-state "all in module" checkbox per role, locked cells and grants-all roles, and
 * change tracking against `initialGrants`. Holds no IAM rules; the app submits the diff for approval.
 */
export function PermissionMatrix({
  permissions,
  roles,
  grants,
  onGrantsChange,
  initialGrants,
  modules,
  isLocked,
  readOnly = false,
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  defaultExpandedModules,
  showGroups = true,
  maxHeight,
  label = "Permissions",
  actions,
  labels: labelsProp,
  className,
  ...props
}: PermissionMatrixProps) {
  const labels = { ...defaultPermissionMatrixLabels, ...labelsProp };
  const [searchState, setSearchState] = useState(defaultSearch);
  const search = searchProp ?? searchState;
  const setSearch = (value: string) => {
    if (searchProp === undefined) setSearchState(value);
    onSearchChange?.(value);
  };

  const moduleList = useMemo(() => {
    const list: PermissionModule[] = [...(modules ?? [])];
    const known = new Set(list.map((m) => m.id));
    for (const p of permissions) {
      if (!known.has(p.module)) {
        known.add(p.module);
        list.push({ id: p.module, label: p.module });
      }
    }
    return list;
  }, [modules, permissions]);
  const moduleLabels = useMemo(() => Object.fromEntries(moduleList.map((m) => [m.id, m.label])), [moduleList]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedModules === "all" ? moduleList.map((m) => m.id) : (defaultExpandedModules ?? [])),
  );

  const filtered = useMemo(() => filterPermissions(permissions, search, moduleLabels), [permissions, search, moduleLabels]);
  const sections = useMemo<ModuleSection[]>(
    () =>
      moduleList
        .map((module) => ({ module, permissions: filtered.filter((p) => p.module === module.id) }))
        .filter((s) => s.permissions.length > 0),
    [moduleList, filtered],
  );

  const grantSets = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const role of roles) map[role.id] = new Set(grants[role.id] ?? []);
    return map;
  }, [roles, grants]);
  const initialSets = useMemo(() => {
    if (!initialGrants) return null;
    const map: Record<string, Set<string>> = {};
    for (const role of roles) map[role.id] = new Set(initialGrants[role.id] ?? []);
    return map;
  }, [roles, initialGrants]);

  const searching = search.trim().length > 0;
  const editable = !readOnly && Boolean(onGrantsChange);
  const roleEditable = (role: PermissionMatrixRole) => editable && !role.readOnly && !role.grantsAll;
  const isGranted = (role: PermissionMatrixRole, key: string) => Boolean(role.grantsAll) || grantSets[role.id]?.has(key) === true;
  const cellLocked = (role: PermissionMatrixRole, key: string) => Boolean(isLocked?.(role.id, key));
  const isChanged = (role: PermissionMatrixRole, key: string) =>
    Boolean(initialSets && !role.grantsAll && initialSets[role.id]?.has(key) !== grantSets[role.id]?.has(key));

  const changeCount = useMemo(() => {
    if (!initialSets) return 0;
    let n = 0;
    for (const role of roles) {
      if (role.grantsAll) continue;
      const diff = diffGrants(initialSets[role.id] ?? [], grantSets[role.id] ?? []);
      n += diff.grant.length + diff.revoke.length;
    }
    return n;
  }, [roles, initialSets, grantSets]);

  const apply = (role: PermissionMatrixRole, keys: string[], granted: boolean) => {
    if (!onGrantsChange || keys.length === 0) return;
    const current = new Set(grants[role.id] ?? []);
    for (const k of keys) {
      if (granted) current.add(k);
      else current.delete(k);
    }
    onGrantsChange({ ...grants, [role.id]: [...current] }, { roleId: role.id, keys, granted });
  };

  const toggleModule = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const colCount = roles.length + 1;
  const scrollStyle = maxHeight !== undefined ? { maxHeight } : undefined;

  return (
    <div className={cx("flex flex-col gap-4", className)} {...props}>
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={search}
          onValueChange={setSearch}
          label={labels.search}
          placeholder={labels.searchPlaceholder}
          className="min-w-0 flex-1 sm:max-w-sm"
        />
        <span className="text-sm text-fg-muted" aria-live="polite">
          {labels.summary(filtered.length, permissions.length)}
          {changeCount > 0 ? (
            <>
              {" · "}
              <span className="font-semibold text-accent-text">{labels.changes(changeCount)}</span>
            </>
          ) : null}
        </span>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {!searching ? (
            <>
              <Button variant="text" size="small" onClick={() => setExpanded(new Set(moduleList.map((m) => m.id)))}>
                {labels.expandAll}
              </Button>
              <Button variant="text" size="small" onClick={() => setExpanded(new Set())}>
                {labels.collapseAll}
              </Button>
            </>
          ) : null}
          {actions}
        </div>
      </div>

      {sections.length === 0 ? (
        <p role="status" className="squircle rounded-3xl bg-surface-sunken p-6 text-center text-fg-muted">
          {labels.noResults}
        </p>
      ) : (
        <div className="squircle overflow-auto rounded-3xl ring-1 ring-line" style={scrollStyle}>
          <table className="w-full border-separate border-spacing-0 text-fg">
            <caption className="sr-only">{label}</caption>
            <thead className={cx(maxHeight !== undefined && "sticky top-0 z-20")}>
              <tr>
                <th scope="col" className={cx("sticky start-0 z-10 min-w-64 border-b border-line bg-surface px-4 py-3 text-start text-fg-muted", labelText)}>
                  {labels.permission}
                </th>
                {roles.map((role) => {
                  const total = permissions.length;
                  const granted = role.grantsAll ? total : permissions.filter((p) => grantSets[role.id]?.has(p.key)).length;
                  return (
                    <th key={role.id} scope="col" title={role.description} className="min-w-28 border-b border-line bg-surface px-3 py-3 text-center align-bottom">
                      <span className="block text-sm font-semibold text-fg">{role.label}</span>
                      <span className="mt-0.5 block font-mono text-xs text-fg-muted">{labels.roleCount(granted, total)}</span>
                      {role.grantsAll ? (
                        <Badge tone="accent" size="small" className="mt-1">
                          {labels.grantsAll}
                        </Badge>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            {sections.map(({ module, permissions: rows }) => {
              const open = searching || expanded.has(module.id);
              const groups = groupRows(rows, showGroups);
              return (
                <tbody key={module.id}>
                  <tr className="bg-surface-sunken">
                    <th scope="rowgroup" className="sticky start-0 z-10 border-b border-line bg-surface-sunken px-2 py-2 text-start">
                      <button
                        type="button"
                        aria-expanded={open}
                        disabled={searching}
                        onClick={() => toggleModule(module.id)}
                        className={cx(
                          "flex w-full min-h-10 cursor-pointer items-center gap-2 rounded-full px-2 text-start disabled:cursor-default",
                          "hover:bg-fg/5 disabled:hover:bg-transparent",
                          focusRing,
                        )}
                      >
                        {open ? <ChevronDown aria-hidden="true" className="size-4 shrink-0" /> : <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
                        <span className="font-display font-bold tracking-tight text-fg">{module.label}</span>
                        <span className="text-xs text-fg-muted">{labels.moduleCount(rows.length)}</span>
                      </button>
                    </th>
                    {roles.map((role) => {
                      const toggleable = rows.filter((p) => !cellLocked(role, p.key));
                      const grantedCount = rows.filter((p) => isGranted(role, p.key)).length;
                      const all = grantedCount === rows.length;
                      const some = grantedCount > 0 && !all;
                      const disabled = !roleEditable(role) || toggleable.length === 0;
                      return (
                        <td key={role.id} className="border-b border-line bg-surface-sunken px-3 py-2 text-center">
                          <Checkbox
                            aria-label={labels.moduleToggle(role.label, module.label)}
                            checked={all}
                            indeterminate={some}
                            disabled={disabled}
                            onChange={() => apply(role, toggleable.map((p) => p.key), !all)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  {open
                    ? groups.map(({ group, items }) => (
                        <Fragment key={group ?? ""}>
                          {group ? (
                            <tr>
                              <th scope="colgroup" colSpan={colCount} className={cx("border-b border-line bg-surface px-4 pt-3 pb-1 text-start text-fg-muted", labelText)}>
                                {group}
                              </th>
                            </tr>
                          ) : null}
                          {items.map((perm) => (
                            <tr key={perm.key} className="hover:bg-fg/[0.03]">
                              <th scope="row" className="sticky start-0 z-10 border-b border-line bg-surface px-4 py-2 text-start align-top font-normal">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-fg">{perm.label}</span>
                                  {perm.level ? (
                                    <Badge size="small" variant="outline">
                                      {perm.level === "edit" ? labels.edit : labels.view}
                                    </Badge>
                                  ) : null}
                                  {perm.sensitive ? (
                                    <Badge size="small" tone="warning">
                                      <ShieldAlert aria-hidden="true" className="size-3" />
                                      {labels.sensitive}
                                    </Badge>
                                  ) : null}
                                </span>
                                <span className="mt-0.5 block font-mono text-xs break-all text-fg-subtle">{perm.key}</span>
                                {perm.description ? <span className="mt-0.5 block text-xs text-fg-muted">{perm.description}</span> : null}
                              </th>
                              {roles.map((role) => {
                                const locked = cellLocked(role, perm.key);
                                const changed = isChanged(role, perm.key);
                                return (
                                  <td
                                    key={role.id}
                                    data-changed={changed || undefined}
                                    className={cx("border-b border-line px-3 py-2 text-center align-top", changed && "bg-accent-tint")}
                                  >
                                    <span className="inline-flex items-center gap-1" title={locked ? labels.locked : undefined}>
                                      <Checkbox
                                        aria-label={labels.cell(role.label, perm.label) + (changed ? `, ${labels.changed}` : "") + (locked ? `, ${labels.locked}` : "")}
                                        checked={isGranted(role, perm.key)}
                                        disabled={!roleEditable(role) || locked}
                                        onChange={(e) => apply(role, [perm.key], e.currentTarget.checked)}
                                      />
                                      {locked ? <Lock aria-hidden="true" className="size-3 text-fg-subtle" /> : null}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    : null}
                </tbody>
              );
            })}
          </table>
        </div>
      )}
    </div>
  );
}

function groupRows(rows: PermissionDefinition[], showGroups: boolean): { group?: string; items: PermissionDefinition[] }[] {
  if (!showGroups) return [{ items: rows }];
  const out: { group?: string; items: PermissionDefinition[] }[] = [];
  for (const row of rows) {
    const last = out[out.length - 1];
    if (last && last.group === row.group) last.items.push(row);
    else out.push({ group: row.group, items: [row] });
  }
  return out;
}
