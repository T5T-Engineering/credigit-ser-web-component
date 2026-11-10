import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrandProvider, clearBrand, defaultBrand } from "../../brand";
import { BrandPresetPicker, isPresetActive, type BrandPreset } from "./brand-preset-picker";
import { BrandSettingsPanel } from "./brand-settings-panel";

const presets: BrandPreset[] = [
  { id: "credigit", name: "Credigit", description: "Default", brand: { colors: { ...defaultBrand.colors }, font: { family: "Baloo 2" } } },
  { id: "forest", name: "Forest bank", brand: { colors: { primary: "#0B3D2E", accent: "#1F7A4D", neutral: "#4A5A52" }, font: { family: "Inter" } } },
];

afterEach(() => clearBrand());

describe("BrandPresetPicker", () => {
  it("renders preset cards with swatches and font names, and applies a preset", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <BrandProvider persist={false}>
        <BrandPresetPicker presets={presets} onApply={onApply} />
      </BrandProvider>,
    );
    const group = screen.getByRole("group", { name: "Brand presets" });
    expect(group.querySelectorAll("[data-swatch]")).toHaveLength(6);
    const credigit = screen.getByRole("button", { name: /Credigit/ });
    const forest = screen.getByRole("button", { name: /Forest bank/ });
    expect(credigit).toHaveAttribute("aria-pressed", "true");
    expect(forest).toHaveAttribute("aria-pressed", "false");
    expect(forest).toHaveTextContent("Inter");

    await user.click(forest);
    expect(onApply).toHaveBeenCalledWith(presets[1]);
    expect(forest).toHaveAttribute("aria-pressed", "true");
    expect(credigit).toHaveAttribute("aria-pressed", "false");
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--cg-font-family")).toContain("Inter"));
  });

  it("renders nothing without presets", () => {
    const { container } = render(
      <BrandProvider persist={false}>
        <BrandPresetPicker presets={[]} />
      </BrandProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("isPresetActive compares colours case-insensitively and the font family", () => {
    const brand = { ...defaultBrand, colors: { ...defaultBrand.colors, accent: defaultBrand.colors.accent.toLowerCase() } };
    expect(isPresetActive(brand, presets[0]!)).toBe(true);
    expect(isPresetActive(brand, presets[1]!)).toBe(false);
    expect(isPresetActive(brand, { id: "x", name: "Empty", brand: {} })).toBe(false);
  });
});

describe("BrandSettingsPanel presets", () => {
  it("shows presets only when given", () => {
    const { rerender } = render(
      <BrandProvider persist={false}>
        <BrandSettingsPanel />
      </BrandProvider>,
    );
    expect(screen.queryByRole("group", { name: "Brand presets" })).not.toBeInTheDocument();
    rerender(
      <BrandProvider persist={false}>
        <BrandSettingsPanel presets={presets} />
      </BrandProvider>,
    );
    expect(screen.getByRole("group", { name: "Brand presets" })).toBeInTheDocument();
    expect(screen.getByText("Presets")).toBeInTheDocument();
  });
});
