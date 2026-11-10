import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox, Field, Input, Select, Textarea } from "./index";

describe("Field wiring", () => {
  it("links label, description and error to the input", () => {
    render(
      <Field label="Loan amount" description="Principal in naira" error="Amount is required" required>
        <Input prefix="₦" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /loan amount/i });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/₦.*Principal in naira.*Amount is required/);
    expect(screen.getByText("Amount is required").closest("p")).toHaveAttribute("id", `${input.id}-error`);
  });

  it("uses htmlFor as the control id and omits aria-invalid without an error", () => {
    render(
      <Field label="Customer BVN" htmlFor="bvn" optional>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText(/customer bvn/i);
    expect(input).toHaveAttribute("id", "bvn");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("wires Select, Textarea and Checkbox the same way", () => {
    render(
      <>
        <Field label="Sector" error="Choose a sector">
          <Select placeholder="Select…" options={[{ value: "agric", label: "Agriculture" }]} />
        </Field>
        <Field label="Notes" description="Visible to approvers">
          <Textarea />
        </Field>
        <Checkbox label="I confirm the figures" description="Required for submission" />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Sector" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox", { name: "Sector" })).toHaveAccessibleDescription("Choose a sector");
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAccessibleDescription("Visible to approvers");
    expect(screen.getByRole("checkbox", { name: "I confirm the figures" })).toHaveAccessibleDescription(
      "Required for submission",
    );
  });
});
