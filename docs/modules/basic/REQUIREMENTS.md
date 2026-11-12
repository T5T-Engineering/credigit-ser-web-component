# Basic components — requirements

| | |
|---|---|
| Module | `src/components/basic` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §6.2 (risk classification statuses shown by `riskStatusTones`); §2.3 product principles (indirect) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend, credigit-ser-landing |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Primitive building blocks every screen uses: buttons, chips, badges, typography, links, icons, lists, avatars, the simple table and the segmented control. They carry the Bolt pill geometry and the tone system (`Tone`, `toneStyles`) that the rest of the library reuses.

**In scope**

- Primitive controls and typography
- `Tone` type and `toneStyles` (single definition for the library)
- `StatusBadge` with a generic status → tone mapping

**Out of scope**

- Form inputs (see `forms`)
- Data-heavy tables (see `data` → `DataTable`)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| BAS-FR-01 | `Button` — Pill button with variants primary / secondary / tertiary / text / danger, sizes small–large, icons, `loading`, `fullWidth`, `href` / `as` polymorphism and `wrap` for multi-line labels. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-02 | `IconButton` — Icon-only button with a required accessible `label`. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-03 | `Chip` — Toned chip with optional icon and remove action; list wrapper. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-04 | `Badge` — Toned badge, variants soft / solid / outline. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-05 | `StatusBadge` — Generic status → tone badge; label derived from the status; tone map passed in (`riskStatusTones` is an exported example map). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-06 | `Text` — Typography on the Bolt type scale; heading level independent of visual size. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-07 | `TextLink` — Link with `external` mode (icon + `rel`) and router `as`. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-08 | `Icon` — lucide icon wrapper; decorative unless `label` is set. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-09 | `List` — Unordered / ordered / check / inline lists. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-10 | `Avatar` — Image or initials avatar. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-11 | `Table` — Styled native table, numeric cells, striped and sticky header. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-12 | `SegmentedControl` — Radiogroup of pill options with keyboard support. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BAS-FR-13 | `Tone` — Single `Tone` union and class map used by every toned component. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `riskStatusTones` (exported default map) | Example mapping of risk / credit statuses (PERFORMING … DISBURSED) to tones | See CONVENTIONS §5 basic | Assumption — status vocabulary should come from tenant configuration; consumers pass `tones`. |

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

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
