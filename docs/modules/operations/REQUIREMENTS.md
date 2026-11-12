# Operations controls — requirements

| | |
|---|---|
| Module | `src/components/operations` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §2.3 (one configurable maker-checker / co-signer workflow engine; limits as Rules & Parameters Engine parameters); §4.0–§4.2 (tenant-configurable tiers, roles, limits); §6.1.2 (co-signer / adjudicator matrix); §10.4 (configuration editable by System Admin, audited, second-person confirmation) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend (Operations / Rules / Templates / Extensions screens); backend: credigit-ser-core-backend; templates: credigit-ser-notification-service |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Controls for the Operations area (invariants 8 and 9): typed business-rule editors and cards, workflow step editor and diagram, running-operation card / timeline with SLA countdown, safe HTML template preview, template variables, domain-event log and hook / event subscription list, key-value editor.

**In scope**

- Editing and displaying rule values, workflow definitions, operation instances, templates, events and subscriptions
- Client-side validation helpers

**Out of scope**

- Executing workflows, storing rules, sending notifications, dispatching events (backend)
- Deciding approver eligibility / SoD (backend)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| OPS-FR-01 | `RuleValueInput` — Typed rule editor (number, percent, money, duration, boolean, enum, text, url, list, roles) with validation (http/https URLs only). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-02 | `ChipInput` — List entry as removable chips. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-03 | `RoleMultiSelect` — Toggle-pill multi-select for roles. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-04 | `RuleCard` — Rule display: key copy, value vs default, scope, pending approval, source, changed by. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-05 | `WorkflowStepEditor` — Ordered step editor: name, approver roles, any / all, SLA hours, condition, adjudicator, notify; reorder by keyboard / drag. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-06 | `WorkflowDiagram` — Visual workflow definition with current / completed steps and adjudicator branch. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-07 | `WorkflowInstanceCard` — Running operation with status, requester, current step, SLA pill and timeline. Statuses: pending, in progress, approved, rejected, returned, cancelled, expired and **failed** (approved, but applying the change failed — distinct from rejected; frontend TD-960, Operations OPS-FR-17). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-08 | `HtmlTemplatePreview` — Sandboxed iframe preview (`sandbox=""`, CSP meta, no scripts) with desktop / mobile toggle. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-09 | `TemplateVariableList` — Template variables with copy / insert. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-10 | `EventLogList` — Domain-event log with name / module filters and wildcard patterns. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-11 | `SubscriptionList` — Before / after hook and event subscriber list with enable toggle and last run. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-12 | `KeyValueEditor` — Editable key / value rows. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| OPS-FR-13 | `ops-utils` — Shared internals. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `RuleValueInput.currency` / locale | Money display | `NGN` (₦), `en-NG` | Assumption — tenant currency / locale should be passed from tenant configuration. |
| `WorkflowStepEditor.defaultSlaHours` | New step SLA | 0 (forces entry) | CONVENTIONS §5 operations. |
| `WorkflowInstanceCard.warnWithinMs` | Amber SLA threshold | no default | From business rules. |
| Clock tick | Instance card refresh | 30 s | UI refresh interval (`useNow`). |

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
- **Security:** template HTML only rendered in `<iframe sandbox="" srcdoc>` with injected CSP and `referrerpolicy="no-referrer"`; never `dangerouslySetInnerHTML`. Rule URLs restricted to http/https.
- **i18n:** all labels overridable via `labels?` / `messages?`.

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
