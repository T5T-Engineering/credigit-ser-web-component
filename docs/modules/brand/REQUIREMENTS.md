# Brand engine and theming — requirements

| | |
|---|---|
| Module | `src/brand, src/styles, src/theme, src/utils` |
| Repo | credigit-ser-web-component (`@credigit/web-ui`) |
| PRD | §2.1 / §10.1 (multi-tenant SaaS for many institutions — per-tenant brand); §10.4 (tenant-level configuration) |
| Owner (business) | Not stated in the PRD; library maintained by the frontend lead (CONVENTIONS §4: changes to `src/brand/*`, `src/index.ts`, `credigit.css` go through the lead) |
| Counterpart | Consumers: credigit-ser-frontend, credigit-ser-landing (root layout); brand source: `../brand-kit/` |
| Last reviewed | 2026-11-12 |

## 1. Purpose and scope

Runtime brand engine: `BrandProvider` / `useBrand().updateBrand({ colors, logos, font })`, brand merge / validation, CSS variable application, font loading (bundled Baloo 2 or validated Google Fonts), persistence and the pre-paint boot script, the themeable `<Logo />`, the CSS token layer (`src/styles/credigit.css`) and the JS token mirror (`src/theme/tokens.ts`).

**In scope**

- Brand colours (primary / accent / neutral scales), logos, name and font at runtime
- Surface themes, density, type scale and Tailwind `@theme` mapping
- Generated themeable logo SVGs from `assets/logos`

**Out of scope**

- Storing the tenant brand server-side and loading it per tenant (app + backend)
- Brand editing UI (see `utilities` → `BrandSettingsPanel`)

## 2. Users and permissions

| Role | What they do here | Permission keys |
|---|---|---|
| App developer (consumer) | Composes screens from these components | — |
| End user of a consuming app | Interacts with the rendered controls | Resolved by the app |

Not applicable (consumers enforce). The library holds no permission catalogue and performs no checks; apps pass already-resolved flags (e.g. `disabled`, `allowed`, conditional rendering).

## 3. Functional requirements

| ID | Requirement | Source |
|---|---|---|
| BRD-FR-01 | `BrandProvider` — Context with `brand`, `updateBrand`, `resetBrand`; `initialBrand`, `persist`, `storageKey`. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-02 | `mergeBrand` — Merge + validate input, write CSS variables, manage one Google Fonts `<link>` + preconnect. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-03 | `isHexColor` — Input validation (no CSS / URL injection). | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-04 | `loadStoredBrand` — localStorage persistence and pre-paint script. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-05 | `defaultBrand` — Credigit defaults and curated font catalogue. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-06 | `Logo` — Variants horizontal / stacked / symbol / wordmark, tone auto / default / reverse; switches to tenant logos. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-07 | `colors` — JS mirror of tokens for canvas / PDF / e-mail. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-08 | `cx` — Class-name join helper. | [CONVENTIONS §5](../../CONVENTIONS.md) |
| BRD-FR-10 | `BrandProvider tenantId` / `brandStorageKey(tenantId)` — Tenant-scoped persistence: with `tenantId` the stored brand lives under `credigit.brand.<tenantId>`, so tenants sharing a browser never see each other's brand. Without `tenantId` (and without `storageKey`) the key stays `credigit.brand` (backward compatible); an explicit `storageKey` wins over both. `brandBootScript(brandStorageKey(tenantId))` reads the same key before paint. | Invariant 2 (per-tenant brand), brand IMPLEMENTATION §10 gap |
| BRD-FR-09 | `CSS tokens` — `@font-face` Baloo 2, brand scales, status colours, surface themes, density, Tailwind `@theme`. | [CONVENTIONS §5](../../CONVENTIONS.md) |

## 4. Business rules and parameters

The library holds no business rules. The table lists component defaults and props that carry rule values supplied by the app.

| Rule key / prop | Meaning | Default | Source |
|---|---|---|---|
| `defaultBrand` | Credigit default colours / logos / font | Ink #0F1E2E, Ember #E8401C, Slate #5B6878, Baloo 2 | Brand kit (`../brand-kit/`); hex values allowed only here and in `credigit.css`. |
| Status colours | success / warning / danger / info | provisional | README › Open decisions #1. |
| `BRAND_STORAGE_KEY` | localStorage key prefix | `credigit.brand` (`credigit.brand.<tenantId>` with `tenantId`) | Library constant; tenant id comes from the app's session / tenant configuration. |
| Google Fonts axes | Variable `wght@400..800`, static fallback 400–800 | fixed | CONVENTIONS §3. |

## 5. Workflows (Operations)

Not applicable. A UI library routes nothing; consuming apps submit to the backend Operations workflow.

## 6. Notifications

Not applicable. The library sends no notifications.

## 7. Events and hook points

Not applicable as domain events / hook points. Components expose UI callbacks only (listed in IMPLEMENTATION §3); the consuming app turns them into commands that the backend audits and publishes.

## 8. Integration points

| Connector / system | Direction | Trigger | Data | Status |
|---|---|---|---|---|
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Outbound (browser) | `updateBrand` with a non-bundled font | Font family name; visitor IP sent to Google | Built; not recorded in `docs/integration-points.md` (file absent) |

## 9. Non-functional

- **Accessibility:** WCAG 2.2 AA — visible focus ring, keyboard support, roles/ARIA, labels on every input, `prefers-reduced-motion`, 24×24 px minimum target, text contrast ≥ 4.5:1 ([CONVENTIONS §4](../../CONVENTIONS.md)).
- **Theming:** colours only from semantic / brand / status tokens; fonts only `font-sans|display|mono` (`font-code` for code); works inside every surface theme `xlight|light|dark|xdark` and density `compact|regular|spacious` ([CONVENTIONS §3](../../CONVENTIONS.md)).
- **Design:** Bolt shapes, sizes, type scale, elevation, motion and states ([BOLT-DESIGN](../../BOLT-DESIGN.md)).
- **API stability:** the props in [CONVENTIONS §5](../../CONVENTIONS.md) are the public contract; optional props may be added, none renamed or removed.
- **No domain data:** domain mappings, limits and labels are passed in as props ([CONVENTIONS §4](../../CONVENTIONS.md)).
- **Audit / tenant isolation:** Not applicable in the library; enforced by the backend and the consuming app.
- **Security / privacy:** font names and colours validated before use (incl. boot script); Baloo 2 self-hosted; non-bundled fonts need CSP `style-src fonts.googleapis.com` / `font-src fonts.gstatic.com` and a privacy-notice mention.
- **Performance:** `brandBootScript()` applies the stored brand before first paint (no flash).

## 10. Open questions

| ID | Question | Current assumption |
|---|---|---|
| README › Open decisions #1 | Status colours (success / warning / danger / info) are not in the brand kit. | Provisional values in `src/styles/credigit.css`; brand-owner approval pending. |
| README › Open decisions #2 | Publishing: README says consumers use a `file:` dependency; CLAUDE.md says `git+https://…#develop`. | CLAUDE.md (GitHub `develop`) is current; README to be aligned. |
