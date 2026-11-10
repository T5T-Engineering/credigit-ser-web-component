import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "./chip";
import { resolveStatusTone, riskStatusTones, StatusBadge } from "./status-badge";
import { toneStyles } from "./tone";

describe("StatusBadge", () => {
  it("formats the status as the label", () => {
    render(<StatusBadge status="PENDING_APPROVAL" tones={riskStatusTones} />);
    const badge = screen.getByText("PENDING APPROVAL");
    expect(badge.className).toContain("bg-info-soft");
  });

  it("defaults to neutral when no mapping matches", () => {
    render(<StatusBadge status="SOMETHING_ELSE" />);
    expect(screen.getByText("SOMETHING ELSE").className).toContain(toneStyles.neutral.soft.split(" ")[0]);
  });

  it("uses a custom label and tone map", () => {
    render(<StatusBadge status="lost" tones={riskStatusTones} label="Written off" variant="solid" />);
    const badge = screen.getByText("Written off");
    expect(badge.className).toContain("bg-danger");
    expect(badge).toHaveAttribute("data-status", "lost");
  });

  it("resolves tones exactly, then case-insensitively", () => {
    expect(resolveStatusTone("DISBURSED", riskStatusTones)).toBe("brand");
    expect(resolveStatusTone("watchlist", riskStatusTones)).toBe("warning");
    expect(resolveStatusTone("UNKNOWN", riskStatusTones)).toBe("neutral");
  });
});

describe("Chip", () => {
  it("calls onRemove from an accessible remove button", async () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>Lagos</Chip>);
    await userEvent.click(screen.getByRole("button", { name: "Remove Lagos" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
