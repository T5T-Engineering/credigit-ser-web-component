# Bolt design language (adopted for Credigit)

The component design and design principles of `@credigit/web-ui` follow **Bolt** (the ride-hailing
company, bolt.eu). Only three things differ from Bolt:

| | Bolt | Credigit |
|---|---|---|
| Font | Bolt's own sans | **Baloo 2** for the entire application: headings, text, labels and figures (tabular numbers). IBM Plex Mono only for code samples (`font-code`) |
| Colours | Bolt green + black | **Credigit brand kit**: Ink `#0F1E2E` in Bolt's black / high-contrast role, Ember `#E8401C` (deep shade `#C2330F` for buttons) in Bolt's green / accent role, Slate `#5B6878` in Bolt's grey role |
| Logo | Bolt | Credigit `<Logo />` |

Values below were taken from bolt.eu's production stylesheets (Radix Themes base with Bolt overrides,
`data-radius="medium"`, `data-scaling="100%"`, `corner-shape: squircle` where supported).

## Principles

1. **Soft, friendly geometry.** Every interactive element is a pill. Surfaces have large, smooth
   (squircle) corners. There are no sharp corners anywhere.
2. **Flat and calm.** Depth comes from light grey fills and hairline rings, not heavy borders or
   shadows. Most cards are borderless grey panels on white, or white panels on grey.
3. **Bold, confident type.** Large, tight, bold headings; generous, readable body text; short copy.
4. **One loud colour.** The accent fills the primary action only. Secondary actions are high-contrast
   ink or soft grey. Colour is never decoration for its own sake.
5. **Generous space.** Big section padding, roomy controls (48px marketing buttons), clear grouping.
6. **Obvious and accessible.** Large targets, strong focus rings, plain language.

## Shape

| Element | Bolt value | Tailwind in this library |
|---|---|---|
| Buttons, icon buttons, chips, badges, tags, segmented controls, pill tabs, switches, search fields | pill (radius ≥ height) | `rounded-full` |
| Text inputs, selects | pill-like squircle (40px on 40px control) | `rounded-full` (single line); `rounded-3xl` for textareas, `rounded-2xl` for file drop zones |
| Small cards, menus, popovers, toasts, tooltips (tooltips `rounded-xl`) | 16–24px | `rounded-2xl` (16px) / `rounded-3xl` (24px) |
| Cards, panels, modals | 24–32px | `rounded-3xl` (24px) default; `rounded-4xl` (32px) large |
| Hero media, feature blocks, CTA bands, large image frames | 32–40px | `rounded-4xl` (32px) / `rounded-5xl` (40px) |
| Avatars, status dots, radios | circle | `rounded-full` |

Add the `squircle` utility to every rounded surface and control (it applies `corner-shape: squircle`
in browsers that support it, like Bolt; others fall back to normal rounding).

## Size

| Token | Bolt | Use |
|---|---|---|
| Control heights | 32 / 40 / 48px (`--space-6/7/8`) | `h-control-sm` / `h-control-md` / `h-control-lg` |
| Button large (marketing default) | 48px tall, 24px side padding, 18px text, 12px icon gap | `size="large"` |
| Button medium (app default) | 40px, 16px padding, 16px text | `size="medium"` |
| Button small | 32px, 12px padding, 14px text | `size="small"` |
| Input | 40px, 16px text, 12px padding | `h-control-md` |

## Type (Baloo 2)

| Role | Bolt size / line-height | Weight | Tracking |
|---|---|---|---|
| Display (hero h1) | 60–72px / 1.05 | 700 | -0.025em |
| Headline (section h2) | 40–48px / 1.1 | 700 | -0.02em |
| Title (h3) | 24–30px / 1.2 | 700 | -0.015em |
| Subtitle | 20px / 1.4 | 600 | -0.01em |
| Body large (lead) | 18–20px / 1.55 | 400 | 0 |
| Body | 16px / 1.5 | 400 | 0 |
| Small | 14px / 1.45 | 400–500 | 0 |
| Button text | 16–18px | 600 | -0.005em |
| Eyebrow / label (Baloo 2, `font-mono` token) | 12–13px | 500 | 0.08em, uppercase |

Headings are `text-fg`; body is `text-fg-muted`. Mobile scales display down to 40–44px, headline to 32px.

## Colour roles (Bolt role → Credigit token)

- Bolt green solid (primary CTA) → `bg-action text-on-action hover:bg-action-hover`
- Bolt black "high contrast" solid (secondary CTA) → `bg-emphasis text-on-emphasis hover:bg-emphasis-hover`
- Bolt soft grey button / chip / input fill → `bg-fg/5 hover:bg-fg/10 text-fg` (theme-aware), or `bg-surface-sunken`
- Bolt soft green tint (selected, brand badge) → `bg-accent-50 text-accent-700` (or `bg-accent-100`)
- Bolt grey section backgrounds → `bg-surface-sunken` / `data-cg-theme="light"`
- Borders: hairline rings `ring-1 ring-line` / `shadow-sm`, rarely visible strokes.

## Elevation (Bolt shadow-2/3/4)

- `shadow-sm`: hairline ring + 1–2px soft drop: resting cards on grey, inputs on focus.
- `shadow-md`: ring + 4–16px soft drop: hover lift, menus, popovers.
- `shadow-lg`: ring + large soft drop: modals, drawers, toasts.

## Motion

Short and soft: 150–200ms `ease-out` for hover/press; press scales to `active:scale-[0.98]`;
sections may fade up 8–16px on enter. All motion is disabled by `prefers-reduced-motion`.

## States

- Hover: fill one step darker (`action-hover`, `fg/10`); cards lift with `shadow-md` and `-translate-y-0.5`.
- Focus: 2px accent outline, 2px offset, on every interactive element.
- Selected: accent tint (`bg-accent-50 text-accent-700`) or solid ink for pill tabs / segmented controls.
- Disabled: 50% opacity, no pointer events.
- Error: `text-danger-strong`, `ring-danger` on the control, message with icon.
