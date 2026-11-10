import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { Hero } from "./hero";
import { Teaser } from "./teaser";

describe("block style props", () => {
  it("Card radius maps to Bolt surface radii (default medium)", () => {
    const { rerender } = render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId("c").className).toContain("rounded-3xl");
    rerender(<Card data-testid="c" radius="large">x</Card>);
    expect(screen.getByTestId("c").className).toContain("rounded-4xl");
    rerender(<Card data-testid="c" radius="xlarge">x</Card>);
    expect(screen.getByTestId("c").className).toContain("rounded-5xl");
  });

  it("Teaser surface switches between sunken (default) and raised panels", () => {
    const { rerender } = render(<Teaser data-testid="t" title="T" />);
    expect(screen.getByTestId("t").className).toContain("bg-surface-sunken");
    rerender(<Teaser data-testid="t" title="T" surface="raised" />);
    expect(screen.getByTestId("t").className).not.toContain("bg-surface-sunken");
    expect(screen.getByTestId("t").className).toContain("bg-surface");
  });

  it("Hero mediaFrame sunken adds a padded frame around media", () => {
    const { rerender } = render(<Hero title="H" media={<img alt="m" src="m.png" />} />);
    expect(screen.getByAltText("m").parentElement!.className).toContain("rounded-4xl");
    rerender(<Hero title="H" mediaFrame="sunken" media={<img alt="m" src="m.png" />} />);
    const frame = screen.getByAltText("m").parentElement!.parentElement!;
    expect(frame.className).toContain("bg-surface-sunken");
    expect(frame.className).toMatch(/\bp-3\b/);
  });

  it("Alert inherits the surrounding surface theme (no pinned light theme)", () => {
    render(
      <div data-cg-theme="dark">
        <Alert title="Heads up">Body</Alert>
      </div>,
    );
    expect(screen.getByRole("status")).not.toHaveAttribute("data-cg-theme");
  });
});

describe("CardHeader layout", () => {
  it("row (default) keeps children side by side", () => {
    render(
      <CardHeader data-testid="h">
        <CardTitle>Title</CardTitle>
      </CardHeader>,
    );
    const header = screen.getByTestId("h");
    expect(header).not.toHaveAttribute("data-layout");
    expect(header.firstElementChild?.tagName).toBe("H3");
  });

  it("stack puts title above description and actions on the right", () => {
    render(
      <CardHeader data-testid="h" layout="stack" actions={<button type="button">Export</button>}>
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>By sector</CardDescription>
      </CardHeader>,
    );
    const header = screen.getByTestId("h");
    expect(header).toHaveAttribute("data-layout", "stack");
    const [text, actions] = Array.from(header.children);
    expect(text?.className).toContain("flex-col");
    expect(text).toHaveTextContent("PortfolioBy sector");
    expect(actions).toContainElement(screen.getByRole("button", { name: "Export" }));
  });
});
