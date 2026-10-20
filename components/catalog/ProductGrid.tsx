import { getLocale } from "next-intl/server";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Locale } from "@/i18n/routing";
import type { Category, Product } from "@/lib/types";
import { localize } from "@/lib/utils";

type ProductGridProps = {
  products: Product[];
  categories: Category[];
  /** Kateqoriya səhifəsində kateqoriya etiketi lazım deyil — alt bölmə göstərilir */
  labelBy?: "category" | "subcategory";
};

/** Məhsul şəbəkəsi: mobil 2, planşet 3 sütun (filtr paneli ilə desktop-da da 3) */
export async function ProductGrid({ products, categories, labelBy = "category" }: ProductGridProps) {
  const locale = (await getLocale()) as Locale;

  return (
    <ul className="grid grid-cols-2 gap-grid md:grid-cols-3">
      {products.map((p) => {
        const category = categories.find((c) => c.slug === p.categorySlug);
        const sub = category?.subcategories.find((s) => s.slug === p.subcategorySlug);
        const label =
          labelBy === "subcategory" && sub
            ? localize(sub.name, locale)
            : category
              ? localize(category.shortName ?? category.name, locale)
              : undefined;
        return (
          <li key={p.slug} className="flex">
            <ProductCard
              product={p}
              categoryName={label}
              world={category?.world}
              className="w-full"
              sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw"
            />
          </li>
        );
      })}
    </ul>
  );
}

/** Suspense fallback — nəticələr yüklənənə qədər eyni ölçüdə boz kartlar (layout sürüşmür) */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-grid md:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-2.5">
          <span className="aspect-square animate-pulse rounded-media bg-garden" />
          <span className="mx-2 h-4 w-2/3 animate-pulse rounded-tag bg-garden" />
          <span className="mx-2 mb-3 h-4 w-1/3 animate-pulse rounded-tag bg-garden" />
        </li>
      ))}
    </ul>
  );
}
