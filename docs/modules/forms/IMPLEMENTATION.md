# Form controls — implementation

| | |
|---|---|
| Status | Built |
| Requirements | [REQUIREMENTS.md](REQUIREMENTS.md) |
| Last updated | 2026-11-12 (commit d545831) |

## 1. Design overview

React 19 function components, TypeScript strict, Tailwind 4 token utilities, lucide icons, shipped as source. Exported through the group barrel `index.ts` and re-exported by `src/index.ts`. Interactive files start with `"use client";`; presentational ones stay server-compatible. Classes merged with `cx()`; native props spread.

## 2. Files and entry points

| Path | Role |
|---|---|
| `src/components/forms/index.ts` | Group barrel |
| `src/components/forms/field.tsx` | Field |
| `src/components/forms/field-context.ts` | Field |
| `src/components/forms/label.tsx` | Label |
| `src/components/forms/field-message.tsx` | Label |
| `src/components/forms/fieldset.tsx` | Label |
| `src/components/forms/input.tsx` | Input |
| `src/components/forms/textarea.tsx` | Textarea |
| `src/components/forms/select.tsx` | Select |
| `src/components/forms/checkbox.tsx` | Checkbox |
| `src/components/forms/radio.tsx` | Checkbox |
| `src/components/forms/radio-group.tsx` | Checkbox |
| `src/components/forms/switch.tsx` | Switch |
| `src/components/forms/search-field.tsx` | SearchField |
| `src/components/forms/file-upload.tsx` | FileUpload |
| `src/components/forms/form.tsx` | Form |
| `src/components/forms/password-input.tsx` | PasswordInput |
| `src/components/forms/password-strength.tsx` | PasswordStrength |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Field`, `FieldContext`, `useFieldContext`, `useFieldControl` | `src/components/forms/field.tsx` | Label / description / error framing that wires ids and ARIA into the child control. |
| `Label`, `FieldMessage`, `Fieldset` | `src/components/forms/label.tsx` | Label, toned message and fieldset with legend. |
| `Input` | `src/components/forms/input.tsx` | Pill text input with icons, prefix / suffix (e.g. ₦). |
| `Textarea` | `src/components/forms/textarea.tsx` | Multi-line input with `autoResize`. |
| `Select` | `src/components/forms/select.tsx` | Styled native select with options and placeholder. |
| `Checkbox`, `Radio`, `RadioGroup` | `src/components/forms/checkbox.tsx` | Choice controls; `RadioGroup` with options and orientation. |
| `Switch` | `src/components/forms/switch.tsx` | Accessible on / off switch. |
| `SearchField` | `src/components/forms/search-field.tsx` | Search input with icon and clear button. |
| `FileUpload`, `fileMatchesAccept`, `formatFileSize` | `src/components/forms/file-upload.tsx` | Drag & drop zone with `accept`, `multiple`, `maxSizeMb`, rejection list. |
| `Form`, `FormActions` | `src/components/forms/form.tsx` | Form stack spacing and action row. |
| `PasswordInput` | `src/components/forms/password-input.tsx` | Password input with show / hide toggle. |
| `PasswordStrength`, `evaluatePassword`, `defaultPasswordRules` | `src/components/forms/password-strength.tsx` | Strength meter and rules checklist; rules passed in. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `defaultPasswordRules` = 12 / 4 classes | forms |
| `FileUpload.maxSizeMb` = none (prop) | forms |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/forms/field.test.tsx` | `Field`, `Label` |
| `src/components/forms/radio-group.test.tsx` | `Checkbox` |
| `src/components/forms/switch.test.tsx` | `Switch` |
| `src/components/forms/search-field.test.tsx` | `SearchField` |
| `src/components/forms/file-upload.test.tsx` | `FileUpload` |
| `src/components/forms/password.test.tsx` | `PasswordInput`, `PasswordStrength` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| FRM-FR-01 | `src/components/forms/field.tsx` | `field.test.tsx` | Done |
| FRM-FR-02 | `src/components/forms/label.tsx` | `field.test.tsx` | Done |
| FRM-FR-03 | `src/components/forms/input.tsx` | — | Done (no test) |
| FRM-FR-04 | `src/components/forms/textarea.tsx` | — | Done (no test) |
| FRM-FR-05 | `src/components/forms/select.tsx` | — | Done (no test) |
| FRM-FR-06 | `src/components/forms/checkbox.tsx` | `radio-group.test.tsx` | Done |
| FRM-FR-07 | `src/components/forms/switch.tsx` | `switch.test.tsx` | Done |
| FRM-FR-08 | `src/components/forms/search-field.tsx` | `search-field.test.tsx` | Done |
| FRM-FR-09 | `src/components/forms/file-upload.tsx` | `file-upload.test.tsx` | Done |
| FRM-FR-10 | `src/components/forms/form.tsx` | — | Done (no test) |
| FRM-FR-11 | `src/components/forms/password-input.tsx` | `password.test.tsx` | Done |
| FRM-FR-12 | `src/components/forms/password-strength.tsx` | `password.test.tsx` | Done |

## 10. Gaps against the invariants

- `defaultPasswordRules` hard-codes a policy (12 chars) as a fallback; tenant password policy must be passed in (invariant 8).
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
