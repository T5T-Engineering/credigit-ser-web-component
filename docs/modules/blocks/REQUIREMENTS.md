# UI blocks — requirements

| | |
|---|---|
| Module | `src/components/blocks` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §6.1 (lending lifecycle shown with `Steps`); §6.11 (dashboard KPI tiles via `StatCard`) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend, credigit-ser-landing |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Bolt UI-Blocks: cards, teasers, headers, hero, feature rows, banners and alerts, accordion, modal and drawer, KPI stat card, empty state, steps / timeline, CTA band and toasts.

**In scope**

- Composite presentational surfaces
- Dialogs (modal / drawer) with focus management
- Toast notifications in the page (`useToast`)

**Out of scope**

- Server notifications (see `app` → `NotificationCenter`; delivery is the notification service)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| BLK-FR-01 | `Card` — Squircle card with variants, interactive / link mode, padding and radius. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-02 | `Teaser` — Feature / module tile. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-03 | `PageHeader` — Page and section headings with eyebrow, description, actions. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-04 | `Hero` — Hero block with media, theme and background. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-05 | `FeatureRow` — Split text / media row. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-06 | `InfoSection` — Label / value pairs. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-07 | `ActionBlocks` — Grid of large linked actions. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-08 | `Banner` — Dismissible page announcement. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-09 | `Alert` — Inline toned message. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-10 | `Blockquote` — Quote with author (no fabricated testimonials). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-11 | `Accordion` — Single / multiple disclosure list. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-12 | `Modal` — Native `<dialog>` with focus trap, Escape and focus restore. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-13 | `Drawer` — Side sheet dialog. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-14 | `StatCard` — KPI tile with delta and intent. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-15 | `EmptyState` — Empty / no-access placeholder. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-16 | `Steps / Timeline` — Vertical / horizontal progress steps. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-17 | `CtaBand` — Call-to-action band. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-18 | `Toaster` — Auto-dismissing toasts in an `aria-live="polite"` region. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BLK-FR-19 | `ConfirmDialog` — Confirmation modal for consequential commands (lock / unlock a user, reset MFA, deactivate, revoke): title, description, `tone` (`danger` uses the danger button), optional reason field (`reason: "required" \| "optional"`, `minReasonLength`), async `onConfirm(reason)` with busy state; returning `false` or rejecting keeps it open and shows an error. The backend IAM commands take a `reason` that is shown to approvers and kept in the audit log. | identity-access API §4 (`{ reason }` bodies); invariant 9 (audited) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| Toast auto-dismiss duration | How long a toast stays | 5000 ms (`duration`; `Infinity` keeps it) | Assumption — UI timing, not a business rule. |

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
