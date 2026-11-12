import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

function Harness(props: Partial<ConfirmDialogProps>) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <span>{open ? "is-open" : "is-closed"}</span>
      <ConfirmDialog open={open} onOpenChange={setOpen} title="Lock user" onConfirm={() => undefined} {...props} />
    </>
  );
}

describe("ConfirmDialog", () => {
  it("confirms without a reason field and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} confirmLabel="Lock" />);
    expect(screen.queryByLabelText(/Reason/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Lock" }));
    expect(onConfirm).toHaveBeenCalledWith("");
    expect(screen.getByText("is-closed")).toBeInTheDocument();
  });

  it("requires a reason and enforces the minimum length", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} reason="required" minReasonLength={10} tone="danger" />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText("Enter a reason.")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Reason/), "short");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByText("Enter at least 10 characters.")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Reason/), " but now long enough ");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith("short but now long enough");
  });

  it("allows an empty optional reason", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} reason="optional" />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith("");
  });

  it("stays open when onConfirm returns false or throws", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(r: string) => Promise<boolean>>().mockResolvedValueOnce(false).mockRejectedValueOnce(new Error("Account already locked."));
    render(<Harness onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByText("is-open")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(await screen.findByText("Account already locked.")).toBeInTheDocument();
    expect(screen.getByText("is-open")).toBeInTheDocument();
  });
});
