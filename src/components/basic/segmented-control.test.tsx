import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl, type SegmentedControlOption } from "./segmented-control";

type Period = "day" | "week" | "month" | "year";

const options: SegmentedControlOption<Period>[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
  { value: "year", label: "Year" },
];

function Controlled({ onChange }: { onChange?: (v: Period) => void }) {
  const [value, setValue] = useState<Period>("day");
  return (
    <SegmentedControl
      label="Period"
      options={options}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("exposes a labelled radiogroup with one checked radio", () => {
    render(<Controlled />);
    expect(screen.getByRole("radiogroup", { name: "Period" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "false");
  });

  it("uses roving tabindex: only the selected radio is tabbable", async () => {
    render(<Controlled />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects with clicks", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Year" }));
    expect(onChange).toHaveBeenCalledWith("year");
    expect(screen.getByRole("radio", { name: "Year" })).toHaveAttribute("aria-checked", "true");
  });

  it("moves and selects with arrow keys, skipping disabled options and wrapping", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Week" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{ArrowRight}"); // skips disabled "Month"
    expect(screen.getByRole("radio", { name: "Year" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}"); // wraps to start
    expect(screen.getByRole("radio", { name: "Day" })).toHaveFocus();

    await userEvent.keyboard("{ArrowLeft}"); // wraps to end
    expect(screen.getByRole("radio", { name: "Year" })).toHaveAttribute("aria-checked", "true");

    expect(onChange.mock.calls.map((c) => c[0])).toEqual(["week", "year", "day", "year"]);
  });

  it("supports Home and End", async () => {
    render(<Controlled />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Year" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true");
  });

  it("does not select disabled options", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Month" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
