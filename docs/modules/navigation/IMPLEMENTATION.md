# Navigation — implementation

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
| `src/components/navigation/index.ts` | Group barrel |
| `src/components/navigation/navbar.tsx` | Navbar |
| `src/components/navigation/side-nav.tsx` | SideNav |
| `src/components/navigation/breadcrumb.tsx` | Breadcrumb |
| `src/components/navigation/pagination.tsx` | Pagination |
| `src/components/navigation/tabs.tsx` | Tabs |
| `src/components/navigation/menu.tsx` | Menu |
| `src/components/navigation/table-of-contents.tsx` | TableOfContents |
| `src/components/navigation/page-footer.tsx` | PageFooter |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `Navbar` | `src/components/navigation/navbar.tsx` | Top navigation with logo, links, actions, sticky / transparent modes and accessible mobile disclosure menu. |
| `SideNav` | `src/components/navigation/side-nav.tsx` | Grouped application sidebar on `xdark` surface with environment, user and badges. |
| `Breadcrumb` | `src/components/navigation/breadcrumb.tsx` | Breadcrumb trail. |
| `Pagination`, `paginationRange` | `src/components/navigation/pagination.tsx` | Page navigation with sibling range. |
| `Tabs` | `src/components/navigation/tabs.tsx` | ARIA tabs (underline / pill). |
| `Menu` | `src/components/navigation/menu.tsx` | Keyboard-navigable dropdown; Escape / outside click closes. |
| `TableOfContents` | `src/components/navigation/table-of-contents.tsx` | Section list highlighting the section in view. |
| `PageFooter` | `src/components/navigation/page-footer.tsx` | Footer with logo, columns, legal and bottom links. |

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
| `src/components/navigation/navbar.test.tsx` | `Navbar` |
| `src/components/navigation/pagination.test.tsx` | `Pagination` |
| `src/components/navigation/tabs.test.tsx` | `Tabs` |
| `src/components/navigation/menu.test.tsx` | `Menu` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| NAV-FR-01 | `src/components/navigation/navbar.tsx` | `navbar.test.tsx` | Done |
| NAV-FR-02 | `src/components/navigation/side-nav.tsx` | — | Done (no test) |
| NAV-FR-03 | `src/components/navigation/breadcrumb.tsx` | — | Done (no test) |
| NAV-FR-04 | `src/components/navigation/pagination.tsx` | `pagination.test.tsx` | Done |
| NAV-FR-05 | `src/components/navigation/tabs.tsx` | `tabs.test.tsx` | Done |
| NAV-FR-06 | `src/components/navigation/menu.tsx` | `menu.test.tsx` | Done |
| NAV-FR-07 | `src/components/navigation/table-of-contents.tsx` | — | Done (no test) |
| NAV-FR-08 | `src/components/navigation/page-footer.tsx` | — | Done (no test) |

## 10. Gaps against the invariants

- Invariant 9 (navigable) and 12: `SideNav` / `Navbar` have no permission field on items; apps must filter items by permission before rendering.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
