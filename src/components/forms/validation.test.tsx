import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../basic/button";
import { Modal } from "../blocks/modal";
import { Field, Form, Input, Select, SubmitButton, Textarea, ValidationScope, useValidation } from "./index";

describe("Form required-field check", () => {
  it("blocks submit, shows the message on each empty required field and focuses the first", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Borrower" required>
          <Input />
        </Field>
        <Field label="Sector" required>
          <Select options={[{ value: "", label: "Choose" }, { value: "agri", label: "Agriculture" }]} />
        </Field>
        <Field label="Notes" optional>
          <Textarea />
        </Field>
        <button type="submit">Save</button>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText("This field is required.")).toHaveLength(2);
    const borrower = screen.getByRole("textbox", { name: /borrower/i });
    expect(borrower).toHaveFocus();
    expect(borrower).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: /notes/i })).not.toHaveAttribute("aria-invalid");
  });

  it("clears the message as the person types and submits once filled", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Borrower" required>
          <Input />
        </Field>
        <button type="submit">Save</button>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("This field is required.")).toBeInTheDocument();
    fireEvent.input(screen.getByRole("textbox", { name: /borrower/i }), { target: { value: "Dangote Plc" } });
    expect(screen.queryByText("This field is required.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("keeps an explicit error and honours valueMissing for custom controls", () => {
    render(
      <Form>
        <Field label="Roles" required valueMissing>
          <div id="roles-picker" />
        </Field>
        <Field label="Amount" required error="Amount must be positive">
          <Input defaultValue="-1" />
        </Field>
        <button type="submit">Save</button>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("This field is required.")).toBeInTheDocument();
    expect(screen.getByText("Amount must be positive")).toBeInTheDocument();
  });

  it("ignores required fields in a closed dialog or a hidden panel", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <div hidden>
          <Field label="Hidden" required>
            <Input />
          </Field>
        </div>
        <button type="submit">Save</button>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe("useValidation / ValidationScope", () => {
  function Page({ onSave }: { onSave: () => void }) {
    const validation = useValidation({ required: "Fill this in." });
    const [reason, setReason] = useState("");
    return (
      <ValidationScope value={validation}>
        <Field label="Reason" required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Button onClick={() => validation.validate() && onSave()}>Save</Button>
      </ValidationScope>
    );
  }

  it("validates a button-saved area with custom copy", () => {
    const onSave = vi.fn();
    render(<Page onSave={onSave} />);
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Fill this in.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /reason/i }), { target: { value: "Quarterly review" } });
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("shows nothing before a save attempt", () => {
    render(<Page onSave={() => {}} />);
    expect(screen.queryByText("Fill this in.")).not.toBeInTheDocument();
  });
});

describe("SubmitButton", () => {
  it("checks the fields of the Modal body from the footer before saving", () => {
    const onSave = vi.fn();
    render(
      <Modal open onOpenChange={() => {}} title="New loss event" footer={<SubmitButton onClick={onSave}>Save</SubmitButton>}>
        <Field label="Description" required>
          <Textarea />
        </Field>
      </Modal>,
    );
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("This field is required.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), { target: { value: "ATM cash shortage" } });
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("acts as a plain button outside a scope", () => {
    const onSave = vi.fn();
    render(<SubmitButton onClick={onSave}>Save</SubmitButton>);
    act(() => screen.getByRole("button", { name: "Save" }).click());
    expect(onSave).toHaveBeenCalledOnce();
  });
});
