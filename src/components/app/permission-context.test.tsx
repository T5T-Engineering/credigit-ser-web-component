import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Can, checkPermissions, PermissionProvider, useCan } from "./permission-context";

const held = new Set(["identity.users.view", "identity.users.deactivate"]);
const has = (p: string) => held.has(p);

describe("checkPermissions", () => {
  it("checks a single key", () => {
    expect(checkPermissions(has, { permission: "identity.users.view" })).toBe(true);
    expect(checkPermissions(has, { permission: "identity.roles.view" })).toBe(false);
  });

  it("supports anyOf and allOf, combined with AND", () => {
    expect(checkPermissions(has, { anyOf: ["x", "identity.users.view"] })).toBe(true);
    expect(checkPermissions(has, { allOf: ["identity.users.view", "x"] })).toBe(false);
    expect(checkPermissions(has, { permission: "identity.users.view", allOf: ["identity.users.deactivate"] })).toBe(true);
    expect(checkPermissions(has, { permission: "identity.users.view", anyOf: ["x"] })).toBe(false);
  });

  it("fails closed when nothing is required", () => {
    expect(checkPermissions(() => true, {})).toBe(false);
    expect(checkPermissions(() => true, { anyOf: [], allOf: [] })).toBe(false);
    expect(checkPermissions(() => true, { permission: "" })).toBe(false);
  });
});

describe("Can", () => {
  it("denies everything without a provider", () => {
    render(
      <Can permission="identity.users.view" fallback={<p>No access</p>}>
        Users
      </Can>,
    );
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.getByText("No access")).toBeInTheDocument();
  });

  it("reads granted keys from the provider", () => {
    render(
      <PermissionProvider permissions={["identity.users.view"]}>
        <Can permission="identity.users.view">Users</Can>
        <Can permission="identity.roles.view">Roles</Can>
      </PermissionProvider>,
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.queryByText("Roles")).not.toBeInTheDocument();
  });

  it("uses a provider check function and a per-gate override", () => {
    render(
      <PermissionProvider has={has}>
        <Can anyOf={["identity.users.deactivate"]}>Deactivate</Can>
        <Can permission="identity.users.view" has={() => false}>
          Hidden
        </Can>
      </PermissionProvider>,
    );
    expect(screen.getByText("Deactivate")).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("passes the result to a render function (disable instead of hide)", () => {
    render(
      <PermissionProvider has={has}>
        <Can permission="identity.roles.change-permissions">
          {(allowed) => (
            <button type="button" disabled={!allowed}>
              Save
            </button>
          )}
        </Can>
      </PermissionProvider>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});

describe("useCan", () => {
  function Probe({ req }: { req: Parameters<typeof useCan>[0] }) {
    return <span>{useCan(req) ? "yes" : "no"}</span>;
  }

  it("accepts a key, an any-of array or a requirement object", () => {
    const { rerender } = render(
      <PermissionProvider has={has}>
        <Probe req="identity.users.view" />
      </PermissionProvider>,
    );
    expect(screen.getByText("yes")).toBeInTheDocument();
    rerender(
      <PermissionProvider has={has}>
        <Probe req={["a", "b"]} />
      </PermissionProvider>,
    );
    expect(screen.getByText("no")).toBeInTheDocument();
    rerender(
      <PermissionProvider has={has}>
        <Probe req={{ allOf: ["identity.users.view", "identity.users.deactivate"] }} />
      </PermissionProvider>,
    );
    expect(screen.getByText("yes")).toBeInTheDocument();
  });
});
