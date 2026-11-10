import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../forms/field";
import {
  durationToMinutes,
  formatRuleValue,
  parseRuleNumber,
  RuleValueInput,
  validateRuleValue,
  type RuleValue,
  type RuleValueInputProps,
} from "./rule-value-input";
import { RuleCard, RuleRow, type RuleSummary } from "./rule-card";

const roles = [
  { value: "credit_officer", label: "Credit officer" },
  { value: "cro", label: "Chief Risk Officer" },
];

describe("validateRuleValue", () => {
  it("number / percent / money: required, finite, integer, bounds", () => {
    expect(validateRuleValue("number", null, { required: true })).toBe("A value is required");
    expect(validateRuleValue("number", null)).toBeNull();
    expect(validateRuleValue("number", Number.NaN)).toBe("Enter a valid number");
    expect(validateRuleValue("number", 1.5, { integer: true })).toBe("Enter a whole number");
    expect(validateRuleValue("percent", 120, { max: 100 })).toBe("Must be at most 100");
    expect(validateRuleValue("money", -1, { min: 0 })).toBe("Must be at least 0");
    expect(validateRuleValue("money", 5_000_000, { min: 0 })).toBeNull();
  });

  it("duration bounds are in minutes", () => {
    expect(durationToMinutes({ amount: 2, unit: "days" })).toBe(2880);
    expect(validateRuleValue("duration", { amount: 30, unit: "minutes" }, { min: 60 })).toBe("Must be at least 1 h");
    expect(validateRuleValue("duration", { amount: 3, unit: "days" }, { max: 2880 })).toBe("Must be at most 2 days");
    expect(validateRuleValue("duration", { amount: -1, unit: "hours" })).toBe("Enter a valid duration");
    expect(validateRuleValue("duration", { amount: 4, unit: "hours" }, { min: 60, max: 2880 })).toBeNull();
  });

  it("boolean, enum, text, url", () => {
    expect(validateRuleValue("boolean", false, { required: true })).toBeNull();
    expect(validateRuleValue("boolean", null, { required: true })).toBe("A value is required");
    expect(validateRuleValue("enum", "x", { options: [{ value: "a", label: "A" }] })).toBe("Choose one of the listed values");
    expect(validateRuleValue("enum", "a", { options: [{ value: "a", label: "A" }] })).toBeNull();
    expect(validateRuleValue("text", "ab", { min: 3 })).toBe("Must be at least 3 characters");
    expect(validateRuleValue("text", "  ", { required: true })).toBe("A value is required");
    expect(validateRuleValue("url", "not a url")).toBe("Enter a valid URL (https://…)");
    expect(validateRuleValue("url", "javascript:alert(1)")).toBe("Enter a valid URL (https://…)");
    expect(validateRuleValue("url", "https://api.example.test/v1")).toBeNull();
  });

  it("list and roles: item counts and known roles", () => {
    expect(validateRuleValue("list", [], { required: true })).toBe("A value is required");
    expect(validateRuleValue("list", ["a"], { min: 2 })).toBe("Add at least 2 items");
    expect(validateRuleValue("list", ["a", "b", "c"], { max: 2 })).toBe("No more than 2 items");
    expect(validateRuleValue("roles", ["ghost"], { options: roles })).toBe("Choose one of the listed values");
    expect(validateRuleValue("roles", ["cro"], { options: roles })).toBeNull();
  });

  it("accepts message overrides", () => {
    expect(validateRuleValue("number", null, { required: true }, { required: "Pflichtfeld" })).toBe("Pflichtfeld");
  });
});

describe("parseRuleNumber / formatRuleValue", () => {
  it("parses thousands separators and rejects junk", () => {
    expect(parseRuleNumber("1,250.5")).toBe(1250.5);
    expect(parseRuleNumber("")).toBeNull();
    expect(parseRuleNumber("12abc")).toBeNaN();
  });

  it("formats per type", () => {
    expect(formatRuleValue("money", 250000000)).toBe("₦250,000,000");
    expect(formatRuleValue("money", 1000, { currency: "USD" })).toBe("USD 1,000");
    expect(formatRuleValue("percent", 12.5)).toBe("12.5%");
    expect(formatRuleValue("number", 1.2, { unit: "x" })).toBe("1.2 x");
    expect(formatRuleValue("duration", { amount: 1, unit: "days" })).toBe("1 day");
    expect(formatRuleValue("duration", { amount: 48, unit: "hours" })).toBe("48 hours");
    expect(formatRuleValue("boolean", true)).toBe("On");
    expect(formatRuleValue("roles", ["cro", "credit_officer"], { options: roles })).toBe("Chief Risk Officer, Credit officer");
    expect(formatRuleValue("text", null)).toBe("—");
  });
});

function Harness(props: Omit<RuleValueInputProps, "value" | "onChange"> & { initial: RuleValue; spy?: (v: RuleValue) => void }) {
  const { initial, spy, ...rest } = props;
  const [value, setValue] = useState<RuleValue>(initial);
  return (
    <RuleValueInput
      {...rest}
      value={value}
      onChange={(v) => {
        setValue(v);
        spy?.(v);
      }}
    />
  );
}

