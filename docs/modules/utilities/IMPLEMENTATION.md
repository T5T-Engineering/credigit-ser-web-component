# Utilities — implementation

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
| `src/components/utilities/index.ts` | Group barrel |
| `src/components/utilities/tooltip.tsx` | Tooltip |
| `src/components/utilities/popover.tsx` | Popover |
| `src/components/utilities/copy-to-clipboard.tsx` | CopyToClipboard |
| `src/components/utilities/code-snippet.tsx` | CodeSnippet |
| `src/components/utilities/spinner.tsx` | Spinner |
| `src/components/utilities/skeleton.tsx` | Spinner |
| `src/components/utilities/visually-hidden.tsx` | VisuallyHidden |
| `src/components/utilities/skip-link.tsx` | VisuallyHidden |
| `src/components/utilities/sticky.tsx` | Sticky |
| `src/components/utilities/scroll-to-top.tsx` | Sticky |
| `src/components/utilities/brand-settings-panel.tsx` | BrandSettingsPanel |
| `src/components/utilities/brand-preset-picker.tsx` | BrandPresetPicker |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Tooltip` | `src/components/utilities/tooltip.tsx` | Hover / focus tooltip, Escape dismisses. |
| `Popover` | `src/components/utilities/popover.tsx` | Trigger + content popover. |
| `CopyToClipboard` | `src/components/utilities/copy-to-clipboard.tsx` | Copy button announcing "Copied". |
| `CodeSnippet` | `src/components/utilities/code-snippet.tsx` | `font-code` snippet with copy. |
| `Spinner`, `Skeleton` | `src/components/utilities/spinner.tsx` | Loading indicators. |
| `VisuallyHidden`, `SkipLink` | `src/components/utilities/visually-hidden.tsx` | Screen-reader and keyboard helpers. |
| `Sticky`, `ScrollToTop` | `src/components/utilities/sticky.tsx` | Sticky wrapper; reduced-motion-aware scroll to top. |
| `BrandSettingsPanel`, `LOGO_MAX_BYTES` | `src/components/utilities/brand-settings-panel.tsx` | Colour pickers + hex validation, contrast warning, name, font (catalogue or validated Google font), logo upload, live preview, reset, optional presets. |
| `BrandPresetPicker`, `isPresetActive` | `src/components/utilities/brand-preset-picker.tsx` | Preset cards applying `updateBrand(preset.brand)`. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `LOGO_MAX_BYTES` = 512 KB | utilities |
| Accepted logo types = fixed | utilities |
| Contrast warning threshold = 4.5:1 | utilities |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/utilities/tooltip.test.tsx` | `Tooltip` |
| `src/components/utilities/brand-settings-panel.test.tsx` | `BrandSettingsPanel` |
| `src/components/utilities/brand-preset-picker.test.tsx` | `BrandPresetPicker` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| UTL-FR-01 | `src/components/utilities/tooltip.tsx` | `tooltip.test.tsx` | Done |
| UTL-FR-02 | `src/components/utilities/popover.tsx` | — | Done (no test) |
| UTL-FR-03 | `src/components/utilities/copy-to-clipboard.tsx` | — | Done (no test) |
| UTL-FR-04 | `src/components/utilities/code-snippet.tsx` | — | Done (no test) |
| UTL-FR-05 | `src/components/utilities/spinner.tsx` | — | Done (no test) |
| UTL-FR-06 | `src/components/utilities/visually-hidden.tsx` | — | Done (no test) |
| UTL-FR-07 | `src/components/utilities/sticky.tsx` | — | Done (no test) |
| UTL-FR-08 | `src/components/utilities/brand-settings-panel.tsx` | `brand-settings-panel.test.tsx` | Done |
| UTL-FR-09 | `src/components/utilities/brand-preset-picker.tsx` | `brand-preset-picker.test.tsx` | Done |

## 10. Gaps against the invariants

- `BrandSettingsPanel` applies changes locally (`updateBrand` + localStorage) with no `onSave` / before-change hook, so audit, System Admin permission and second-person confirmation (PRD §10.4) must be added by the app around it.
- Logo size / type limits are literals (invariant 8) with no TECH-DEBT ID.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
