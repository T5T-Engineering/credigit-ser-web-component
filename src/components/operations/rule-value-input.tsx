"use client";

import { useEffect, useId, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";

import { FieldMessage } from "../forms/field-message";
import { Input } from "../forms/input";
import { Select } from "../forms/select";
import { Switch } from "../forms/switch";
import { useFieldContext } from "../forms/field-context";
import { cx } from "../../utils/cx";
import { ChipInput } from "./chip-input";
import { RoleMultiSelect } from "./role-multi-select";

/** Value types a business rule can hold. */
export type RuleValueType = "number" | "percent" | "money" | "duration" | "boolean" | "enum" | "text" | "url" | "list" | "roles";

/** Unit of a `duration` rule value. */
export type DurationUnit = "minutes" | "hours" | "days";

/** A `duration` rule value. */
export type DurationValue = { amount: number; unit: DurationUnit };

/**
 * A rule value. number / percent (in percent units, `12.5` = 12.5%) / money → `number`; duration →
 * `DurationValue`; boolean → `boolean`; enum / text / url → `string`; list / roles → `string[]`; unset → `null`.
 */
export type RuleValue = number | string | boolean | string[] | DurationValue | null;

/** Option of an `enum` / `roles` rule. */
export type RuleValueOption = { value: string; label: string; description?: string; disabled?: boolean };

/** Constraints used by `validateRuleValue`. */
export type RuleValueConstraints = {
  /**
   * Lower bound: number / percent / money value; duration total in **minutes**; list / roles item count;
   * text / url length.
   */
  min?: number;
  /** Upper bound (same meaning as `min`). */
  max?: number;
  /** Value must be set (non-empty). */
  required?: boolean;
  /** Allowed values for enum / roles. */
  options?: RuleValueOption[];
  /** Number must be a whole number (default false). */
  integer?: boolean;
  /** Allowed URL protocols (default `["https:", "http:"]`). */
  protocols?: string[];
};

/** Validation messages (override for i18n). */
export type RuleValueMessages = {
  required: string;
  number: string;
  integer: string;
  min: (min: string) => string;
  max: (max: string) => string;
  minItems: (min: number) => string;
  maxItems: (max: number) => string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  url: string;
  option: string;
  duration: string;
};

/** Default English validation messages. */
export const defaultRuleValueMessages: RuleValueMessages = {
  required: "A value is required",
  number: "Enter a valid number",
  integer: "Enter a whole number",
  min: (min) => `Must be at least ${min}`,
  max: (max) => `Must be at most ${max}`,
  minItems: (min) => `Add at least ${min} ${min === 1 ? "item" : "items"}`,
  maxItems: (max) => `No more than ${max} ${max === 1 ? "item" : "items"}`,
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be at most ${max} characters`,
  url: "Enter a valid URL (https://…)",
  option: "Choose one of the listed values",
  duration: "Enter a valid duration",
};

const minutesPerUnit: Record<DurationUnit, number> = { minutes: 1, hours: 60, days: 1440 };

/** Total minutes of a duration value. */
export function durationToMinutes(value: DurationValue): number {
  return value.amount * minutesPerUnit[value.unit];
}

/** Whether a value is a `DurationValue`. */
export function isDurationValue(value: unknown): value is DurationValue {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "amount" in value && "unit" in value;
}

/** Parse a typed number ("1,250.5" → 1250.5); `null` when empty, `NaN` when invalid. */
export function parseRuleNumber(text: string): number | null {
  const cleaned = text.replace(/[,\s_]/g, "");
  if (cleaned === "") return null;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

/**
 * Validate a rule value against its type and constraints. Returns the first error message, or `null`
 * when valid.
 */
export function validateRuleValue(
  type: RuleValueType,
  value: RuleValue | undefined,
  constraints: RuleValueConstraints = {},
  messages: Partial<RuleValueMessages> = {},
): string | null {
  const m = { ...defaultRuleValueMessages, ...messages };
  const { min, max, required, options, integer, protocols = ["https:", "http:"] } = constraints;
  const empty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);

  switch (type) {
    case "number":
    case "percent":
    case "money": {
      if (value === null || value === undefined || value === "") return required ? m.required : null;
      if (typeof value !== "number" || !Number.isFinite(value)) return m.number;
      if (integer && !Number.isInteger(value)) return m.integer;
      if (min !== undefined && value < min) return m.min(String(min));
      if (max !== undefined && value > max) return m.max(String(max));
      return null;
    }
    case "duration": {
      if (value === null || value === undefined) return required ? m.required : null;
      if (!isDurationValue(value) || !Number.isFinite(value.amount) || value.amount < 0) return m.duration;
      if (integer && !Number.isInteger(value.amount)) return m.integer;
      const total = durationToMinutes(value);
      if (min !== undefined && total < min) return m.min(formatDurationMinutes(min));
      if (max !== undefined && total > max) return m.max(formatDurationMinutes(max));
      return null;
    }
    case "boolean":
      if (value === null || value === undefined) return required ? m.required : null;
      return typeof value === "boolean" ? null : m.required;
    case "enum":
      if (empty) return required ? m.required : null;
      if (typeof value !== "string") return m.option;
      if (options && !options.some((o) => o.value === value)) return m.option;
      return null;
    case "text":
    case "url": {
      if (empty) return required ? m.required : null;
      if (typeof value !== "string") return type === "url" ? m.url : m.required;
      if (min !== undefined && value.length < min) return m.minLength(min);
      if (max !== undefined && value.length > max) return m.maxLength(max);
      if (type === "url") {
        try {
          const url = new URL(value);
          if (!protocols.includes(url.protocol)) return m.url;
        } catch {
          return m.url;
        }
      }
      return null;
    }
    case "list":
    case "roles": {
      const items = Array.isArray(value) ? value : [];
      if (items.length === 0 && required) return m.required;
      if (min !== undefined && items.length < min) return m.minItems(min);
      if (max !== undefined && items.length > max) return m.maxItems(max);
      if (type === "roles" && options && items.some((r) => !options.some((o) => o.value === r))) return m.option;
      return null;
    }
  }
}

/** Short duration text for minutes (e.g. 90 → "1 h 30 min", 2880 → "2 days"). */
export function formatDurationMinutes(minutes: number): string {
  if (minutes > 0 && minutes % 1440 === 0) return `${minutes / 1440} ${minutes === 1440 ? "day" : "days"}`;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${h} h ${rest} min` : `${h} h`;
  }
  return `${minutes} min`;
}

