/**
 * Runtime brand engine.
 *
 * The whole design system reads colours from CSS variables (`--cg-*`).
 * Changing a brand value here rewrites those variables on the root element,
 * so every component in every consuming app updates at once.
 * The application font works the same way: `--cg-font-family` feeds font-sans, font-display and font-mono.
 */

export type BrandColors = {
  /** Main brand colour (Credigit Ink). Headings, dark bands, secondary buttons. */
  primary: string;
  /** Action colour (Credigit Ember). Primary buttons, links, highlights. */
  accent: string;
  /** Neutral text colour (Credigit Slate). Body copy, captions. */
  neutral: string;
};

export type BrandLogos = {
  /** Image URL for the horizontal logo on light backgrounds. Leave empty to use the built-in logo. */
  horizontal?: string;
  /** Horizontal logo for dark backgrounds. Falls back to `horizontal`. */
  horizontalReverse?: string;
  /** Stacked logo. Falls back to `horizontal`. */
  stacked?: string;
  /** Stacked logo for dark backgrounds. Falls back to `stacked`, then `horizontalReverse`. */
  stackedReverse?: string;
  /** Square symbol / app icon. */
  symbol?: string;
  /** Symbol for dark backgrounds. Falls back to `symbol`. */
  symbolReverse?: string;
};

/** Where a font comes from: shipped with the library (self-hosted @font-face) or Google Fonts at runtime. */
export type FontSource = "bundled" | "google";

/** The application font (headings, body, labels and figures). Code samples keep IBM Plex Mono (`font-code`). */
export type BrandFont = {
  /** CSS font-family name, e.g. "Baloo 2" or "Inter". Letters, digits, spaces and hyphens only. */
  family: string;
  source: FontSource;
};

/** Font input: `source` may be omitted (bundled when the family ships with the library, Google Fonts otherwise). */
export type BrandFontInput = { family: string; source?: FontSource };

export type BrandConfig = {
  name: string;
  colors: BrandColors;
  logos: BrandLogos;
  font: BrandFont;
};

export type BrandInput = {
  name?: string;
  colors?: Partial<BrandColors>;
  logos?: Partial<BrandLogos>;
  font?: BrandFontInput;
};

/** An entry of the curated {@link fontOptions} catalogue. */
export type FontOption = BrandFont & {
  /** Display label. */
  label: string;
  /** Google Fonts css2 weight axis, e.g. "wght@400..800" (variable) or "wght@400;700;900" (static). Google fonts only. */
  axis?: string;
};

/** Font families shipped (self-hosted) with the library. */
export const bundledFontFamilies = ["Baloo 2"] as const;

/** Default Google Fonts weight axis: the variable range the components use (400 regular … 800 extrabold). */
export const GOOGLE_FONT_AXIS_VARIABLE = "wght@400..800";
/** Fallback for families without a variable weight axis. */
export const GOOGLE_FONT_AXIS_STATIC = "wght@400;500;600;700;800";

/**
 * Curated application fonts: Baloo 2 (bundled, default) plus well-known Google Fonts suited to a banking / risk product.
 * Any other Google Fonts family can be used by name (validated with {@link isSafeFontFamily}).
 */
