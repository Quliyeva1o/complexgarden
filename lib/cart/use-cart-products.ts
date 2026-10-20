"use client";

import { useCart } from "@/lib/store/cart";
import { useHydrated } from "@/lib/store/use-hydrated";
import { priceCart, type CartTotals } from "./pricing";
import { useProductsBySlugs } from "./use-products";

/**
 * Səbətdəki məhsulların aktual məlumatını gətirir və hesablayır.
 * `ready` false olanda (hidratasiya və ya yükləmə) skelet göstərilməlidir.
 */
export function useCartProducts(): { totals: CartTotals; ready: boolean } {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const { products, ready, empty } = useProductsBySlugs(
    lines.map((l) => l.slug),
    hydrated,
  );
  return { totals: priceCart(ready && !empty ? lines : [], products), ready };
}
