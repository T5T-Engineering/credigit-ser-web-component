# Operations controls — implementation

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
| `src/components/operations/index.ts` | Group barrel |
| `src/components/operations/rule-value-input.tsx` | RuleValueInput |
| `src/components/operations/chip-input.tsx` | ChipInput |
| `src/components/operations/role-multi-select.tsx` | RoleMultiSelect |
| `src/components/operations/rule-card.tsx` | RuleCard |
| `src/components/operations/workflow-step-editor.tsx` | WorkflowStepEditor |
| `src/components/operations/workflow-diagram.tsx` | WorkflowDiagram |
| `src/components/operations/workflow-instance-card.tsx` | WorkflowInstanceCard |
| `src/components/operations/html-template-preview.tsx` | HtmlTemplatePreview |
| `src/components/operations/event-log-list.tsx` | EventLogList |
| `src/components/operations/subscription-list.tsx` | SubscriptionList |
| `src/components/operations/key-value-editor.tsx` | KeyValueEditor |
| `src/components/operations/ops-utils.ts` | ops-utils |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `RuleValueInput`, `validateRuleValue`, `formatRuleValue`, `parseRuleNumber`, `durationToMinutes`, `formatDurationMinutes`, `isDurationValue`, `currencySymbols`, `defaultRuleValueMessages` | `src/components/operations/rule-value-input.tsx` | Typed rule editor (number, percent, money, duration, boolean, enum, text, url, list, roles) with validation (http/https URLs only). |
| `ChipInput` | `src/components/operations/chip-input.tsx` | List entry as removable chips. |
| `RoleMultiSelect` | `src/components/operations/role-multi-select.tsx` | Toggle-pill multi-select for roles. |
| `RuleCard`, `RuleRow` | `src/components/operations/rule-card.tsx` | Rule display: key copy, value vs default, scope, pending approval, source, changed by. |
| `WorkflowStepEditor`, `validateWorkflowStep`, `validateWorkflowSteps`, `moveWorkflowStep` | `src/components/operations/workflow-step-editor.tsx` | Ordered step editor: name, approver roles, any / all, SLA hours, condition, adjudicator, notify; reorder by keyboard / drag. |
| `WorkflowDiagram` | `src/components/operations/workflow-diagram.tsx` | Visual workflow definition with current / completed steps and adjudicator branch. |
| `WorkflowInstanceCard`, `OperationTimeline`, `SlaCountdown`, `slaState`, `formatSlaDuration`, `operationStatusMeta`, `operationDecisionMeta` | `src/components/operations/workflow-instance-card.tsx` | Running operation with status, requester, current step, SLA pill and timeline. `OperationStatus` includes `failed` (danger tone, `CircleAlert` icon, label "Failed"; SLA hidden like other closed statuses). |
| `HtmlTemplatePreview`, `withPreviewCsp`, `templatePreviewCsp` | `src/components/operations/html-template-preview.tsx` | Sandboxed iframe preview (`sandbox=""`, CSP meta, no scripts) with desktop / mobile toggle. |
| `TemplateVariableList` | `src/components/operations/html-template-preview.tsx` | Template variables with copy / insert. |
| `EventLogList`, `matchEventPattern`, `filterEvents`, `formatPayload` | `src/components/operations/event-log-list.tsx` | Domain-event log with name / module filters and wildcard patterns. |
| `SubscriptionList`, `subscriptionKindMeta`, `subscriptionRunMeta` | `src/components/operations/subscription-list.tsx` | Before / after hook and event subscriber list with enable toggle and last run. |
| `KeyValueEditor`, `validateKeyValuePairs`, `toKeyValuePairs`, `fromKeyValuePairs` | `src/components/operations/key-value-editor.tsx` | Editable key / value rows. |
| `ops-utils` | `src/components/operations/ops-utils.ts` | Shared internals. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

No persisted data. Prop types only (see §3 and CONVENTIONS §5).

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `RuleValueInput.currency` / locale = `NGN` (₦), `en-NG` | operations |
| `WorkflowStepEditor.defaultSlaHours` = 0 (forces entry) | operations |
| `WorkflowInstanceCard.warnWithinMs` = no default | operations |
| Clock tick = 30 s | operations |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/components/operations/rule-value-input.test.tsx` | `RuleValueInput` |
| `src/components/operations/workflow.test.tsx` | `WorkflowStepEditor`, `WorkflowDiagram`, `WorkflowInstanceCard` (incl. `failed` status and its label override) |
| `src/components/operations/extensions.test.tsx` | `HtmlTemplatePreview`, `TemplateVariableList`, `EventLogList`, `SubscriptionList`, `KeyValueEditor` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| OPS-FR-01 | `src/components/operations/rule-value-input.tsx` | `rule-value-input.test.tsx` | Done |
| OPS-FR-02 | `src/components/operations/chip-input.tsx` | — | Done (no test) |
| OPS-FR-03 | `src/components/operations/role-multi-select.tsx` | — | Done (no test) |
| OPS-FR-04 | `src/components/operations/rule-card.tsx` | — | Done (no test) |
| OPS-FR-05 | `src/components/operations/workflow-step-editor.tsx` | `workflow.test.tsx` | Done |
| OPS-FR-06 | `src/components/operations/workflow-diagram.tsx` | `workflow.test.tsx` | Done |
| OPS-FR-07 | `src/components/operations/workflow-instance-card.tsx` | `workflow.test.tsx` | Done |
| OPS-FR-08 | `src/components/operations/html-template-preview.tsx` | `extensions.test.tsx` | Done |
| OPS-FR-09 | `src/components/operations/html-template-preview.tsx` | `extensions.test.tsx` | Done |
| OPS-FR-10 | `src/components/operations/event-log-list.tsx` | `extensions.test.tsx` | Done |
| OPS-FR-11 | `src/components/operations/subscription-list.tsx` | `extensions.test.tsx` | Done |
| OPS-FR-12 | `src/components/operations/key-value-editor.tsx` | `extensions.test.tsx` | Done |
| OPS-FR-13 | `src/components/operations/ops-utils.ts` | — | Done (no test) |

## 10. Gaps against the invariants

- `RuleCard` / `SubscriptionList` actions are slots/handlers; permission gating (view vs edit rule, toggle subscription) and second-person confirmation are the app's responsibility.
- `ChipInput`, `RoleMultiSelect`, `RuleCard` have no dedicated tests.
- Invariant 8: the literal defaults listed in §5 are registered as exceptions in [TECH-DEBT.md](../../../TECH-DEBT.md) (ids in §11 and next to each literal in the code).
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

Registered in [TECH-DEBT.md](../../../TECH-DEBT.md):

| ID | Item | Status |
|---|---|---|
| TD-013 | `RuleValueInput` / `formatRuleValue` default currency `NGN` (₦) and locale `en-NG` | Open |
| TD-014 | `WorkflowInstanceCard` clock ticks every 30 s | Open |
| TD-019 | Components without dedicated tests: `Logo`, `tokens.ts`, `AppHeader`, `UserMenu`, `CommentThread`, `AiInsightCard`, `DocumentList`, `TenantSwitcher`, `ActivityFeed` / `AuditTrail`, `ChipInput`, `RoleMultiSelect`, `RuleCard` | Open |
