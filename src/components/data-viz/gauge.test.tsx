import { render, screen } from "@testing-library/react";

import { Gauge, gaugeRatio } from "./gauge";

describe("Gauge", () => {
  it("clamps the ratio", () => {
    expect(gaugeRatio(150, 0, 100)).toBe(1);
    expect(gaugeRatio(-10, 0, 100)).toBe(0);
    expect(gaugeRatio(25, 0, 50)).toBe(0.5);
    expect(gaugeRatio(5, 10, 10)).toBe(0);
  });

  it("clamps the displayed value above max and below min", () => {
    const { rerender } = render(<Gauge value={150} label="Risk score" />);
    expect(screen.getByRole("img", { name: "Risk score: 100 (range 0 to 100)" })).toBeInTheDocument();
    rerender(<Gauge value={-5} min={0} max={10} label="Risk score" />);
    expect(screen.getByRole("img", { name: "Risk score: 0 (range 0 to 10)" })).toBeInTheDocument();
  });
});
