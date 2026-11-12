# Form controls — requirements

| | |
|---|---|
| Module | `src/components/forms` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §10.1 (MFA / secure sign-in screens use these controls); §5.4 (document upload uses `FileUpload`) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend, credigit-ser-landing (demo-request form) |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Accessible form controls and the `Field` wiring (label, description, error, `aria-describedby` / `aria-invalid` via context). Includes password entry and a strength meter used by the authentication screens.

**In scope**

- Field framing and messages
- Text, select, choice, switch, search and file controls
- Password input and strength evaluation

**Out of scope**

- Business-rule value editors (see `operations` → `RuleValueInput`)
- Server-side validation

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| FRM-FR-01 | `Field` — Label / description / error framing that wires ids and ARIA into the child control. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-02 | `Label` — Label, toned message and fieldset with legend. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-03 | `Input` — Pill text input with icons, prefix / suffix (e.g. ₦). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-04 | `Textarea` — Multi-line input with `autoResize`. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-05 | `Select` — Styled native select with options and placeholder. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-06 | `Checkbox` — Choice controls; `RadioGroup` with options and orientation. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-07 | `Switch` — Accessible on / off switch. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-08 | `SearchField` — Search input with icon and clear button. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-09 | `FileUpload` — Drag & drop zone with `accept`, `multiple`, `maxSizeMb`, rejection list. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-10 | `Form` — Form stack spacing and action row. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-11 | `PasswordInput` — Password input with show / hide toggle. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| FRM-FR-12 | `PasswordStrength` — Strength meter and rules checklist; rules passed in. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `defaultPasswordRules` | Default password policy: ≥ 12 characters, upper, lower, number, symbol | 12 / 4 classes | CONVENTIONS §5 forms says password policy is a tenant setting → consumers must pass `rules` from tenant configuration. |
| `FileUpload.maxSizeMb` | Upload size limit | none (prop) | Passed by consumer from rules. |

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
- **Security:** controls never log or persist values; password visibility toggle is user-initiated.

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
