import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeatureRow } from "./feature-row";

describe("FeatureRow", () => {
  it("renders text before media in DOM order and a heading", () => {
    const { container } = render(
      <FeatureRow title="Early warning" description="Spot risk early." media={<img alt="Chart" src="x.png" />} />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Early warning" })).toBeInTheDocument();
    const heading = screen.getByRole("heading");
    const media = container.querySelector("[data-feature-media]")!;
    expect(heading.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(media.className).toContain("bg-surface-sunken");
    expect(media.className).not.toContain("lg:order-first");
  });

  it("moves media to the start on wide screens when reversed and supports frames and heading level", () => {
    const { container } = render(
      <FeatureRow title="Row" titleAs="h2" reverse mediaFrame="raised" media={<div>Visual</div>}>
        <p>Extra</p>
      </FeatureRow>,
    );
    const media = container.querySelector("[data-feature-media]")!;
    expect(media.className).toContain("lg:order-first");
    expect(media.className).toContain("bg-surface");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Row");
    expect(screen.getByText("Extra")).toBeInTheDocument();
  });

  it("renders no frame fill with mediaFrame none", () => {
    const { container } = render(<FeatureRow title="Row" mediaFrame="none" media={<div>Visual</div>} />);
    expect(container.querySelector("[data-feature-media]")!.className).not.toMatch(/bg-surface/);
  });
});
