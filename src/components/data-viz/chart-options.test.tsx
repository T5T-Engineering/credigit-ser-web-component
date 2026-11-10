import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AreaChart } from "./area-chart";
import { resolveYDomain } from "./chart-utils";
import { LineChart } from "./line-chart";
import { RadarChart } from "./radar-chart";
import { ScatterChart } from "./scatter-chart";
import { WaterfallChart, waterfallAxis, computeWaterfall } from "./waterfall-chart";

describe("resolveYDomain", () => {
  it("keeps the zero-based default", () => {
    expect(resolveYDomain([12, 87])).toEqual([0, 100]);
    expect(resolveYDomain([-3, 7])).toEqual([-5, 10]);
  });

  it("uses an explicit domain and normalises its order", () => {
    expect(resolveYDomain([1, 2], [90, 110])).toEqual([90, 110]);
    expect(resolveYDomain([1, 2], [110, 90])).toEqual([90, 110]);
    expect(resolveYDomain([], [5, 5])).toEqual([5, 6]);
  });

  it("pads min/max for auto and lands on four nice intervals", () => {
    const [lo, hi] = resolveYDomain([95, 105], "auto");
    expect(lo).toBeLessThan(95);
    expect(lo).toBeGreaterThan(0);
    expect(hi).toBeGreaterThan(105);
    const step = (hi - lo) / 4;
    expect(Number.isInteger(lo / step)).toBe(true);
    // Never crosses 0 just because of padding.
    expect(resolveYDomain([0.5, 40], "auto")[0]).toBe(0);
  });
});

const months = ["Jan", "Feb", "Mar"];
const pts = (ys: number[]) => ys.map((y, i) => ({ x: months[i] ?? String(i), y }));

describe("LineChart options", () => {
  it("plots against yDomain and draws reference lines", () => {
    const { container } = render(
      <LineChart
        series={[{ name: "CAR", points: pts([15, 16, 17]) }]}
        yDomain={[10, 20]}
        referenceLines={[{ value: 15, label: "Regulatory minimum", tone: "danger" }]}
      />,
    );
    // Tick labels follow the domain (10 … 20), not 0.
    expect(screen.getAllByText("10").length).toBeGreaterThan(0);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    const ref = container.querySelector<HTMLElement>("[data-reference-line='15']");
    expect(ref?.style.top).toBe("50%");
    expect(screen.getByText("Regulatory minimum")).toBeInTheDocument();
  });

  it("supports a secondary right axis with its own domain and formatter", () => {
    const { container } = render(
      <LineChart
        label="Loans and NPL"
        series={[
          { name: "Loans", points: pts([100, 200, 300]) },
          { name: "NPL ratio", points: pts([2, 4, 6]), axis: "right" },
        ]}
        yDomainRight={[0, 8]}
        yFormatterRight={(v) => `${v}%`}
      />,
    );
    expect(container.querySelector("[data-axis-column='right']")).toHaveTextContent("8%");
    expect(container.querySelector("polyline[data-axis='right']")).toBeInTheDocument();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("NPL ratio (right axis): Jan 2%");
    expect(screen.getByRole("table")).toHaveTextContent("6%");
  });

  it("renders no right axis by default", () => {
    const { container } = render(<LineChart series={[{ name: "A", points: pts([1, 2, 3]) }]} />);
    expect(container.querySelector("[data-axis-column='right']")).not.toBeInTheDocument();
  });
});

