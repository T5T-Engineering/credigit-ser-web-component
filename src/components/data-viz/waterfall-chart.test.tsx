import { render, screen } from "@testing-library/react";

import { computeWaterfall, WaterfallChart } from "./waterfall-chart";

const steps = [
  { label: "Opening ECL", value: 100, type: "start" as const },
  { label: "New loans", value: 40 },
  { label: "Repayments", value: -25 },
  { label: "Stage transfers", value: 15 },
  { label: "Closing ECL", type: "total" as const },
];

describe("computeWaterfall", () => {
  it("computes floating bars and running totals", () => {
    const bars = computeWaterfall(steps);
    expect(bars.map((b) => [b.from, b.to])).toEqual([
      [0, 100],
      [100, 140],
      [140, 115],
      [115, 130],
      [0, 130],
    ]);
    expect(bars.map((b) => b.running)).toEqual([100, 140, 115, 130, 130]);
    expect(bars[2]?.direction).toBe("down");
    expect(bars[1]?.direction).toBe("up");
    expect(bars[4]?.value).toBe(130);
  });

  it("uses an explicit total value and resets the running total", () => {
    const bars = computeWaterfall([
      { label: "A", value: 10, type: "start" },
      { label: "B", value: 5 },
      { label: "Sub", value: 20, type: "total" },
      { label: "C", value: -3 },
    ]);
    expect(bars[2]?.to).toBe(20);
    expect(bars[3]).toMatchObject({ from: 20, to: 17, running: 17 });
  });

  it("handles negative running totals", () => {
    const bars = computeWaterfall([{ label: "A", value: -10 }, { label: "T", type: "total" }]);
    expect(bars[0]).toMatchObject({ from: 0, to: -10 });
    expect(bars[1]?.value).toBe(-10);
  });
});

describe("WaterfallChart", () => {
  it("renders an accessible summary and data table with totals", () => {
    render(<WaterfallChart steps={steps} label="ECL movement" increaseIntent="negative" />);
    const img = screen.getByRole("img", { name: /ECL movement/ });
    expect(img.getAttribute("aria-label")).toContain("New loans: +40 (running 140)");
    expect(img.getAttribute("aria-label")).toContain("Closing ECL: 130");
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Closing ECL");
    expect(table).toHaveTextContent("115");
  });

  it("colours increases by intent", () => {
    const { container } = render(<WaterfallChart steps={steps} increaseIntent="negative" />);
    const up = container.querySelector('[data-from="100"][data-to="140"]') as HTMLElement;
    const down = container.querySelector('[data-from="140"][data-to="115"]') as HTMLElement;
    expect(up.style.backgroundColor).toBe("var(--cg-danger)");
    expect(down.style.backgroundColor).toBe("var(--cg-success)");
  });
});
