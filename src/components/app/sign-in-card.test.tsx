import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MicrosoftSignInButton, SignInCard } from "./sign-in-card";

describe("SignInCard", () => {
  it("renders the Microsoft button and calls the handler (Entra mode)", async () => {
    const user = userEvent.setup();
    const onMicrosoftSignIn = vi.fn();
    render(<SignInCard productName="Smart Enterprise Risk 360°" onMicrosoftSignIn={onMicrosoftSignIn} />);
    expect(screen.getByRole("heading", { name: "Smart Enterprise Risk 360°" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign in with Microsoft" }));
    expect(onMicrosoftSignIn).toHaveBeenCalledTimes(1);
  });

  it("shows the divider above children and an error alert", () => {
    render(
      <SignInCard error="Your account is not enabled for this tenant">
        <p>Demo access</p>
      </SignInCard>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Your account is not enabled for this tenant");
    expect(screen.getByRole("separator", { name: "or" })).toBeInTheDocument();
    expect(screen.getByText("Demo access")).toBeInTheDocument();
  });

  it("hides the Microsoft button and divider in local mode", () => {
    render(
      <SignInCard microsoft={false}>
        <form aria-label="Sign in with e-mail" />
      </SignInCard>,
    );
    expect(screen.queryByRole("button", { name: "Sign in with Microsoft" })).not.toBeInTheDocument();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Sign in with e-mail" })).toBeInTheDocument();
  });
});

describe("MicrosoftSignInButton", () => {
  it("renders a link with href and disables it while loading", () => {
    const { rerender } = render(<MicrosoftSignInButton href="/auth/microsoft" />);
    expect(screen.getByRole("link", { name: "Sign in with Microsoft" })).toHaveAttribute("href", "/auth/microsoft");
    rerender(<MicrosoftSignInButton loading />);
    const button = screen.getByRole("button", { name: "Sign in with Microsoft" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
