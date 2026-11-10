import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Banner } from "./banner";

describe("Banner", () => {
  it("renders title and message without a dismiss button by default", () => {
    render(<Banner title="Maintenance">Scheduled downtime Saturday 02:00 WAT.</Banner>);
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("hides itself and calls onDismiss when dismissed", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Banner tone="warning" title="CBN return due" dismissible onDismiss={onDismiss}>
        Submit by Friday.
      </Banner>,
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("CBN return due")).not.toBeInTheDocument();
  });
});