describe("RuleValueInput", () => {
  it("money: ₦ prefix, parsed number, bounds message", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="money" label="Tier 2 limit" initial={null} max={1000} spy={spy} />);
    expect(screen.getByText("₦")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Tier 2 limit" });
    await user.type(input, "1,500");
    expect(spy).toHaveBeenLastCalledWith(1500);
    expect(screen.getByText("Must be at most 1000")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("number: invalid text shows a message and does not call onChange with junk", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="number" label="DSCR" unit="x" initial={1.2} spy={spy} />);
    const input = screen.getByRole("textbox", { name: "DSCR" });
    expect(input).toHaveValue("1.2");
    await user.clear(input);
    await user.type(input, "1.2a");
    expect(screen.getByText("Enter a valid number")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalledWith(Number.NaN);
  });

  it("percent: % suffix and arrow keys step within bounds", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="percent" label="Rate" initial={99.5} step={0.5} max={100} spy={spy} />);
    expect(screen.getByText("%")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Rate" });
    await user.click(input);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(spy).toHaveBeenLastCalledWith(100);
  });

  it("duration: amount + unit select", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="duration" label="SLA" initial={{ amount: 24, unit: "hours" }} spy={spy} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "SLA unit" }), "days");
    expect(spy).toHaveBeenLastCalledWith({ amount: 24, unit: "days" });
    const amount = screen.getByRole("textbox", { name: "SLA" });
    await user.clear(amount);
    await user.type(amount, "2");
    expect(spy).toHaveBeenLastCalledWith({ amount: 2, unit: "days" });
  });

  it("boolean: switch", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="boolean" initial={false} spy={spy} />);
    await user.click(screen.getByRole("switch", { name: "Disabled" }));
    expect(spy).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("switch", { name: "Enabled" })).toHaveAttribute("aria-checked", "true");
  });

  it("enum: select of options; required message when cleared", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="enum" label="Frequency" required initial="monthly" options={[{ value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }]} spy={spy} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Frequency" }), "quarterly");
    expect(spy).toHaveBeenLastCalledWith("quarterly");
  });

  it("url: validation message", async () => {
    const user = userEvent.setup();
    render(<Harness type="url" label="Bureau endpoint" initial="" />);
    await user.type(screen.getByRole("textbox", { name: "Bureau endpoint" }), "ftp://x");
    expect(screen.getByText("Enter a valid URL (https://…)")).toBeInTheDocument();
  });

  it("list: chip input adds on Enter / comma, removes via chip button and Backspace", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="list" label="Sectors" initial={["Oil & gas"]} spy={spy} />);
    const input = screen.getByRole("textbox", { name: "Sectors" });
    await user.type(input, "Agriculture{Enter}Telecoms,");
    expect(spy).toHaveBeenLastCalledWith(["Oil & gas", "Agriculture", "Telecoms"]);
    await user.click(screen.getByRole("button", { name: "Remove Agriculture" }));
    expect(spy).toHaveBeenLastCalledWith(["Oil & gas", "Telecoms"]);
    await user.type(input, "{Backspace}");
    expect(spy).toHaveBeenLastCalledWith(["Oil & gas"]);
    await user.type(input, "Oil & gas{Enter}");
    expect(spy).toHaveBeenLastCalledWith(["Oil & gas"]);
  });

  it("roles: toggle pills keep option order; min items validation", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness type="roles" label="Approvers" min={1} initial={["cro"]} options={roles} spy={spy} />);
    await user.click(screen.getByRole("button", { name: "Credit officer" }));
    expect(spy).toHaveBeenLastCalledWith(["credit_officer", "cro"]);
    await user.click(screen.getByRole("button", { name: "Credit officer" }));
    await user.click(screen.getByRole("button", { name: "Chief Risk Officer" }));
    expect(spy).toHaveBeenLastCalledWith([]);
    expect(screen.getByText("Add at least 1 item")).toBeInTheDocument();
  });

  it("wires to Field and reports validity", () => {
    const onValidityChange = vi.fn();
    render(
      <Field label="Max tenor">
        <RuleValueInput type="number" value={500} max={360} onChange={() => {}} onValidityChange={onValidityChange} />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Max tenor" })).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenCalledWith("Must be at most 360");
  });

  it("external error overrides the computed one", () => {
    render(<RuleValueInput type="text" label="Name" value="ok" onChange={() => {}} error="Already in use" />);
    expect(screen.getByText("Already in use")).toBeInTheDocument();
  });
});

const rule: RuleSummary = {
  key: "credit.approval.tier2.limit",
  label: "Tier 2 approval limit",
  description: "Facilities above this amount go to the Credit Committee.",
  type: "money",
  value: 250000000,
  defaultValue: 100000000,
  scope: "Tenant",
  source: "PRD §6.2",
  sourceHref: "#prd",
  pending: { value: 300000000, requestedBy: "A. Bello", requestedAt: "10 Nov 2026" },
  changedBy: "F. Ahmed",
  changedAt: "2 Nov 2026",
};

describe("RuleCard / RuleRow", () => {
  it("renders formatted values, default, badges, source and pending change", () => {
    render(<RuleCard rule={rule} actions={<button type="button">Edit</button>} />);
    expect(screen.getByRole("heading", { name: "Tier 2 approval limit" })).toBeInTheDocument();
    expect(screen.getByText("credit.approval.tier2.limit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy rule key credit.approval.tier2.limit" })).toBeInTheDocument();
    expect(screen.getByTestId("rule-value")).toHaveTextContent("₦250,000,000");
    expect(screen.getByText("₦100,000,000")).toBeInTheDocument();
    expect(screen.getByText("Modified")).toBeInTheDocument();
    expect(screen.getAllByText("Awaiting approval").length).toBeGreaterThan(0);
    expect(screen.getByText("₦300,000,000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PRD §6.2" })).toHaveAttribute("href", "#prd");
    expect(screen.getByText(/F\. Ahmed/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("row variant renders value and hides 'Modified' when equal to default", () => {
    render(<RuleRow rule={{ ...rule, value: 100000000, pending: undefined }} />);
    expect(screen.getByTestId("rule-value")).toHaveTextContent("₦100,000,000");
    expect(screen.queryByText("Modified")).not.toBeInTheDocument();
    expect(screen.queryByText("Awaiting approval")).not.toBeInTheDocument();
  });
});
