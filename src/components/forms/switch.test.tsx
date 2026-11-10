import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./index";

describe("Switch", () => {
  it("toggles uncontrolled with click and keyboard", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Email alerts" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch", { name: "Email alerts" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenNthCalledWith(1, true);
    expect(onCheckedChange).toHaveBeenNthCalledWith(2, false);
  });

  it("respects the controlled value and disabled state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Switch label="2FA" checked onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch", { name: "2FA" });
    await user.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    rerender(<Switch label="2FA" checked={false} disabled onCheckedChange={onCheckedChange} />);
    await user.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });
});
