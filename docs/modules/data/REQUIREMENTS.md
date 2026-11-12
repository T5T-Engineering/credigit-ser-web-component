# Data components — requirements

| | |
|---|---|
| Module | `src/components/data` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §6.6.3 (Top 10/20/50/100 concentration lists); §6.2 (36-cell interpretive layer, heat maps via `Matrix`); §10.1 (immutable audit log — `AuditTrail` view); §10.3 (drillable figures) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Data-heavy application components: `DataTable` (search, filters, sort, paging, selection, bulk actions, CSV export, server mode), filter bar, description lists, heat-map matrix, metric deltas, record headers, activity feed / audit trail view and kanban board.

**In scope**

- Client-side and server-driven (`manual`) tables
- CSV export of the visible dataset
- Read-only rendering of audit entries passed in

**Out of scope**

- Writing to the audit log (backend)
- Data fetching / tenant scoping (app + backend)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| DAT-FR-01 | `DataTable` — Full-featured table: columns, search, filters, sort, paging, selection, bulk actions, row link / click, loading / empty states, sticky header, mobile cards, CSV export, server mode. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-02 | `toCsv` — RFC 4180 CSV with formula-injection guard and UTF-8 BOM download. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-03 | `FilterBar` — Pill filters (select and date range), search, clear all. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-04 | `DescriptionList` — Label / value lists and grey tile grid. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-05 | `Matrix (HeatmapGrid)` — Accessible rows × columns heat map with thresholds, continuous scale, clickable cells and legend. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-06 | `MetricDelta` — Change indicator with intent / invert; arrow + hidden text. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-07 | `EntityHeader` — Record page header with identifier copy, status, facts, actions, tabs. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-08 | `ActivityFeed` — Day-grouped activity list; detailed audit mode with before / after changes, IP, device and immutable notice. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| DAT-FR-10 | `DataTable.onExport(rows, filename)` — called before the CSV download (filtered + sorted rows, all pages); returning `false` (or a promise resolving to `false`) cancels it. Lets the app check the export permission and write the audit entry. | Invariants 9 (audited) and 12 (exports are permissioned); data IMPLEMENTATION §10 gap |
| DAT-FR-09 | `KanbanBoard` — Columns with WIP limits, drag & drop plus keyboard Move menu. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `DataTable.defaultPageSize` / `pageSizeOptions` | Paging defaults | 10 | Assumption — UI default, overridable. |
| `Matrix.thresholds`, `KanbanBoard.columns[].limit` | Heat-map bands, WIP limits | None (props) | From rules engine via the app. |

## 5. Workflows (Operations)

Not applicable. A UI library routes nothing; consuming apps submit to the backend Operations workflow.

## 6. Notifications

Not applicable. The library sends no notifications.

## 7. Events and hook points

Not applicable as domain events / hook points. Components expose UI callbacks only (listed in IMPLEMENTATION §3); the consuming app turns them into commands that the backend audits and publishes.

## 8. Integration points

Not applicable. No connector or network call.

## 9. Non-functional

- **Accessibility:** WCAG 2.2 AA — visible focus ring, keyboard support, roles/ARIA, labels on every input, `prefers-reduced-motion`, 24×24 px minimum target, text contrast ≥ 4.5:1 ([CONVENTIONS §4](../../CONVENTIONS.md)).
- **Theming:** colours only from semantic / brand / status tokens; fonts only `font-sans|display|mono` (`font-code` for code); works inside every surface theme `xlight|light|dark|xdark` and density `compact|regular|spacious` ([CONVENTIONS §3](../../CONVENTIONS.md)).
- **Design:** Bolt shapes, sizes, type scale, elevation, motion and states ([BOLT-DESIGN](../../BOLT-DESIGN.md)).
- **API stability:** the props in [CONVENTIONS §5](../../CONVENTIONS.md) are the public contract; optional props may be added, none renamed or removed.
- **No domain data:** domain mappings, limits and labels are passed in as props ([CONVENTIONS §4](../../CONVENTIONS.md)).
- **Audit / tenant isolation:** Not applicable in the library; enforced by the backend and the consuming app.
- **Security:** CSV export guards against spreadsheet formula injection.
- **Export:** `DataTable` export runs client-side on rows already loaded; apps must gate the Export button behind an export permission (invariant 12).

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
