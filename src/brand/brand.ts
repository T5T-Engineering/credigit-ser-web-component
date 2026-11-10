/**
 * Runtime brand engine.
 *
 * The whole design system reads colours from CSS variables (`--cg-*`).
 * Changing a brand value here rewrites those variables on the root element,
 * so every component in every consuming app updates at once.
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

export type BrandConfig = {
  name: string;
  colors: BrandColors;
  logos: BrandLogos;
};

export type BrandInput = {
  name?: string;
  colors?: Partial<BrandColors>;
  logos?: Partial<BrandLogos>;
};

/** Credigit brand kit defaults. */
export const defaultBrand: BrandConfig = {
  name: "Credigit",
  colors: {
    primary: "#0F1E2E",
    accent: "#E8401C",
    neutral: "#5B6878",
  },
  logos: {},
};

export const BRAND_STORAGE_KEY = "credigit.brand";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

/** Merge partial brand input over a base config, ignoring invalid colours. */
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
  return { name: input.name?.trim() || base.name, colors, logos };
}

/** CSS variables written for a brand. Scales and hover states are derived in CSS. */
export function brandToCssVars(brand: BrandConfig): Record<string, string> {
  return {
    "--cg-brand-primary": brand.colors.primary,
    "--cg-brand-accent": brand.colors.accent,
    "--cg-brand-neutral": brand.colors.neutral,
  };
}

/** Write brand variables onto an element (defaults to <html>). Safe to call on the server: it no-ops. */
export function applyBrand(brand: BrandConfig, target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  for (const [name, value] of Object.entries(brandToCssVars(brand))) {
    el.style.setProperty(name, value);
  }
}

/** Remove runtime overrides so the stylesheet defaults apply again. */
export function clearBrand(target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  for (const name of Object.keys(brandToCssVars(defaultBrand))) el.style.removeProperty(name);
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
 * Inline script for <head> that applies a stored brand before first paint (avoids a flash of default colours).
 * Usage in Next.js: <script dangerouslySetInnerHTML={{ __html: brandBootScript() }} />
 */
export function brandBootScript(key = BRAND_STORAGE_KEY): string {
  return `(function(){try{var b=JSON.parse(localStorage.getItem(${JSON.stringify(key)})||"null");if(!b||!b.colors)return;var s=document.documentElement.style,h=/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;if(h.test(b.colors.primary||""))s.setProperty("--cg-brand-primary",b.colors.primary);if(h.test(b.colors.accent||""))s.setProperty("--cg-brand-accent",b.colors.accent);if(h.test(b.colors.neutral||""))s.setProperty("--cg-brand-neutral",b.colors.neutral);}catch(e){}})();`;
}
