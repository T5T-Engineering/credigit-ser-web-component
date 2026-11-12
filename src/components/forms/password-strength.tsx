import type { ComponentProps } from "react";
import { Check, X } from "lucide-react";

import { cx } from "../../utils/cx";

/** A password rule; `test` returns true when satisfied. */
export type PasswordRule = { id: string; label: string; test: (value: string) => boolean };

/**
 * Default rules. Password policy is a tenant setting — pass your own `rules` to change it.
 * These defaults follow common enterprise guidance (length first, mixed character classes).
 */
// TD-012: fallback policy; apps build rules from the tenant password policy (/auth/config).
export const defaultPasswordRules: PasswordRule[] = [
  { id: "length", label: "At least 12 characters", test: (v) => v.length >= 12 },
  { id: "upper", label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol (e.g. ! @ # ?)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export type PasswordEvaluation = { passed: string[]; failed: string[]; valid: boolean; /** 0–4 */ score: number };

/** Check a password against rules. `score` grows with rules met and extra length. */
export function evaluatePassword(value: string, rules: PasswordRule[] = defaultPasswordRules): PasswordEvaluation {
  const passed = rules.filter((r) => r.test(value)).map((r) => r.id);
  const failed = rules.filter((r) => !r.test(value)).map((r) => r.id);
  const ratio = rules.length ? passed.length / rules.length : 1;
  let score = value.length === 0 ? 0 : Math.max(1, Math.round(ratio * 3));
  if (failed.length === 0 && value.length >= 16) score = 4;
  return { passed, failed, valid: failed.length === 0, score };
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthBar = ["bg-fg/10", "bg-danger", "bg-warning", "bg-info", "bg-success"];

/** Props for `PasswordStrength`. */
export type PasswordStrengthProps = Omit<ComponentProps<"div">, "children"> & {
  value: string;
  rules?: PasswordRule[];
  /** Hide the rule checklist and show only the meter. */
  hideRules?: boolean;
};

/** Strength meter and rule checklist for a new password. Announces changes politely. */
export function PasswordStrength({ value, rules = defaultPasswordRules, hideRules = false, className, ...props }: PasswordStrengthProps) {
  const result = evaluatePassword(value, rules);
  return (
    <div className={cx("flex flex-col gap-2.5", className)} {...props}>
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={cx("h-1.5 rounded-full transition-colors duration-200", i <= result.score ? strengthBar[result.score] : "bg-fg/10")} />
          ))}
        </div>
        <span aria-live="polite" className="min-w-14 text-right text-xs font-semibold text-fg-muted">
          {value ? `${strengthLabels[result.score]}` : ""}
          <span className="sr-only">{value ? ` password. ${result.failed.length} requirement${result.failed.length === 1 ? "" : "s"} left.` : ""}</span>
        </span>
      </div>
      {hideRules ? null : (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {rules.map((r) => {
            const ok = result.passed.includes(r.id);
            return (
              <li key={r.id} className={cx("flex items-center gap-2 text-sm", ok ? "text-fg" : "text-fg-muted")}>
                <span aria-hidden="true" className={cx("grid size-4 shrink-0 place-items-center rounded-full", ok ? "bg-success text-on-status" : "bg-fg/10 text-fg-subtle")}>
                  {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                </span>
                <span>
                  {r.label}
                  <span className="sr-only">{ok ? " — met" : " — not met"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
