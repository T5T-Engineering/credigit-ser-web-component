import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { squarify, Treemap } from "./treemap";

const items = [
  { label: "Oil and gas", value: 600 },
  { label: "Manufacturing", value: 600 },
  { label: "Trade", value: 400 },
  { label: "Agriculture", value: 300 },
  { label: "Real estate", value: 200 },
  { label: "ICT", value: 100 },
  { label: "Zero", value: 0 },
];

const W = 600;
const H = 400;

describe("squarify", () => {
  const rects = squarify(items, W, H);

  it("skips non-positive items and sorts largest first", () => {
    expect(rects).toHaveLength(6);
    expect(rects.map((r) => r.item.value)).toEqual([600, 600, 400, 300, 200, 100]);
  });

  it("gives each tile an area proportional to its value and tiles the whole box", () => {
    const total = 2200;
    for (const r of rects) expect(r.width * r.height).toBeCloseTo((r.item.value / total) * W * H, 6);
    expect(rects.reduce((a, r) => a + r.width * r.height, 0)).toBeCloseTo(W * H, 6);
  });

  it("keeps rects within bounds and non-overlapping", () => {
    const eps = 1e-6;
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-eps);
      expect(r.y).toBeGreaterThanOrEqual(-eps);
      expect(r.x + r.width).toBeLessThanOrEqual(W + eps);
      expect(r.y + r.height).toBeLessThanOrEqual(H + eps);
    }
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]!;
        const b = rects[j]!;
        const ox = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        expect(ox <= eps || oy <= eps).toBe(true);
      }
  });

  it("produces reasonably square tiles", () => {
    for (const r of rects) expect(Math.max(r.width / r.height, r.height / r.width)).toBeLessThan(4);
  });

  it("returns nothing for empty input", () => {
    expect(squarify([], 10, 10)).toEqual([]);
    expect(squarify([{ value: 0 }], 10, 10)).toEqual([]);
  });
});

describe("Treemap", () => {
  it("renders an accessible summary and table", () => {
    render(<Treemap items={items} label="Exposure by sector" />);
    expect(screen.getByRole("img", { name: /Exposure by sector\. Oil and gas: 600 \(27\.3%\)/ })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("Agriculture");
  });

  it("calls onItemClick from tile buttons", async () => {
    const onItemClick = vi.fn();
    render(<Treemap items={items} onItemClick={onItemClick} />);
    await userEvent.click(screen.getByRole("button", { name: /^Trade:/ }));
    expect(onItemClick).toHaveBeenCalledWith(items[2], 2);
  });
});
