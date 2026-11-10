import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Field } from "./field";
import { PasswordInput } from "./password-input";
import { PasswordStrength, defaultPasswordRules, evaluatePassword } from "./password-strength";

describe("PasswordInput", () => {
  it("toggles visibility and keeps its field label", async () => {
    render(
      <Field label="Password">
        <PasswordInput />
      </Field>,
    );
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("evaluatePassword", () => {
  it("fails weak passwords and passes strong ones", () => {
    expect(evaluatePassword("abc").valid).toBe(false);
    expect(evaluatePassword("abc").failed).toContain("length");
    const strong = evaluatePassword("Correct-Horse-42!");
    expect(strong.valid).toBe(true);
    expect(strong.score).toBe(4);
    expect(evaluatePassword("").score).toBe(0);
  });

  it("accepts custom tenant rules", () => {
    const rules = [{ id: "len8", label: "8+", test: (v: string) => v.length >= 8 }];
    expect(evaluatePassword("abcdefgh", rules).valid).toBe(true);
  });
});

describe("PasswordStrength", () => {
  it("lists every rule with met state", () => {
    render(<PasswordStrength value="Abcdefghijkl" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(defaultPasswordRules.length);
    expect(screen.getByText("At least 12 characters").parentElement).toHaveTextContent("met");
  });
});
