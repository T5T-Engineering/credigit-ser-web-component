# Brand engine and theming — implementation

| | |
|---|---|
| Status | Built |
| Requirements | [REQUIREMENTS.md](REQUIREMENTS.md) |
| Last updated | 2026-11-12 (commit d545831) |

## 1. Design overview

`BrandProvider` holds a `BrandConfig` (merged from `defaultBrand`, `initialBrand` and stored input), and on change calls `applyBrand` → CSS variables on `<html>` (`brandToCssVars`) + `applyFont` (managed Google Fonts link) and `storeBrand` (localStorage). `credigit.css` maps those variables to Tailwind `@theme` utilities, surface themes and density, so every component re-themes without re-render. `brandBootScript()` repeats the apply step before hydration. `<Logo />` renders generated SVGs (`npm run generate:logos`) coloured by variables, or the tenant's uploaded logo.

## 2. Files and entry points

| Path | Role |
|---|---|
| `src/brand/BrandProvider.tsx` | BrandProvider |
| `src/brand/brand.ts` | mergeBrand |
| `src/brand/Logo.tsx` | Logo |
| `src/brand/logo-svgs.ts` | Logo |
| `src/theme/tokens.ts` | colors |
| `src/utils/cx.ts` | cx |
| `src/styles/credigit.css` | CSS tokens |

## 3. Public API (exported components and helpers)

| Export | File | Notes |
|---|---|---|
| `BrandProvider`, `useBrand` | `src/brand/BrandProvider.tsx` | Context with `brand`, `updateBrand`, `resetBrand`; `initialBrand`, `persist`, `storageKey`. |
| `mergeBrand`, `brandToCssVars`, `applyBrand`, `clearBrand`, `applyFont`, `normalizeFont`, `findFontOption`, `googleFontHref`, `googleFontAxes` | `src/brand/brand.ts` | Merge + validate input, write CSS variables, manage one Google Fonts `<link>` + preconnect. |
| `isHexColor`, `isSafeFontFamily`, `FONT_FAMILY_PATTERN`, `FONT_FAMILY_MAX_LENGTH` | `src/brand/brand.ts` | Input validation (no CSS / URL injection). |
| `loadStoredBrand`, `storeBrand`, `brandBootScript`, `BRAND_STORAGE_KEY` | `src/brand/brand.ts` | localStorage persistence and pre-paint script. |
| `defaultBrand`, `fontOptions`, `bundledFontFamilies` | `src/brand/brand.ts` | Credigit defaults and curated font catalogue. |
| `Logo` | `src/brand/Logo.tsx` | Variants horizontal / stacked / symbol / wordmark, tone auto / default / reverse; switches to tenant logos. |
| `colors`, `fonts`, `sizes`, `surfaceThemes`, `Size`, `SurfaceTheme`, `Density`, `readBrandColor` | `src/theme/tokens.ts` | JS mirror of tokens for canvas / PDF / e-mail. |
| `cx` | `src/utils/cx.ts` | Class-name join helper. |
| `CSS tokens` | `src/styles/credigit.css` | `@font-face` Baloo 2, brand scales, status colours, surface themes, density, Tailwind `@theme`. |

Full prop signatures: [CONVENTIONS §5](../../CONVENTIONS.md).

## 4. Data model

| Store | Key fields |
|---|---|
| `BrandConfig` (React context) | `name`, `colors { primary, accent, neutral }`, `logos { horizontal, horizontalReverse, stacked, stackedReverse, symbol, symbolReverse }`, `font { family, source }` |
| localStorage `credigit.brand` (`BRAND_STORAGE_KEY`, overridable `storageKey`) | Serialised `BrandInput` |
| CSS custom properties on `<html>` | `--cg-*` brand scales, `--cg-font-family` |

## 5. Rule keys used

No Rules & Parameters Engine keys are read by the library. Literal defaults present in code:

| Default / prop | Where |
|---|---|
| `defaultBrand` = Ink #0F1E2E, Ember #E8401C, Slate #5B6878, Baloo 2 | brand |
| Status colours = provisional | brand |
| `BRAND_STORAGE_KEY` = `credigit.brand` | brand |
| Google Fonts axes = fixed | brand |

## 6. Permission keys enforced

None (consumers enforce).

## 7. Workflows, notifications, events, hooks wired

Not applicable (REQUIREMENTS §5–7). UI callbacks are the integration surface for apps.

## 8. Tests

Vitest + Testing Library (`vitest.config.ts`, `vitest.setup.ts`). Not run for this doc change.

| Test file | Covers |
|---|---|
| `src/brand/font.test.ts` | `BrandProvider`, `mergeBrand`, `isHexColor`, `loadStoredBrand`, `defaultBrand` |
| `src/components/utilities/brand-settings-panel.test.tsx` | `BrandProvider` |
| `src/brand/brand.test.ts` | `mergeBrand`, `isHexColor` |

## 9. Requirements traceability

| FR id | Implemented in | Test | Status |
|---|---|---|---|
| BRD-FR-01 | `src/brand/BrandProvider.tsx` | `font.test.ts`, `brand-settings-panel.test.tsx` | Done |
| BRD-FR-02 | `src/brand/brand.ts` | `brand.test.ts`, `font.test.ts` | Done |
| BRD-FR-03 | `src/brand/brand.ts` | `brand.test.ts`, `font.test.ts` | Done |
| BRD-FR-04 | `src/brand/brand.ts` | `font.test.ts` | Done |
| BRD-FR-05 | `src/brand/brand.ts` | `font.test.ts` | Done |
| BRD-FR-06 | `src/brand/Logo.tsx` | — | Done (no test) |
| BRD-FR-07 | `src/theme/tokens.ts` | — | Done (no test) |
| BRD-FR-08 | `src/utils/cx.ts` | — | Done (no test) |
| BRD-FR-09 | `src/styles/credigit.css` | — | Done (no test) |

## 10. Gaps against the invariants

- Brand persistence is browser localStorage only; per-tenant brand must be loaded by the app into `initialBrand` / `updateBrand` from tenant configuration — no tenant-aware storage key by default (cross-tenant bleed possible on shared browsers unless apps set `storageKey`).
- Invariant 9 connector-ready: Google Fonts outbound call not recorded in `docs/integration-points.md` (file does not exist).
- `Logo` and `tokens.ts` have no tests.
- Invariant 8: no `TECH-DEBT.md` exists in this repo, so the literal defaults listed in §5 are not registered as exceptions with IDs.
- Invariant 12: permission checks are out of scope for a library; apps must gate every action that these components render.

## 11. Tech debt

No `TECH-DEBT.md` in this repo, so no TD ids exist. Items in §10 are candidates.
