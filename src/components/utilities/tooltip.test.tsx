import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("shows on focus, links aria-describedby, hides on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Probability of default">
        <button type="button">PD</button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "PD" });
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(tip).not.toBeVisible();
    expect(button).toHaveAttribute("aria-describedby", tip.id);

    await user.tab();
    expect(button).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeVisible();
    expect(button).toHaveAccessibleDescription("Probability of default");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("tooltip", { hidden: true })).not.toBeVisible();
  });

  it("hides on blur", () => {
    render(
      <Tooltip content="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const button = screen.getByRole("button");
    fireEvent.focus(button);
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.blur(button);
    expect(screen.getByRole("tooltip", { hidden: true })).not.toBeVisible();
  });
});