/** Options of `formatRuleValue`. */
export type FormatRuleValueOptions = {
  /** ISO currency code for money (default "NGN"). */
  currency?: string;
  /** Symbol shown before money values (default "₦" for NGN, otherwise the currency code). */
  currencySymbol?: string;
  /** Unit suffix for number values (e.g. "x", "days"). */
  unit?: string;
  /** Labels for enum / roles values. */
  options?: RuleValueOption[];
  /** Number locale (default "en-NG"). */
  locale?: string;
  /** Text for unset values (default "—"). */
  emptyText?: string;
  /** Boolean labels (default "On" / "Off"). */
  booleanLabels?: { on: string; off: string };
};

/** Default currency symbols used when `currencySymbol` is not given. */
export const currencySymbols: Record<string, string> = { NGN: "₦" };

const durationUnitLabel: Record<DurationUnit, [string, string]> = {
  minutes: ["minute", "minutes"],
  hours: ["hour", "hours"],
  days: ["day", "days"],
};

/** Human-readable text for a rule value (₦ amounts, percents, durations, labels for enum / roles). */
export function formatRuleValue(type: RuleValueType, value: RuleValue | undefined, options: FormatRuleValueOptions = {}): string {
  // TD-013: tenant base currency / locale should be passed in.
  const { currency = "NGN", unit, locale = "en-NG", emptyText = "—", booleanLabels = { on: "On", off: "Off" } } = options;
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return emptyText;
  const nf = (n: number, digits = 2) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n);
  const label = (v: string) => options.options?.find((o) => o.value === v)?.label ?? v;
  switch (type) {
    case "number":
      return typeof value === "number" ? `${nf(value, 4)}${unit ? ` ${unit}` : ""}` : String(value);
    case "percent":
      return typeof value === "number" ? `${nf(value, 4)}%` : String(value);
    case "money": {
      const symbol = options.currencySymbol ?? currencySymbols[currency] ?? `${currency} `;
      return typeof value === "number" ? `${value < 0 ? "-" : ""}${symbol}${nf(Math.abs(value))}` : String(value);
    }
    case "duration": {
      if (!isDurationValue(value)) return String(value);
      const [one, many] = durationUnitLabel[value.unit];
      return `${nf(value.amount)} ${value.amount === 1 ? one : many}`;
    }
    case "boolean":
      return value === true ? booleanLabels.on : value === false ? booleanLabels.off : String(value);
    case "enum":
      return typeof value === "string" ? label(value) : String(value);
    case "list":
    case "roles":
      return Array.isArray(value) ? value.map(label).join(", ") : String(value);
    default:
      return String(value);
  }
}

