import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Navbar } from "./navbar";

const links = [
  { label: "Platform", href: "#platform", active: true },
  { label: "Modules", href: "#modules" },
  { label: "Contact", href: "#contact" },
];

describe("Navbar", () => {
  it("renders the default logo link and marks the active link", () => {
    const { container } = render(<Navbar links={links} />);
    expect(container.querySelector('a[href="/"] svg[role="img"]')).not.toBeNull();
    const active = container.querySelectorAll('a[aria-current="page"]');
    expect(active.length).toBeGreaterThan(0);
    expect(active[0]).toHaveTextContent("Platform");
  });

  it("toggles the mobile disclosure menu and manages focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar links={links} actions={<button type="button">Book a demo</button>} />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    const panel = container.querySelector(`#${CSS.escape(toggle.getAttribute("aria-controls") ?? "")}`) as HTMLElement;
    expect(panel).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Close menu");
    expect(panel).toBeVisible();
    expect(panel.querySelector("a")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
    expect(toggle).toHaveFocus();
  });

  it("closes the mobile menu when a link is chosen", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar links={links} />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    const panel = container.querySelector(`#${CSS.escape(toggle.getAttribute("aria-controls") ?? "")}`) as HTMLElement;
    await user.click(panel.querySelector('a[href="#modules"]') as HTMLElement);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("gains a surface when a transparent bar is scrolled", () => {
    const { container } = render(<Navbar links={links} transparent />);
    const header = container.querySelector("header") as HTMLElement;
    expect(header.className).toContain("bg-transparent");
    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-scrolled", "true");
    expect(header.className).toContain("bg-surface/95");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
