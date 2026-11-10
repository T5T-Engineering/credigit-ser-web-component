import { applyBrand, defaultBrand, isHexColor, mergeBrand } from "./brand";

describe("brand engine", () => {
  it("ignores invalid colours and keeps defaults", () => {
    const b = mergeBrand(defaultBrand, { colors: { accent: "red; background:url(x)" } });
    expect(b.colors.accent).toBe(defaultBrand.colors.accent);
  });

  it("merges valid colours and logos, empty string removes a logo", () => {
    const withLogo = mergeBrand(defaultBrand, { colors: { accent: "#123456" }, logos: { horizontal: "/l.svg" } });
    expect(withLogo.colors.accent).toBe("#123456");
    expect(withLogo.logos.horizontal).toBe("/l.svg");
    expect(mergeBrand(withLogo, { logos: { horizontal: "" } }).logos.horizontal).toBeUndefined();
  });

  it("writes brand variables onto the root element", () => {
    applyBrand(mergeBrand(defaultBrand, { colors: { primary: "#000000" } }));
    expect(document.documentElement.style.getPropertyValue("--cg-brand-primary")).toBe("#000000");
  });

  it("validates hex colours", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor("#E8401C")).toBe(true);
    expect(isHexColor("orange")).toBe(false);
  });
});
