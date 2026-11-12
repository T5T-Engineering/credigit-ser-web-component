# Data visualisation — implementation

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
| `src/components/data-viz/index.ts` | Group barrel |
| `src/components/data-viz/radar-chart.tsx` | RadarChart |
| `src/components/data-viz/bar-chart.tsx` | BarChart |
| `src/components/data-viz/line-chart.tsx` | LineChart |
| `src/components/data-viz/donut-chart.tsx` | DonutChart |
| `src/components/data-viz/progress-bar.tsx` | ProgressBar |
| `src/components/data-viz/gauge.tsx` | Gauge |
| `src/components/data-viz/sparkline.tsx` | Sparkline |
| `src/components/data-viz/rag-indicator.tsx` | RagIndicator |
| `src/components/data-viz/stacked-bar-chart.tsx` | StackedBarChart |
| `src/components/data-viz/area-chart.tsx` | AreaChart |
| `src/components/data-viz/waterfall-chart.tsx` | WaterfallChart |
| `src/components/data-viz/scatter-chart.tsx` | ScatterChart |
| `src/components/data-viz/treemap.tsx` | Treemap |
| `src/components/data-viz/mini-bar-list.tsx` | MiniBarList |
| `src/components/data-viz/chart-overlays.tsx` | Chart overlays / utils |
| `src/components/data-viz/chart-utils.ts` | Chart overlays / utils |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `RadarChart`, `radarPoint` | `src/components/data-viz/radar-chart.tsx` | 360 RAR radar: axes, series, max, levels, legend, values, label size. |
| `BarChart` | `src/components/data-viz/bar-chart.tsx` | Vertical / horizontal bars. |
| `LineChart`, `resolveYDomain` | `src/components/data-viz/line-chart.tsx` | Multi-series line with auto domain, reference lines and right axis. |
| `DonutChart` | `src/components/data-viz/donut-chart.tsx` | Donut with centre label / value. |
| `ProgressBar` | `src/components/data-viz/progress-bar.tsx` | 0–1 progress meter. |
| `Gauge` | `src/components/data-viz/gauge.tsx` | Gauge with toned bands (bands passed in). |
| `Sparkline` | `src/components/data-viz/sparkline.tsx` | Inline trend line. |
| `RagIndicator` | `src/components/data-viz/rag-indicator.tsx` | Red / amber / green dot + text (colour never the only signal). |
| `StackedBarChart` | `src/components/data-viz/stacked-bar-chart.tsx` | Stacked / grouped bars with totals and legend. |
| `AreaChart` | `src/components/data-viz/area-chart.tsx` | Overlapping / stacked area chart. |
| `WaterfallChart`, `computeWaterfall`, `waterfallAxis` | `src/components/data-viz/waterfall-chart.tsx` | Start / delta / total waterfall with axis break and increase intent. |
| `ScatterChart` | `src/components/data-viz/scatter-chart.tsx` | Scatter / bubble chart with reference lines, quadrants and vector arrow. |
| `Treemap`, `squarify` | `src/components/data-viz/treemap.tsx` | Squarified treemap, optional clickable tiles. |
| `MiniBarList` | `src/components/data-viz/mini-bar-list.tsx` | Ranked bar list (e.g. Top 10 obligors). |
| `Chart overlays / utils` | `src/components/data-viz/chart-overlays.tsx` | Shared tooltips, legends, tone → CSS variable mapping. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| Thresholds / bands / reference lines (`bands`, `referenceLines`, `quadrants`) = None in the library (props) | data-viz |
| `RadarChart.max` / `levels` = 100 / 5 | data-viz |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/data-viz/radar-chart.test.tsx` | `RadarChart` |
| `src/components/data-viz/chart-options.test.tsx` | `LineChart`, `AreaChart`, `Chart overlays / utils` |
| `src/components/data-viz/gauge.test.tsx` | `Gauge` |
| `src/components/data-viz/charts-extra.test.tsx` | `StackedBarChart`, `AreaChart`, `ScatterChart` |
| `src/components/data-viz/waterfall-chart.test.tsx` | `WaterfallChart` |
| `src/components/data-viz/treemap.test.tsx` | `Treemap` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| VIZ-FR-01 | `src/components/data-viz/radar-chart.tsx` | `radar-chart.test.tsx` | Done |
| VIZ-FR-02 | `src/components/data-viz/bar-chart.tsx` | — | Done (no test) |
| VIZ-FR-03 | `src/components/data-viz/line-chart.tsx` | `chart-options.test.tsx` | Done |
| VIZ-FR-04 | `src/components/data-viz/donut-chart.tsx` | — | Done (no test) |
| VIZ-FR-05 | `src/components/data-viz/progress-bar.tsx` | — | Done (no test) |
| VIZ-FR-06 | `src/components/data-viz/gauge.tsx` | `gauge.test.tsx` | Done |
| VIZ-FR-07 | `src/components/data-viz/sparkline.tsx` | — | Done (no test) |
| VIZ-FR-08 | `src/components/data-viz/rag-indicator.tsx` | — | Done (no test) |
| VIZ-FR-09 | `src/components/data-viz/stacked-bar-chart.tsx` | `charts-extra.test.tsx` | Done |
| VIZ-FR-10 | `src/components/data-viz/area-chart.tsx` | `chart-options.test.tsx`, `charts-extra.test.tsx` | Done |
| VIZ-FR-11 | `src/components/data-viz/waterfall-chart.tsx` | `waterfall-chart.test.tsx` | Done |
| VIZ-FR-12 | `src/components/data-viz/scatter-chart.tsx` | `charts-extra.test.tsx` | Done |
| VIZ-FR-13 | `src/components/data-viz/treemap.tsx` | `treemap.test.tsx` | Done |
| VIZ-FR-14 | `src/components/data-viz/mini-bar-list.tsx` | — | Done (no test) |
| VIZ-FR-15 | `src/components/data-viz/chart-overlays.tsx` | `chart-options.test.tsx` | Done |

## 10. Gaps against the invariants

- PRD §10.3 (drill-down to source from the UI) is only partly supported: `Treemap.onItemClick` and `MiniBarList.href` exist; other charts expose no point-click / drill-down callback.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
