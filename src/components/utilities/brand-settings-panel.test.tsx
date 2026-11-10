import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { BrandProvider, defaultBrand, FONT_LINK_ID, fontOptions } from "../../brand";
import { BrandSettingsPanel, contrastRatio, validateLogoFile } from "./brand-settings-panel";

const mocks = vi.hoisted(() => ({ updateBrand: vi.fn(), resetBrand: vi.fn(), useMock: { current: false } }));

vi.mock("../../brand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../brand")>();
  return {
    ...actual,
    useBrand: () =>
      mocks.useMock.current
        ? { brand: actual.defaultBrand, updateBrand: mocks.updateBrand, resetBrand: mocks.resetBrand }
        : actual.useBrand(),
  };
});

function file(bytes: number, type: string, name = "logo") {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("BrandSettingsPanel (mocked brand)", () => {
  beforeEach(() => {
    mocks.useMock.current = true;
    mocks.updateBrand.mockReset();
    mocks.resetBrand.mockReset();
  });
  afterEach(() => {
    mocks.useMock.current = false;
  });

  it("calls updateBrand only for valid hex values", async () => {
    const user = userEvent.setup();
    render(<BrandSettingsPanel />);
    const accent = screen.getByLabelText("Accent");
    await user.clear(accent);
    await user.type(accent, "#12");
    expect(accent).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a hex colour such as #E8401C.")).toBeInTheDocument();
    expect(mocks.updateBrand).not.toHaveBeenCalled();

    await user.type(accent, "3456");
    expect(accent).toHaveAttribute("aria-invalid", "false");
    expect(mocks.updateBrand).toHaveBeenLastCalledWith({ colors: { accent: "#123456" } });
  });

  it("rejects logos over 512 KB and wrong types", () => {
    render(<BrandSettingsPanel />);
    const input = screen.getByLabelText("Upload Horizontal logo");
    fireEvent.change(input, { target: { files: [file(600 * 1024, "image/png")] } });
    expect(screen.getByRole("alert")).toHaveTextContent("limit is 512 KB");
    fireEvent.change(input, { target: { files: [file(10, "image/gif")] } });
    expect(screen.getByRole("alert")).toHaveTextContent("SVG, PNG or WebP");
    expect(mocks.updateBrand).not.toHaveBeenCalled();
  });

  it("reads an accepted logo as a data URL", async () => {
    render(<BrandSettingsPanel />);
    fireEvent.change(screen.getByLabelText("Upload Symbol"), { target: { files: [file(100, "image/png")] } });
    await waitFor(() =>
      expect(mocks.updateBrand).toHaveBeenCalledWith({ logos: { symbol: expect.stringMatching(/^data:image\/png;base64,/) } }),
    );
  });

  it("resets to defaults", async () => {
    const user = userEvent.setup();
    render(<BrandSettingsPanel />);
    const primary = screen.getByLabelText("Primary");
    await user.clear(primary);
    await user.type(primary, "#zz");
    await user.click(screen.getByRole("button", { name: /reset to credigit defaults/i }));
    expect(mocks.resetBrand).toHaveBeenCalledOnce();
    expect(primary).toHaveValue(defaultBrand.colors.primary);
  });

  it("warns when accent contrast against white is below 4.5:1", async () => {
    const user = userEvent.setup();
    render(<BrandSettingsPanel />);
    const accent = screen.getByLabelText("Accent");
    await user.clear(accent);
    await user.type(accent, "#FFAA00");
    expect(screen.getByText(/below the WCAG AA minimum/)).toBeInTheDocument();
    await user.clear(accent);
    await user.type(accent, "#0F1E2E");
    expect(screen.getByText(/Meets WCAG AA/)).toBeInTheDocument();
  });
});

describe("BrandSettingsPanel font (mocked brand)", () => {
  beforeEach(() => {
    mocks.useMock.current = true;
    mocks.updateBrand.mockReset();
  });
  afterEach(() => {
    mocks.useMock.current = false;
  });

  it("lists the font catalogue and calls updateBrand on select", async () => {
    const user = userEvent.setup();
    render(<BrandSettingsPanel />);
    const select = screen.getByLabelText("Application font");
    expect(select).toHaveValue("Baloo 2");
    expect(screen.getAllByRole("option")).toHaveLength(fontOptions.length);
    await user.selectOptions(select, "Inter");
    expect(mocks.updateBrand).toHaveBeenLastCalledWith({ font: { family: "Inter", source: "google" } });
  });

  it("applies a custom Google Font on Enter and rejects unsafe names", async () => {
    const user = userEvent.setup();
    render(<BrandSettingsPanel />);
    const input = screen.getByLabelText("Custom Google Font");
    await user.type(input, "Inter; } body{{");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(/letters, digits, spaces and hyphens/);
    expect(mocks.updateBrand).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "Work Sans");
    await user.tab();
    expect(mocks.updateBrand).toHaveBeenLastCalledWith({ font: { family: "Work Sans", source: "google" } });
  });
});

describe("BrandSettingsPanel (real provider)", () => {
  it("switches the document font and reset restores Baloo 2", async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider persist={false}>
        <BrandSettingsPanel />
      </BrandProvider>,
    );
    await user.selectOptions(screen.getByLabelText("Application font"), "Manrope");
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--cg-font-family")).toBe('"Manrope"'));
    expect(document.getElementById(FONT_LINK_ID)).not.toBeNull();
    await user.click(screen.getByRole("button", { name: /reset to credigit defaults/i }));
    await waitFor(() => expect(screen.getByLabelText("Application font")).toHaveValue("Baloo 2"));
    expect(document.documentElement.style.getPropertyValue("--cg-font-family")).toBe('"Baloo 2"');
    expect(document.getElementById(FONT_LINK_ID)).toBeNull();
  });

  it("applies colours to the document and resets them", async () => {
    const user = userEvent.setup();
    render(
      <BrandProvider persist={false}>
        <BrandSettingsPanel />
      </BrandProvider>,
    );
    const accent = screen.getByLabelText("Accent");
    await user.clear(accent);
    await user.type(accent, "#0055AA");
    await waitFor(() => expect(document.documentElement.style.getPropertyValue("--cg-brand-accent")).toBe("#0055AA"));
    await user.click(screen.getByRole("button", { name: /reset to credigit defaults/i }));
    await waitFor(() => expect(accent).toHaveValue(defaultBrand.colors.accent));
  });
});

describe("helpers", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#FFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });
  it("validates logo files", () => {
    expect(validateLogoFile(file(1000, "image/svg+xml"))).toBeNull();
    expect(validateLogoFile(file(512 * 1024 + 1, "image/webp"))).toMatch(/512 KB/);
  });
});
