import { Search } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { ProductGridSkeleton } from "@/components/catalog/ProductGrid";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog, parseCatalogParams, URL_KEYS, type SearchParamsRecord } from "@/lib/data";
import { localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Catalog");
  // Axtarış nəticələri indekslənmir — dublikat məzmun yaratmasın
  return { title: t("searchTitle"), robots: { index: false, follow: true } };
}

async function SearchResults({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const t = await getTranslations("Catalog");
  const tc = await getTranslations("Common");
  const locale = (await getLocale()) as Locale;
  const params = await searchParams;
  const raw = params[URL_KEYS.query];
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const query = { ...parseCatalogParams(params), subcategorySlug: undefined };

  const [products, categories] = await Promise.all([
    q ? catalog.searchProducts(q, locale, Number.POSITIVE_INFINITY) : catalog.getProducts(),
    catalog.getCategories(),
  ]);

  // Nəticələrin bölmələr üzrə paylanması — birbaşa bölməyə keçid üçün
  const byCategory = categories
    .map((c) => ({ c, count: products.filter((p) => p.categorySlug === c.slug).length }))
    .filter((x) => x.count > 0);

  return (
    <>
      <div className="mb-8 flex flex-col gap-5">
        <h1 className="text-h1">{q ? t("searchResultsFor", { q }) : t("allProducts")}</h1>
        {!q && <p className="max-w-2xl text-lead">{t("allProductsText")}</p>}

        <form action="" method="get" role="search" className="flex max-w-xl gap-2">
          <label htmlFor="search-page-q" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink-muted" />
            <input
              id="search-page-q"
              name={URL_KEYS.query}
              type="search"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-pill border border-ink-strong/12 bg-surface pr-4 pl-11 text-body text-ink-strong outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
            />
          </div>
          <button type="submit" className="h-12 rounded-pill bg-primary px-6 font-medium text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2">
            {t("searchSubmit")}
          </button>
        </form>

        {byCategory.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-small text-ink-muted">{t("searchInCategories")}:</span>
            {byCategory.map(({ c, count }) => (
              <Link
                key={c.slug}
                href={routes.category(c.slug)}
                className={`${c.world === "pool" ? "bg-pool" : "bg-garden"} inline-flex h-9 items-center gap-1.5 rounded-pill px-4 text-small font-medium text-ink-strong hover:text-(--link)`}
              >
                {localize(c.shortName ?? c.name, locale)}
                <span className="text-caption">{tc("products", { count })}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CatalogResults
        products={products}
        query={query}
        categories={categories}
        q={q || undefined}
        empty={
          q
            ? { title: t("searchEmptyTitle", { q }), text: t("searchEmptyText") }
            : { title: t("emptyTitle"), text: t("emptyText") }
        }
      />
    </>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/[locale]/axtaris">) {
  const locale = await getLocale();
  const t = await getTranslations("Catalog");

  return (
    <main id="main">
      <Section spacing="none" className="pt-8 pb-section-sm">
        <Container>
          <div className="mb-6">
            <Breadcrumbs locale={locale} items={[{ label: t("searchTitle") }]} />
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <SearchResults searchParams={searchParams as Promise<SearchParamsRecord>} />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}
