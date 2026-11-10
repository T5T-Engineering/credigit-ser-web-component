# @credigit/web-ui — Conventions and component contract

This is the single contract for everyone building in or consuming `@credigit/web-ui`
(the shared React component library used by `credigit-ser-frontend` and `credigit-ser-landing`).

## 1. Sources of truth

| Concern | Source |
|---|---|
| Colours, font family, logo | Credigit brand kit (`../brand-kit`) → `src/styles/credigit.css`, `src/brand/*` |
| Component design and design principles | **Bolt** (the ride-hailing company, bolt.eu): shapes, sizes, type scale, elevation, states — see **[BOLT-DESIGN.md](BOLT-DESIGN.md)** (binding). Component taxonomy (group names) and t-shirt size names are kept for API stability. |
| Product language | `../README.md` (Smart Enterprise Risk 360° PRD) |

Only the font family (and the brand-kit colours and logo) differ from Bolt. Application font: **Baloo 2** for everything — headings, text, labels and figures. The `font-mono` utility is kept for labels/figures but now maps to Baloo 2 with tabular numbers; use `font-code` (IBM Plex Mono) only for code samples.

## 2. Stack

React 19.3 (function components, `ref` as a normal prop — no `forwardRef`), TypeScript (strict), Tailwind CSS 4.3, lucide-react icons, Vitest 5 + Testing Library. The package is distributed **as source** (`main: src/index.ts`); consumers transpile it (Next.js `transpilePackages: ["@credigit/web-ui"]`) and point Tailwind at it with `@source`.

## 3. Theming rules (mandatory)

- **Never hard-code colours** (no hex, no `slate-*`, `emerald-*`, `rose-*`, etc.). Only use:
  - Semantic, theme-aware utilities: `bg-bg`, `bg-surface`, `bg-surface-sunken`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `border-line-strong`, `bg-action` / `hover:bg-action-hover` / `text-on-action`, `bg-emphasis` / `hover:bg-emphasis-hover` / `text-on-emphasis`, `text-link`, `ring-focus` / `outline-focus`.
  - Brand scales: `primary-50…900` (600 = brand Ink), `accent-50…900` (500 = brand Ember), `neutral-50…900` (500 = brand Slate).
  - Status: `success`, `warning`, `danger`, `info`, `*-soft` backgrounds, `*-strong` (AA text / solid fills) and `text-on-status` (provisional, not in brand kit).
  - `Tone` type and `toneStyles` live in `src/components/basic/tone.ts` — import from there; don't redefine `Tone` elsewhere.
  - Opacity modifiers are fine (`bg-fg/5`, `border-line/60`).
- Prefer **semantic** utilities so a component flips correctly inside a dark band.
- Surface themes (Bolt): `xlight` (default), `light`, `dark`, `xdark`. Applied to any subtree with `data-cg-theme="dark"`. Layout components expose a `theme?: SurfaceTheme` prop that sets this attribute.
- Information density (Bolt): `data-cg-density="compact|regular|spacious"`. Controls use `h-control-sm|md|lg`; table cells use `py-cell-y`.
- Shape, size, type, elevation and states follow **docs/BOLT-DESIGN.md** exactly: pills (`rounded-full`) for every control, chip and badge; `rounded-3xl`/`rounded-4xl`/`rounded-5xl` squircle surfaces; add the `squircle` utility to rounded surfaces and controls. Type scale utilities: `text-display`, `text-headline`, `text-title`, `text-subtitle`, `text-lead`.
- Logo: always render `<Logo />` (from `src/brand`) — never import logo files directly. It switches to the tenant's uploaded logo automatically.
- Runtime brand changes go through `BrandProvider` / `useBrand().updateBrand({ colors, logos })`.

## 4. Component rules

