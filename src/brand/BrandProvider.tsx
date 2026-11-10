"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  applyBrand,
  BRAND_STORAGE_KEY,
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
  /** Merge changes into the active brand and apply them everywhere. */
  updateBrand: (input: BrandInput) => void;
  /** Return to the configured base brand (Credigit defaults unless `initialBrand` was given). */
  resetBrand: () => void;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export type BrandProviderProps = {
  children: ReactNode;
  /** Tenant or app-level overrides applied over the Credigit defaults. */
  initialBrand?: BrandInput;
  /** Persist user changes in localStorage so they survive reloads. Default true. */
  persist?: boolean;
  storageKey?: string;
};

/**
 * Wrap the app once at the root. All components and the <Logo> read from it,
 * so a colour or logo change here restyles the whole product.
 */
export function BrandProvider({ children, initialBrand, persist = true, storageKey = BRAND_STORAGE_KEY }: BrandProviderProps) {
  const base = useMemo(() => mergeBrand(defaultBrand, initialBrand), [initialBrand]);
  const [brand, setBrand] = useState<BrandConfig>(base);
  const [hydrated, setHydrated] = useState(false);

  // Load the stored brand after mount so server and client render the same markup first.
  useEffect(() => {
    const stored = persist ? loadStoredBrand(storageKey) : null;
    if (stored) setBrand(mergeBrand(base, stored));
    setHydrated(true);
  }, [base, persist, storageKey]);

  useEffect(() => {
    applyBrand(brand);
    if (persist && hydrated) storeBrand(brand === base ? null : brand, storageKey);
  }, [brand, base, persist, hydrated, storageKey]);

  const updateBrand = useCallback((input: BrandInput) => setBrand((current) => mergeBrand(current, input)), []);
  const resetBrand = useCallback(() => {
    clearBrand();
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
