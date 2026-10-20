import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { computeFacetCounts, applyProductQuery, type ProductQuery } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { localize } from "@/lib/utils";
import {
  ActiveFilters,
  CatalogProvider,
  CatalogToolbar,
  EmptyResults,
  FilterPanel,
  ResultsArea,
  SubcategoryPills,
  type PanelFilter,
} from "./CatalogControls";
import { ProductGrid } from "./ProductGrid";

type CatalogResultsProps = {
  /** Süzgəcdən əvvəlki bütün siyahı (kateqoriyanın məhsulları və ya axtarış nəticələri) */
  products: Product[];
  query: ProductQuery;
  /** Kateqoriya səhifəsində: xas filtrlər və alt bölmə pill-ləri üçün */
  category?: Category;
  categories: Category[];
  q?: string;
  empty: { title: string; text: string };
};

/**
 * Filtr paneli + üst panel + məhsul şəbəkəsi. Filtrləmə serverdə aparılır (URL-dən),
 * panel yalnız URL-i dəyişir — link paylaşılanda eyni nəticə açılır.
 */
export async function CatalogResults({ products, query, category, categories, q, empty }: CatalogResultsProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Catalog");

  const results = applyProductQuery(products, query, category);
  const counts = computeFacetCounts(products, query, category);
  const brands = [...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort();

  const filters: PanelFilter[] = (category?.filters ?? []).map((f) => ({
    key: f.key,
    label: localize(f.label, locale),
    type: f.type === "boolean" ? "boolean" : "options",
    options:
      f.type === "options"
        ? f.options.map((o) => ({ value: o.value, label: localize(o.label, locale) }))
        : f.type === "range"
          ? f.buckets.map((b, i) => ({ value: String(i), label: localize(b.label, locale) }))
          : [],
  }));

  const subcategories = (category?.subcategories ?? [])
    .filter((s) => s.active !== false && (counts.subcategories[s.slug] ?? 0) > 0)
    .map((s) => ({ slug: s.slug, name: localize(s.name, locale) }));

  return (
    <CatalogProvider query={query} q={q} counts={counts} total={results.length} filters={filters} brands={brands}>
      <div className="flex flex-col gap-6">
        <SubcategoryPills items={subcategories} />

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          <aside aria-label={t("filters")} className="hidden lg:block">
            <div className="sticky top-44">
              <FilterPanel />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <CatalogToolbar />
            <ActiveFilters />
            <ResultsArea>
              {results.length > 0 ? (
                <ProductGrid products={results} categories={categories} labelBy={category ? "subcategory" : "category"} />
              ) : (
                <EmptyResults title={empty.title} text={empty.text} />
              )}
            </ResultsArea>
          </div>
        </div>
      </div>
    </CatalogProvider>
  );
}
