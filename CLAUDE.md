# credigit-ser-web-component — `@credigit/web-ui`

The single source of every UI control used by Credigit apps. Read `docs/CONVENTIONS.md` (component rules and APIs) and `docs/BOLT-DESIGN.md` (visual language) before adding or changing a component.

## Project invariants (apply to every Credigit SER repository)

1. **Every UI control is a shared library component first.** Any control, widget or visual building block used in a frontend (credigit-ser-frontend, credigit-ser-landing, or any future app) must be created in **credigit-ser-web-component** (`@credigit/web-ui`) first, then imported by the apps. Apps contain only routes, page compositions, data access, domain logic and copy — never their own buttons, inputs, tables, cards, charts, dialogs or similar. If a control is missing, add it to the library (with tests and docs in `docs/CONVENTIONS.md`), release it to the library `develop` branch, then use it in the app.
2. **Brand comes from tokens, never hard-coded values.** Colours, fonts and logos are runtime-configurable per tenant (BrandProvider: `updateBrand({ colors, logos, font })`). Use only the theme utilities; never hex colours, palette classes or font names in components or apps. Default font: Baloo 2.
3. **Design language: Bolt (bolt.eu).** Component design follows `credigit-ser-web-component/docs/BOLT-DESIGN.md` (pills, squircle surfaces, bold type, soft elevation) with Credigit colours, Baloo 2 and the Credigit logo.
4. **The PRD is the product source of truth.** `credigit-ser-claude-works/README.md` (Smart Enterprise Risk 360° PRD v2.1). Don't invent regulatory rules, formulas, weights, limits or provider endpoints; record ambiguities as open questions.
5. **Git workflow.** Work on a feature branch → merge (`--no-ff`) into local `develop` → push `origin develop`. Every remote has `develop`, `test`, `uat`, `staging`, `production`; never commit directly to the environment branches.
6. **Dependencies:** latest stable/LTS versions, pinned exactly.
7. **No secrets in repositories** (credigit-ser-web-component is public).

### In this repo
- New components: right group under `src/components/<group>/`, exported from the group barrel, documented in `docs/CONVENTIONS.md` §5, with Vitest tests; `npx tsc --noEmit` and `npm test` must pass.
- Consumers install from GitHub (`git+https://github.com/T5T-Engineering/credigit-ser-web-component.git#develop`); after pushing, apps run `npm update @credigit/web-ui`.
