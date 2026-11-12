# Navigation — requirements

| | |
|---|---|
| Module | `src/components/navigation` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §4 (role-based access — apps filter menu items before passing them) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend (`SideNav`), credigit-ser-landing (`Navbar`, `PageFooter`) |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Navigation controls: marketing navbar, application side navigation, breadcrumb, pagination, tabs, dropdown menu, table of contents and page footer. Menu content (items, routes, active state) is always passed in by the app.

**In scope**

- Navigation rendering and keyboard patterns
- Router integration via `linkComponent`

**Out of scope**

- Menu / route definitions and which items a user may see (apps resolve from permissions)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| NAV-FR-01 | `Navbar` — Top navigation with logo, links, actions, sticky / transparent modes and accessible mobile disclosure menu. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-02 | `SideNav` — Grouped application sidebar on `xdark` surface with environment, user and badges. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-09 | `SideNav` permission filtering — items take `permission?: string \| string[]` (any of); with a `can(permission)` prop, items the user may not use are not rendered and groups left empty are hidden. Without `can` every item renders (backward compatible). | Invariants 9 (navigable) and 12; identity-access API §5 (menus) |
| NAV-FR-03 | `Breadcrumb` — Breadcrumb trail. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-04 | `Pagination` — Page navigation with sibling range. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-05 | `Tabs` — ARIA tabs (underline / pill). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-06 | `Menu` — Keyboard-navigable dropdown; Escape / outside click closes. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-07 | `TableOfContents` — Section list highlighting the section in view. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| NAV-FR-08 | `PageFooter` — Footer with logo, columns, legal and bottom links. | [CONVENTIONS §5](../../CONVENTIONS.md) |

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

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