describe("AreaChart options", () => {
  it("accepts yDomain auto and reference lines", () => {
    const { container } = render(
      <AreaChart series={[{ name: "Deposits", points: pts([980, 1000, 1020]) }]} yDomain="auto" referenceLines={[{ value: 1000, label: "Budget" }]} />,
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(container.querySelector("[data-reference-line='1000']")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
  });
});

describe("WaterfallChart baseline", () => {
  const steps = [
    { label: "Opening", value: 1000, type: "start" as const },
    { label: "New", value: 40 },
    { label: "Repaid", value: -25 },
    { label: "Closing", type: "total" as const },
  ];

  it("computes a broken axis for auto and numeric baselines", () => {
    const bars = computeWaterfall(steps);
    const auto = waterfallAxis(bars, "auto");
    expect(auto).not.toBeNull();
    expect(auto!.min).toBeGreaterThan(0);
    expect(auto!.min).toBeLessThanOrEqual(1000);
    expect(auto!.max).toBeGreaterThanOrEqual(1040);
    expect(waterfallAxis(bars, 900)).toMatchObject({ min: 900 });
    expect(waterfallAxis(bars, 0)).toBeNull();
  });

  it("truncates start/total bars and shows the axis-break note", () => {
    const { container } = render(<WaterfallChart steps={steps} baseline={900} />);
    expect(container.querySelectorAll("[data-truncated]")).toHaveLength(2);
    expect(container.querySelector("[data-axis-break]")).toHaveTextContent("Axis starts at 900");
    // Delta keeps a visible height relative to the 900 baseline.
    const up = container.querySelector<HTMLElement>('[data-from="1000"][data-to="1040"]');
    expect(parseFloat(up!.style.height)).toBeGreaterThan(10);
  });

  it("keeps the zero baseline by default", () => {
    const { container } = render(<WaterfallChart steps={steps} />);
    expect(container.querySelector("[data-truncated]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-axis-break]")).not.toBeInTheDocument();
  });
});

describe("ScatterChart quadrants, vector and per-point labels", () => {
  it("draws quadrant lines with corner labels, a vector and only chosen labels", () => {
    const { container } = render(
      <ScatterChart
        label="360 RAR"
        xDomain={[0, 100]}
        yDomain={[0, 100]}
        quadrants={{ x: 50, y: 50, labels: ["Grow", "Invest", "Exit", "Harvest"] }}
        vector={{ from: { x: 20, y: 30 }, to: { x: 70, y: 80 }, label: "Strategic thrust" }}
        series={[
          {
            name: "Obligors",
            points: [
              { x: 10, y: 10, label: "Acme", showLabel: true },
              { x: 60, y: 60, label: "Beta" },
            ],
          },
        ]}
      />,
    );
    expect(container.querySelector<HTMLElement>("[data-quadrant='x']")?.style.left).toBe("50%");
    const plot = within(screen.getByRole("img"));
    for (const text of ["Grow", "Invest", "Exit", "Harvest", "Strategic thrust", "Acme"]) expect(plot.getByText(text)).toBeInTheDocument();
    // Beta is not printed on the plot but keeps its tooltip (and its row in the data table).
    expect(plot.queryByText("Beta")).not.toBeInTheDocument();
    expect(container.querySelector('[title^="Beta:"]')).toBeInTheDocument();
    const line = container.querySelector("[data-vector] line");
    expect(line?.getAttribute("x1")).toBe("20%");
    expect(line?.getAttribute("y2")).toBe("20%");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Strategic thrust from (20, 30) to (70, 80)");
  });

  it("showLabel: false hides a label even when showLabels is on", () => {
    render(
      <ScatterChart
        showLabels
        series={[{ name: "S", points: [{ x: 1, y: 1, label: "Shown" }, { x: 2, y: 2, label: "Hidden", showLabel: false }] }]}
      />,
    );
    const plot = within(screen.getByRole("img"));
    expect(plot.getByText("Shown")).toBeInTheDocument();
    expect(plot.queryByText("Hidden")).not.toBeInTheDocument();
  });
});

describe("RadarChart labelSize", () => {
  const axes = [
    { key: "a", label: "North" },
    { key: "b", label: "East" },
    { key: "c", label: "South" },
  ];
  const series = [{ name: "S", values: { a: 50, b: 60, c: 70 } }];
  const fontOf = (container: HTMLElement) => Number(container.querySelector("text.font-display")?.getAttribute("font-size"));

  it("enlarges axis labels and widens the viewBox", () => {
    const small = render(<RadarChart axes={axes} series={series} />);
    const smallFont = fontOf(small.container);
    const smallBox = small.container.querySelector("svg")?.getAttribute("viewBox");
    small.unmount();
    const large = render(<RadarChart axes={axes} series={series} labelSize="large" />);
    expect(fontOf(large.container)).toBeCloseTo(smallFont * 1.6, 1);
    expect(large.container.querySelector("svg")?.getAttribute("viewBox")).not.toBe(smallBox);
  });
});
