# @credigit/web-ui — Conventions and component contract

This is the single contract for everyone building in or consuming `@credigit/web-ui`
(the shared React component library used by `credigit-ser-frontend` and `credigit-ser-landing`).

## 1. Sources of truth

| Concern | Source |
|---|---|
| Colours, font family, logo | Credigit brand kit (`../brand-kit`) → `src/styles/credigit.css`, `src/brand/*` |
| Component design and design principles | **Bolt** (the ride-hailing company, bolt.eu): shapes, sizes, type scale, elevation, states — see **[BOLT-DESIGN.md](BOLT-DESIGN.md)** (binding). Component taxonomy (group names) and t-shirt size names are kept for API stability. |
| Product language | `../README.md` (Smart Enterprise Risk 360° PRD) |

Only the font family (and the brand-kit colours and logo) differ from Bolt. Application font: **Baloo 2** for everything — headings, text, labels and figures. The `font-mono` utility is kept for labels/figures but now maps to Baloo 2 with tabular numbers; use `font-code` (IBM Plex Mono) only for code samples. Baloo 2 is the default; the application font can be switched at runtime (see Theming rules).

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
- Runtime brand changes go through `BrandProvider` / `useBrand().updateBrand({ colors, logos, font })`.
- **Fonts:** never hard-code a `font-family` (no `font-[Inter]`, no inline `fontFamily`). Use `font-sans` (default), `font-display` (headings) and `font-mono` (labels/figures, tabular numbers) — all three read `var(--cg-font-family)` and follow runtime font changes; `font-code` (IBM Plex Mono) stays fixed for code samples.
  - API: `updateBrand({ font: { family: "Inter" } })` (`source` is inferred: `"bundled"` for Baloo 2, `"google"` otherwise). `fontOptions` is the curated catalogue (Baloo 2 + 12 Google Fonts); any other Google Fonts family works by exact name. Families are validated (`isSafeFontFamily`: letters, digits, single spaces/hyphens, ≤ 64 chars) everywhere, including `brandBootScript()`; anything else is ignored.
  - `applyBrand` writes `--cg-font-family` and keeps exactly one managed `<link id="cg-brand-font">` to `fonts.googleapis.com/css2?family=…:wght@400..800&display=swap` (static-weight fallback if the family has no variable range) plus a preconnect to `fonts.gstatic.com`; switching back to a bundled font removes it. `clearBrand` / `resetBrand` restore Baloo 2.
  - **Privacy / CSP:** Baloo 2 is self-hosted (`assets/fonts`), so the default makes no third-party request. Any other font is loaded from Google at runtime: apps must allow `style-src https://fonts.googleapis.com` and `font-src https://fonts.gstatic.com` in their CSP, and should note it in the privacy notice (the user's IP is sent to Google). Tenants that can't allow this should stay on Baloo 2.
  - Glyph coverage: Baloo 2 stays in the stack after the runtime font, so glyphs a Google font lacks (e.g. ₦) still render in the brand font.

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
- `StackedBarChart` — `categories: string[]`, `series: { name, values: number[], tone? }[]` (`values[i]` ↔ `categories[i]`), `mode?: "stacked" | "grouped"` (default stacked), `orientation?: "vertical" | "horizontal"`, `height?` (default 220), `valueFormatter?`, `showTotals?` (stacked; default on for horizontal), `showLegend?` (pill legend, default when >1 series), `label?`. Negative values draw as 0.
- `AreaChart` — `series: { name, points: { x: string, y: number }[], tone? }[]` (x categories from the first series), `stacked?: boolean` (cumulative bands; default overlapping), `height?` (default 220), `yFormatter?`, `showLegend?`, `label?`. Gradient fills + thick round lines.
- `WaterfallChart` — `steps: { label, value?, type?: "start" | "delta" | "total", caption? }[]` (`delta` default; a `total` without `value` shows the running total), `increaseIntent?: "positive" | "negative"` (e.g. ECL / capital consumption = `negative` → increases red), `increaseTone?`, `decreaseTone?`, `totalTone?` (default `brand`), `valueFormatter?`, `showValues?`, `showLegend?`, `legendLabels?: { increase?, decrease?, total? }`, `height?` (default 240), `label?`. Also exports the pure `computeWaterfall(steps) → { label, type, value, from, to, running, direction }[]`.
- `ScatterChart` — `series: { name, points: { x, y, size?, label? }[], tone? }[]` (any `size` → bubbles, radius ∝ √size within `bubbleRange?: [min, max]` px, default `[6, 26]`), `xFormatter?`, `yFormatter?`, `xLabel?`, `yLabel?`, `xDomain?`, `yDomain?: [min, max]`, `referenceLines?: { axis: "x" | "y", value, label?, tone? }[]` (e.g. RAROC hurdle), `showLabels?`, `showLegend?`, `height?` (default 260), `label?`.
- `Treemap` — `items: { label, value, tone?, caption? }[]` (values ≤ 0 skipped), `aspectRatio?` (default 2) or fixed `height?`, `valueFormatter?`, `showShare?` (default true), `onItemClick?(item, index)` (tiles become buttons), `label?`. Squarified layout with soft tinted squircle tiles; labels only where they fit. Also exports the pure `squarify(items, width, height) → { item, index, x, y, width, height }[]`.
- `MiniBarList` — ranked horizontal bar list (e.g. Top 10 obligors) rendered as a labelled `<ol>`: `items: { label, value, href?, meta?, tone? }[]`, `valueFormatter?`, `max?` (scale; default largest value), `limit?`, `sort?` (default true, largest first), `showRank?` (default true), `tone?` (default `accent`), `linkComponent?`, `label?` (list name).

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
- `BrandSettingsPanel` — UI to change brand at runtime: colour pickers + hex inputs for primary/accent/neutral, brand name, **Font** (select of `fontOptions` + "Custom Google Font" input, validated and applied on Enter/blur, with a preview line in the chosen font; catalogue options render in their own font where the browser supports it), logo upload (horizontal, reverse, symbol; reads file as data URL, SVG/PNG/WebP ≤ 512 KB), live preview, "Reset to Credigit defaults" (restores colours, logos and Baloo 2). Uses `useBrand()`. Validates hex input, shows contrast warning if accent vs white < 4.5:1.

### data (`src/components/data`)
Data-heavy app components (tables, record pages, audit, boards). Colours via tokens / `toneStyles` / chart-utils only.
- `DataTable<T>` — `columns: DataTableColumn<T>[]` (`{ id, header, accessor?: keyof T | (row) => unknown, cell?: (row) => ReactNode, sortable?, sortValue?, align?: "start" | "center" | "end", numeric?, width?, hidden?, searchable?, csv?, csvHeader?, exportable?, className? }`), `data: T[]`, `getRowId(row, index)`, `label?` / `caption?`. Search: `searchable?`, `searchPlaceholder?`, `search?`/`onSearchChange?` (controlled). Filters: `filters?: { id, label, columnId?, options?, value?, defaultValue?, onChange?, filterFn?, allLabel? }[]` (select pills via `FilterBar`; options faceted from the data with counts when omitted). Sort: `sort?`/`defaultSort?`/`onSortChange?` (`{ id, direction: "asc" | "desc" } | null`; header buttons cycle asc → desc → none, `aria-sort`). Paging: `paginate?` (default true), `page?`/`onPageChange?`, `defaultPageSize?` (10), `pageSize?`/`onPageSizeChange?`, `pageSizeOptions?` (`[]` hides). Selection: `selectable?`, `selectedIds?`/`defaultSelectedIds?`/`onSelectionChange?`, `isRowSelectable?`, `bulkActions?: (rows, clear) => ReactNode` (ink bar while rows are selected). Rows: `onRowClick?(row, event)` (row focusable, Enter/Space; clicks on in-row controls ignored), `getRowHref?(row)` + `linkComponent?` (first cell becomes a link covering the row), `rowProps?`. States: `loading?` + `loadingRows?` (skeleton, `aria-busy`), `emptyState?`. Layout: `stickyHeader?`, `maxHeight?` (scroll area + sticky header), `striped?`, `density?` (`data-cg-density`), `toolbar?` (right-side actions), `exportFilename?`/`exportLabel?` (Export CSV button: filtered + sorted rows, all pages), `mobileCard?: (row) => ReactNode` (card list below `md`). Server-side: `manual?` + `totalRows?` (no client sort/search/filter/paging). Also exports `processRows(rows, columns, { search, filters, sort })`.
- CSV helpers — `toCsv(columns, rows)` (RFC 4180, CRLF, hidden / `exportable: false` columns skipped, formula-injection guard on text), `exportCsv(columns, rows, filename)` (downloads UTF-8 CSV with BOM, returns the text), `escapeCsvField(value)`, `getColumnValue(column, row)`.
- `FilterBar` — controlled pill filters: `search?: { value, onChange, placeholder?, label? }`, `filters?: FilterBarFilter[]` (`{ id, label, options: { value, label, count? }[], value, onChange, allLabel? }` select pill showing "Label: Selected", or `{ type: "dateRange", id, label, from?, to?, onChange({ from, to }), min?, max? }`), `onClearAll?` ("Clear all" pill while anything is active), `clearAllLabel?`, `actions?` (right-aligned), `children?` (extra pills), `label?` (group name). Active pills use the accent tint. Also `isFilterActive(filter)`.
- `DescriptionList` — `<dl>` label/value pairs: `items: DescriptionItem[]` (`{ label, value?, mono?, status?, statusTones?, copyValue?, hint?, span? }`; empty values render "—"; `status` renders a `StatusBadge`; `copyValue` adds a `CopyToClipboard`), `columns?: 1 | 2 | 3` (default 2, one column on phones), `layout?: "stacked" | "inline"`, `divided?` (default true).
- `KeyValueGrid` — same `items` as Bolt grey tiles with larger values: `columns?: 2 | 3 | 4` (default 3), `surface?: "sunken" | "raised"`.
- `Matrix` (alias `HeatmapGrid`) — labelled rows × columns as a real table: `rows`/`columns: { id, label, description? }[]`, `cells: { row, column, value?, label?, tone?, description?, disabled? }[]`, `label` (caption / accessible name), `showCaption?`, `colorBy?: "tone" | "value"` (default tone when cells have tones or thresholds are given), `thresholds?: { to, tone, label? }[]` (value bands → tones, e.g. heat-map Low/Medium/High), `scale?: { min?, max?, tone? }` (continuous tint, capped so text stays ≥ 4.5:1), `cellVariant?: "soft" | "solid"`, `valueFormatter?`, `showValues?`, `corner?`, `columnAxisLabel?`, `rowAxisLabel?`, `onCellClick?(cell)` (cells become buttons named "Row, Column: value. description"), `selected?: { row, column } | null`, `legend?: boolean | { label, tone }[]` (auto: threshold pills or a min → max gradient), `cellSize?`. Also `toneForValue(value, thresholds)`. Used for risk heat maps, the 360 RAR 36-cell interpretive layer and concentration grids.
- `MetricDelta` — inline change: `delta: number | string`, `format?`, `direction?`, `intent?: "positive" | "negative" | "neutral"`, `invert?` (higher is worse: NPL, ECL), `variant?: "pill" | "inline"`, `size?: "small" | "medium"`. Arrow + hidden "Up/Down/Unchanged" so colour is never the only signal. Also `deltaDirection(delta)`.
- `TrendValue` — `value` (mono figure), `label?`, `delta?`, `deltaProps?` (forwarded to `MetricDelta`), `hint?`, `size?: "small" | "medium" | "large"`.
- `EntityHeader` — record page header: `title`, `subtitle?`, `eyebrow?`, `identifier?` (mono pill + copy button) / `identifierLabel?`, `status?: ReactNode | { status, tones?, label? }`, `media?` (avatar / icon), `facts?: { label, value, mono? }[]` (grey key-facts strip), `actions?`, `back?: { href, label }`, `linkComponent?`, `tabs?`, `titleAs?` (default `h1`).
- `ActivityFeed` — chronological list (`<ol>` per day): `items: ActivityItem[]` (`{ id, actor: string | { name, avatarSrc?, role? }, action, target?, type?, timestamp, changes?: { field, before?, after? }[], ip?, device?, note?, tone? }`), `types?: { value, label }[]` (filter pills with `aria-pressed`), `type?`/`defaultType?`/`onTypeChange?`, `groupByDay?` (default true), `formatTimestamp?`, `formatDay?`, `detailed?` (type badge, IP, device), `label?`, `emptyMessage?`, `notice?`.
- `AuditTrail` — `ActivityFeed` in detailed mode for the immutable audit log, with `immutableNotice?` (append-only notice; `null` hides). Default label "Audit trail".
- `KanbanBoard` — `columns: { id, title, tone?, limit? }[]` (count pill, warning when over `limit`), `cards: { id, columnId, title, textTitle?, meta?, badges?: { label, tone? }[], assignee?: { name, avatarSrc? }, href?, footer? }[]` (array order = order within a column), `onMove?(cardId, toColumnId, toIndex)` (controlled: update `cards` yourself), `draggable?` (HTML drag & drop, default true with `onMove`); keyboard alternative: per-card "Move" menu (Move up / down / to <column>) with a polite live announcement; `onCardClick?`, `renderCard?`, `linkComponent?`, `label?`, `emptyColumnMessage?`.

### app (`src/components/app`) — application chrome and workflow
Product components for Smart Enterprise Risk 360°. Domain values (roles, limits, amounts, times) are passed in pre-formatted; these components never format currency or dates.
- `AppHeader` — content for `AppShell`'s `topbar`: `title?`, `breadcrumb?` (shown from `md`), `onSearchClick?` (search pill with Ctrl/⌘ K hint; icon-only below `md`), `searchLabel?`, `tenant?: ReactNode`, `environment?: { label, tone? }`, `notifications?: ReactNode`, `helpHref?`/`onHelpClick?`, `userMenu?: ReactNode`, `actions?`.
- `UserMenu` — `user: { name, role?, email?, avatarSrc? }` (`AppUser`), `profileHref?`/`onProfile?`, `settingsHref?`/`onSettings?`, `onSignOut?`/`signOutHref?`, `roles?: { id, label }[]` + `activeRoleId?` + `onSwitchRole?` (switch-role section), `extraItems?: MenuItem[]`, `compact?` (name hidden below `md`), `labels?`. Built on `Menu`.
- `NotificationCenter` — bell with unread count + popover (`variant="popover"`, default; full-width sheet on mobile) or `Drawer` (`variant="drawer"`): `notifications: AppNotification[]` (`{ id, title, body?, time?, tone?, read?, href?, category? }`), `onMarkRead?(id)` (called when an unread item is opened), `onMarkAllRead?`, `onNotificationClick?`, `filters?: { id, label }[]` (`all`, `unread` built in; other ids match `category`), `open?`/`defaultOpen?`/`onOpenChange?`, `footer?`, `linkComponent?`. `NotificationList` is the panel content on its own (for a full page).
- `CommandPalette` — Ctrl/⌘+K dialog (ARIA combobox + grouped listbox): `open`, `onOpenChange`, `items: CommandItem[]` (`{ id, label, group?, description?, icon?, keywords?, shortcut?, href?, disabled? }`), `groups?: { id, label }[]` (headings + order), `onSelect(item)` (the app navigates), `query?`/`onQueryChange?` + `filter={false}` for server-side search, `loading?`, `enableShortcut?` (default true), `limit?`. ↑/↓ wrap and skip disabled items, Ctrl+Home/End, Enter selects, Esc closes. Also `scoreCommand(item, query)`.
- `Wizard` — multi-step form: `steps: WizardStep[]` (`{ id, title, description?, content, optional?, status?: "complete" | "error", validate?() }`), `step?`/`defaultStep?`/`onStepChange?`, `validateStep?(id)`, `onSubmit()`, `onSaveDraft?(stepId)`, `summary?` (appended review step, `summaryTitle?`), `allowStepNavigation?` (jump to visited steps), `submitting?`, `labels?`. Validators may be async and return `true`, `false` (default message) or an error string; errors mark the step and render `role="alert"`. Focus moves to the step heading on step change.
- `ApprovalTimeline` (alias `ApprovalChain`) — credit approval route: `tiers: ApprovalTier[]` (`{ id, title, role?, limit?, participants: ApprovalParticipant[], adjudicator?, decision?, meta? }`; participant `{ name, role?, avatarSrc?, decision, decidedAt?, comment?, note? }`), `currentTierId?` (default: first pending/dissent tier), `decisionLabels?`, `coSignLabel?`, `adjudicatorLabel?`, `limitLabel?`. Decisions: `pending | approved | declined | recommended | dissent | adjudicated | escalated | returned` (`approvalDecisionMeta`). Two or more participants render side by side as co-signers; dissent (explicit, or approve vs decline) renders the adjudicator branch (placeholder when unassigned). Helpers `hasDissent()`, `deriveTierDecision()`.
- `DecisionPanel` — approver form: `actions?: ("approve" | "recommend" | "return" | "decline")[]`, `onDecide({ decision, comment })`, `commentRequired?: boolean | DecisionAction[]` (default all), `minCommentLength?`, `requireStepUp?: boolean | (d) => boolean` + `onStepUp?(d): Promise<boolean>` (e.g. open `StepUpAuthDialog`; `false` aborts), `title?`, `notice?`, `actionLabels?`, `defaultDecision?`, `disabled?`.
- `StepUpAuthDialog` — re-authentication modal: `open`, `onOpenChange`, `onVerify(code): Promise<boolean>`, `onVerified?`, `onResend?`, `method?: "otp" | "pin"` (PIN is masked, no resend), `length?` (6), `summary?` (what is being approved), `errorMessage?`, `resendCooldown?` (30 s), `autoSubmit?`. UI only. `CodeInput` (separate digit boxes; paste distributes; Backspace/arrow keys; `autocomplete="one-time-code"`) is exported too.
- `CommentThread` — `comments: ThreadComment[]` (`{ id, author: AppUser, body, time?, edited?, internal? }`), `mentions?: string[]` (known names; default highlights any `@word`), `currentUser?`, `onSubmit?(body)` (compose box; Ctrl/⌘+Enter posts), `title?`, `placeholder?`. Helper `splitMentions()`.
- `AiInsightCard` — AI co-pilot output: `kind?: "drafted" | "flagged" | "insight"` (label "AI-drafted" / "AI-flagged" / "AI insight" with sparkle icon; flagged uses a warning tint, the others the accent tint), `title?`, `model?`, `generatedAt?`, `confidence?` (0–1 meter), `paragraphs?`, `bullets?`, children, `sources?: { label, href?, detail? }[]`, `onAccept?`/`onEdit?`/`onDismiss?`, `signOffNote?` (default: a named person must sign off), `signedOffBy?` (replaces the note and hides the actions).
- `AiDraftPanel` — editable AI draft (e.g. a credit memo section): same meta props plus `draft: string` (blank-line paragraphs, `- ` bullets), `onAccept(text)`, `onChange?`, `defaultEditing?`; shows "Edited" once changed.
- `FileCard` / `DocumentList` — `document` / `documents: DocumentItem[]` (`{ id, name, type?, size? (bytes), version?, uploadedBy?, uploadedAt?, status?, note?, category? }`), status `uploaded | processing | extracted | verified | rejected` (`documentStatusMeta`; processing shows "Processing OCR" with a spinner), `onPreview?`/`onDownload?`/`onReplace?`/`onDelete?` (an icon button per handler), `empty?`. Type icon from MIME type or extension.
- `ChecklistPanel` — conditions precedent / disbursement checklist: `items: ChecklistItem[]` (`{ id, title, description?, status, owner?, dueDate?, overdue?, evidence?: { label, href }, locked? }`), status `met | pending | waived | deferred | breached` (`checklistStatusMeta`), `onToggle?(id, "met" | "pending")` (checkbox for met/pending items), `title?`, `description?`, `action?`, `labels?`. Progress = satisfied (met + waived) / total, with a segmented bar and per-status counts; `checklistSummary()` helper.
- `PhaseBadge` — `phase: number | string`, `label?`, `tone?` (1 accent, 2 info, 3+ neutral).
- `ModuleHeader` — page header: `icon?`, `eyebrow?`, `title`, `description?`, `phase?`, `badges?`, `actions?`, `breadcrumb?`, `tabs?: { id, label, href?, icon?, badge?, disabled? }[]` + `activeTab?` + `onTabChange?` (pill sub-navigation with `aria-current="page"`), `linkComponent?`, `titleAs?`.
- `SignInCard` — `productName?`, `tagline?`, `logo?` (default `<Logo />`), `onMicrosoftSignIn?` / `microsoftHref?`, `loading?`, `error?`, `microsoftTheme?`, `dividerLabel?` (default "or"; `null` hides it), children (demo access area, e.g. `RolePicker`), `footer?`.
- `MicrosoftSignInButton` — `theme?: "light" | "dark"`, `href?`, `loading?`, `label?` (keep "Sign in with Microsoft"), `shape?: "pill" | "rectangle"`, `fullWidth?`. Four-square logo drawn in SVG (`MicrosoftLogo`). **Exception to the theming rule:** Microsoft's branding guidance requires its own logo colours and a neutral button (white, #8C8C8C border, #5E5E5E text; or #2F2F2F with white text), so these hex values live in `sign-in-card.tsx` and must not be recoloured by the brand.
- `RolePicker` — `roles: RoleOption[]` (`{ id, title, description?, icon?, group?, badge?, disabled? }`), `onSelect(role)`, `selectedId?`, `searchable?` (default when there are more than 6 roles), `layout?: "grid" | "list"` (grid is 2 columns when its container is ≥ 32rem), `groupOrder?`.
- `TenantSwitcher` — `tenants: Tenant[]` (`{ id, name, logoSrc?, environment?, description? }`), `value`, `onValueChange?(tenant)`, `environmentTones?` (merged over `defaultEnvironmentTones`; `environmentTone()` helper), `compact?`. Built on `Menu`.
- `SessionTimeoutDialog` — `open`, `secondsRemaining?` (120) or `expiresAt?`, `onStaySignedIn`, `onSignOut`, `onTimeout?` (default `onSignOut`; fired once at 0), `title?`, `description?`. Escape / close = stay signed in; `role="timer"` plus coarse live announcements at 60/30/10 s. `formatCountdown()` helper.
- `PermissionGate` — `allowed: boolean`, children, `fallback?` (default lock `EmptyState`; `null` renders nothing), `title?`, `description?`, `action?`. A UI convenience only; the server must enforce permissions.

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
