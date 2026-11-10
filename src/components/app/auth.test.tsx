import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthCard } from "./auth-card";
import { OtpVerification } from "./otp-verification";
import { RolePicker } from "./role-picker";

describe("AuthCard", () => {
  it("renders title, back link and footer", () => {
    render(<AuthCard title="Reset password" back={{ label: "Back to sign in", href: "/login" }} footer="Need help?" />);
    expect(screen.getByRole("heading", { name: "Reset password" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to sign in/ })).toHaveAttribute("href", "/login");
  });
});

describe("OtpVerification", () => {
  it("verifies a complete code and shows an error when rejected", async () => {
    const onVerify = vi.fn(async (code: string) => code === "123456");
    render(<OtpVerification onVerify={onVerify} autoSubmit={false} />);
    const first = screen.getAllByRole("textbox")[0]!;
    await userEvent.click(first);
    await userEvent.paste("111111");
    await userEvent.click(screen.getByRole("button", { name: "Verify" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    await userEvent.click(screen.getAllByRole("textbox")[0]!);
    await userEvent.paste("123456");
    await userEvent.click(screen.getByRole("button", { name: "Verify" }));
    await waitFor(() => expect(onVerify).toHaveBeenLastCalledWith("123456"));
  });
});

describe("RolePicker collapsible", () => {
  const roles = [
    { id: "a", title: "Account Officer", group: "Front office" },
    { id: "b", title: "Group Head", group: "Credit approval" },
  ];
  it("collapses groups and expands on toggle or search", async () => {
    render(<RolePicker roles={roles} onSelect={() => {}} collapsible searchable />);
    expect(screen.queryByRole("button", { name: /Account Officer/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Front office/ }));
    expect(screen.getByRole("button", { name: /Front office/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Account Officer/ })).toBeVisible();
    await userEvent.type(screen.getByRole("searchbox"), "group");
    expect(screen.getByRole("button", { name: /Group Head/ })).toBeVisible();
  });
});
