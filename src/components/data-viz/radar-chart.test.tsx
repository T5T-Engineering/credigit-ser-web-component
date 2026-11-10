import { render, screen } from "@testing-library/react";

import { RadarChart, radarPoint } from "./radar-chart";

const axes = [
  { key: "internal", label: "Internal Risk Assessment" },
  { key: "industry", label: "Operating Industry Assessment" },
  { key: "macro", label: "Macro-Economic Assessment" },
  { key: "comparative", label: "Comparative Assessment" },
];

describe("radarPoint", () => {
  it("places axis 0 at 12 o'clock and goes clockwise", () => {
    expect(radarPoint(0, 4, 50, 100, 100, 200, 200)).toEqual({ x: 200, y: 150 });
    expect(radarPoint(1, 4, 100, 100, 100, 200, 200)).toEqual({ x: 300, y: 200 });
    expect(radarPoint(2, 4, 25, 100, 100, 200, 200)).toEqual({ x: 200, y: 225 });
    expect(radarPoint(3, 4, 100, 100, 100, 200, 200)).toEqual({ x: 100, y: 200 });
  });

  it("clamps values outside 0..max", () => {
    expect(radarPoint(0, 4, 150, 100, 100, 0, 0)).toEqual({ x: 0, y: -100 });
    expect(radarPoint(0, 4, -20, 100, 100, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("RadarChart", () => {
  const series = [{ name: "Obligor", values: { internal: 8, industry: 10, macro: 2.5, comparative: 0 } }];

  it("renders vertices at the expected positions", () => {
    const { container } = render(<RadarChart axes={axes} series={series} max={10} size={320} />);
    // size 320 -> radius 160, padX 115.2, padY 48 -> centre (275.2, 208)
    const dot = (key: string) => container.querySelector(`circle[data-axis="${key}"]`)!;
    expect(dot("internal").getAttribute("cx")).toBe("275.2");
    expect(dot("internal").getAttribute("cy")).toBe("80"); // 208 - 160 * 0.8
    expect(dot("industry").getAttribute("cx")).toBe("435.2");
    expect(dot("industry").getAttribute("cy")).toBe("208");
    expect(dot("macro").getAttribute("cy")).toBe("248");
    expect(dot("comparative").getAttribute("cx")).toBe("275.2");
  });

  it("exposes an accessible name and a data table", () => {
    render(<RadarChart axes={axes} series={series} max={10} label="360 RAR for Acme Ltd" />);
    expect(screen.getByRole("img", { name: "360 RAR for Acme Ltd" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "360 RAR for Acme Ltd" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Obligor" })).toBeInTheDocument();
  });

  it("builds a default label from series and axes", () => {
    render(<RadarChart axes={axes} series={series} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/Obligor across 4 axes: Internal Risk Assessment/);
  });
});
