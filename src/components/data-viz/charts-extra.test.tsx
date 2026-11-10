import { render, screen } from "@testing-library/react";

import { AreaChart } from "./area-chart";
import { MiniBarList } from "./mini-bar-list";
import { ScatterChart } from "./scatter-chart";
import { StackedBarChart } from "./stacked-bar-chart";

describe("StackedBarChart", () => {
  const props = {
    categories: ["Q1", "Q2"],
    series: [
      { name: "Stage 1", values: [10, 20] },
      { name: "Stage 2", values: [5, 0] },
    ],
  };

  it("renders segments, totals and an accessible summary", () => {
    const { container } = render(<StackedBarChart {...props} label="Loans by stage" showTotals />);
    expect(screen.getByRole("img", { name: /Loans by stage\. Q1: Stage 1 10, Stage 2 5/ })).toBeInTheDocument();
    // Zero-value segments are not drawn in stacked mode.
    expect(container.querySelectorAll("[data-value]")).toHaveLength(3);
    expect(screen.getByRole("table")).toHaveTextContent("Total");
    expect(screen.getAllByText("15").length).toBeGreaterThan(0);
  });

  it("renders grouped horizontal bars", () => {
    const { container } = render(<StackedBarChart {...props} mode="grouped" orientation="horizontal" />);
    expect(container.querySelectorAll("[data-value]")).toHaveLength(4);
    expect(container.querySelector("figcaption")).toHaveTextContent("Stage 2");
  });
});

describe("AreaChart", () => {
  it("draws one area per series and stacks cumulatively", () => {
    const series = [
      { name: "A", points: [{ x: "Jan", y: 1 }, { x: "Feb", y: 2 }] },
      { name: "B", points: [{ x: "Jan", y: 3 }, { x: "Feb", y: 3 }] },
    ];
    const { container } = render(<AreaChart series={series} stacked label="Deposits" />);
    expect(container.querySelectorAll("polygon")).toHaveLength(2);
    expect(screen.getByRole("img", { name: /Deposits\. A: Jan 1, Feb 2\. B: Jan 3, Feb 3/ })).toBeInTheDocument();
  });
});

describe("ScatterChart", () => {
  it("renders points, scales bubbles by sqrt and labels the axes", () => {
    const { container } = render(
      <ScatterChart
        series={[
          {
            name: "Obligors",
            points: [
              { x: 10, y: 5, size: 100, label: "Acme" },
              { x: 20, y: 15, size: 25, label: "Beta" },
            ],
          },
        ]}
        xLabel="Capital"
        yLabel="RAROC"
        referenceLines={[{ axis: "y", value: 12, label: "Hurdle" }]}
      />,
    );
    const marks = container.querySelectorAll<HTMLElement>("[data-series]");
    expect(marks).toHaveLength(2);
    // Radius = 6 + sqrt(size / max) × 20 → 26px and 16px.
    expect(marks[0]?.style.width).toBe("52px");
    expect(marks[1]?.style.width).toBe("32px");
    expect(screen.getByText("Hurdle")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("RAROC");
  });
});

describe("MiniBarList", () => {
  it("ranks, limits and links items", () => {
    render(
      <MiniBarList
        label="Top obligors"
        limit={2}
        items={[
          { label: "Small", value: 1 },
          { label: "Big", value: 10, href: "/obligors/big" },
          { label: "Mid", value: 5 },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Top obligors" });
    const rows = list.querySelectorAll("li");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Big");
    expect(screen.getByRole("link", { name: "Big" })).toHaveAttribute("href", "/obligors/big");
    expect(screen.queryByText("Small")).not.toBeInTheDocument();
  });
});
