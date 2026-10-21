import { RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/catalog/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { EquipmentSummary, PlantPassport } from "@/components/product/TypeBlocks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tabs } from "@/components/ui/Tabs";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const products = await catalog.getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

async function resolve(params: PageProps<"/[locale]/mehsul/[slug]">["params"]) {
  const { locale: l, slug } = await params;
  const locale: Locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  const product = await catalog.getProduct(slug);
  return { locale, product };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/mehsul/[slug]">): Promise<Metadata> {
  const { locale, product } = await resolve(params);
  if (!product) return {};
  const name = localize(product.name, locale);
  const description = localize(product.description, locale);
  return pageMetadata({ path: routes.product(product.slug), locale, title: name, description, image: img(product.images[0]) });
}

/** Kartlardan ibarət sıra ("Birlikdə alınır", "Oxşar məhsullar") */
function ProductRow({ title, text, products, categories, locale }: { title: string; text: string; products: Product[]; categories: Category[]; locale: Locale }) {
  if (!products.length) return null;
  return (
    <Section spacing="sm">
      <Container>
        <SectionHeading title={title} description={text} />
        <ul className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const c = categories.find((x) => x.slug === p.categorySlug);
            return (
              <li key={p.slug} className="flex">
                <ProductCard product={p} categoryName={c ? localize(c.shortName ?? c.name, locale) : undefined} world={c?.world} className="w-full" />
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/** Məhsulun bütün məzmunu — params URL məlumatıdır, ona görə Suspense içində render olunur */
async function ProductContent({ params }: { params: PageProps<"/[locale]/mehsul/[slug]">["params"] }) {
  const { locale, product } = await resolve(params);
  if (!product) notFound();

  const t = await getTranslations("ProductPage");
  const tp = await getTranslations("Product");
  const [category, categories, related, together, reviews] = await Promise.all([
    catalog.getCategory(product.categorySlug),
    catalog.getCategories(),
    catalog.getRelatedProducts(product, 8),
    catalog.getProductsBySlugs(product.boughtTogether ?? []),
    catalog.getReviews(),
  ]);
  if (!category) notFound();

  const name = localize(product.name, locale);
  const togetherSlugs = new Set(together.map((p) => p.slug));
  const similar = related.filter((p) => !togetherSlugs.has(p.slug)).slice(0, 4);
  const description = localize(product.description, locale);
  // Başlıq altında yalnız ilk cümlə — tam mətn "Təsvir" tabındadır
  const lead = description.split(/(?<=[.!?])s/)[0];
  const sub = category.subcategories.find((s) => s.slug === product.subcategorySlug);
  const discount = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  const crumbs: Crumb[] = [
    { label: localize(category.name, locale), href: routes.category(category.slug) },
    ...(sub ? [{ label: localize(sub.name, locale), href: routes.category(category.slug, sub.slug) }] : []),
    { label: name },
  ];

  const service =
    product.installationService?.available
      ? { kind: product.productType === "plant" ? ("planting" as const) : ("install" as const), price: product.installationService.price }
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: localize(product.description, locale),
    sku: product.slug,
    image: product.images.map((i) => img(i)),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "AZN",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${siteConfig.url}/${locale}${routes.product(product.slug)}`,
    },
    ...(product.rating && { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewsCount ?? 1 } }),
  };

  const info = [
    { icon: Truck, title: t("infoDelivery"), text: t("infoDeliveryText", { amount: siteConfig.freeDeliveryThreshold, fee: siteConfig.deliveryFee }) },
    { icon: ShieldCheck, title: t("infoWarranty"), text: t("infoWarrantyText") },
    { icon: RotateCcw, title: t("infoReturn"), text: t("infoReturnText") },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section spacing="none" className="pt-6 pb-section-sm">
        <Container className="flex flex-col gap-6">
          <Breadcrumbs locale={locale} items={crumbs} />

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="lg:sticky lg:top-44 lg:self-start">
              <ProductGallery
                images={product.images.map((i) => img(i))}
                alt={name}
                world={category.world}
                badges={
                  <>
                    {discount !== null && <Badge variant="sale">−{discount}%</Badge>}
                    {product.badges?.includes("new") && <Badge variant="new">{tp("badgeNew")}</Badge>}
                    {product.badges?.includes("bestseller") && <Badge variant="bestseller">{tp("badgeBestseller")}</Badge>}
                  </>
                }
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link href={routes.category(category.slug, sub?.slug)} className="w-fit text-small font-medium text-(--link) hover:underline">
                  {localize(sub?.name ?? category.name, locale)}
                </Link>
                <h1 className="text-h2">{name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {product.rating !== undefined && (
                    <a href="#tabs" className="hover:underline">
                      <Rating value={product.rating} count={product.reviewsCount} size="md" />
                    </a>
                  )}
                  {product.brand && (
                    <span className="text-small text-ink-muted">
                      {t("brand")}: <span className="font-medium text-ink-strong">{product.brand}</span>
                    </span>
                  )}
                </div>
                <p className="text-body">{lead}</p>
              </div>

              <ProductPurchase
                slug={product.slug}
                name={name}
                price={product.price}
                oldPrice={product.oldPrice}
                inStock={product.inStock}
                leadTimeDays={product.leadTimeDays}
                subscriptionEligible={product.subscriptionEligible}
                dosage={product.productType === "chemical" ? product.dosage : undefined}
                service={service}
              >
                {product.productType === "plant" && <PlantPassport product={product} />}
                {product.productType === "equipment" && <EquipmentSummary product={product} />}
              </ProductPurchase>

              <ul className="grid gap-3 rounded-card border border-border p-4 sm:grid-cols-3">
                {info.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3 sm:flex-col sm:gap-2">
                    <Icon aria-hidden className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
                    <span className="flex flex-col">
                      <span className="text-small font-medium text-ink-strong">{title}</span>
                      <span className="text-caption">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Təsvir / Xüsusiyyətlər / Rəylər */}
      <Section id="tabs" background="surface" spacing="sm" className="scroll-mt-40">
        <Container>
          <Tabs
            tabs={[
              {
                id: "description",
                label: t("tabDescription"),
                content: <p className="max-w-prose text-lead">{localize(product.description, locale)}</p>,
              },
              {
                id: "specs",
                label: t("tabSpecs"),
                content: (
                  <dl className="grid max-w-3xl sm:grid-cols-2 sm:gap-x-10">
                    {product.brand && (
                      <div className="flex justify-between gap-4 border-b border-border py-3">
                        <dt className="text-ink-muted">{t("brand")}</dt>
                        <dd className="text-right font-medium text-ink-strong">{product.brand}</dd>
                      </div>
                    )}
                    {product.specs.map((s) => (
                      <div key={s.label.az} className="flex justify-between gap-4 border-b border-border py-3">
                        <dt className="text-ink-muted">{localize(s.label, locale)}</dt>
                        <dd className="text-right font-medium text-ink-strong">{localize(s.value, locale)}</dd>
                      </div>
                    ))}
                    {product.warrantyMonths && (
                      <div className="flex justify-between gap-4 border-b border-border py-3">
                        <dt className="text-ink-muted">{t("warranty")}</dt>
                        <dd className="text-right font-medium text-ink-strong">{t("warrantyMonths", { count: product.warrantyMonths })}</dd>
                      </div>
                    )}
                  </dl>
                ),
              },
              {
                id: "reviews",
                label: t("tabReviews", { count: product.reviewsCount ?? 0 }),
                content: (
                  <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
                    <div className="flex flex-col gap-2">
                      <span className="font-heading text-display leading-none text-ink-strong">{(product.rating ?? 0).toFixed(1)}</span>
                      <Rating value={product.rating ?? 0} size="md" />
                      <span className="text-small text-ink-muted">{t("reviewsSummary", { count: product.reviewsCount ?? 0 })}</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      <h3 className="text-h4">{t("reviewsStore")}</h3>
                      <ul className="grid gap-4 md:grid-cols-2">
                        {reviews.items.slice(0, 4).map((r) => (
                          <li key={r.id} className="flex flex-col gap-3 rounded-card border border-border bg-page p-5">
                            <span role="img" className="inline-flex gap-0.5 text-primary" aria-label={`${r.rating}/5`}>
                              {Array.from({ length: r.rating }, (_, i) => (
                                <Star key={i} aria-hidden className="size-3.5 fill-current" />
                              ))}
                            </span>
                            <p className="text-body text-ink-strong">{localize(r.text, locale)}</p>
                            <span className="text-small font-medium text-ink-strong">{r.author}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Container>
      </Section>

      <ProductRow title={t("boughtTogether")} text={t("boughtTogetherText")} products={together} categories={categories} locale={locale} />
      <ProductRow title={t("related")} text={t("relatedText")} products={similar} categories={categories} locale={locale} />
    </>
  );
}

/** Statik qabıq: bütün məhsullar üçün eyni skelet (ani keçid üçün), məzmun stream olunur */
function ProductSkeleton() {
  return (
    <Section spacing="none" className="pt-6 pb-section-sm">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-14" aria-hidden>
        <span className="aspect-square animate-pulse rounded-hero bg-garden" />
        <span className="flex flex-col gap-4 pt-10">
          <span className="h-10 w-3/4 animate-pulse rounded-tag bg-garden" />
          <span className="h-5 w-1/2 animate-pulse rounded-tag bg-garden" />
          <span className="h-40 animate-pulse rounded-card bg-garden" />
        </span>
      </Container>
    </Section>
  );
}

export default function ProductPage({ params }: PageProps<"/[locale]/mehsul/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </main>
  );
}
