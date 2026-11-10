"use client";

import { AlertTriangle, CheckCircle2, ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useId, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

import { defaultBrand, isHexColor, Logo, useBrand, type BrandColors, type BrandLogos } from "../../brand";
import { cx } from "../../utils/cx";

/** Maximum logo upload size in bytes (512 KB). */
export const LOGO_MAX_BYTES = 512 * 1024;
/** Accepted logo MIME types. */
export const LOGO_ACCEPTED_TYPES = ["image/svg+xml", "image/png", "image/webp"] as const;

/** Expand `#abc` to `#AABBCC`; returns the input uppercased otherwise. */
export function normalizeHex(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return `#${v
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")}`.toUpperCase();
  }
  return v.toUpperCase();
}

function luminance(hex: string): number {
  const h = normalizeHex(hex).slice(1);
  const channel = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Approximates --cg-accent-600 (accent mixed 84% with black): the shade used for buttons and links. */
export function actionShade(hex: string): string {
  const h = normalizeHex(hex).slice(1);
  const parts = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.84));
  return `#${parts.map((n) => n.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Returns an error message, or null when the file is an accepted logo. */
export function validateLogoFile(file: File): string | null {
  if (!(LOGO_ACCEPTED_TYPES as readonly string[]).includes(file.type)) return "Use an SVG, PNG or WebP image.";
  if (file.size > LOGO_MAX_BYTES) return `File is ${Math.ceil(file.size / 1024)} KB; the limit is 512 KB.`;
  return null;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type ColorKey = keyof BrandColors;
type LogoKey = Extract<keyof BrandLogos, "horizontal" | "horizontalReverse" | "symbol">;

const colorFields: { key: ColorKey; label: string; hint: string }[] = [
  { key: "primary", label: "Primary", hint: "Headings, dark bands, secondary buttons" },
  { key: "accent", label: "Accent", hint: "Primary buttons, links, highlights" },
  { key: "neutral", label: "Neutral", hint: "Body text, captions, borders" },
];

const logoFields: { key: LogoKey; label: string; hint: string; dark?: boolean }[] = [
  { key: "horizontal", label: "Horizontal logo", hint: "For light backgrounds" },
  { key: "horizontalReverse", label: "Horizontal logo (reverse)", hint: "For dark backgrounds", dark: true },
  { key: "symbol", label: "Symbol", hint: "Square icon / favicon" },
];

const inputClass =
  "squircle h-control-md w-full rounded-full border-0 bg-fg/5 px-4 text-base text-fg ring-1 ring-transparent transition-[background-color,box-shadow] duration-150 ease-bolt placeholder:text-fg-subtle hover:bg-fg/10 focus:bg-surface focus:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:ring-danger";
const ghostButton =
  "squircle inline-flex h-control-sm min-w-8 items-center justify-center gap-1.5 rounded-full bg-fg/5 px-3.5 text-sm font-semibold text-fg transition-[background-color,transform] duration-150 ease-bolt hover:bg-fg/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const eyebrow = "font-mono text-xs uppercase tracking-[0.08em] text-fg-muted";

/** Props for {@link BrandSettingsPanel}. */
export type BrandSettingsPanelProps = Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
};

/**
 * Runtime brand editor: colours, brand name and logos. Every valid change is applied immediately
 * through `useBrand().updateBrand`, so the whole product (and the live preview) restyles at once.
 */
export function BrandSettingsPanel({
  title = "Brand settings",
  description = "Change colours, name and logos. Changes apply across the whole product immediately.",
  className,
  ...props
}: BrandSettingsPanelProps) {
  const { brand, updateBrand, resetBrand } = useBrand();
  const uid = useId();
  const [drafts, setDrafts] = useState<BrandColors>(brand.colors);
  const [name, setName] = useState(brand.name);
  const [logoErrors, setLogoErrors] = useState<Partial<Record<LogoKey, string>>>({});

  // Follow external brand changes (reset, other panels, stored brand loading after mount).
  const { primary, accent, neutral } = brand.colors;
  useEffect(() => setDrafts({ primary, accent, neutral }), [primary, accent, neutral]);
  useEffect(() => setName(brand.name), [brand.name]);

  const setColor = (key: ColorKey, value: string) => {
    setDrafts((d) => ({ ...d, [key]: value }));
    if (isHexColor(value)) updateBrand({ colors: { [key]: value.trim() } });
  };

  const onLogo = async (key: LogoKey, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const error = validateLogoFile(file);
    setLogoErrors((e) => ({ ...e, [key]: error ?? undefined }));
    if (error) return;
    try {
      updateBrand({ logos: { [key]: await readAsDataUrl(file) } });
    } catch {
      setLogoErrors((e) => ({ ...e, [key]: "The file could not be read." }));
    }
  };

  const reset = () => {
    resetBrand();
    setDrafts(defaultBrand.colors);
    setName(defaultBrand.name);
    setLogoErrors({});
  };

  // Buttons and links use a deeper shade of the accent (--cg-accent-600 = 84% accent + black),
  // so check that shade against white rather than the raw accent.
  const accentForContrast = isHexColor(drafts.accent) ? drafts.accent : brand.colors.accent;
  const ratio = contrastRatio(actionShade(accentForContrast), "#FFFFFF");
  const lowContrast = ratio < 4.5;

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className={cx("squircle rounded-4xl bg-surface p-6 text-fg shadow-sm sm:p-8", className)}
      {...props}
    >
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-prose">
          <h2 id={`${uid}-title`} className="font-display text-title font-bold text-fg">
            {title}
          </h2>
          {description && <p className="mt-2 text-base text-fg-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={reset}
          className="squircle inline-flex h-control-md items-center gap-2 rounded-full bg-fg/5 px-4 text-base font-semibold tracking-[-0.005em] text-fg transition-[background-color,transform] duration-150 ease-bolt hover:bg-fg/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset to Credigit defaults
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-name`} className="text-sm font-semibold text-fg">
              Brand name
            </label>
            <input
              id={`${uid}-name`}
              className={inputClass}
              value={name}
              maxLength={60}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) updateBrand({ name: e.target.value });
              }}
            />
            <p className="text-xs text-fg-muted">Used as the logo's accessible name and in page titles.</p>
          </div>

          {/* Colours */}
          <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
            <legend className={cx(eyebrow, "mb-3")}>Colours</legend>
            {colorFields.map(({ key, label, hint }) => {
              const value = drafts[key];
              const valid = isHexColor(value);
              const id = `${uid}-${key}`;
              return (
                <div key={key} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                  <input
                    type="color"
                    aria-label={`${label} colour picker`}
                    value={valid ? normalizeHex(value).toLowerCase() : normalizeHex(brand.colors[key]).toLowerCase()}
                    onChange={(e) => setColor(key, e.target.value.toUpperCase())}
                    className="mt-6 size-control-md shrink-0 cursor-pointer appearance-none overflow-hidden rounded-full border-0 bg-transparent p-0 shadow-sm transition-transform duration-150 ease-bolt hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-semibold text-fg">
                      {label}
                    </label>
                    <input
                      id={id}
                      className={cx(inputClass, "font-mono uppercase")}
                      value={value}
                      spellCheck={false}
                      autoComplete="off"
                      maxLength={7}
                      aria-invalid={!valid}
                      aria-describedby={`${id}-hint`}
                      onChange={(e) => setColor(key, e.target.value)}
                    />
                    <p id={`${id}-hint`} className={cx("text-xs", valid ? "text-fg-muted" : "font-medium text-danger-strong")}>
                      {valid ? hint : "Enter a hex colour such as #E8401C."}
                    </p>
                  </div>
                </div>
              );
            })}

            <div
              role="status"
              className={cx(
                "squircle flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm",
                lowContrast ? "bg-warning-soft text-warning-strong ring-1 ring-warning/40" : "bg-surface-sunken text-fg-muted",
              )}
            >
              {lowContrast ? (
                <AlertTriangle aria-hidden="true" className="mt-px size-4 shrink-0" />
              ) : (
                <CheckCircle2 aria-hidden="true" className="mt-px size-4 shrink-0 text-success-strong" />
              )}
              <span>
                Button and link contrast (deeper accent shade vs white) is{" "}
                <strong className="font-mono">{ratio.toFixed(2)}:1</strong>.{" "}
                {lowContrast
                  ? "This is below the WCAG AA minimum of 4.5:1, so white text on primary buttons and accent links may be hard to read. Consider a darker accent."
                  : "Meets WCAG AA for normal text."}
              </span>
            </div>
          </fieldset>

          {/* Logos */}
          <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <legend className={cx(eyebrow, "mb-1")}>Logos</legend>
            <p className="text-xs text-fg-muted">SVG, PNG or WebP, up to 512 KB. Leave empty to use the built-in logo.</p>
            {logoFields.map(({ key, label, hint, dark }) => {
              const id = `${uid}-logo-${key}`;
              const current = brand.logos[key];
              const error = logoErrors[key];
              return (
                <div key={key} className="squircle flex flex-col gap-2 rounded-3xl bg-surface-sunken p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div
                      data-cg-theme={dark ? "xdark" : "xlight"}
                      className="squircle flex h-14 w-24 shrink-0 items-center sm:w-32 justify-center overflow-hidden rounded-2xl p-2 shadow-sm"
                    >
                      {current ? (
                        <img src={current} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-subtle">Built-in</span>
                      )}
                    </div>
                    <div className="min-w-36 flex-1">
                      <p className="text-sm font-semibold text-fg">{label}</p>
                      <p className="text-xs text-fg-muted">{hint}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id={id}
                        type="file"
                        accept={LOGO_ACCEPTED_TYPES.join(",")}
                        className="peer sr-only"
                        aria-describedby={error ? `${id}-error` : undefined}
                        onChange={(e) => void onLogo(key, e)}
                      />
                      <label
                        htmlFor={id}
                        className={cx(
                          ghostButton,
                          "cursor-pointer bg-surface shadow-sm hover:bg-surface hover:shadow-md peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                        )}
                      >
                        <ImagePlus aria-hidden="true" className="size-3.5" />
                        Upload<span className="sr-only"> {label}</span>
                      </label>
                      {current && (
                        <button
                          type="button"
                          className={ghostButton}
                          aria-label={`Remove ${label}`}
                          onClick={() => updateBrand({ logos: { [key]: "" } })}
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {error && (
                    <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger-strong">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </fieldset>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start" aria-label="Live preview" role="group">
          <p className={eyebrow}>Live preview</p>
          {(["xlight", "xdark"] as const).map((theme) => (
            <div key={theme} data-cg-theme={theme} className="squircle overflow-hidden rounded-3xl shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <Logo tone={theme === "xdark" ? "reverse" : "default"} size="small" />
                <Logo variant="symbol" tone={theme === "xdark" ? "reverse" : "default"} size="small" />
              </div>
              <div className="flex flex-col gap-3 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-link">360° Risk Assessment Radar</p>
                <p className="font-display text-xl font-bold tracking-tight text-fg">Portfolio at a glance</p>
                <p className="text-sm text-fg-muted">
                  Body copy uses the neutral colour. <span className="font-medium text-link underline">Links</span> use the accent.
                </p>
                <div className="flex flex-wrap gap-2" aria-hidden="true">
                  <span className="squircle inline-flex h-control-sm items-center rounded-full bg-action px-3.5 text-sm font-semibold text-on-action">
                    Primary action
                  </span>
                  <span className="squircle inline-flex h-control-sm items-center rounded-full bg-emphasis px-3.5 text-sm font-semibold text-on-emphasis">
                    Secondary
                  </span>
                  <span className="squircle inline-flex h-control-sm items-center rounded-full bg-fg/5 px-3.5 text-sm font-semibold text-fg">
                    Tertiary
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" aria-hidden="true">
                  {["bg-primary-600", "bg-primary-400", "bg-accent-500", "bg-accent-300", "bg-neutral-500", "bg-neutral-200"].map((c) => (
                    <span key={c} className={cx("size-6 rounded-full ring-1 ring-fg/10", c)} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
