import {
  applyBrand,
  brandBootScript,
  BRAND_STORAGE_KEY,
  clearBrand,
  defaultBrand,
  FONT_LINK_ID,
  FONT_PRECONNECT_ID,
  fontOptions,
  googleFontAxes,
  googleFontHref,
  isSafeFontFamily,
  loadStoredBrand,
  mergeBrand,
  normalizeFont,
  storeBrand,
} from "./brand";

const root = () => document.documentElement;
const fontLinks = () => document.head.querySelectorAll(`link[rel="stylesheet"][href^="https://fonts.googleapis.com"]`);

function resetDom() {
  clearBrand();
  document.getElementById(FONT_PRECONNECT_ID)?.remove();
  root().removeAttribute("style");
  localStorage.clear();
}

describe("font validation", () => {
  it("accepts well-formed family names", () => {
    for (const f of ["Baloo 2", "Inter", "IBM Plex Sans", "Source Sans 3", "M PLUS 1p", "Noto-Sans"]) {
      expect(isSafeFontFamily(f)).toBe(true);
    }
  });

  it("rejects CSS injection, URLs and odd characters", () => {
    for (const f of [
      '"; } body{background:red}',
      "Inter; color:red",
      "Inter', x",
      "https://evil.example/font.css",
      "url(x)",
      "Inter</style>",
      "Inter\\22",
      "",
      "   ",
      "-Inter",
      "a".repeat(65),
    ]) {
      expect(isSafeFontFamily(f)).toBe(false);
    }
    expect(isSafeFontFamily(42)).toBe(false);
  });

  it("normalises source and casing; rejects bundled for non-bundled families", () => {
    expect(normalizeFont({ family: "inter" })).toEqual({ family: "Inter", source: "google" });
    expect(normalizeFont({ family: "Baloo 2" })).toEqual({ family: "Baloo 2", source: "bundled" });
    expect(normalizeFont({ family: "  Work   Sans " })).toEqual({ family: "Work Sans", source: "google" });
    expect(normalizeFont({ family: "Inter", source: "bundled" })).toBeNull();
    expect(normalizeFont({ family: "Inter", source: "cdn" })).toBeNull();
    expect(normalizeFont({ family: '"; } body{' })).toBeNull();
  });

  it("mergeBrand ignores unsafe fonts and keeps the base font", () => {
    const b = mergeBrand(defaultBrand, { font: { family: "x; } body{color:red" } });
    expect(b.font).toEqual(defaultBrand.font);
    expect(mergeBrand(defaultBrand, { font: { family: "Manrope" } }).font).toEqual({ family: "Manrope", source: "google" });
  });

  it("catalogue: Baloo 2 bundled default plus Google fonts, all safe", () => {
    expect(fontOptions[0]).toMatchObject({ family: "Baloo 2", source: "bundled" });
    expect(fontOptions.filter((o) => o.source === "google").length).toBeGreaterThanOrEqual(10);
    for (const o of fontOptions) expect(isSafeFontFamily(o.family)).toBe(true);
  });

  it("builds encoded Google Fonts URLs with a static fallback axis", () => {
    expect(googleFontHref("IBM Plex Sans", "wght@400..800")).toBe(
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400..800&display=swap",
    );
    expect(googleFontAxes("Work Sans")).toEqual(["wght@400..800", "wght@400;500;600;700;800", ""]);
    expect(googleFontAxes("Lato")[0]).toBe("wght@400;700;900");
  });
});

