"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cx } from "../../utils/cx";
import { Input, type InputProps } from "./input";

/** Props for `PasswordInput`. */
export type PasswordInputProps = Omit<InputProps, "type" | "iconAfter" | "suffix"> & {
  /** Accessible labels for the reveal toggle. */
  showLabel?: string;
  hideLabel?: string;
};

/** Password field with a show / hide toggle inside the pill. Wires to `Field` like `Input`. */
export function PasswordInput({ showLabel = "Show password", hideLabel = "Hide password", autoComplete = "current-password", disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      disabled={disabled}
      autoComplete={autoComplete}
      type={visible ? "text" : "password"}
      spellCheck={false}
      autoCapitalize="none"
      iconAfter={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className={cx(
            "grid size-8 cursor-pointer place-items-center rounded-full text-fg-muted transition-colors hover:bg-fg/10 hover:text-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:cursor-not-allowed",
          )}
        >
          {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </button>
      }
    />
  );
}
