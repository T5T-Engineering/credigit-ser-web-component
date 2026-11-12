# Data visualisation — requirements

| | |
|---|---|
| Module | `src/components/data-viz` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §6.2 (360 RAR radar chart and composite position chart with strategic-thrust arrow, Figure 4a); §6.6 (concentration, Top-N obligors); §6.7 (ECL waterfall); §6.11 (executive dashboards); §6.12 trend tracking; §10.3 (figures drillable to source) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend (dashboards, 360 RAR) |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Theme-aware, accessible SVG charts for risk analytics, including the 360° Risk Assessment Radar, scatter / quadrant chart with strategic-thrust vector, waterfall, treemap, gauges, sparklines and RAG indicators.

**In scope**

- Chart rendering from data passed in
- Pure layout helpers (`computeWaterfall`, `squarify`, `resolveYDomain`, `radarPoint`)
- Accessible text alternatives (hidden data tables / summaries)

**Out of scope**

- Calculating risk scores, ECL, RAROC or thresholds (backend / rules engine)
- Drill-down navigation targets (apps pass handlers / links)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| VIZ-FR-01 | `RadarChart` — 360 RAR radar: axes, series, max, levels, legend, values, label size. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-02 | `BarChart` — Vertical / horizontal bars. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-03 | `LineChart` — Multi-series line with auto domain, reference lines and right axis. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-04 | `DonutChart` — Donut with centre label / value. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-05 | `ProgressBar` — 0–1 progress meter. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-06 | `Gauge` — Gauge with toned bands (bands passed in). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-07 | `Sparkline` — Inline trend line. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-08 | `RagIndicator` — Red / amber / green dot + text (colour never the only signal). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-09 | `StackedBarChart` — Stacked / grouped bars with totals and legend. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-10 | `AreaChart` — Overlapping / stacked area chart. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-11 | `WaterfallChart` — Start / delta / total waterfall with axis break and increase intent. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-12 | `ScatterChart` — Scatter / bubble chart with reference lines, quadrants and vector arrow. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-13 | `Treemap` — Squarified treemap, optional clickable tiles. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-14 | `MiniBarList` — Ranked bar list (e.g. Top 10 obligors). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| VIZ-FR-15 | `Chart overlays / utils` — Shared tooltips, legends, tone → CSS variable mapping. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| Thresholds / bands / reference lines (`bands`, `referenceLines`, `quadrants`) | Hurdles, RAG cut-offs, quadrant splits | None in the library (props) | PRD §6.2 / §6.9 — values come from the rules engine via the app. |
| `RadarChart.max` / `levels` | Radar scale | 100 / 5 | Assumption — display scale only; app passes the 360 RAR scale. |

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
- **Charts:** SVG, `role="img"` + `aria-label` and a hidden data table or `<title>/<desc>`; responsive `viewBox`; colours via `var(--cg-…)` so charts follow runtime brand changes.

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
