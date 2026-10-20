"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import type { CartProduct } from "./pricing";

/**
 * Slug siyahısı üzrə aktual məhsul məlumatı (/api/products). Səbət və seçilmişlər istifadə edir.
 * `enabled` false olanda (hidratasiyadan əvvəl) sorğu göndərilmir.
 */
export function useProductsBySlugs(slugList: string[], enabled: boolean) {
  const locale = useLocale();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const slugs = [...new Set(slugList)].sort().join(",");
  const key = `${locale}:${slugs}`;

  useEffect(() => {
    if (!enabled || !slugs) return;
    const controller = new AbortController();
    fetch(`/api/products?slugs=${encodeURIComponent(slugs)}&locale=${locale}`, { signal: controller.signal })
      .then((r) => r.json() as Promise<CartProduct[]>)
      .then((data) => {
        setProducts(data);
        setLoadedKey(key);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [enabled, slugs, locale, key]);

  // Silmə zamanı skelet yanıb-sönməsin: lazım olan məhsullar artıq yüklənibsə gözləmə
  const allPresent = Boolean(slugs) && slugs.split(",").every((s) => products.some((p) => p.slug === s));
  const ready = enabled && (!slugs || loadedKey === key || allPresent);
  return { products, ready, empty: enabled && !slugs };
}
