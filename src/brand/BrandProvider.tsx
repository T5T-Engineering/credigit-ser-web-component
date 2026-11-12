"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  applyBrand,
  brandStorageKey,
  clearBrand,
  defaultBrand,
  loadStoredBrand,
  mergeBrand,
  storeBrand,
  type BrandConfig,
  type BrandInput,
} from "./brand";

type BrandContextValue = {
  brand: BrandConfig;
  /** Merge changes (colours, logos, name, font) into the active brand and apply them everywhere. */
  updateBrand: (input: BrandInput) => void;
  /** Return to the configured base brand (Credigit defaults unless `initialBrand` was given). */
  resetBrand: () => void;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export type BrandProviderProps = {
  children: ReactNode;
  /** Tenant or app-level overrides applied over the Credigit defaults, e.g. `{ font: { family: "Inter" } }`. */
  initialBrand?: BrandInput;
  /** Persist user changes in localStorage so they survive reloads. Default true. */
  persist?: boolean;
  /**
   * Active tenant. Scopes the stored brand to `credigit.brand.<tenantId>` so tenants sharing a browser
   * never see each other's brand. Omit for the legacy shared key `credigit.brand`.
   */
  tenantId?: string | null;
  /** Explicit localStorage key; wins over `tenantId`. */
  storageKey?: string;
};

/**
 * Wrap the app once at the root. All components and the <Logo> read from it,
 * so a colour, logo or font change here restyles the whole product.
 */
export function BrandProvider({ children, initialBrand, persist = true, tenantId, storageKey: storageKeyProp }: BrandProviderProps) {
  const storageKey = storageKeyProp ?? brandStorageKey(tenantId);
  const base = useMemo(() => mergeBrand(defaultBrand, initialBrand), [initialBrand]);
  const [brand, setBrand] = useState<BrandConfig>(base);
  // Key whose stored brand is currently in state. Null until the first load after mount; a tenant
  // switch changes `storageKey` and must not write the previous tenant's brand under the new key.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // Load the stored brand after mount (so server and client render the same markup first) and again
  // whenever the key changes; a tenant with nothing stored falls back to the base brand.
  useEffect(() => {
    const stored = persist ? loadStoredBrand(storageKey) : null;
    setBrand(stored ? mergeBrand(base, stored) : base);
    setLoadedKey(storageKey);
  }, [base, persist, storageKey]);

  useEffect(() => {
    applyBrand(brand);
    if (persist && loadedKey === storageKey) storeBrand(brand === base ? null : brand, storageKey);
  }, [brand, base, persist, loadedKey, storageKey]);

  const updateBrand = useCallback((input: BrandInput) => setBrand((current) => mergeBrand(current, input)), []);
  const resetBrand = useCallback(() => {
    clearBrand();
    applyBrand(base); // re-apply tenant defaults (incl. font) even when the state is already `base`
    setBrand(base);
    if (persist) storeBrand(null, storageKey);
  }, [base, persist, storageKey]);

  const value = useMemo(() => ({ brand, updateBrand, resetBrand }), [brand, updateBrand, resetBrand]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

/** Read and change the active brand. Works without a provider (returns defaults, updates are no-ops). */
export function useBrand(): BrandContextValue {
  return (
    useContext(BrandContext) ?? {
      brand: defaultBrand,
      updateBrand: () => undefined,
      resetBrand: () => undefined,
    }
  );
}
