# Basic components — implementation

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
| `src/components/basic/index.ts` | Group barrel |
| `src/components/basic/button.tsx` | Button |
| `src/components/basic/icon-button.tsx` | IconButton |
| `src/components/basic/chip.tsx` | Chip |
| `src/components/basic/chip-list.tsx` | Chip |
| `src/components/basic/badge.tsx` | Badge |
| `src/components/basic/status-badge.tsx` | StatusBadge |
| `src/components/basic/text.tsx` | Text |
| `src/components/basic/heading.tsx` | Text |
| `src/components/basic/eyebrow.tsx` | Text |
| `src/components/basic/text-link.tsx` | TextLink |
| `src/components/basic/icon.tsx` | Icon |
| `src/components/basic/list.tsx` | List |
| `src/components/basic/avatar.tsx` | Avatar |
| `src/components/basic/table.tsx` | Table |
| `src/components/basic/segmented-control.tsx` | SegmentedControl |
| `src/components/basic/tone.ts` | Tone |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Button`, `buttonStyles` | `src/components/basic/button.tsx` | Pill button with variants primary / secondary / tertiary / text / danger, sizes small–large, icons, `loading`, `fullWidth`, `href` / `as` polymorphism and `wrap` for multi-line labels. |
| `IconButton` | `src/components/basic/icon-button.tsx` | Icon-only button with a required accessible `label`. |
| `Chip`, `ChipList` | `src/components/basic/chip.tsx` | Toned chip with optional icon and remove action; list wrapper. |
| `Badge` | `src/components/basic/badge.tsx` | Toned badge, variants soft / solid / outline. |
| `StatusBadge`, `riskStatusTones` | `src/components/basic/status-badge.tsx` | Generic status → tone badge; label derived from the status; tone map passed in (`riskStatusTones` is an exported example map). |
| `Text`, `Heading`, `Eyebrow` | `src/components/basic/text.tsx` | Typography on the Bolt type scale; heading level independent of visual size. |
| `TextLink` | `src/components/basic/text-link.tsx` | Link with `external` mode (icon + `rel`) and router `as`. |
| `Icon` | `src/components/basic/icon.tsx` | lucide icon wrapper; decorative unless `label` is set. |
| `List` | `src/components/basic/list.tsx` | Unordered / ordered / check / inline lists. |
| `Avatar` | `src/components/basic/avatar.tsx` | Image or initials avatar. |
| `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` | `src/components/basic/table.tsx` | Styled native table, numeric cells, striped and sticky header. |
| `SegmentedControl` | `src/components/basic/segmented-control.tsx` | Radiogroup of pill options with keyboard support. |
| `Tone`, `toneStyles` | `src/components/basic/tone.ts` | Single `Tone` union and class map used by every toned component. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `riskStatusTones` (exported default map) = See CONVENTIONS §5 basic | basic |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/basic/button.test.tsx` | `Button`, `IconButton` |
| `src/components/basic/status-badge.test.tsx` | `Chip`, `StatusBadge` |
| `src/components/basic/segmented-control.test.tsx` | `SegmentedControl` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| BAS-FR-01 | `src/components/basic/button.tsx` | `button.test.tsx` | Done |
| BAS-FR-02 | `src/components/basic/icon-button.tsx` | `button.test.tsx` | Done |
| BAS-FR-03 | `src/components/basic/chip.tsx` | `status-badge.test.tsx` | Done |
| BAS-FR-04 | `src/components/basic/badge.tsx` | — | Done (no test) |
| BAS-FR-05 | `src/components/basic/status-badge.tsx` | `status-badge.test.tsx` | Done |
| BAS-FR-06 | `src/components/basic/text.tsx` | — | Done (no test) |
| BAS-FR-07 | `src/components/basic/text-link.tsx` | — | Done (no test) |
| BAS-FR-08 | `src/components/basic/icon.tsx` | — | Done (no test) |
| BAS-FR-09 | `src/components/basic/list.tsx` | — | Done (no test) |
| BAS-FR-10 | `src/components/basic/avatar.tsx` | — | Done (no test) |
| BAS-FR-11 | `src/components/basic/table.tsx` | — | Done (no test) |
| BAS-FR-12 | `src/components/basic/segmented-control.tsx` | `segmented-control.test.tsx` | Done |
| BAS-FR-13 | `src/components/basic/tone.ts` | — | Done (no test) |

## 10. Gaps against the invariants

- `riskStatusTones` embeds a domain status list in the library (overridable through `tones`); consumers should pass their configured map.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
