import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { brandBootScript, brandStorageKey, BRAND_STORAGE_KEY, clearBrand } from "./brand";
import { BrandProvider, useBrand } from "./BrandProvider";

function Probe() {
  const { brand, updateBrand } = useBrand();
  return (
    <div>
      <span data-testid="accent">{brand.colors.accent}</span>
      <button type="button" onClick={() => updateBrand({ colors: { accent: "#123456" } })}>
        change
      </button>
    </div>
  );
}

afterEach(() => {
  clearBrand();
  localStorage.clear();
});

describe("brandStorageKey", () => {
  it("keeps the legacy key without a tenant", () => {
    expect(brandStorageKey()).toBe(BRAND_STORAGE_KEY);
    expect(brandStorageKey(null)).toBe("credigit.brand");
    expect(brandStorageKey("  ")).toBe("credigit.brand");
  });

  it("scopes the key per tenant", () => {
    expect(brandStorageKey("tenant-a")).toBe("credigit.brand.tenant-a");
    expect(brandStorageKey(" tenant-b ")).toBe("credigit.brand.tenant-b");
  });
});

describe("brandBootScript", () => {
  it("escapes '<' so a key can never close the inline script", () => {
    const script = brandBootScript(brandStorageKey("</script><script>alert(1)"));
    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>");
  });
});

describe("BrandProvider persistence", () => {
  it("stores under the legacy key by default (backward compatible)", () => {
    render(
      <BrandProvider>
        <Probe />
      </BrandProvider>,
    );
    act(() => screen.getByRole("button", { name: "change" }).click());
    expect(JSON.parse(localStorage.getItem("credigit.brand") ?? "null").colors.accent).toBe("#123456");
  });

  it("stores and loads under the tenant-scoped key", () => {
    localStorage.setItem("credigit.brand.tenant-a", JSON.stringify({ colors: { accent: "#abcdef" } }));
    localStorage.setItem("credigit.brand", JSON.stringify({ colors: { accent: "#000000" } }));
    render(
      <BrandProvider tenantId="tenant-a">
        <Probe />
      </BrandProvider>,
    );
    expect(screen.getByTestId("accent")).toHaveTextContent("#abcdef");
    act(() => screen.getByRole("button", { name: "change" }).click());
    expect(JSON.parse(localStorage.getItem("credigit.brand.tenant-a") ?? "null").colors.accent).toBe("#123456");
    expect(JSON.parse(localStorage.getItem("credigit.brand") ?? "null").colors.accent).toBe("#000000");
  });

  it("does not carry one tenant's brand into another on switch", () => {
    localStorage.setItem("credigit.brand.tenant-a", JSON.stringify({ colors: { accent: "#abcdef" } }));
    const { rerender } = render(
      <BrandProvider tenantId="tenant-a">
        <Probe />
      </BrandProvider>,
    );
    expect(screen.getByTestId("accent")).toHaveTextContent("#abcdef");
    rerender(
      <BrandProvider tenantId="tenant-b">
        <Probe />
      </BrandProvider>,
    );
    expect(screen.getByTestId("accent")).toHaveTextContent("#E8401C");
    expect(localStorage.getItem("credigit.brand.tenant-b")).toBeNull();
    expect(JSON.parse(localStorage.getItem("credigit.brand.tenant-a") ?? "null").colors.accent).toBe("#abcdef");
  });

  it("lets an explicit storageKey win over tenantId", () => {
    render(
      <BrandProvider tenantId="tenant-a" storageKey="custom.key">
        <Probe />
      </BrandProvider>,
    );
    act(() => screen.getByRole("button", { name: "change" }).click());
    expect(localStorage.getItem("custom.key")).not.toBeNull();
    expect(localStorage.getItem("credigit.brand.tenant-a")).toBeNull();
  });
});
