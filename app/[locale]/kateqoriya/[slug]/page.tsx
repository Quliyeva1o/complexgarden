import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { ProductGridSkeleton } from "@/components/catalog/ProductGrid";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { catalog, parseCatalogParams, type SearchParamsRecord } from "@/lib/data";
import type { Category } from "@/lib/types";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await catalog.getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

async function resolve(params: PageProps<"/[locale]/kateqoriya/[slug]">["params"]) {
  const { locale: l, slug } = await params;
  const locale: Locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const category = await catalog.getCategory(slug);
  return { locale, category };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/kateqoriya/[slug]">): Promise<Metadata> {
  const { locale, category } = await resolve(params);
  if (!category) return {};
  const name = localize(category.name, locale);
  const description = localize(category.description, locale);
  return pageMetadata({ path: routes.category(category.slug), locale, title: name, description, image: img(category.image) });
}

/** Filtrli nəticələr — searchParams runtime məlumatıdır, ona görə Suspense içində */
async function Results({ category, searchParams }: { category: Category; searchParams: Promise<SearchParamsRecord> }) {
  const t = await getTranslations("Catalog");
  const parsed = parseCatalogParams(await searchParams);
  // Mövcud olmayan alt bölmə URL-də yazılıbsa nəzərə alınmır
  const validSub = category.subcategories.some((s) => s.slug === parsed.subcategorySlug && s.active !== false);
  const query = { ...parsed, categorySlug: category.slug, subcategorySlug: validSub ? parsed.subcategorySlug : undefined };

  const [products, categories] = await Promise.all([
    catalog.getProducts({ categorySlug: category.slug }),
    catalog.getCategories(),
  ]);

  return (
    <CatalogResults
      products={products}
      query={query}
      category={category}
      categories={categories}
      empty={{ title: t("emptyTitle"), text: t("emptyText") }}
    />
  );
}

/** Kateqoriyanın bütün məzmunu — params URL məlumatıdır, ona görə Suspense içində */
async function CategoryContent({ params, searchParams }: PageProps<"/[locale]/kateqoriya/[slug]">) {
  const { locale, category } = await resolve(params);
  if (!category) notFound();

  const t = await getTranslations("Catalog");
  const tc = await getTranslations("Common");
  const counts = await catalog.getProductCounts();
  const name = localize(category.name, locale);
  const pool = category.world === "pool";

  return (
    <>
      {/* Başlıq zolağı — kateqoriyanın "dünyasının" rəngində */}
      <Section spacing="none" className="pt-6 pb-8">
        <Container>
          <div className={`${pool ? "world-pool bg-pool" : "world-garden bg-garden"} grid items-center gap-6 overflow-hidden rounded-hero p-6 sm:p-10 md:grid-cols-[1fr_auto]`}>
            <div className="flex flex-col items-start gap-4">
              <Breadcrumbs locale={locale} items={[{ label: name }]} />
              <h1 className="text-h1">{name}</h1>
              <p className="max-w-2xl text-lead">{localize(category.description, locale)}</p>
              <span className="text-small font-medium text-ink-strong">{tc("products", { count: counts[category.slug] ?? 0 })}</span>
            </div>
            <div className="relative hidden size-44 overflow-hidden rounded-pill border-8 border-surface md:block lg:size-52">
              <Image src={img(category.image)} alt="" fill priority sizes="208px" className="object-cover" />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="none" className="pb-section-sm">
        <Container>
          <Suspense fallback={<ProductGridSkeleton />}>
            <Results category={category} searchParams={searchParams as Promise<SearchParamsRecord>} />
          </Suspense>
        </Container>
      </Section>

      {(category.guide || category.faq?.length) && (
        <Section background="surface">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {category.guide && (
              <div>
                <SectionHeading eyebrow={t("guideEyebrow")} title={t("guideTitle", { name })} as="h2" />
                <p className="max-w-prose text-body">{localize(category.guide, locale)}</p>
              </div>
            )}
            {category.faq?.length ? (
              <div>
                <h2 className="mb-heading-gap text-h3">{t("faqTitle")}</h2>
                <Accordion
                  items={category.faq.map((f, i) => ({
                    id: `faq-${i}`,
                    title: localize(f.question, locale),
                    content: localize(f.answer, locale),
                  }))}
                />
                {/* FAQ üçün schema.org (axtarış nəticələrində sual-cavab) */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: category.faq.map((f) => ({
                        "@type": "Question",
                        name: localize(f.question, locale),
                        acceptedAnswer: { "@type": "Answer", text: localize(f.answer, locale) },
                      })),
                    }),
                  }}
                />
              </div>
            ) : null}
          </Container>
        </Section>
      )}
    </>
  );
}

export default function CategoryPage(props: PageProps<"/[locale]/kateqoriya/[slug]">) {
  return (
    <main id="main">
      <Suspense
        fallback={
          <Container className="pt-6">
            <span aria-hidden className="block h-56 animate-pulse rounded-hero bg-garden" />
          </Container>
        }
      >
        <CategoryContent {...props} />
      </Suspense>
    </main>
  );
}