/** Props for `RuleValueInput`. */
export type RuleValueInputProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  type: RuleValueType;
  value: RuleValue | undefined;
  onChange: (value: RuleValue) => void;
  /** Bounds; see `RuleValueConstraints` for their meaning per type. */
  min?: number;
  max?: number;
  /** ArrowUp / ArrowDown increment of number / percent / money / duration inputs (default 1). */
  step?: number;
  /** Unit suffix for number values (e.g. "x", "days", "bps"). */
  unit?: string;
  /** Options for enum (select) and roles (toggle pills). */
  options?: RuleValueOption[];
  /** ISO currency code for money (default "NGN"). */
  currency?: string;
  /** Prefix symbol for money (default "₦" for NGN, else the currency code). */
  currencySymbol?: string;
  /** Duration units offered in the unit select (default minutes, hours, days). */
  durationUnits?: DurationUnit[];
  /** Labels of the duration units. */
  durationUnitLabels?: Partial<Record<DurationUnit, string>>;
  /** Labels of the boolean switch (default "Enabled" / "Disabled"). */
  booleanLabels?: { on: string; off: string };
  required?: boolean;
  integer?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Accessible name when not inside a `Field` (e.g. the rule label). */
  label?: string;
  /** id of the main control (default: surrounding Field's id or generated). */
  inputId?: string;
  placeholder?: string;
  /** External error (e.g. server-side); shown instead of the computed one. */
  error?: string | null;
  /** Show the computed validation message (default true). */
  showValidation?: boolean;
  /** Validation message overrides (i18n). */
  messages?: Partial<RuleValueMessages>;
  /** Called with the current error (or null) whenever it changes. */
  onValidityChange?: (error: string | null) => void;
  size?: "small" | "medium" | "large";
};

const allDurationUnits: DurationUnit[] = ["minutes", "hours", "days"];
const defaultDurationUnitLabels: Record<DurationUnit, string> = { minutes: "Minutes", hours: "Hours", days: "Days" };

function numberText(value: RuleValue | undefined): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (isDurationValue(value) && Number.isFinite(value.amount)) return String(value.amount);
  return "";
}

/**
 * Typed editor for a business-rule value: number / percent / money (₦ prefix) / duration (amount + unit) /
 * boolean (switch) / enum (select) / text / url / list (chip input) / roles (toggle pills), with an
 * inline validation message. Built on `Input`, `Select`, `Switch`, `ChipInput` and `RoleMultiSelect`.
 */
