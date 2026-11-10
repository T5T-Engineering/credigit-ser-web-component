import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonStyles } from "./button";
import { IconButton } from "./icon-button";

describe("Button", () => {
  it("renders a type=button button by default and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("bg-action");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant, size, fullWidth and merges className last", () => {
    render(
      <Button variant="secondary" size="large" fullWidth className="custom">
        Go
      </Button>,
    );
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("bg-emphasis");
    expect(cls).toContain("h-control-lg");
    expect(cls).toContain("w-full");
    expect(cls.trim().endsWith("custom")).toBe(true);
  });

  it("renders an anchor when href is given", () => {
    render(<Button href="/apply">Apply</Button>);
    const link = screen.getByRole("link", { name: "Apply" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/apply");
    expect(link).not.toHaveAttribute("type");
  });

  it("renders a custom component via as", () => {
    function FakeLink(props: ComponentProps<"a">) {
      return <a data-router="yes" {...props} />;
    }
    render(
      <Button as={FakeLink} href="/x">
        Router
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Router" })).toHaveAttribute("data-router", "yes");
  });

  it("disables and blocks clicks when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Nope" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows busy state and disables while loading", () => {
    render(<Button loading>Submitting</Button>);
    const button = screen.getByRole("button", { name: "Submitting" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("removes href from a disabled or loading link", () => {
    render(
      <>
        <Button href="/a" disabled>
          Disabled link
        </Button>
        <Button href="/b" loading>
          Loading link
        </Button>
      </>,
    );
    for (const name of ["Disabled link", "Loading link"]) {
      const link = screen.getByRole("link", { name });
      expect(link).not.toHaveAttribute("href");
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveAttribute("tabindex", "-1");
    }
  });

  it("buttonStyles returns a class string", () => {
    const cls = buttonStyles({ variant: "tertiary", size: "small", className: "x" });
    expect(cls).toContain("bg-fg/5");
    expect(cls).toContain("rounded-full");
    expect(cls).toContain("h-control-sm");
    expect(cls).toContain("x");
  });
});

describe("IconButton", () => {
  it("uses the label as accessible name and hides the icon", () => {
    render(<IconButton label="Edit" icon={<svg data-testid="i" />} />);
    const button = screen.getByRole("button", { name: "Edit" });
    expect(button).toHaveAttribute("title", "Edit");
    expect(button.className).toContain("size-control-md");
  });
});

describe("Button wrap", () => {
  it("is a single-line pill by default", () => {
    render(<Button>Go</Button>);
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("whitespace-nowrap");
    expect(cls).toContain("rounded-full");
    expect(cls).toContain("h-control-md");
  });

  it("wraps onto several lines with auto height and squircle corners", () => {
    render(
      <Button wrap variant="tertiary" size="small">
        Which obligors breached the single-obligor limit this quarter?
      </Button>,
    );
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("whitespace-normal");
    expect(cls).toContain("rounded-3xl");
    expect(cls).toContain("min-h-control-sm");
    expect(cls).not.toContain("rounded-full");
    expect(cls).not.toMatch(/(^| )h-control-sm/);
    expect(buttonStyles({ wrap: true, iconOnly: true })).toContain("rounded-full");
  });
});
