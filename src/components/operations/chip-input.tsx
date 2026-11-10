"use client";

import { useId, useState, type ComponentProps, type KeyboardEvent } from "react";

import { Chip } from "../basic/chip";
import { useFieldControl } from "../forms/field-context";
import { cx } from "../../utils/cx";

/** Props for `ChipInput`. */
export type ChipInputProps = Omit<ComponentProps<"div">, "onChange" | "children" | "defaultValue"> & {
  value: string[];
  onChange?: (value: string[]) => void;
  /** Accessible name of the text box when not inside a `Field`. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Allow the same entry twice (default false: duplicates are ignored). */
  allowDuplicates?: boolean;
  /** Keys that commit the typed text (default Enter and comma). */
  separators?: string[];
  /** Transform / validate an entry before it is added; return null to reject. Default: trimmed, empty rejected. */
  normalize?: (text: string) => string | null;
  /** Monospaced chips (codes, keys). */
  mono?: boolean;
  /** Remove-button label factory. Default `Remove <item>`. */
  removeLabel?: (item: string) => string;
  /** id of the text input (falls back to the surrounding Field's id). */
  inputId?: string;
  "aria-describedby"?: string;
};

const defaultNormalize = (t: string) => (t.trim() === "" ? null : t.trim());

/**
 * List entry as removable chips plus a text box: Enter / comma add, Backspace on an empty box removes
 * the last chip, pasted comma/newline-separated text adds several. Wires to `Field` automatically.
 */
export function ChipInput({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  invalid,
  allowDuplicates = false,
  separators = ["Enter", ","],
  normalize = defaultNormalize,
  mono = false,
  removeLabel = (item) => `Remove ${item}`,
  inputId,
  className,
  "aria-describedby": describedBy,
  ...props
}: ChipInputProps) {
  const ctl = useFieldControl({ id: inputId, disabled, invalid, "aria-describedby": describedBy });
  const autoId = useId();
  const id = ctl.id ?? `cg-chip-input-${autoId}`;
  const [draft, setDraft] = useState("");

  const add = (entries: string[]) => {
    const next = [...value];
    for (const raw of entries) {
      const item = normalize(raw);
      if (item === null) continue;
      if (!allowDuplicates && next.includes(item)) continue;
      next.push(item);
    }
    if (next.length !== value.length) onChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (separators.includes(event.key)) {
      if (draft.trim() === "" && event.key === "Enter") return;
      event.preventDefault();
      add([draft]);
      setDraft("");
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange?.(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cx(
        "squircle flex min-h-control-md w-full flex-wrap items-center gap-1.5 rounded-3xl bg-fg/5 px-2 py-1.5 transition-[background-color,box-shadow] duration-150 ease-bolt",
        "focus-within:bg-surface focus-within:shadow-sm focus-within:ring-2",
        ctl.invalid ? "ring-2 ring-danger focus-within:ring-danger" : "hover:bg-fg/10 focus-within:ring-focus",
        ctl.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      data-invalid={ctl.invalid || undefined}
      {...props}
    >
      {value.length > 0 ? (
        <ul className="contents" aria-label={label ? `${label} entries` : "Entries"}>
          {value.map((item, i) => (
            <li key={`${item}-${i}`} className="contents">
              <Chip
                size="small"
                className={cx(mono && "font-code font-medium")}
                removeLabel={removeLabel(item)}
                onRemove={ctl.disabled ? undefined : () => onChange?.(value.filter((_, j) => j !== i))}
              >
                {item}
              </Chip>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={id}
        type="text"
        value={draft}
        disabled={ctl.disabled}
        placeholder={placeholder}
        aria-label={ctl.field ? undefined : label}
        aria-invalid={ctl.ariaInvalid}
        aria-describedby={ctl.describedBy}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft.trim() !== "") {
            add([draft]);
            setDraft("");
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[,\n]/.test(text)) {
            e.preventDefault();
            add(text.split(/[,\n]/));
          }
        }}
        className="h-8 min-w-24 flex-1 bg-transparent px-2 text-base text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
      />
    </div>
  );
}
