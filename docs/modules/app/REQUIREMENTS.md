# Application chrome and workflow UI — requirements

| | |
|---|---|
| Module | `src/components/app` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §4.0–§4.1 (configurable roles, System Admin holds every permission → `PermissionMatrix`, `Can`); §4.1–§4.2 (roles, step-up auth above threshold, dissent → adjudicator, session timeout); §6.1.2 (co-signer / adjudicator matrix → `ApprovalTimeline`); §6.12 / §10.3 (AI output labelled, time-stamped, model recorded, human sign-off → `AiInsightCard`, `AiDraftPanel`); §7.1 (conditions precedent → `ChecklistPanel`); §5.4 (documents / OCR status → `DocumentList`); §10.1 (MFA → `StepUpAuthDialog`, `OtpVerification`) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Product components for Smart Enterprise Risk 360°: header, user / tenant / role menus, notification centre, command palette, wizard, approval timeline and decision panel, step-up authentication, comments, AI insight / draft cards, documents, checklists, module header, sign-in / auth screens, session timeout and `PermissionGate`.

**In scope**

- Presentational and interaction layer for approvals, auth and app chrome
- Values arrive pre-formatted; components never format currency or dates

**Out of scope**

- Approval routing, SoD, four-eyes and dissent resolution logic (backend Operations workflow)
- Authentication, OTP verification and session management (identity provider + backend)
- Notification delivery

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

Permission-aware support that exists: `PermissionProvider` + `Can` / `useCan` (the app supplies `has(permission)` or the user's effective permission keys from `GET /api/v1/identity/me`; the library only evaluates `permission` / `anyOf` / `allOf` against it and fails closed without a provider), `PermissionGate` (`allowed`, fallback / `null`), `disabled` props, handler-presence rendering (e.g. `DocumentList` shows an action only when its handler is passed), `DecisionPanel.actions` (app passes only the decisions the user may take).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| APP-FR-01 | `AppHeader` — Top bar content: title, breadcrumb, search pill (Ctrl/⌘ K), tenant, environment, notifications, help, user menu. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-02 | `UserMenu` — User menu with profile, settings, sign-out and role switching. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-03 | `NotificationCenter` — Bell + unread count; popover or drawer list with filters and mark-read callbacks. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-04 | `CommandPalette` — Ctrl/⌘ K combobox with groups, server-side search mode. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-05 | `Wizard` — Multi-step form with (async) validation, draft save, summary step, adaptive stepper. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-06 | `ApprovalTimeline (ApprovalChain)` — Tiered approval route with co-signers, dissent and adjudicator branch. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-07 | `DecisionPanel` — Approve / recommend / return / decline with required comment and optional step-up before submit. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-08 | `StepUpAuthDialog` — OTP / PIN re-authentication modal (UI only; `onVerify` is the app's). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-09 | `CommentThread` — Comments with mentions, internal flag, compose box. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-10 | `AiInsightCard` — AI-drafted / flagged / insight labelling, model, time, confidence, sources, accept / edit / dismiss, sign-off note. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-11 | `FileCard` — Document rows with status (incl. OCR processing) and per-handler actions. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-12 | `ChecklistPanel` — Conditions-precedent checklist with progress. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-13 | `PhaseBadge` — Module page header with phase badge and pill sub-navigation. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-14 | `SignInCard` — Sign-in card with Microsoft button (Microsoft brand colours — documented exception); `microsoft={false}` hides it for local e-mail + password mode (`/auth/config` `mode: "Local"`). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-15 | `RolePicker` — Searchable / collapsible role selection (demo access). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-16 | `TenantSwitcher` — Tenant / environment switcher. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-17 | `SessionTimeoutDialog` — Countdown dialog with stay / sign-out and live announcements. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-18 | `PermissionGate` — Renders children when `allowed`, else lock fallback (UI only; server enforces). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-19 | `AuthCard` — Auth screen frame and inline OTP entry. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-20 | `App helpers` — Shared internals. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| APP-FR-21 | `PermissionProvider`, `usePermissions`, `useCan`, `Can`, `checkPermissions` — Permission gate driven by a `has(permission)` function or a list of granted keys supplied by the app. `Can` takes `permission` / `anyOf` / `allOf`, an optional `has` override, a `fallback` (default nothing) and children as nodes or a render function `(allowed) => node` (to disable rather than hide). No IAM logic: no catalogue, no role names, no wildcards; denies when no check is given or no provider exists. | Invariant 12; `credigit-ser-core-backend/docs/api/identity-access.md` §5 (guard buttons with `permissions.includes(key)`) |
| APP-FR-22 | `PermissionMatrix`, `diffGrants`, `diffRoleGrants`, `filterPermissions` — Roles × permissions grid grouped by module (collapsible sections, optional sub-groups), search over label / key / description / module, grant / revoke checkbox per cell, per-module tri-state "all" checkbox per role, roles flagged `grantsAll` (e.g. System Admin) shown fully granted and locked, `isLocked(roleId, key)` for protected permissions, `initialGrants` to mark changed cells and count changes, `readOnly`, sensitive badge. Controlled (`grants` + `onGrantsChange`). `diffRoleGrants` produces `{ grant[], revoke[] }` per role for `POST /identity/roles/{id}/permission-changes`. Scales to the ~268-permission catalogue. | PRD §4.0–§4.1; identity-access API §4 (`PermissionCatalogue`, `Role`, permission-changes) |
| APP-FR-23 | Tests for `SignInCard` and `SessionTimeoutDialog` (previously untested). | IMPLEMENTATION §10 gap |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `SessionTimeoutDialog.secondsRemaining` | Warning countdown | 120 s | PRD §4.2: session timeout is configurable per role → app passes the rule value (or `expiresAt`). |
| `StepUpAuthDialog.resendCooldown`, `OtpVerification.resendCooldown` | OTP resend cooldown | 30 s | Assumption — should come from identity / tenant config. |
| `StepUpAuthDialog.length` | Code length | 6 | Backend `Challenge.codeLength` / `/auth/config` `otpLength` → app passes it (TD-003). |
| `DecisionPanel.commentRequired` / `minCommentLength` / `requireStepUp` | Comment and step-up policy | comment required for all actions | PRD §4.2 high-value step-up threshold → app evaluates the rule and passes the flag. |
| Microsoft button colours | #8C8C8C / #5E5E5E / #2F2F2F | fixed | Documented exception in CONVENTIONS §5 app (Microsoft brand guidance). |

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
- **Security:** step-up / OTP dialogs only collect codes; verification is the app's `onVerify`. `PermissionGate`, `Can` and `PermissionMatrix` are UI conveniences only: the backend re-checks every call and routes grant / revoke changes through the Operations workflow (`role.permissions-change`, second-person confirmation).

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| APP-OQ-01 | Should `Can` support wildcard / pattern permissions (the backend's `protectedAdministratorPermissions` are patterns)? | No — apps pass exact keys or a custom `has`; `isLocked` covers protected patterns in `PermissionMatrix`. |
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
