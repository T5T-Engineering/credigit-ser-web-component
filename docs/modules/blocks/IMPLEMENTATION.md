# UI blocks — implementation

| | |
|---|---|
| Status | Built |
| Requirements | [REQUIREMENTS.md](REQUIREMENTS.md) |
| Last updated | 2026-11-12 (feature/wc-iam) |

## 1. Design overview

React 19 function components, TypeScript strict, Tailwind 4 token utilities, lucide icons, shipped as source. Exported through the group barrel `index.ts` and re-exported by `src/index.ts`. Interactive files start with `"use client";`; presentational ones stay server-compatible. Classes merged with `cx()`; native props spread.

## 2. Files and entry points

| Path | Role |
|---|---|
| `src/components/blocks/index.ts` | Group barrel |
| `src/components/blocks/card.tsx` | Card |
| `src/components/blocks/teaser.tsx` | Teaser |
| `src/components/blocks/page-header.tsx` | PageHeader |
| `src/components/blocks/section-header.tsx` | PageHeader |
| `src/components/blocks/hero.tsx` | Hero |
| `src/components/blocks/feature-row.tsx` | FeatureRow |
| `src/components/blocks/info-section.tsx` | InfoSection |
| `src/components/blocks/action-blocks.tsx` | ActionBlocks |
| `src/components/blocks/banner.tsx` | Banner |
| `src/components/blocks/alert.tsx` | Alert |
| `src/components/blocks/blockquote.tsx` | Blockquote |
| `src/components/blocks/accordion.tsx` | Accordion |
| `src/components/blocks/modal.tsx` | Modal |
| `src/components/blocks/use-dialog.ts` | Modal |
| `src/components/blocks/drawer.tsx` | Drawer |
| `src/components/blocks/stat-card.tsx` | StatCard |
| `src/components/blocks/empty-state.tsx` | EmptyState |
| `src/components/blocks/steps.tsx` | Steps / Timeline |
| `src/components/blocks/cta-band.tsx` | CtaBand |
| `src/components/blocks/toast.tsx` | Toaster |
| `src/components/blocks/confirm-dialog.tsx` | ConfirmDialog |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardMedia` | `src/components/blocks/card.tsx` | Squircle card with variants, interactive / link mode, padding and radius. |
| `Teaser` | `src/components/blocks/teaser.tsx` | Feature / module tile. |
| `PageHeader`, `SectionHeader` | `src/components/blocks/page-header.tsx` | Page and section headings with eyebrow, description, actions. |
| `Hero` | `src/components/blocks/hero.tsx` | Hero block with media, theme and background. |
| `FeatureRow` | `src/components/blocks/feature-row.tsx` | Split text / media row. |
| `InfoSection` | `src/components/blocks/info-section.tsx` | Label / value pairs. |
| `ActionBlocks` | `src/components/blocks/action-blocks.tsx` | Grid of large linked actions. |
| `Banner` | `src/components/blocks/banner.tsx` | Dismissible page announcement. |
| `Alert` | `src/components/blocks/alert.tsx` | Inline toned message. |
| `Blockquote` | `src/components/blocks/blockquote.tsx` | Quote with author (no fabricated testimonials). |
| `Accordion`, `AccordionItem` | `src/components/blocks/accordion.tsx` | Single / multiple disclosure list. |
| `Modal` | `src/components/blocks/modal.tsx` | Native `<dialog>` with focus trap, Escape and focus restore. |
| `Drawer` | `src/components/blocks/drawer.tsx` | Side sheet dialog. |
| `StatCard` | `src/components/blocks/stat-card.tsx` | KPI tile with delta and intent. |
| `EmptyState` | `src/components/blocks/empty-state.tsx` | Empty / no-access placeholder. |
| `Steps / Timeline` | `src/components/blocks/steps.tsx` | Vertical / horizontal progress steps. |
| `CtaBand` | `src/components/blocks/cta-band.tsx` | Call-to-action band. |
| `Toaster`, `useToast` | `src/components/blocks/toast.tsx` | Auto-dismissing toasts in an `aria-live="polite"` region. |
| `ConfirmDialog` | `src/components/blocks/confirm-dialog.tsx` | Confirmation modal with optional (required) reason and async confirm. Built on `Modal`. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| Toast auto-dismiss duration = 5000 ms | blocks |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`).

| Test file | Covers |
|---|---|
| `src/components/blocks/block-props.test.tsx` | `Card`, `PageHeader`, `Hero` |
| `src/components/blocks/feature-row.test.tsx` | `FeatureRow` |
| `src/components/blocks/banner.test.tsx` | `Banner` |
| `src/components/blocks/accordion.test.tsx` | `Accordion` |
| `src/components/blocks/modal.test.tsx` | `Modal`, `Drawer` |
| `src/components/blocks/toast.test.tsx` | `Toaster` |
| `src/components/blocks/confirm-dialog.test.tsx` | `ConfirmDialog` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| BLK-FR-01 | `src/components/blocks/card.tsx` | `block-props.test.tsx` | Done |
| BLK-FR-02 | `src/components/blocks/teaser.tsx` | — | Done (no test) |
| BLK-FR-03 | `src/components/blocks/page-header.tsx` | `block-props.test.tsx` | Done |
| BLK-FR-04 | `src/components/blocks/hero.tsx` | `block-props.test.tsx` | Done |
| BLK-FR-05 | `src/components/blocks/feature-row.tsx` | `feature-row.test.tsx` | Done |
| BLK-FR-06 | `src/components/blocks/info-section.tsx` | — | Done (no test) |
| BLK-FR-07 | `src/components/blocks/action-blocks.tsx` | — | Done (no test) |
| BLK-FR-08 | `src/components/blocks/banner.tsx` | `banner.test.tsx` | Done |
| BLK-FR-09 | `src/components/blocks/alert.tsx` | — | Done (no test) |
| BLK-FR-10 | `src/components/blocks/blockquote.tsx` | — | Done (no test) |
| BLK-FR-11 | `src/components/blocks/accordion.tsx` | `accordion.test.tsx` | Done |
| BLK-FR-12 | `src/components/blocks/modal.tsx` | `modal.test.tsx` | Done |
| BLK-FR-13 | `src/components/blocks/drawer.tsx` | `modal.test.tsx` | Done |
| BLK-FR-14 | `src/components/blocks/stat-card.tsx` | — | Done (no test) |
| BLK-FR-15 | `src/components/blocks/empty-state.tsx` | — | Done (no test) |
| BLK-FR-16 | `src/components/blocks/steps.tsx` | — | Done (no test) |
| BLK-FR-17 | `src/components/blocks/cta-band.tsx` | — | Done (no test) |
| BLK-FR-18 | `src/components/blocks/toast.tsx` | `toast.test.tsx` | Done |
| BLK-FR-19 | `src/components/blocks/confirm-dialog.tsx` | `confirm-dialog.test.tsx` | Done |

## 10. Gaps against the invariants

- Invariant 8: the literal defaults listed in §5 are registered as exceptions in [TECH-DEBT.md](../../../TECH-DEBT.md) (ids in §11 and next to each literal in the code).
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

Registered in [TECH-DEBT.md](../../../TECH-DEBT.md):

| ID | Item | Status |
|---|---|---|
| TD-007 | Toast auto-dismiss defaults to 5000 ms | Open |
