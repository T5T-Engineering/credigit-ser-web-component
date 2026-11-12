# Utilities — requirements

| | |
|---|---|
| Module | `src/components/utilities` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §10.4 (tenant-level configuration editable by System Admin, audited) — applies to brand changes made with `BrandSettingsPanel` |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend (tenant branding settings) |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Small helpers (tooltip, popover, copy, code snippet, spinner, skeleton, visually hidden, skip link, sticky, scroll to top) and the brand administration UI (`BrandSettingsPanel`, `BrandPresetPicker`) built on the brand engine.

**In scope**

- Overlay and feedback helpers
- Runtime brand editing UI (colours, name, font, logos, presets)

**Out of scope**

- Persisting the tenant brand server-side (app + backend)
- Brand engine itself (see `brand`)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| UTL-FR-01 | `Tooltip` — Hover / focus tooltip, Escape dismisses. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-02 | `Popover` — Trigger + content popover. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-03 | `CopyToClipboard` — Copy button announcing "Copied". | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-04 | `CodeSnippet` — `font-code` snippet with copy. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-05 | `Spinner` — Loading indicators. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-06 | `VisuallyHidden` — Screen-reader and keyboard helpers. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-07 | `Sticky` — Sticky wrapper; reduced-motion-aware scroll to top. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-08 | `BrandSettingsPanel` — Colour pickers + hex validation, contrast warning, name, font (catalogue or validated Google font), logo upload, live preview, reset, optional presets. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| UTL-FR-09 | `BrandPresetPicker` — Preset cards applying `updateBrand(preset.brand)`. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `LOGO_MAX_BYTES` | Logo upload limit | 512 KB | Literal in `brand-settings-panel.tsx` — registered as TD-015 in `TECH-DEBT.md` (invariant 8). |
| Accepted logo types | SVG / PNG / WebP | fixed | Literal in `brand-settings-panel.tsx`. |
| Contrast warning threshold | Accent vs white | 4.5:1 | WCAG 2.2 AA (not a business rule). |

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
- **Security:** hex colours and font names validated; logo read as data URL (no upload request from the library).

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
