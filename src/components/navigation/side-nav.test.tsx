import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { filterSideNavGroups, SideNav, type SideNavGroup } from "./side-nav";

const groups: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Home" },
      { href: "/portfolio", label: "Portfolio", permission: "portfolio.dashboard.view" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/roles", label: "Roles", permission: "identity.roles.view" },
      { href: "/admin/users", label: "Users", permission: ["identity.users.view", "identity.users.invite"] },
    ],
  },
];

describe("SideNav", () => {
  it("renders every item without a permission check", () => {
    render(<SideNav groups={groups} activeHref="/portfolio" />);
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Roles" })).toBeInTheDocument();
  });

  it("hides items the user may not use and empty groups", () => {
    const held = new Set(["portfolio.dashboard.view"]);
    render(<SideNav groups={groups} activeHref="/" can={(p) => held.has(p)} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Portfolio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Roles" })).not.toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("treats an array permission as any-of", () => {
    const out = filterSideNavGroups(groups, (p) => p === "identity.users.invite");
    expect(out.map((g) => g.items.map((i) => i.label))).toEqual([["Home"], ["Users"]]);
  });
});
