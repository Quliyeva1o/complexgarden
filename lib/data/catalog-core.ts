import type { Category, Product } from "@/lib/types";
import { applyProductQuery, sortProducts } from "./query";
import type { CatalogRepository } from "./repository";

/** Kataloqun bir anlıq görüntüsü: mənbədən (fayl və ya Supabase) gələn kateqoriya və məhsullar */
export interface CatalogSnapshot {
  categories: Category[];
  products: Product[];
}

export type CatalogMethods = Pick<
  CatalogRepository,
  | "getCategories"
  | "getCategory"
  | "getProducts"
  | "getProduct"
  | "getProductsBySlugs"
  | "getBestsellers"
  | "getRelatedProducts"
  | "searchProducts"
  | "getBrands"
  | "getProductCounts"
>;

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

function normalize(value: string): string {
  return value.toLocaleLowerCase("az").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Yalnız aktiv kateqoriya və aktiv alt kateqoriyadakı məhsullar satışdadır */
function visibleProducts({ categories, products }: CatalogSnapshot): Product[] {
  const active = new Map(categories.filter((c) => c.active).map((c) => [c.slug, c]));
  return products.filter((p) => {
    const category = active.get(p.categorySlug);
    if (!category) return false;
    if (!p.subcategorySlug) return true;
    const sub = category.subcategories.find((s) => s.slug === p.subcategorySlug);
    return sub?.active !== false;
  });
}

/** Kateqoriya/məhsul məntiqi — hər iki məlumat mənbəyi üçün eyni */
export function createCatalogMethods(load: () => Promise<CatalogSnapshot>): CatalogMethods {
  const visible = async () => visibleProducts(await load());

  return {
    async getCategories(options) {
      const { categories } = await load();
      const list = options?.includeInactive ? categories : categories.filter((c) => c.active);
      return [...list].sort(byOrder);
    },

    async getCategory(slug) {
      const { categories } = await load();
      return categories.find((c) => c.slug === slug && c.active);
    },

    async getProducts(query = {}) {
      const snapshot = await load();
      const category = query.categorySlug
        ? snapshot.categories.find((c) => c.slug === query.categorySlug)
        : undefined;
      return applyProductQuery(visibleProducts(snapshot), query, category);
    },

    async getProduct(slug) {
      return (await visible()).find((p) => p.slug === slug);
    },

    async getProductsBySlugs(slugs) {
      const list = await visible();
      return slugs
        .map((slug) => list.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p));
    },

    async getBestsellers(limit = 8) {
      const list = (await visible()).filter((p) => p.badges?.includes("bestseller"));
      return sortProducts(list, "popular").slice(0, limit);
    },

    async getRelatedProducts(product, limit = 4) {
      const list = (await visible()).filter(
        (p) => p.slug !== product.slug && p.categorySlug === product.categorySlug,
      );
      // Eyni alt kateqoriya əvvəl gəlsin
      const ranked = sortProducts(list, "popular").sort(
        (a, b) =>
          Number(b.subcategorySlug === product.subcategorySlug) -
          Number(a.subcategorySlug === product.subcategorySlug),
      );
      return ranked.slice(0, limit);
    },

    async searchProducts(term, locale, limit = 8) {
      const needle = normalize(term.trim());
      if (!needle) return [];
      const hits = (await visible()).filter((p) => {
        const haystack = normalize(`${p.name[locale]} ${p.name.az} ${p.brand ?? ""}`);
        return haystack.includes(needle);
      });
      return sortProducts(hits, "popular").slice(0, limit);
    },

    async getBrands(categorySlug) {
      const brands = (await visible())
        .filter((p) => !categorySlug || p.categorySlug === categorySlug)
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b));
      return [...new Set(brands)].sort();
    },

    async getProductCounts() {
      const counts: Record<string, number> = {};
      for (const p of await visible()) {
        counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
      }
      return counts;
    },
  };
}
