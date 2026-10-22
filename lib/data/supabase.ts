import { cacheLife, cacheTag } from "next/cache";
import { categories as codeCategories } from "@/data/categories";
import { createPublicClient } from "@/lib/supabase/public";
import { rowToCategory, rowToProduct } from "@/lib/supabase/mappers";
import type { CategoryRow, ProductRow, SubcategoryRow } from "@/lib/supabase/rows";
import { createCatalogMethods, type CatalogSnapshot } from "./catalog-core";
import { localRepository } from "./local";
import type { CatalogRepository } from "./repository";

/** Admin yazısından sonra `updateTag(CATALOG_TAG)` — kataloq dərhal yenilənir */
export const CATALOG_TAG = "catalog";

// Kateqoriya filtrləri v1-də kodda qalır
const codeFilters = new Map(codeCategories.map((c) => [c.slug, c.filters]));

async function loadCatalog(): Promise<CatalogSnapshot> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");

  const db = createPublicClient();
  const [cats, subs, prods] = await Promise.all([
    db.from("categories").select("*").order("sort_order"),
    db.from("subcategories").select("*").order("sort_order"),
    db.from("products").select("*").eq("status", "published"),
  ]);
  for (const result of [cats, subs, prods]) {
    if (result.error) throw new Error(`Supabase kataloq oxuması: ${result.error.message}`);
  }

  const subRows = subs.data as SubcategoryRow[];
  return {
    categories: (cats.data as CategoryRow[]).map((row) =>
      rowToCategory(row, subRows, codeFilters.get(row.slug) ?? []),
    ),
    products: (prods.data as ProductRow[]).map(rowToProduct),
  };
}

/** Kateqoriya və məhsullar Supabase-dən; qalan məzmun (kampaniya, xidmət, səhifələr) hələlik koddan */
export const supabaseRepository: CatalogRepository = {
  ...localRepository,
  ...createCatalogMethods(loadCatalog),
};
