# Layouts — requirements

| | |
|---|---|
| Module | `src/components/layouts` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §7 (printed offer letters — `AppShell` print rules) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend (`AppShell`), credigit-ser-landing (`Site`, `Band`) |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Page structure: containers, Bolt bands with surface themes, stacks, grids, two-column layout, the marketing `Site` frame and the application `AppShell` (responsive sidebar drawer, print-clean).

**In scope**

- Spacing / width primitives
- Surface theme application (`theme` → `data-cg-theme`)
- Site and application frames

**Out of scope**

- Navigation content (see `navigation`)
- Menu definitions (apps own routes and menus)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| LAY-FR-01 | `Container` — Max-width container (640 / 896 / 1200 / 1440 / full) with gutters. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-02 | `Band` — Page section with surface `theme`, spacing, optional container and decorative background. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-03 | `Stack` — Flex stack with gap, direction, alignment. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-04 | `Grid` — Responsive column grid. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-05 | `Layout` — Content + aside layout. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-06 | `Site` — Page frame with header, footer, `<main id="main">` and skip link. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-07 | `AppShell` — Application frame: sidebar (drawer below `lg`), top bar, content; sidebar / top bar hidden in print. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| LAY-FR-08 | `Divider` — Horizontal / vertical divider with optional label. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

Not applicable. No business values; layout and spacing come from tokens.

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
- **Responsive:** sidebar becomes a drawer below `lg`; no horizontal page scroll.
- **Print:** `AppShell` chrome is `print:hidden` so documents print cleanly.

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