- Files: `src/components/<group>/<kebab-name>.tsx`, PascalCase named exports, no default exports. Each group has its own `index.ts` barrel — **only edit your own group's barrel**. Never edit `src/index.ts`, `src/styles/credigit.css`, or `src/brand/*` (ask the lead instead; report needed tokens).
- Tests: `src/components/<group>/<kebab-name>.test.tsx` for interactive/logic components.
- Props: extend the native element's props (`ComponentProps<"button">` etc.) and spread `...props`; accept `className` merged last with `cx()` from `../../utils/cx`.
- Bolt sizes: `size?: "xsmall" | "small" | "medium" | "large" | "xlarge"` (support the subset that makes sense; default `"medium"`). Use the `Size` type from `../../theme/tokens`.
- Polymorphism: components that may render a link accept `href` (renders `<a>`) or an `as` prop for a router Link component (`linkComponent?: ElementType` for nav components).
- Add `"use client";` at the top of any file that uses state, effects, context or event handlers. Pure presentational components stay server-compatible (no directive).
- Accessibility: WCAG 2.2 AA. Visible focus (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`), keyboard support, proper roles/ARIA, labels for all inputs, `prefers-reduced-motion` respected (base CSS handles transitions), minimum 24×24 target size, text contrast ≥ 4.5:1 on default themes.
- No domain data hard-coded in components (the old ride-hailing statuses are gone). Domain mappings are passed in as props.
- Typography: headings `font-display font-bold|extrabold tracking-tight text-fg`; body `text-fg-muted`; eyebrows/labels/figures `font-mono uppercase tracking-[0.08em] text-xs`.
- Every exported component and its props type gets a one-line JSDoc.

## 5. Component contract

Groups mirror Bolt's taxonomy. Signatures below are the agreed public API; implementers may add optional props but must not rename or remove these. `Size` = Bolt t-shirt size, `SurfaceTheme` = `xlight|light|dark|xdark`, `Tone` = `"neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info"`.

### basic (`src/components/basic`)
- `Button` — `variant?: "primary" | "secondary" | "tertiary" | "text" | "danger"` (Bolt: primary = `bg-action` pill, secondary = `bg-emphasis` ink pill, tertiary = soft grey `bg-fg/5` pill, text = ghost); `size?: "small"|"medium"|"large"`; `iconBefore?`, `iconAfter?: ReactNode`; `fullWidth?`; `loading?`; `href?` (renders `<a>`); `as?: ElementType`. Also `buttonStyles({ variant, size, fullWidth, className })` returning a class string.
- `IconButton` — `label: string` (aria-label, required), `icon: ReactNode`, `variant?`, `size?`.
- `Chip` — `tone?: Tone`, `size?: "small"|"medium"`, `icon?`, `onRemove?`.
- `ChipList` — wraps chips with gap.
- `Badge` — `tone?: Tone`, `variant?: "soft" | "solid" | "outline"`.
- `StatusBadge` — `status: string`, `tones?: Record<string, Tone>`, `label?: string`; default tone `neutral`, label = status with `_` → space. Exports `riskStatusTones` (e.g. `PERFORMING: success, WATCHLIST: warning, SUBSTANDARD: warning, DOUBTFUL: danger, LOST: danger, PENDING_APPROVAL: info, APPROVED: success, DECLINED: danger, DISBURSED: brand`).
- `Text` — `as?: ElementType`, `variant?: "display" | "headline" | "title" | "subtitle" | "body" | "small" | "caption" | "eyebrow" | "figure"`, `tone?: "default" | "muted" | "subtle" | "accent" | "inverse"`, `align?`.
- `Heading` — `level: 1-6`, `size?: "xsmall"…"xxlarge"` (visual size independent of level).
- `Eyebrow` — small mono uppercase label (`tone?: "accent" | "muted"`).
- `TextLink` — `href`, `external?` (adds icon + `rel`), `as?: ElementType`.
- `Icon` — `icon: LucideIcon`, `size?: Size`, `label?: string` (decorative if absent).
- `List` — `items?: ReactNode[]` or children; `variant?: "unordered" | "ordered" | "check" | "inline"`; `spacing?: Size`.
- `Avatar` — `name: string`, `src?`, `size?: Size`.
- `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` — `numeric?` on cells (mono, right-aligned), `striped?`/`stickyHeader?` on `Table`.
- `SegmentedControl` — `options: { value, label, icon? }[]`, `value`, `onChange`, `size?`, `label` (radiogroup name).

### forms (`src/components/forms`)
All controls: controlled or uncontrolled, `size?: "small"|"medium"|"large"`, `invalid?`, `disabled?`, use `h-control-*`. Native element props spread.
- `Field` — `label: ReactNode`, `htmlFor?`, `description?`, `error?`, `required?`, `optional?`; children = control. Wires `aria-describedby`/`aria-invalid` (via context).
- `Label`, `FieldMessage` (`tone?: "neutral" | "error" | "success"`), `Fieldset` (`legend`).
- `Input` — `iconBefore?`, `iconAfter?`, `prefix?`, `suffix?` (e.g. "₦").
- `Textarea` — `autoResize?`.
- `Select` (native styled select) — `options?: { value, label, disabled? }[]`, `placeholder?`.
- `Checkbox`, `Radio`, `RadioGroup` (`options`, `value`, `onChange`, `orientation?`), `Switch` (`checked`, `onCheckedChange`, `label`).
- `SearchField` — search input with icon and optional clear button.
- `FileUpload` — drag & drop zone, `accept?`, `multiple?`, `maxSizeMb?`, `onFilesChange(files)`; lists selected files.
- `Form` — `<form>` with vertical stack spacing; `FormActions` — right-aligned button row.

### layouts (`src/components/layouts`)
- `Container` — `size?: "small" | "medium" | "large" | "xlarge" | "full"` (max widths 640/896/1200/1440/none), horizontal gutters `px-4 sm:px-6 lg:px-8`.
- `Band` (Bolt's band / page section) — `theme?: SurfaceTheme`, `spacing?: "none" | "small" | "medium" | "large" | "xlarge"` (vertical padding), `as?: ElementType` (default `section`), `contained?: boolean` (wraps children in `Container`, default true), `containerSize?`, `id?`, `background?: "none" | "grid" | "radial"` (subtle decorative background using brand colours).
- `Stack` — `gap?: Size | "none"`, `direction?: "vertical" | "horizontal"`, `align?`, `justify?`, `wrap?`, `as?`.
- `Grid` — `columns?: 1|2|3|4|6|12` or responsive object `{ base?, sm?, md?, lg?, xl? }`, `gap?: Size`.
- `Layout` — two-column content/aside: `aside: ReactNode`, `asidePosition?: "start" | "end"`, `asideWidth?: "narrow" | "medium" | "wide"`.
- `Site` — page frame: `header?`, `footer?`, children main (`<main id="main">`), includes a "Skip to content" link.
- `AppShell` — application frame for credigit-ser-frontend: `sidebar`, `topbar?`, children content; responsive (sidebar becomes a drawer below `lg`).
- `Divider` — `orientation?`, `label?`.

### navigation (`src/components/navigation`)
- `Navbar` — `logo?: ReactNode` (defaults to `<Logo />` linking to `logoHref = "/"`), `links: { label, href, active? }[]`, `actions?: ReactNode` (e.g. buttons), `theme?: SurfaceTheme`, `sticky?: boolean`, `transparent?: boolean` (transparent until scrolled), `linkComponent?: ElementType`. Mobile: hamburger toggles an accessible disclosure menu (Escape closes, focus managed).
- `SideNav` — port of the old `AppSidebar`: `groups: { label, items: { href, label, icon?, badge? }[] }[]`, `activeHref`, `header?` (defaults to `<Logo tone="reverse" />`), `environment?`, `user?: { name, role, avatarSrc? }`, `footer?`, `linkComponent?`, `collapsed?`. Uses `data-cg-theme="xdark"` surface.
- `Breadcrumb` — `items: { label, href? }[]`, `linkComponent?`.
- `Pagination` — `page`, `pageCount`, `onPageChange`, `siblingCount?`.
- `Tabs` — `items: { id, label, content, icon?, badge? }[]`, `defaultValue?`, `value?`, `onValueChange?`, `variant?: "underline" | "pill"` (default `pill`). Full ARIA tabs keyboard pattern.
- `Menu` — dropdown: `trigger: ReactNode`, `items: { label, onSelect?, href?, icon?, danger?, divider? }[]`, `align?: "start" | "end"`. Keyboard navigable, closes on Escape/outside click.
- `TableOfContents` — `items: { id, label }[]`, highlights the section in view.
- `PageFooter` — `logo?` (default `<Logo />`), `tagline?`, `columns: { title, links: { label, href }[] }[]`, `legal?: ReactNode`, `bottomLinks?: { label, href }[]`, `theme?: SurfaceTheme` (default `xdark`), `linkComponent?`.

### blocks (`src/components/blocks`) — Bolt UI-Blocks
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardMedia` — `Card` props: `variant?: "outlined" | "elevated" | "filled"`, `interactive?` (hover lift + focus ring), `href?` (whole card is a link), `padding?: "none" | "small" | "medium" | "large"`, `radius?: "medium" | "large" | "xlarge"` (rounded-3xl / 4xl / 5xl).
- `Teaser` — `eyebrow?`, `title`, `description?`, `icon?: ReactNode`, `href?`, `cta?: string`, `layout?: "vertical" | "horizontal"`, `media?: ReactNode`, `surface?: "sunken" | "raised"` (grey panel by default; `raised` = white panel for grey bands). Used for feature/module tiles.
- `PageHeader` — `eyebrow?`, `title`, `description?`, `actions?`, `breadcrumb?: ReactNode`.
- `SectionHeader` — `eyebrow?`, `title`, `description?`, `align?: "start" | "center"`, `action?`, `size?: "medium" | "large"`, `as?` heading level (default `h2`).
- `Hero` — `eyebrow?`, `title: ReactNode`, `description?`, `actions?: ReactNode`, `media?: ReactNode`, `align?: "start" | "center"`, `theme?: SurfaceTheme`, `footnote?: ReactNode`, `background?: "none" | "grid" | "radial"`, `mediaFrame?: "sunken" | "none"`.
- `FeatureRow` — Bolt split row: `eyebrow?`, `title`, `description?`, `children?`, `media`, `reverse?` (media on the left), `mediaFrame?: "sunken" | "raised" | "none"`, `titleAs?`. Stacks text-first on mobile.
- `InfoSection` — label/value pairs: `items: { label, value, hint? }[]`, `columns?`.
- `ActionBlocks` — grid of large linked actions: `items: { title, description?, icon?, href }[]`.
- `Banner` — page-level announcement: `tone?: Tone`, `title?`, children, `action?`, `dismissible?`, `onDismiss?`.
- `Alert` — inline message: `tone?: "info" | "success" | "warning" | "danger"`, `title?`, children, `action?`.
- `Blockquote` — `quote`, `author?`, `role?` (no fabricated testimonials in product copy).
- `Accordion`, `AccordionItem` — `type?: "single" | "multiple"`, `defaultValue?`; item `value`, `title`, children. Uses native `<details>`/`<summary>` or full ARIA disclosure.
- `Modal` — `open`, `onOpenChange`, `title`, `description?`, `footer?`, `size?: "small"|"medium"|"large"`. Native `<dialog>`, focus trap, Escape closes, restores focus.
- `Drawer` — like `Modal` but slides from `side?: "start" | "end"`.
- `StatCard` — KPI tile: `label`, `value` (mono figure), `delta?: string`, `deltaDirection?: "up" | "down" | "flat"`, `deltaIntent?: "positive" | "negative" | "neutral"`, `hint?`, `icon?`, `tone?: Tone`.
- `EmptyState` — `icon?`, `title`, `description?`, `action?`.
- `Steps` / `Timeline` — `items: { title, description?, status?: "complete" | "current" | "upcoming", meta?: string }[]`, `orientation?: "vertical" | "horizontal"`. Used for lending lifecycle and phase roadmap.
- `CtaBand` — `title`, `description?`, `actions`, `theme?` (default `dark`).
- `Notification` / `Toaster` + `useToast()` — `toast({ title, description?, tone? })`, auto-dismiss, `aria-live="polite"`.

### data-viz (`src/components/data-viz`)
All charts: SVG, theme-aware via CSS variables (`var(--cg-…)` as `stroke`/`fill` via `style` or `className` like `fill-accent-500 stroke-line`), accessible (`role="img"` + `aria-label` + hidden data table or `<title>/<desc>`), responsive (`viewBox`, `width="100%"`).
- `RadarChart` — the 360° Risk Assessment Radar visual: `axes: { key, label }[]`, `series: { name, values: Record<key, number>, tone?: "accent" | "primary" | "neutral" }[]`, `max?: number` (default 100), `levels?: number` (default 5), `size?: number`, `showLegend?`, `showValues?`.
- `BarChart` — port of old `BarChart`: `data: { label, value, caption? }[]`, `height?`, `tone?: Tone`, `orientation?: "vertical" | "horizontal"`, `valueFormatter?`.
- `LineChart` — `series: { name, points: { x: string, y: number }[], tone? }[]`, `height?`, `yFormatter?`.
- `DonutChart` — `segments: { label, value, tone? }[]`, `centerLabel?`, `centerValue?`.
- `ProgressBar` — `value` (0–1), `tone?`, `label?`, `showValue?`, `size?: "small" | "medium"`.
- `Gauge` — `value`, `min?`, `max?`, `bands?: { to: number, tone: Tone }[]`, `label?`.
- `Sparkline` — `values: number[]`, `tone?`, `height?`.
- `RagIndicator` — `status: "red" | "amber" | "green"`, `label?` (dot + text; colour never the only signal).

### utilities (`src/components/utilities`) — Bolt Utilities
- `Tooltip` — `content`, `children` (trigger), `side?: "top" | "bottom" | "start" | "end"`. Hover + focus, Escape dismisses, `aria-describedby`.
- `Popover` — `trigger`, `content`, `align?`, `open?`/`onOpenChange?`.
- `CopyToClipboard` — `value`, `label?`; announces "Copied".
- `CodeSnippet` — `code`, `language?`, `copyable?` (mono, sunken surface).
- `Spinner` — `size?: Size`, `label?` (default "Loading").
- `Skeleton` — `className` for shape, `lines?`.
- `VisuallyHidden`, `SkipLink`.
- `Sticky` — `top?: number` wrapper.
- `ScrollToTop` — smooth scroll (respects reduced motion).
- `BrandSettingsPanel` — UI to change brand at runtime: colour pickers + hex inputs for primary/accent/neutral, brand name, logo upload (horizontal, reverse, symbol; reads file as data URL, SVG/PNG/WebP ≤ 512 KB), live preview, "Reset to Credigit defaults". Uses `useBrand()`. Validates hex input, shows contrast warning if accent vs white < 4.5:1.

## 6. Consuming the library

```jsonc
// package.json of credigit-ser-landing / credigit-ser-frontend
"dependencies": { "@credigit/web-ui": "file:../credigit-ser-web-component" }
```
```ts
// next.config.ts
transpilePackages: ["@credigit/web-ui"]
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
<html lang="en" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{ __html: brandBootScript() }} /></head>
  <body><BrandProvider>{children}</BrandProvider></body>
</html>
```
