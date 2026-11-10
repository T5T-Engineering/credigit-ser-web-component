import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toaster, dismissToast, useToast } from "./toast";

function Trigger() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: "Report exported", description: "PAR30 report is ready.", tone: "success" })}>
      Notify
    </button>
  );
}

afterEach(() => {
  act(() => dismissToast());
  vi.useRealTimers();
});

describe("Toaster / useToast", () => {
  it("renders toasts in a polite live region", () => {
    render(
      <>
        <Toaster />
        <Trigger />
      </>,
    );
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Notify" }).click());
    expect(screen.getByText("Report exported")).toBeInTheDocument();
    expect(screen.getByText("PAR30 report is ready.")).toBeInTheDocument();
  });

  it("auto-dismisses after the default duration", () => {
    vi.useFakeTimers();
    render(
      <>
        <Toaster />
        <Trigger />
      </>,
    );
    act(() => screen.getByRole("button", { name: "Notify" }).click());
    act(() => vi.advanceTimersByTime(4900));
    expect(screen.getByText("Report exported")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText("Report exported")).not.toBeInTheDocument();
  });

  it("persists with Infinity duration and can be dismissed manually", () => {
    vi.useFakeTimers();
    function Sticky() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: "Sync failed", tone: "danger", duration: Infinity })}>Fail</button>;
    }
    render(
      <>
        <Toaster />
        <Sticky />
      </>,
    );
    act(() => screen.getByRole("button", { name: "Fail" }).click());
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Sync failed")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Dismiss notification" }).click());
    expect(screen.queryByText("Sync failed")).not.toBeInTheDocument();
  });
});
