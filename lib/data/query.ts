import type { Category, FilterDefinition, FilterField, Product } from "@/lib/types";

/** Kataloq sorğusu — kateqoriya səhifəsində URL query-dən qurulur */
export interface ProductQuery {
  categorySlug?: string;
  subcategorySlug?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  inStock?: boolean;
  subscription?: boolean;
  /** Kateqoriyaya xas filtrlər: { [filter.key]: seçilmiş dəyərlər } — range üçün bucket indeksi */
  facets?: Record<string, string[]>;
  sort?: ProductSort;
}

export const productSorts = ["popular", "new", "price-asc", "price-desc"] as const;
export type ProductSort = (typeof productSorts)[number];

/** `attributes.purpose` / `plantPassport.sun` kimi yoldan dəyəri oxuyur */
export function getFieldValue(product: Product, field: FilterField): unknown {
  const [root, key] = field.split(".") as ["attributes" | "plantPassport", string];
  const source = product[root] as Record<string, unknown> | undefined;
  return source?.[key];
}

function matchesFilter(product: Product, def: FilterDefinition, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const value = getFieldValue(product, def.field);

  switch (def.type) {
    case "options":
      return value !== undefined && selected.includes(String(value));
    case "boolean":
      return value === true;
    case "range": {
      if (typeof value !== "number") return false;
      return selected.some((index) => {
        const bucket = def.buckets[Number(index)];
        if (!bucket) return false;
        const aboveMin = bucket.min === undefined || value >= bucket.min;
        const belowMax = bucket.max === undefined || value < bucket.max;
        return aboveMin && belowMax;
      });
    }
  }
}

export function sortProducts(list: Product[], sort: ProductSort = "popular"): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "new":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
    default:
      return sorted.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }
}

/** Məhsul siyahısına sorğunu tətbiq edir (təmiz funksiya — istənilən məlumat mənbəyi ilə işləyir) */
export function applyProductQuery(list: Product[], query: ProductQuery, category?: Category): Product[] {
  const filtered = list.filter((p) => {
    if (query.categorySlug && p.categorySlug !== query.categorySlug) return false;
    if (query.subcategorySlug && p.subcategorySlug !== query.subcategorySlug) return false;
    if (query.priceMin !== undefined && p.price < query.priceMin) return false;
    if (query.priceMax !== undefined && p.price > query.priceMax) return false;
    if (query.brands?.length && (!p.brand || !query.brands.includes(p.brand))) return false;
    if (query.inStock && !p.inStock) return false;
    if (query.subscription && !p.subscriptionEligible) return false;

    if (category && query.facets) {
      for (const def of category.filters) {
        if (!matchesFilter(p, def, query.facets[def.key] ?? [])) return false;
      }
    }
    return true;
  });

  return sortProducts(filtered, query.sort);
}

/** Filtr panelindəki sayğaclar: hər seçim üçün "seçilsə neçə məhsul olar" */
export interface FacetCounts {
  subcategories: Record<string, number>;
  brands: Record<string, number>;
  inStock: number;
  subscription: number;
  facets: Record<string, Record<string, number>>;
  /** Kateqoriyadakı qiymət aralığı (filtrsiz) — input placeholder-ləri üçün */
  priceRange: { min: number; max: number };
}

/**
 * Hər ölçü üçün sayğac həmin ölçünün öz seçimi çıxılmaqla, qalan aktiv filtrlərlə hesablanır
 * (çoxseçimli filtrlərdə standart davranış — seçim etdikcə digər seçimlər "0" olmur).
 */
export function computeFacetCounts(list: Product[], query: ProductQuery, category?: Category): FacetCounts {
  const without = (patch: Partial<ProductQuery>) => applyProductQuery(list, { ...query, ...patch, sort: undefined }, category);
  const tally = (products: Product[], key: (p: Product) => string | undefined) => {
    const out: Record<string, number> = {};
    for (const p of products) {
      const k = key(p);
      if (k) out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  };

  const facets: FacetCounts["facets"] = {};
  for (const def of category?.filters ?? []) {
    const base = without({ facets: { ...query.facets, [def.key]: [] } });
    const counts: Record<string, number> = {};
    if (def.type === "options") {
      for (const o of def.options) counts[o.value] = base.filter((p) => matchesFilter(p, def, [o.value])).length;
    } else if (def.type === "range") {
      def.buckets.forEach((_, i) => {
        counts[String(i)] = base.filter((p) => matchesFilter(p, def, [String(i)])).length;
      });
    } else {
      counts.true = base.filter((p) => matchesFilter(p, def, ["true"])).length;
    }
    facets[def.key] = counts;
  }

  const prices = list.filter((p) => !query.categorySlug || p.categorySlug === query.categorySlug).map((p) => p.price);

  return {
    subcategories: tally(without({ subcategorySlug: undefined }), (p) => p.subcategorySlug),
    brands: tally(without({ brands: [] }), (p) => p.brand),
    inStock: without({ inStock: undefined }).filter((p) => p.inStock).length,
    subscription: without({ subscription: undefined }).filter((p) => p.subscriptionEligible).length,
    facets,
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
}
