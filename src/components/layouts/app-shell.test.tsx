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
