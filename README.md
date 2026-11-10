# @credigit/web-ui

Credigit's shared design system for **Smart Enterprise Risk 360°**: brand tokens, runtime theming and the
reusable React components used by `credigit-ser-landing` and `credigit-ser-frontend`.

- **Brand:** colours and logos come from the Credigit brand kit. The application font is **Baloo 2** everywhere (IBM Plex Mono only for code samples).
- **Design principles:** component design follows **Bolt** (the ride-hailing app, bolt.eu): pill controls,
  large squircle surfaces, bold type, soft elevation. Only the font family, colours and logo differ.
  See [`docs/BOLT-DESIGN.md`](docs/BOLT-DESIGN.md).
- **Runtime branding:** wrap an app in `<BrandProvider>` and call `useBrand().updateBrand({ colors, logos, font })`.
  Every component and the `<Logo />` update at once, across the whole product.

The full contract (theming rules, component rules and every component's API) is in
[`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## Stack

React 19.3 · TypeScript · Tailwind CSS 4.3 · lucide-react · Vitest + Testing Library. Shipped as TypeScript source.

## Structure

```text
assets/            brand-kit fonts and logo files
src/brand/         brand engine, BrandProvider/useBrand, Logo (generated themeable SVGs)
src/styles/        credigit.css: @font-face, brand scales, Bolt surface themes, Tailwind @theme mapping
src/theme/         JS token mirror (for canvas/PDF/email), shared types
src/components/    basic · forms · layouts · navigation · blocks · data-viz · utilities
playground/        local Vite app to preview every component and try brand changes
```

## Using it in an app

```jsonc
// package.json
"dependencies": { "@credigit/web-ui": "file:../credigit-ser-web-component" }
```

```ts
// next.config.ts
const nextConfig = { transpilePackages: ["@credigit/web-ui"] };
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@credigit/web-ui/styles.css";
@source "../node_modules/@credigit/web-ui/src";
```

```tsx
// app/layout.tsx
import { BrandProvider, brandBootScript } from "@credigit/web-ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: brandBootScript() }} />
      </head>
      <body>
        <BrandProvider>{children}</BrandProvider>
      </body>
    </html>
  );
}
```

### Changing the brand

```tsx
const { updateBrand, resetBrand } = useBrand();
updateBrand({ colors: { accent: "#0057B8" }, logos: { horizontal: "/tenant-logo.svg" } });
updateBrand({ font: { family: "Inter" } });   // any entry of fontOptions, or any Google Fonts family by exact name
updateBrand({ font: { family: "Baloo 2" } }); // back to the bundled font
resetBrand(); // back to Credigit defaults (colours, logos, Baloo 2)
```

Tenant defaults can be passed once: `<BrandProvider initialBrand={{ name: "Acme MFB", colors: { primary: "#102A43" }, font: { family: "IBM Plex Sans" } }}>`.

**Fonts.** The application font (`font-sans`, `font-display`, `font-mono`) reads `var(--cg-font-family)`; `font-code` (IBM Plex Mono)
is fixed. `fontOptions` lists Baloo 2 (bundled, default) plus curated Google Fonts (Inter, Archivo, IBM Plex Sans, Source Sans 3,
Nunito Sans, Open Sans, Lato, Roboto, Montserrat, Poppins, DM Sans, Manrope). Font names are validated
(`isSafeFontFamily`: letters, digits, spaces, hyphens), so stored or user input can't inject CSS or URLs. `brandBootScript()`
applies the stored font before first paint.
**Privacy / CSP:** Baloo 2 is self-hosted. Any other font is loaded at runtime from `fonts.googleapis.com` / `fonts.gstatic.com`
(one managed `<link id="cg-brand-font">` + preconnect), which sends the visitor's IP to Google; allow those hosts in
`style-src` / `font-src` and mention it in the privacy notice, or keep tenants on Baloo 2.
`<BrandSettingsPanel />` gives users a ready-made UI for this.

Surface themes for any section: `<Band theme="dark">` or `data-cg-theme="xlight|light|dark|xdark"`.
Density: `data-cg-density="compact|regular|spacious"`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Playground at http://localhost:5173 |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run generate:logos` | Rebuild `src/brand/logo-svgs.ts` from `assets/logos` |

## Open decisions

- Status colours (success, warning, danger, info) aren't in the brand kit. Current values are provisional
  and need brand-owner approval.
- Publishing: consumers currently use a `file:` dependency. Move to a private registry (e.g. GitHub Packages)
  once the repos are pushed.
