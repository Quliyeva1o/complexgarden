import { productSorts, type ProductQuery, type ProductSort } from "./query";

/**
 * Kataloq filtrlərinin URL formatı (paylaşıla bilən link):
 *   ?alt=hovuz-dermanlari&min=10&max=200&brend=AquaClear,Hydroline&stok=1&abune=1
 *    &f_purpose=chlorine,ph&f_height=0,1&sirala=price-asc
 * `f_<açar>` — kateqoriyaya xas filtrlər (range üçün bucket indeksi).
 * Server (filtrləmə) və client (filtr paneli) eyni funksiyalardan istifadə edir.
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const URL_KEYS = {
  sub: "alt",
  min: "min",
  max: "max",
  brands: "brend",
  inStock: "stok",
  subscription: "abune",
  sort: "sirala",
  query: "q",
  facetPrefix: "f_",
} as const;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (first(v) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return Number.isFinite(n) && first(v) !== "" && first(v) !== undefined ? n : undefined;
};

/** URL → ProductQuery (categorySlug ayrıca verilir) */
export function parseCatalogParams(params: SearchParamsRecord): ProductQuery {
  const facets: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith(URL_KEYS.facetPrefix)) {
      const values = list(value);
      if (values.length) facets[key.slice(URL_KEYS.facetPrefix.length)] = values;
    }
  }
  const sort = first(params[URL_KEYS.sort]);

  return {
    subcategorySlug: first(params[URL_KEYS.sub]) || undefined,
    priceMin: num(params[URL_KEYS.min]),
    priceMax: num(params[URL_KEYS.max]),
    brands: list(params[URL_KEYS.brands]),
    inStock: first(params[URL_KEYS.inStock]) === "1" || undefined,
    subscription: first(params[URL_KEYS.subscription]) === "1" || undefined,
    facets,
    sort: productSorts.includes(sort as ProductSort) ? (sort as ProductSort) : undefined,
  };
}

/** ProductQuery → URLSearchParams (boş dəyərlər yazılmır, sıra sabitdir) */
export function serializeCatalogQuery(query: ProductQuery, extra?: { q?: string }): URLSearchParams {
  const p = new URLSearchParams();
  if (extra?.q) p.set(URL_KEYS.query, extra.q);
  if (query.subcategorySlug) p.set(URL_KEYS.sub, query.subcategorySlug);
  if (query.priceMin !== undefined) p.set(URL_KEYS.min, String(query.priceMin));
  if (query.priceMax !== undefined) p.set(URL_KEYS.max, String(query.priceMax));
  if (query.brands?.length) p.set(URL_KEYS.brands, query.brands.join(","));
  if (query.inStock) p.set(URL_KEYS.inStock, "1");
  if (query.subscription) p.set(URL_KEYS.subscription, "1");
  for (const [key, values] of Object.entries(query.facets ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    if (values.length) p.set(URL_KEYS.facetPrefix + key, values.join(","));
  }
  if (query.sort && query.sort !== "popular") p.set(URL_KEYS.sort, query.sort);
  return p;
}

/** Aktiv filtr sayı (sıralama və alt kateqoriya daxil deyil) — mobil "Filtrlər (3)" düyməsi üçün */
export function countActiveFilters(query: ProductQuery): number {
  return (
    (query.priceMin !== undefined || query.priceMax !== undefined ? 1 : 0) +
    (query.brands?.length ?? 0) +
    (query.inStock ? 1 : 0) +
    (query.subscription ? 1 : 0) +
    Object.values(query.facets ?? {}).reduce((sum, v) => sum + v.length, 0)
  );
}