export const fontOptions: readonly FontOption[] = [
  { family: "Baloo 2", source: "bundled", label: "Baloo 2 (Credigit default)" },
  { family: "Inter", source: "google", label: "Inter", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Archivo", source: "google", label: "Archivo", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "IBM Plex Sans", source: "google", label: "IBM Plex Sans", axis: "wght@400;500;600;700" },
  { family: "Source Sans 3", source: "google", label: "Source Sans 3", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Nunito Sans", source: "google", label: "Nunito Sans", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Open Sans", source: "google", label: "Open Sans", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Lato", source: "google", label: "Lato", axis: "wght@400;700;900" },
  { family: "Roboto", source: "google", label: "Roboto", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Montserrat", source: "google", label: "Montserrat", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Poppins", source: "google", label: "Poppins", axis: GOOGLE_FONT_AXIS_STATIC },
  { family: "DM Sans", source: "google", label: "DM Sans", axis: GOOGLE_FONT_AXIS_VARIABLE },
  { family: "Manrope", source: "google", label: "Manrope", axis: GOOGLE_FONT_AXIS_VARIABLE },
];

/** Credigit brand kit defaults. */
export const defaultBrand: BrandConfig = {
  name: "Credigit",
  colors: {
    primary: "#0F1E2E",
    accent: "#E8401C",
    neutral: "#5B6878",
  },
  logos: {},
  font: { family: "Baloo 2", source: "bundled" },
};

// Legacy shared key; use brandStorageKey(tenantId) for tenant isolation (TD-009, closed).
export const BRAND_STORAGE_KEY = "credigit.brand";

/**
 * localStorage key for a tenant's stored brand: `credigit.brand.<tenantId>`. Without a tenant id
 * (undefined, null or blank) it returns `BRAND_STORAGE_KEY`, the shared key used before tenant scoping.
 * Pass the same value to `BrandProvider tenantId` and `brandBootScript(brandStorageKey(tenantId))`.
 */
export function brandStorageKey(tenantId?: string | null): string {
  const id = tenantId?.trim();
  return id ? `${BRAND_STORAGE_KEY}.${id}` : BRAND_STORAGE_KEY;
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

/**
 * Safe font-family names: words of letters/digits separated by single spaces or hyphens ("Baloo 2", "Source Sans 3").
 * Anything else (quotes, semicolons, braces, slashes, colons, URLs) is rejected, so a family can never inject CSS or URLs.
 */
export const FONT_FAMILY_PATTERN = /^[A-Za-z0-9]+(?:[ -][A-Za-z0-9]+)*$/;
/** Maximum font-family length. */
export const FONT_FAMILY_MAX_LENGTH = 64;

/** True when `value` (after trimming) is a safe font-family name. */
export function isSafeFontFamily(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v.length > 0 && v.length <= FONT_FAMILY_MAX_LENGTH && FONT_FAMILY_PATTERN.test(v);
}

/** Find a catalogue entry by family (case-insensitive). */
export function findFontOption(family: string): FontOption | undefined {
  const f = family.trim().toLowerCase();
  return fontOptions.find((o) => o.family.toLowerCase() === f);
}

/**
 * Validate and normalise font input. Returns null when it is unsafe or inconsistent
 * (e.g. `source: "bundled"` for a family the library does not ship). Catalogue families get their canonical casing.
 */
export function normalizeFont(input: unknown): BrandFont | null {
  if (!input || typeof input !== "object") return null;
  const { family, source } = input as { family?: unknown; source?: unknown };
  if (typeof family !== "string") return null;
  const collapsed = family.trim().replace(/\s+/g, " ");
  if (!isSafeFontFamily(collapsed)) return null;
  if (source !== undefined && source !== "bundled" && source !== "google") return null;
  const name = findFontOption(collapsed)?.family ?? collapsed;
  const bundled = (bundledFontFamilies as readonly string[]).includes(name);
  const resolved: FontSource = source ?? (bundled ? "bundled" : "google");
  if (resolved === "bundled" && !bundled) return null;
  return { family: name, source: resolved };
}

/** Google Fonts weight axes to try for a family, best first: catalogue axis or variable range, static weights, default weight. */
export function googleFontAxes(family: string): string[] {
  const preferred = findFontOption(family)?.axis ?? GOOGLE_FONT_AXIS_VARIABLE;
  return [...new Set([preferred, GOOGLE_FONT_AXIS_VARIABLE, GOOGLE_FONT_AXIS_STATIC, ""])];
}

/** Google Fonts css2 stylesheet URL for a validated family (URL-encoded, spaces as `+`). Empty `axis` = default weight only. */
export function googleFontHref(family: string, axis: string = googleFontAxes(family)[0] ?? GOOGLE_FONT_AXIS_VARIABLE): string {
  const fam = encodeURIComponent(family.trim()).replace(/%20/g, "+");
  return `https://fonts.googleapis.com/css2?family=${fam}${axis ? `:${axis}` : ""}&display=swap`;
}

/** Merge partial brand input over a base config, ignoring invalid colours and unsafe fonts. */
export function mergeBrand(base: BrandConfig, input: BrandInput = {}): BrandConfig {
  const colors = { ...base.colors };
  for (const [key, value] of Object.entries(input.colors ?? {}) as Array<[keyof BrandColors, string | undefined]>) {
    if (value && isHexColor(value)) colors[key] = value.trim();
  }
  const logos: BrandLogos = { ...base.logos };
  for (const [key, value] of Object.entries(input.logos ?? {}) as Array<[keyof BrandLogos, string | undefined]>) {
    if (value === undefined) continue;
    if (value === "") delete logos[key];
    else logos[key] = value;
  }
  const font = (input.font ? normalizeFont(input.font) : null) ?? normalizeFont(base.font) ?? defaultBrand.font;
  return { name: input.name?.trim() || base.name, colors, logos, font: { ...font } };
}

/** CSS variables written for a brand. Scales and hover states are derived in CSS. */
export function brandToCssVars(brand: BrandConfig): Record<string, string> {
  return {
    "--cg-brand-primary": brand.colors.primary,
    "--cg-brand-accent": brand.colors.accent,
    "--cg-brand-neutral": brand.colors.neutral,
    "--cg-font-family": `"${(normalizeFont(brand.font) ?? defaultBrand.font).family}"`,
  };
}

/** id of the single managed Google Fonts stylesheet `<link>`. */
export const FONT_LINK_ID = "cg-brand-font";
/** id of the fonts.gstatic.com preconnect `<link>`. */
export const FONT_PRECONNECT_ID = "cg-brand-font-preconnect";

/**
 * Load (or unload) a font's stylesheet. A Google font gets exactly one managed `<link id="cg-brand-font">` in `<head>`
 * (replaced when the family changes) plus a one-off preconnect to fonts.gstatic.com; a bundled font removes the link.
 * If Google rejects a weight axis (e.g. the family has no variable range), the next axis from {@link googleFontAxes} is tried.
 */
export function applyFont(font: BrandFont): void {
  if (typeof document === "undefined") return;
  const safe = normalizeFont(font) ?? defaultBrand.font;
  const existing = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (safe.source !== "google") {
    existing?.remove();
    return;
  }
  if (existing?.dataset.family === safe.family) return; // already loading or loaded (e.g. by brandBootScript)
  const head = document.head ?? document.documentElement;
  if (!document.getElementById(FONT_PRECONNECT_ID)) {
    const pre = document.createElement("link");
    pre.id = FONT_PRECONNECT_ID;
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    head.appendChild(pre);
  }
  const axes = googleFontAxes(safe.family);
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.dataset.family = safe.family;
  let attempt = 0;
  link.onerror = () => {
    attempt += 1;
    if (attempt < axes.length && link.isConnected) link.href = googleFontHref(safe.family, axes[attempt]);
  };
  link.href = googleFontHref(safe.family, axes[0]);
  if (existing) existing.replaceWith(link);
  else head.appendChild(link);
}

/** Write brand variables onto an element (defaults to <html>) and load the brand font. Safe to call on the server: it no-ops. */
export function applyBrand(brand: BrandConfig, target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  for (const [name, value] of Object.entries(brandToCssVars(brand))) {
    el.style.setProperty(name, value);
  }
  applyFont(brand.font ?? defaultBrand.font);
}

/** Remove runtime overrides so the stylesheet defaults (Credigit colours, Baloo 2) apply again. */
export function clearBrand(target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  for (const name of Object.keys(brandToCssVars(defaultBrand))) el.style.removeProperty(name);
  document.getElementById(FONT_LINK_ID)?.remove();
}

export function loadStoredBrand(key = BRAND_STORAGE_KEY): BrandInput | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as BrandInput) : null;
  } catch {
    return null;
  }
}

