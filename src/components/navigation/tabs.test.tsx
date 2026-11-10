import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Tabs } from "./tabs";

const items = [
  { id: "credit", label: "Credit", content: "Credit panel" },
  { id: "market", label: "Market", content: "Market panel", disabled: true },
  { id: "ops", label: "Operational", content: "Ops panel" },
  { id: "liq", label: "Liquidity", content: "Liquidity panel" },
];

describe("Tabs", () => {
  it("wires tab/tabpanel ARIA and shows the first enabled tab", () => {
    render(<Tabs items={items} label="Risk areas" />);
    const tablist = screen.getByRole("tablist", { name: "Risk areas" });
    expect(tablist).toBeInTheDocument();
    const credit = screen.getByRole("tab", { name: "Credit" });
    expect(credit).toHaveAttribute("aria-selected", "true");
    expect(credit).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Operational" })).toHaveAttribute("tabindex", "-1");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Credit panel");
    expect(panel).toHaveAttribute("aria-labelledby", credit.id);
    expect(credit).toHaveAttribute("aria-controls", panel.id);
  });

  it("moves with arrow keys (skipping disabled, wrapping) and Home/End", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Credit" }));

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Operational" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Operational" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Ops panel");
    expect(onValueChange).toHaveBeenLastCalledWith("ops");

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Liquidity" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Credit" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Liquidity" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Credit" })).toHaveFocus();
  });

  it("supports controlled value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs items={items} value="liq" onValueChange={onValueChange} />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Liquidity panel");
    await user.click(screen.getByRole("tab", { name: "Credit" }));
    expect(onValueChange).toHaveBeenCalledWith("credit");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Liquidity panel");
  });
});