export function RuleValueInput({
  type,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  options,
  // TD-013: tenant base currency should be passed in.
  currency = "NGN",
  currencySymbol,
  durationUnits = allDurationUnits,
  durationUnitLabels,
  booleanLabels = { on: "Enabled", off: "Disabled" },
  required,
  integer,
  disabled,
  readOnly,
  label,
  inputId,
  placeholder,
  error: externalError,
  showValidation = true,
  messages,
  onValidityChange,
  size,
  className,
  ...props
}: RuleValueInputProps) {
  const field = useFieldContext();
  const autoId = useId();
  const id = inputId ?? field?.id ?? `cg-rule-value-${autoId}`;
  const messageId = `${id}-validation`;
  const m = { ...defaultRuleValueMessages, ...messages };

  const numeric = type === "number" || type === "percent" || type === "money" || type === "duration";
  const [draft, setDraft] = useState(() => numberText(value));
  const [parseError, setParseError] = useState(false);
  // Remember the chosen duration unit while the amount is empty (value null).
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(() => (isDurationValue(value) ? value.unit : (durationUnits[0] ?? "hours")));
  const valueUnit = isDurationValue(value) ? value.unit : undefined;
  useEffect(() => {
    if (valueUnit) setDurationUnit(valueUnit);
  }, [valueUnit]);
  // Keep the text box in sync when the value changes from outside.
  useEffect(() => {
    if (!numeric) return;
    const current = parseRuleNumber(draft);
    const incoming = typeof value === "number" ? value : isDurationValue(value) ? value.amount : null;
    if (current !== incoming && !(current !== null && Number.isNaN(current))) {
      setDraft(numberText(value));
      setParseError(false);
    }
  }, [value, numeric]);

  const computed = parseError
    ? m.number
    : validateRuleValue(type, value, { min, max, required, options, integer }, messages);
  const error = externalError !== undefined && externalError !== null ? externalError : showValidation ? computed : null;

  useEffect(() => {
    onValidityChange?.(computed);
  }, [computed]);

  const invalid = Boolean(error);
  const describedBy = error ? messageId : undefined;
  const ariaLabel = field ? undefined : label;
  const editable = !disabled && !readOnly;

  const onNumberText = (text: string, unitOverride?: DurationUnit) => {
    setDraft(text);
    const n = parseRuleNumber(text);
    if (n !== null && Number.isNaN(n)) {
      setParseError(true);
      return;
    }
    setParseError(false);
    if (type === "duration") {
      const u = unitOverride ?? durationUnit;
      onChange(n === null ? null : { amount: n, unit: u });
    } else onChange(n);
  };

  // Arrow keys nudge numeric values by `step` (default 1), clamped to min / max for plain numbers.
  const onStepKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!editable || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    const current = parseRuleNumber(draft);
    if (current !== null && Number.isNaN(current)) return;
    event.preventDefault();
    const delta = (step ?? 1) * (event.key === "ArrowUp" ? 1 : -1);
    let next = Number(((current ?? 0) + delta).toFixed(10));
    if (type !== "duration") {
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
    }
    onNumberText(String(next));
  };

  let control: ReactNode;
  switch (type) {
    case "number":
    case "percent":
    case "money": {
      const symbol = currencySymbol ?? currencySymbols[currency] ?? currency;
      control = (
        <Input
          id={id}
          inputMode="decimal"
          numeric
          size={size}
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          invalid={invalid}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          prefix={type === "money" ? symbol : undefined}
          suffix={type === "percent" ? "%" : type === "number" ? unit : undefined}
          onKeyDown={onStepKey}
          onChange={(e) => onNumberText(e.target.value)}
        />
      );
      break;
    }
    case "duration": {
      const current = durationUnit;
      const unitLabels = { ...defaultDurationUnitLabels, ...durationUnitLabels };
      control = (
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
          <Input
            id={id}
            inputMode="decimal"
            numeric
            size={size}
            value={draft}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            invalid={invalid}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            onKeyDown={onStepKey}
            onChange={(e) => onNumberText(e.target.value)}
          />
          </div>
          <div className="w-32 shrink-0 sm:w-36">
          <Select
            id={`${id}-unit`}
            size={size}
            aria-label={`${label ?? "Duration"} unit`}
            value={current}
            disabled={!editable}
            options={durationUnits.map((u) => ({ value: u, label: unitLabels[u] }))}
            onChange={(e) => {
              const u = e.target.value as DurationUnit;
              setDurationUnit(u);
              const n = parseRuleNumber(draft);
              if (n !== null && !Number.isNaN(n)) onChange({ amount: n, unit: u });
            }}
          />
          </div>
        </div>
      );
      break;
    }
    case "boolean":
      control = (
        <Switch
          id={id}
          size={size}
          checked={value === true}
          disabled={!editable}
          invalid={invalid}
          aria-describedby={describedBy}
          label={value === true ? booleanLabels.on : booleanLabels.off}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );
      break;
    case "enum":
      control = (
        <Select
          id={id}
          size={size}
          value={typeof value === "string" ? value : ""}
          placeholder={placeholder ?? "Select…"}
          options={options}
          disabled={!editable}
          required={required}
          invalid={invalid}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        />
      );
      break;
    case "text":
    case "url":
      control = (
        <Input
          id={id}
          type={type === "url" ? "url" : "text"}
          size={size}
          value={typeof value === "string" ? value : ""}
          placeholder={placeholder ?? (type === "url" ? "https://" : undefined)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          invalid={invalid}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          inputClassName={type === "url" ? "font-code text-sm" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "list":
      control = (
        <ChipInput
          inputId={id}
          value={Array.isArray(value) ? value : []}
          onChange={(next) => onChange(next)}
          label={label}
          placeholder={placeholder ?? "Type and press Enter"}
          disabled={!editable}
          invalid={invalid}
          aria-describedby={describedBy}
        />
      );
      break;
    case "roles":
      control = (
        <RoleMultiSelect
          id={id}
          label={label ?? "Roles"}
          options={options ?? []}
          value={Array.isArray(value) ? value : []}
          onChange={(next) => onChange(next)}
          disabled={!editable}
          invalid={invalid}
          aria-describedby={describedBy}
        />
      );
      break;
  }

  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)} data-rule-type={type} {...props}>
      {control}
      {error ? (
        <FieldMessage id={messageId} tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  );
}
