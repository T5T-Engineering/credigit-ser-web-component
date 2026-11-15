import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell print", () => {
  it("hides the sidebar and top bar and drops the main offsets when printing", () => {
    const { container } = render(
      <AppShell sidebar={<nav aria-label="Side">Nav</nav>} topbar={<span>Top</span>}>
        <p>Offer letter</p>
      </AppShell>,
    );
    const header = screen.getByText("Top").closest("header");
    expect(header?.className).toContain("print:hidden");
    const sidebarWrapper = screen.getByText("Nav").closest("div.fixed");
    expect(sidebarWrapper?.className).toContain("print:hidden");
    const main = screen.getByRole("main");
    expect(main.parentElement?.className).toContain("print:pl-0!");
    expect(main).toHaveTextContent("Offer letter");
    expect(container.querySelector(".bg-overlay")?.className).toContain("print:hidden");
  });
});

describe("AppShell collapsible sidebar", () => {
  it("toggles the rail and tells the sidebar whether it is collapsed", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const changes: boolean[] = [];
    const { rerender } = render(
      <AppShell sidebar={({ collapsed }) => <nav aria-label="Side">{collapsed ? "Rail" : "Full"}</nav>} sidebarCollapsed={false} onSidebarCollapsedChange={(c) => changes.push(c)}>
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement?.className).toContain("lg:pl-64");
    await userEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    expect(changes).toEqual([true]);

    rerender(
      <AppShell sidebar={({ collapsed }) => <nav aria-label="Side">{collapsed ? "Rail" : "Full"}</nav>} sidebarCollapsed onSidebarCollapsedChange={(c) => changes.push(c)}>
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getByText("Rail")).toBeInTheDocument();
    expect(screen.getByRole("main").parentElement?.className).toContain("lg:pl-16");
    expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows no collapse button without a handler", () => {
    render(<AppShell sidebar={<nav aria-label="Side">Nav</nav>}>x</AppShell>);
    expect(screen.queryByRole("button", { name: "Collapse navigation" })).toBeNull();
  });
});
