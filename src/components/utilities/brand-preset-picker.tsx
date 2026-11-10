"use client";

import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { defaultBrand, isHexColor, useBrand, type BrandConfig, type BrandInput } from "../../brand";
import { cx } from "../../utils/cx";

/** A named brand theme the user can apply in one click (colours, font, name, logos — any subset of `BrandInput`). */
export type BrandPreset = {
  id: string;
  name: string;
  description?: string;
  brand: BrandInput;
};

/** Props for {@link BrandPresetPicker}. */
export type BrandPresetPickerProps = Omit<ComponentProps<"div">, "onSelect"> & {
  presets: BrandPreset[];
  /** Accessible group name. Default "Brand presets". */
  label?: string;
  /** Called after a preset has been applied through `updateBrand`. */
  onApply?: (preset: BrandPreset) => void;
  /** Optional heading content rendered above the cards. */
  heading?: ReactNode;
};

const fontStack = (family: string) => `"${family}", "Baloo 2", ui-sans-serif, sans-serif`;

/** True when every colour and the font a preset sets match the current brand (case-insensitive hex). */
export function isPresetActive(brand: BrandConfig, preset: BrandPreset): boolean {
  const { colors, font, name } = preset.brand;
  const colorEntries = Object.entries(colors ?? {}) as [keyof BrandConfig["colors"], string | undefined][];
  if (colorEntries.length === 0 && !font) return false;
  const colorsMatch = colorEntries.every(([key, value]) => !value || brand.colors[key]?.toUpperCase() === value.trim().toUpperCase());
  const fontMatches = !font || brand.font.family === font.family;
  const nameMatches = !name || brand.name === name;
  return colorsMatch && fontMatches && nameMatches;
}

/**
 * Selectable brand preset cards (colour swatches + font preview). Clicking a card applies the preset with
 * `useBrand().updateBrand(preset.brand)`, so apps never need to show hex values themselves.
 */
export function BrandPresetPicker({ presets, label = "Brand presets", onApply, heading, className, ...props }: BrandPresetPickerProps) {
  const { brand, updateBrand } = useBrand();
  if (presets.length === 0) return null;

  return (
    <div className={cx("flex min-w-0 flex-col gap-3", className)} {...props}>
      {heading}
      <div role="group" aria-label={label} className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr))]">
        {presets.map((preset) => {
          const active = isPresetActive(brand, preset);
          const colors = { ...defaultBrand.colors, ...preset.brand.colors };
          const family = preset.brand.font?.family ?? brand.font.family;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              data-preset={preset.id}
              onClick={() => {
                updateBrand(preset.brand);
                onApply?.(preset);
              }}
              className={cx(
                "squircle flex min-w-0 flex-col gap-3 rounded-3xl p-4 text-left transition-[background-color,box-shadow,transform] duration-150 ease-bolt active:scale-[0.99]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                active ? "bg-accent-50 ring-2 ring-accent-500" : "bg-surface-sunken hover:bg-fg/10",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex -space-x-1.5" aria-hidden="true">
                  {(["primary", "accent", "neutral"] as const).map((key) => {
                    const value = colors[key];
                    return (
                      <span
                        key={key}
                        data-swatch={key}
                        className="size-6 rounded-full ring-2 ring-surface"
                        // Preset colours are tenant data, shown as swatches only after validation.
                        style={{ backgroundColor: isHexColor(value) ? value : undefined }}
                      />
                    );
                  })}
                </span>
                {active && (
                  <span className="grid size-6 place-items-center rounded-full bg-action text-on-action" aria-hidden="true">
                    <Check className="size-3.5" />
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-display text-base font-bold text-fg">{preset.name}</span>
                {preset.description && <span className="text-sm text-fg-muted">{preset.description}</span>}
              </span>
              <span className="flex items-baseline gap-2 truncate text-sm text-fg-muted">
                <span aria-hidden="true" className="text-lg font-bold text-fg" style={{ fontFamily: fontStack(family) }}>
                  Aa
                </span>
                <span className="truncate" style={{ fontFamily: fontStack(family) }}>
                  {family}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
