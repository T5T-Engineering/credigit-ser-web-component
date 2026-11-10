import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CodeInput, StepUpAuthDialog } from "./step-up-auth-dialog";
import { polyfillDialog } from "./test-utils";

beforeAll(polyfillDialog);

function Harness(props: { onVerify: (c: string) => Promise<boolean>; onResend?: () => void; autoSubmit?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <StepUpAuthDialog open={open} onOpenChange={setOpen} resendCooldown={0} {...props} />
      <p>{open ? "dialog-open" : "dialog-closed"}</p>
    </>
  );
}

function Controlled() {
  const [v, setV] = useState("");
  return (
    <>
      <CodeInput value={v} onChange={setV} />
      <output>{v}</output>
    </>
  );
}

describe("CodeInput", () => {
  it("types digits across boxes, ignores letters and handles Backspace", async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const boxes = screen.getAllByRole("textbox");
    expect(boxes).toHaveLength(6);
    await user.click(boxes[0]!);
    await user.keyboard("12a3");
    expect(document.querySelector("output")).toHaveTextContent(/^123$/);
    expect(boxes[3]).toHaveFocus();
    await user.keyboard("{Backspace}");
    expect(document.querySelector("output")).toHaveTextContent(/^12$/);
    expect(boxes[2]).toHaveFocus();
  });
});

describe("StepUpAuthDialog", () => {
  it("accepts a pasted code and verifies automatically", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn().mockResolvedValue(true);
    render(<Harness onVerify={onVerify} />);
    const boxes = screen.getAllByRole("textbox");
    await user.click(boxes[0]!);
    await user.paste("48 21-09");
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("482109"));
    await waitFor(() => expect(screen.getByText("dialog-closed")).toBeInTheDocument());
  });

  it("shows an error and clears the boxes when verification fails", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn().mockResolvedValue(false);
    render(<Harness onVerify={onVerify} autoSubmit={false} />);
    const boxes = screen.getAllByRole("textbox");
    await user.click(boxes[0]!);
    await user.keyboard("111111");
    await user.click(screen.getByRole("button", { name: "Verify" }));
    expect(await screen.findByText(/incorrect or has expired/)).toBeInTheDocument();
    expect(boxes[0]).toHaveValue("");
    expect(boxes[0]).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("dialog-open")).toBeInTheDocument();
  });

  it("resends the code", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    render(<Harness onVerify={async () => true} onResend={onResend} />);
    await user.click(screen.getByRole("button", { name: "Resend code" }));
    expect(onResend).toHaveBeenCalled();
    expect(await screen.findByText("A new code has been sent.")).toBeInTheDocument();
  });
});

describe("StepUpAuthDialog callback order", () => {
  it("calls onVerified before onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(<StepUpAuthDialog open onOpenChange={(o) => calls.push(`open:${o}`)} onVerify={async () => true} onVerified={() => calls.push("verified")} resendCooldown={0} />);
    await user.click(screen.getAllByRole("textbox")[0]!);
    await user.keyboard("123456");
    await waitFor(() => expect(calls).toContain("verified"));
    expect(calls.indexOf("verified")).toBeLessThan(calls.indexOf("open:false"));
  });
});
