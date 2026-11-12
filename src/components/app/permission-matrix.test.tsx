import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  diffGrants,
  diffRoleGrants,
  filterPermissions,
  PermissionMatrix,
  type PermissionDefinition,
  type PermissionGrants,
  type PermissionMatrixProps,
  type PermissionMatrixRole,
} from "./permission-matrix";

const permissions: PermissionDefinition[] = [
  { key: "identity.roles.view", label: "View roles", module: "identity", group: "Roles", level: "view" },
  { key: "identity.roles.change-permissions", label: "Change role permissions", module: "identity", group: "Roles", sensitive: true, level: "edit" },
  { key: "identity.users.view", label: "View users", module: "identity", group: "Users" },
  { key: "portfolio.data.export", label: "Export portfolio data", module: "portfolio", description: "Download CSV" },
];
const roles: PermissionMatrixRole[] = [
  { id: "analyst", label: "Credit Analyst" },
  { id: "admin", label: "System Admin", grantsAll: true },
];
const modules = [
  { id: "identity", label: "Identity & Access" },
  { id: "portfolio", label: "Portfolio" },
];

function Harness(props: Partial<PermissionMatrixProps> & { start?: PermissionGrants; onChangeSpy?: (g: PermissionGrants) => void }) {
  const { start = { analyst: ["identity.roles.view"] }, onChangeSpy, ...rest } = props;
  const [grants, setGrants] = useState<PermissionGrants>(start);
  return (
    <PermissionMatrix
      permissions={permissions}
      roles={roles}
      modules={modules}
      grants={grants}
      initialGrants={start}
      onGrantsChange={(next) => {
        setGrants(next);
        onChangeSpy?.(next);
      }}
      {...rest}
    />
  );
}

describe("helpers", () => {
  it("diffGrants returns added and removed keys", () => {
    expect(diffGrants(["a", "b"], ["b", "c"])).toEqual({ grant: ["c"], revoke: ["a"] });
  });

  it("diffRoleGrants omits unchanged roles", () => {
    expect(diffRoleGrants({ r1: ["a"], r2: ["x"] }, { r1: ["a", "b"], r2: ["x"] })).toEqual({ r1: { grant: ["b"], revoke: [] } });
  });

  it("filterPermissions matches every term across label, key, description and module label", () => {
    expect(filterPermissions(permissions, "export csv").map((p) => p.key)).toEqual(["portfolio.data.export"]);
    expect(filterPermissions(permissions, "identity users", { identity: "Identity & Access" }).map((p) => p.key)).toEqual(["identity.users.view"]);
    expect(filterPermissions(permissions, "access", { identity: "Identity & Access" })).toHaveLength(3);
    expect(filterPermissions(permissions, "  ")).toHaveLength(4);
  });
});

describe("PermissionMatrix", () => {
  it("renders modules collapsed with role columns and counts", () => {
    render(<Harness />);
    expect(screen.getByRole("table", { name: "Permissions" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Credit Analyst/ })).toHaveTextContent("1 / 4");
    expect(screen.getByRole("columnheader", { name: /System Admin/ })).toHaveTextContent("4 / 4");
    expect(screen.getByRole("button", { name: /Identity & Access/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Credit Analyst: View roles")).not.toBeInTheDocument();
  });

  it("expands a module and toggles a single permission, tracking changes", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onChangeSpy={spy} />);
    await user.click(screen.getByRole("button", { name: /Identity & Access/ }));
    expect(screen.getByRole("columnheader", { name: "Roles" })).toBeInTheDocument();
    const cell = screen.getByLabelText("Credit Analyst: View users");
    expect(cell).not.toBeChecked();
    await user.click(cell);
    expect(spy).toHaveBeenLastCalledWith({ analyst: ["identity.roles.view", "identity.users.view"] });
    expect(screen.getByLabelText("Credit Analyst: View users, changed")).toBeChecked();
    expect(screen.getByText("1 unsaved change")).toBeInTheDocument();
  });

  it("shows grants-all roles fully granted and locked", async () => {
    const user = userEvent.setup();
    render(<Harness defaultExpandedModules="all" />);
    const adminCell = screen.getByLabelText("System Admin: Export portfolio data");
    expect(adminCell).toBeChecked();
    expect(adminCell).toBeDisabled();
    expect(screen.getByLabelText("System Admin: all Portfolio permissions")).toBeDisabled();
    await user.click(adminCell);
    expect(adminCell).toBeChecked();
  });

  it("module checkbox is tri-state and grants every unlocked permission in the module", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onChangeSpy={spy} isLocked={(_, key) => key === "identity.roles.change-permissions"} defaultExpandedModules={["identity"]} />);
    const moduleBox = screen.getByLabelText("Credit Analyst: all Identity & Access permissions") as HTMLInputElement;
    expect(moduleBox.indeterminate).toBe(true);
    expect(screen.getByLabelText("Credit Analyst: Change role permissions, Locked")).toBeDisabled();
    await user.click(moduleBox);
    const next = spy.mock.lastCall?.[0] as PermissionGrants;
    expect([...(next.analyst ?? [])].sort()).toEqual(["identity.roles.view", "identity.users.view"]);
  });

  it("search filters rows, opens matching modules and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByRole("searchbox", { name: "Search permissions" }), "export");
    expect(screen.getByLabelText("Credit Analyst: Export portfolio data")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Identity & Access/ })).not.toBeInTheDocument();
    expect(screen.getByText("1 of 4 permissions")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search permissions" }), " nothing-matches");
    expect(screen.getByRole("status")).toHaveTextContent("No permissions match your search.");
  });

  it("is read-only without onGrantsChange or with readOnly", () => {
    render(
      <PermissionMatrix
        permissions={permissions}
        roles={[{ id: "analyst", label: "Credit Analyst" }]}
        grants={{ analyst: ["portfolio.data.export"] }}
        defaultExpandedModules="all"
        showGroups={false}
      />,
    );
    const cell = screen.getByLabelText("Credit Analyst: Export portfolio data");
    expect(cell).toBeChecked();
    expect(cell).toBeDisabled();
    const table = screen.getByRole("table");
    expect(within(table).queryByRole("columnheader", { name: "Roles" })).not.toBeInTheDocument();
    // Modules without labels fall back to their id.
    expect(screen.getByRole("button", { name: /portfolio/ })).toBeInTheDocument();
  });
});
