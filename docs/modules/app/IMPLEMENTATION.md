# Application chrome and workflow UI — implementation

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
| `src/components/app/index.ts` | Group barrel |
| `src/components/app/app-header.tsx` | AppHeader |
| `src/components/app/user-menu.tsx` | UserMenu |
| `src/components/app/notification-center.tsx` | NotificationCenter |
| `src/components/app/command-palette.tsx` | CommandPalette |
| `src/components/app/wizard.tsx` | Wizard |
| `src/components/app/approval-timeline.tsx` | ApprovalTimeline (ApprovalChain) |
| `src/components/app/decision-panel.tsx` | DecisionPanel |
| `src/components/app/step-up-auth-dialog.tsx` | StepUpAuthDialog |
| `src/components/app/comment-thread.tsx` | CommentThread |
| `src/components/app/ai-insight.tsx` | AiInsightCard |
| `src/components/app/document-list.tsx` | FileCard |
| `src/components/app/checklist-panel.tsx` | ChecklistPanel |
| `src/components/app/module-header.tsx` | PhaseBadge |
| `src/components/app/sign-in-card.tsx` | SignInCard |
| `src/components/app/role-picker.tsx` | RolePicker |
| `src/components/app/tenant-switcher.tsx` | TenantSwitcher |
| `src/components/app/session-timeout-dialog.tsx` | SessionTimeoutDialog |
| `src/components/app/permission-gate.tsx` | PermissionGate |
| `src/components/app/auth-card.tsx` | AuthCard |
| `src/components/app/otp-verification.tsx` | AuthCard |
| `src/components/app/app-utils.ts` | App helpers |
| `src/components/app/test-utils.ts` | App helpers |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `AppHeader` | `src/components/app/app-header.tsx` | Top bar content: title, breadcrumb, search pill (Ctrl/⌘ K), tenant, environment, notifications, help, user menu. |
| `UserMenu` | `src/components/app/user-menu.tsx` | User menu with profile, settings, sign-out and role switching. |
| `NotificationCenter`, `NotificationList` | `src/components/app/notification-center.tsx` | Bell + unread count; popover or drawer list with filters and mark-read callbacks. |
| `CommandPalette`, `scoreCommand` | `src/components/app/command-palette.tsx` | Ctrl/⌘ K combobox with groups, server-side search mode. |
| `Wizard` | `src/components/app/wizard.tsx` | Multi-step form with (async) validation, draft save, summary step, adaptive stepper. |
| `ApprovalTimeline (ApprovalChain)`, `hasDissent`, `deriveTierDecision`, `approvalDecisionMeta` | `src/components/app/approval-timeline.tsx` | Tiered approval route with co-signers, dissent and adjudicator branch. |
| `DecisionPanel` | `src/components/app/decision-panel.tsx` | Approve / recommend / return / decline with required comment and optional step-up before submit. |
| `StepUpAuthDialog`, `CodeInput` | `src/components/app/step-up-auth-dialog.tsx` | OTP / PIN re-authentication modal (UI only; `onVerify` is the app's). |
| `CommentThread`, `splitMentions` | `src/components/app/comment-thread.tsx` | Comments with mentions, internal flag, compose box. |
| `AiInsightCard`, `AiDraftPanel` | `src/components/app/ai-insight.tsx` | AI-drafted / flagged / insight labelling, model, time, confidence, sources, accept / edit / dismiss, sign-off note. |
| `FileCard`, `DocumentList`, `documentStatusMeta` | `src/components/app/document-list.tsx` | Document rows with status (incl. OCR processing) and per-handler actions. |
| `ChecklistPanel`, `checklistSummary`, `checklistStatusMeta` | `src/components/app/checklist-panel.tsx` | Conditions-precedent checklist with progress. |
| `PhaseBadge`, `ModuleHeader` | `src/components/app/module-header.tsx` | Module page header with phase badge and pill sub-navigation. |
| `SignInCard`, `MicrosoftSignInButton`, `MicrosoftLogo` | `src/components/app/sign-in-card.tsx` | Sign-in card with Microsoft button (Microsoft brand colours — documented exception). |
| `RolePicker` | `src/components/app/role-picker.tsx` | Searchable / collapsible role selection (demo access). |
| `TenantSwitcher`, `environmentTone`, `defaultEnvironmentTones` | `src/components/app/tenant-switcher.tsx` | Tenant / environment switcher. |
| `SessionTimeoutDialog`, `formatCountdown` | `src/components/app/session-timeout-dialog.tsx` | Countdown dialog with stay / sign-out and live announcements. |
| `PermissionGate` | `src/components/app/permission-gate.tsx` | Renders children when `allowed`, else lock fallback (UI only; server enforces). |
| `AuthCard`, `OtpVerification` | `src/components/app/auth-card.tsx` | Auth screen frame and inline OTP entry. |
| `App helpers` | `src/components/app/app-utils.ts` | Shared internals. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `SessionTimeoutDialog.secondsRemaining` = 120 s | app |
| `StepUpAuthDialog.resendCooldown`, `OtpVerification.resendCooldown` = 30 s | app |
| `StepUpAuthDialog.length` = 6 | app |
| `DecisionPanel.commentRequired` / `minCommentLength` / `requireStepUp` = comment required for all actions | app |
| Microsoft button colours = fixed | app |

## 6. Permission keys enforced

None (consumers enforce). `PermissionGate` (`src/components/app/permission-gate.tsx`) renders on an app-resolved `allowed` flag.

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/app/notification-center.test.tsx` | `NotificationCenter` |
| `src/components/app/command-palette.test.tsx` | `CommandPalette` |
| `src/components/app/wizard.test.tsx` | `Wizard` |
| `src/components/app/approval-timeline.test.tsx` | `ApprovalTimeline (ApprovalChain)` |
| `src/components/app/decision-panel.test.tsx` | `DecisionPanel` |
| `src/components/app/step-up-auth-dialog.test.tsx` | `StepUpAuthDialog` |
| `src/components/app/checklist-panel.test.tsx` | `ChecklistPanel` |
| `src/components/app/auth.test.tsx` | `RolePicker`, `AuthCard` |
| `src/components/app/permission-gate.test.tsx` | `PermissionGate` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| APP-FR-01 | `src/components/app/app-header.tsx` | — | Done (no test) |
| APP-FR-02 | `src/components/app/user-menu.tsx` | — | Done (no test) |
| APP-FR-03 | `src/components/app/notification-center.tsx` | `notification-center.test.tsx` | Done |
| APP-FR-04 | `src/components/app/command-palette.tsx` | `command-palette.test.tsx` | Done |
| APP-FR-05 | `src/components/app/wizard.tsx` | `wizard.test.tsx` | Done |
| APP-FR-06 | `src/components/app/approval-timeline.tsx` | `approval-timeline.test.tsx` | Done |
| APP-FR-07 | `src/components/app/decision-panel.tsx` | `decision-panel.test.tsx` | Done |
| APP-FR-08 | `src/components/app/step-up-auth-dialog.tsx` | `step-up-auth-dialog.test.tsx` | Done |
| APP-FR-09 | `src/components/app/comment-thread.tsx` | — | Done (no test) |
| APP-FR-10 | `src/components/app/ai-insight.tsx` | — | Done (no test) |
| APP-FR-11 | `src/components/app/document-list.tsx` | — | Done (no test) |
| APP-FR-12 | `src/components/app/checklist-panel.tsx` | `checklist-panel.test.tsx` | Done |
| APP-FR-13 | `src/components/app/module-header.tsx` | — | Done (no test) |
| APP-FR-14 | `src/components/app/sign-in-card.tsx` | — | Done (no test) |
| APP-FR-15 | `src/components/app/role-picker.tsx` | `auth.test.tsx` | Done |
| APP-FR-16 | `src/components/app/tenant-switcher.tsx` | — | Done (no test) |
| APP-FR-17 | `src/components/app/session-timeout-dialog.tsx` | — | Done (no test) |
| APP-FR-18 | `src/components/app/permission-gate.tsx` | `permission-gate.test.tsx` | Done |
| APP-FR-19 | `src/components/app/auth-card.tsx` | `auth.test.tsx` | Done |
| APP-FR-20 | `src/components/app/app-utils.ts` | — | Done (no test) |

## 10. Gaps against the invariants

- Session (120 s) and OTP (30 s, 6 digits) defaults are literals; must be supplied from rules (invariant 8) and registered in a TECH-DEBT file.
- `AppHeader`, `UserMenu`, `CommentThread`, `AiInsightCard`, `DocumentList`, `TenantSwitcher`, `SessionTimeoutDialog`, `SignInCard` have no tests.
- Permission-aware support is limited to `PermissionGate` (boolean `allowed`) and `disabled` props; `DocumentList` actions and `UserMenu` items rely on the app omitting handlers.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
