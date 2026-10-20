"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Server render və ilk hidratasiyada false, sonra true.
 * localStorage-dan gələn dəyərləri (səbət sayı, ürək) hidratasiya uyğunsuzluğu olmadan göstərmək üçün.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
