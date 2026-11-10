import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { Drawer } from "./drawer";
import { Modal } from "./modal";

// jsdom lacks HTMLDialogElement.showModal / close.
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

function Harness({ kind = "modal" }: { kind?: "modal" | "drawer" }) {
  const [open, setOpen] = useState(false);
  const Dialog = kind === "modal" ? Modal : Drawer;
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Approve facility"
        description="Confirm the credit decision."
        footer={<button onClick={() => setOpen(false)}>Confirm</button>}
      >
        <input aria-label="Comment" />
      </Dialog>
    </>
  );
}

describe("Modal", () => {
  it("opens with accessible name/description and focuses the first body control", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog", { name: "Approve facility" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("Confirm the credit decision.");
    expect(screen.getByRole("textbox", { name: "Comment" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it("closes via the close button and returns focus", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it("traps Tab within the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    screen.getByRole("button", { name: "Confirm" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();
  });
});

describe("Drawer", () => {
  it("closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<Harness kind="drawer" />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Approve facility" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });
});
