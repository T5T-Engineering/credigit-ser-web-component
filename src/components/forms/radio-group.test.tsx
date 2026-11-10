import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field, RadioGroup } from "./index";

describe("RadioGroup", () => {
  const options = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly", disabled: true },
    { value: "monthly", label: "Monthly" },
  ];

  it("moves selection with arrow keys, skipping disabled options and wrapping", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup label="Repayment frequency" options={options} defaultValue="daily" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Repayment frequency" })).toBeInTheDocument();
    const daily = screen.getByRole("radio", { name: "Daily" });
    const monthly = screen.getByRole("radio", { name: "Monthly" });
    expect(daily).toHaveAttribute("tabindex", "0");
    expect(monthly).toHaveAttribute("tabindex", "-1");

    daily.focus();
    await user.keyboard("{ArrowDown}");
    expect(monthly).toBeChecked();
    expect(monthly).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("monthly");

    await user.keyboard("{ArrowDown}");
    expect(daily).toBeChecked();
    expect(daily).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(monthly).toBeChecked();
  });

  it("works controlled and takes its name and error from a Field", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("daily");
      return (
        <Field label="Frequency" error="Pick one">
          <RadioGroup options={options} value={value} onChange={setValue} />
        </Field>
      );
    }
    render(<Controlled />);
    const group = screen.getByRole("radiogroup", { name: "Frequency" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick one");
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
  });
});
