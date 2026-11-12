# Layouts — implementation

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
| `src/components/layouts/index.ts` | Group barrel |
| `src/components/layouts/container.tsx` | Container |
| `src/components/layouts/band.tsx` | Band |
| `src/components/layouts/stack.tsx` | Stack |
| `src/components/layouts/grid.tsx` | Grid |
| `src/components/layouts/layout.tsx` | Layout |
| `src/components/layouts/site.tsx` | Site |
| `src/components/layouts/app-shell.tsx` | AppShell |
| `src/components/layouts/divider.tsx` | Divider |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Container` | `src/components/layouts/container.tsx` | Max-width container (640 / 896 / 1200 / 1440 / full) with gutters. |
| `Band` | `src/components/layouts/band.tsx` | Page section with surface `theme`, spacing, optional container and decorative background. |
| `Stack` | `src/components/layouts/stack.tsx` | Flex stack with gap, direction, alignment. |
| `Grid` | `src/components/layouts/grid.tsx` | Responsive column grid. |
| `Layout` | `src/components/layouts/layout.tsx` | Content + aside layout. |
| `Site` | `src/components/layouts/site.tsx` | Page frame with header, footer, `<main id="main">` and skip link. |
| `AppShell` | `src/components/layouts/app-shell.tsx` | Application frame: sidebar (drawer below `lg`), top bar, content; sidebar / top bar hidden in print. |
| `Divider` | `src/components/layouts/divider.tsx` | Horizontal / vertical divider with optional label. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

None.

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/layouts/app-shell.test.tsx` | `AppShell` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| LAY-FR-01 | `src/components/layouts/container.tsx` | — | Done (no test) |
| LAY-FR-02 | `src/components/layouts/band.tsx` | — | Done (no test) |
| LAY-FR-03 | `src/components/layouts/stack.tsx` | — | Done (no test) |
| LAY-FR-04 | `src/components/layouts/grid.tsx` | — | Done (no test) |
| LAY-FR-05 | `src/components/layouts/layout.tsx` | — | Done (no test) |
| LAY-FR-06 | `src/components/layouts/site.tsx` | — | Done (no test) |
| LAY-FR-07 | `src/components/layouts/app-shell.tsx` | `app-shell.test.tsx` | Done |
| LAY-FR-08 | `src/components/layouts/divider.tsx` | — | Done (no test) |

## 10. Gaps against the invariants

- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
