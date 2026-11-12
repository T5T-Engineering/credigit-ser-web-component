# Data components — implementation

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
| `src/components/data/index.ts` | Group barrel |
| `src/components/data/data-table.tsx` | DataTable |
| `src/components/data/csv.ts` | toCsv |
| `src/components/data/filter-bar.tsx` | FilterBar |
| `src/components/data/description-list.tsx` | DescriptionList |
| `src/components/data/matrix.tsx` | Matrix (HeatmapGrid) |
| `src/components/data/metric-delta.tsx` | MetricDelta |
| `src/components/data/entity-header.tsx` | EntityHeader |
| `src/components/data/activity-feed.tsx` | ActivityFeed |
| `src/components/data/kanban-board.tsx` | KanbanBoard |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `DataTable`, `processRows` | `src/components/data/data-table.tsx` | Full-featured table: columns, search, filters, sort, paging, selection, bulk actions, row link / click, loading / empty states, sticky header, mobile cards, CSV export, server mode. |
| `toCsv`, `exportCsv`, `escapeCsvField`, `getColumnValue` | `src/components/data/csv.ts` | RFC 4180 CSV with formula-injection guard and UTF-8 BOM download. |
| `FilterBar`, `isFilterActive` | `src/components/data/filter-bar.tsx` | Pill filters (select and date range), search, clear all. |
| `DescriptionList`, `KeyValueGrid` | `src/components/data/description-list.tsx` | Label / value lists and grey tile grid. |
| `Matrix (HeatmapGrid)`, `toneForValue` | `src/components/data/matrix.tsx` | Accessible rows × columns heat map with thresholds, continuous scale, clickable cells and legend. |
| `MetricDelta`, `TrendValue`, `deltaDirection` | `src/components/data/metric-delta.tsx` | Change indicator with intent / invert; arrow + hidden text. |
| `EntityHeader` | `src/components/data/entity-header.tsx` | Record page header with identifier copy, status, facts, actions, tabs. |
| `ActivityFeed`, `AuditTrail` | `src/components/data/activity-feed.tsx` | Day-grouped activity list; detailed audit mode with before / after changes, IP, device and immutable notice. |
| `KanbanBoard` | `src/components/data/kanban-board.tsx` | Columns with WIP limits, drag & drop plus keyboard Move menu. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `DataTable.defaultPageSize` / `pageSizeOptions` = 10 | data |
| `Matrix.thresholds`, `KanbanBoard.columns[].limit` = None (props) | data |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/data/data-table.test.tsx` | `DataTable`, `toCsv` |
| `src/components/data/filter-bar.test.tsx` | `FilterBar` |
| `src/components/data/data-display.test.tsx` | `DescriptionList`, `MetricDelta`, `EntityHeader` |
| `src/components/data/matrix.test.tsx` | `Matrix (HeatmapGrid)` |
| `src/components/data/kanban-board.test.tsx` | `KanbanBoard` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| DAT-FR-01 | `src/components/data/data-table.tsx` | `data-table.test.tsx` | Done |
| DAT-FR-02 | `src/components/data/csv.ts` | `data-table.test.tsx` | Done |
| DAT-FR-03 | `src/components/data/filter-bar.tsx` | `filter-bar.test.tsx` | Done |
| DAT-FR-04 | `src/components/data/description-list.tsx` | `data-display.test.tsx` | Done |
| DAT-FR-05 | `src/components/data/matrix.tsx` | `matrix.test.tsx` | Done |
| DAT-FR-06 | `src/components/data/metric-delta.tsx` | `data-display.test.tsx` | Done |
| DAT-FR-07 | `src/components/data/entity-header.tsx` | `data-display.test.tsx` | Done |
| DAT-FR-08 | `src/components/data/activity-feed.tsx` | — | Done (no test) |
| DAT-FR-09 | `src/components/data/kanban-board.tsx` | `kanban-board.test.tsx` | Done |

## 10. Gaps against the invariants

- `DataTable` CSV export has no hook to record an audit entry or check an export permission; apps must wrap it (`exportFilename` / `toolbar`) — consider an `onExport` callback.
- `ActivityFeed` / `AuditTrail` have no test file.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