describe("applyBrand font handling", () => {
  beforeEach(resetDom);
  afterAll(resetDom);

  it("writes --cg-font-family and manages exactly one Google Fonts link", () => {
    applyBrand(mergeBrand(defaultBrand, { font: { family: "Inter" } }));
    expect(root().style.getPropertyValue("--cg-font-family")).toBe('"Inter"');
    expect(fontLinks()).toHaveLength(1);
    const link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement;
    expect(link.href).toBe("https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap");
    const pre = document.getElementById(FONT_PRECONNECT_ID) as HTMLLinkElement;
    expect(pre.rel).toBe("preconnect");
    expect(pre.href).toMatch(/^https:\/\/fonts\.gstatic\.com\/?$/);

    applyBrand(mergeBrand(defaultBrand, { font: { family: "DM Sans" } }));
    expect(fontLinks()).toHaveLength(1);
    expect((document.getElementById(FONT_LINK_ID) as HTMLLinkElement).href).toContain("family=DM+Sans:");
    expect(document.querySelectorAll(`#${FONT_PRECONNECT_ID}`)).toHaveLength(1);
  });

  it("does not reload the stylesheet when the font is unchanged", () => {
    const brand = mergeBrand(defaultBrand, { font: { family: "Inter" } });
    applyBrand(brand);
    const first = document.getElementById(FONT_LINK_ID);
    applyBrand({ ...brand, colors: { ...brand.colors, accent: "#123456" } });
    expect(document.getElementById(FONT_LINK_ID)).toBe(first);
  });

  it("falls back to the next weight axis when Google rejects the first", () => {
    applyBrand(mergeBrand(defaultBrand, { font: { family: "Work Sans" } }));
    const link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement;
    link.dispatchEvent(new Event("error"));
    expect(link.href).toContain("family=Work+Sans:wght@400;500;600;700;800");
    link.dispatchEvent(new Event("error"));
    expect(link.href).toBe("https://fonts.googleapis.com/css2?family=Work+Sans&display=swap");
  });

  it("switching back to the bundled font removes the link", () => {
    applyBrand(mergeBrand(defaultBrand, { font: { family: "Roboto" } }));
    expect(fontLinks()).toHaveLength(1);
    applyBrand(mergeBrand(defaultBrand, { font: { family: "Baloo 2" } }));
    expect(fontLinks()).toHaveLength(0);
    expect(root().style.getPropertyValue("--cg-font-family")).toBe('"Baloo 2"');
  });

  it("clearBrand restores Baloo 2 (removes the override and the link)", () => {
    applyBrand(mergeBrand(defaultBrand, { font: { family: "Poppins" } }));
    clearBrand();
    expect(root().style.getPropertyValue("--cg-font-family")).toBe("");
    expect(fontLinks()).toHaveLength(0);
  });
});

describe("persistence and boot script", () => {
  beforeEach(resetDom);
  afterAll(resetDom);

  it("round-trips the font through storage and merge", () => {
    const brand = mergeBrand(defaultBrand, { font: { family: "Open Sans" } });
    storeBrand(brand);
    const restored = mergeBrand(defaultBrand, loadStoredBrand() ?? {});
    expect(restored.font).toEqual({ family: "Open Sans", source: "google" });
    // Old stored brands without a font keep the default.
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ colors: { accent: "#123456" } }));
    expect(mergeBrand(defaultBrand, loadStoredBrand() ?? {}).font).toEqual(defaultBrand.font);
  });

  it("contains the font logic", () => {
    const script = brandBootScript();
    expect(script).toContain("--cg-font-family");
    expect(script).toContain("fonts.googleapis.com/css2");
    expect(script).toContain("fonts.gstatic.com");
    expect(script).toContain(FONT_LINK_ID);
  });

  it("applies a stored Google font before first paint, with the same URL applyBrand uses", () => {
    storeBrand(mergeBrand(defaultBrand, { font: { family: "IBM Plex Sans" }, colors: { accent: "#0055AA" } }));
    new Function(brandBootScript())();
    expect(root().style.getPropertyValue("--cg-font-family")).toBe('"IBM Plex Sans"');
    expect(root().style.getPropertyValue("--cg-brand-accent")).toBe("#0055AA");
    const link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement;
    expect(link.href).toBe(googleFontHref("IBM Plex Sans"));
    // applyBrand keeps the boot script's link instead of reloading it.
    applyBrand(mergeBrand(defaultBrand, { font: { family: "IBM Plex Sans" } }));
    expect(document.getElementById(FONT_LINK_ID)).toBe(link);
    expect(fontLinks()).toHaveLength(1);
  });

  it("ignores unsafe stored fonts in the boot script", () => {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ font: { family: '"; } body{color:red', source: "google" } }));
    new Function(brandBootScript())();
    expect(root().style.getPropertyValue("--cg-font-family")).toBe("");
    expect(fontLinks()).toHaveLength(0);
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ font: { family: "Inter", source: "bundled" } }));
    new Function(brandBootScript())();
    expect(root().style.getPropertyValue("--cg-font-family")).toBe("");
  });
});
