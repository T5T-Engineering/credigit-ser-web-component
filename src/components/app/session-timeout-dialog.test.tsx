import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { formatCountdown, SessionTimeoutDialog } from "./session-timeout-dialog";
import { polyfillDialog } from "./test-utils";

beforeAll(polyfillDialog);
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("formatCountdown", () => {
  it("formats mm:ss and clamps at zero", () => {
    expect(formatCountdown(125)).toBe("02:05");
    expect(formatCountdown(0.2)).toBe("00:01");
    expect(formatCountdown(-5)).toBe("00:00");
  });
});

describe("SessionTimeoutDialog", () => {
  it("counts down and fires onTimeout once at zero", () => {
    const onTimeout = vi.fn();
    const onSignOut = vi.fn();
    render(<SessionTimeoutDialog open secondsRemaining={3} onStaySignedIn={vi.fn()} onSignOut={onSignOut} onTimeout={onTimeout} />);
    expect(screen.getByRole("timer")).toHaveTextContent("00:03");
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    act(() => vi.advanceTimersByTime(3000));
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("defaults the timeout action to sign out and wires the buttons", () => {
    const onStaySignedIn = vi.fn();
    const onSignOut = vi.fn();
    render(<SessionTimeoutDialog open secondsRemaining={60} onStaySignedIn={onStaySignedIn} onSignOut={onSignOut} />);
    expect(screen.getByText("60 seconds remaining")).toBeInTheDocument();
    act(() => screen.getAllByRole("button", { name: "Stay signed in" }).at(-1)!.click());
    expect(onStaySignedIn).toHaveBeenCalled();
    act(() => screen.getByRole("button", { name: "Sign out" }).click());
    expect(onSignOut).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(61_000));
    expect(onSignOut).toHaveBeenCalledTimes(2);
  });
});