export function storeBrand(brand: BrandConfig | null, key = BRAND_STORAGE_KEY): void {
  try {
    if (brand) globalThis.localStorage?.setItem(key, JSON.stringify(brand));
    else globalThis.localStorage?.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode, blocked). Theming still works for this session.
  }
}

/**
 * Inline script for <head> that applies a stored brand (colours and font) before first paint
 * (avoids a flash of default colours / Baloo 2). It re-validates everything it reads from storage.
 * Usage in Next.js: <script dangerouslySetInnerHTML={{ __html: brandBootScript() }} />
 */
export function brandBootScript(key = BRAND_STORAGE_KEY): string {
  // Catalogue axes, so the script requests the same stylesheet as applyFont (which then keeps the link instead of reloading).
  const axes: Record<string, string> = {};
  for (const o of fontOptions) if (o.axis) axes[o.family.toLowerCase()] = o.axis;
  const bundled = bundledFontFamilies.map((f) => f.toLowerCase());
  // JSON plus "<" escaped, so an app-supplied key (e.g. a tenant id) can never close the inline <script>.
  const j = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
  return (
    `(function(){try{var b=JSON.parse(localStorage.getItem(${j(key)})||"null");if(!b)return;` +
    `var d=document,s=d.documentElement.style,h=/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i,c=b.colors||{};` +
    `if(h.test(c.primary||""))s.setProperty("--cg-brand-primary",c.primary);` +
    `if(h.test(c.accent||""))s.setProperty("--cg-brand-accent",c.accent);` +
    `if(h.test(c.neutral||""))s.setProperty("--cg-brand-neutral",c.neutral);` +
    // Font: same validation as isSafeFontFamily / normalizeFont.
    `var f=b.font;if(!f||typeof f.family!=="string")return;` +
    `var n=f.family.trim().replace(/\\s+/g," "),k=n.toLowerCase(),r=new RegExp(${j(FONT_FAMILY_PATTERN.source)});` +
    `if(!n||n.length>${FONT_FAMILY_MAX_LENGTH}||!r.test(n))return;` +
    `var A=${j(axes)},B=${j(bundled)},z=B.indexOf(k)>=0,g=f.source==="google"||(f.source!=="bundled"&&!z);` +
    `if(!g&&!z)return;s.setProperty("--cg-font-family",'"'+n+'"');if(!g)return;` +
    `var e=d.head||d.documentElement;` +
    `if(!d.getElementById(${j(FONT_PRECONNECT_ID)})){var p=d.createElement("link");p.id=${j(FONT_PRECONNECT_ID)};p.rel="preconnect";p.href="https://fonts.gstatic.com";p.crossOrigin="anonymous";e.appendChild(p);}` +
    `var X=[A[k]||${j(GOOGLE_FONT_AXIS_VARIABLE)},${j(GOOGLE_FONT_AXIS_VARIABLE)},${j(GOOGLE_FONT_AXIS_STATIC)},""].filter(function(v,i,a){return a.indexOf(v)===i;}),i=0,` +
    `u=function(a){return "https://fonts.googleapis.com/css2?family="+encodeURIComponent(n).replace(/%20/g,"+")+(a?":"+a:"")+"&display=swap";},` +
    `l=d.createElement("link");l.id=${j(FONT_LINK_ID)};l.rel="stylesheet";l.setAttribute("data-family",n);` +
    `l.onerror=function(){i++;if(i<X.length)l.href=u(X[i]);};l.href=u(X[0]);e.appendChild(l);` +
    `}catch(e){}})();`
  );
}
