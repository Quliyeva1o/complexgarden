import { ArrowUpRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { formatDayMonthYear } from "@/lib/format";
import { localize } from "@/lib/utils";

export async function generateStaticParams() {
  const articles = await catalog.getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

async function resolve(params: PageProps<"/[locale]/beledciler/[slug]">["params"]) {
  const { locale: l, slug } = await params;
  const locale: Locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  return { locale, article: await catalog.getArticle(slug) };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/beledciler/[slug]">): Promise<Metadata> {
  const { locale, article } = await resolve(params);
  if (!article) return {};
  const title = localize(article.title, locale);
  return {
    title,
    description: localize(article.excerpt, locale),
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}${routes.guide(article.slug)}`])) },
    openGraph: { type: "article", title, images: [img(article.image)], publishedTime: article.publishedAt },
  };
}

async function ArticleContent({ params }: { params: PageProps<"/[locale]/beledciler/[slug]">["params"] }) {
  const { locale, article } = await resolve(params);
  if (!article) notFound();

  const t = await getTranslations("Pages");
  const [products, categories, all] = await Promise.all([
    catalog.getProductsBySlugs(article.productSlugs),
    catalog.getCategories(),
    catalog.getArticles(),
  ]);
  const title = localize(article.title, locale);
  const more = all.filter((a) => a.slug !== article.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: localize(article.excerpt, locale),
    image: [img(article.image)],
    datePublished: article.publishedAt,
    publisher: { "@type": "Organization", name: siteConfig.name },
    inLanguage: locale,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <Section spacing="none" className="pt-6 pb-section-sm">
          <Container className="flex flex-col gap-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              <Breadcrumbs locale={locale} items={[{ label: t("guidesTitle"), href: routes.guides }, { label: title }]} />
              <h1 className="text-h1">{title}</h1>
              <p className="text-lead">{localize(article.excerpt, locale)}</p>
              <p className="inline-flex flex-wrap items-center gap-4 text-small text-ink-muted">
                <span>
                  {t("published")}: <time dateTime={article.publishedAt}>{formatDayMonthYear(article.publishedAt, locale)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="size-4" />
                  {t("readingTime", { count: article.readingMinutes })}
                </span>
              </p>
            </div>
            <div className={`relative aspect-21/9 overflow-hidden rounded-hero ${article.world === "pool" ? "bg-pool" : "bg-garden"}`}>
              <Image src={img(article.image)} alt="" fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="mx-auto flex w-full max-w-prose flex-col gap-6">
              {article.body.map((p) => (
                <p key={p.az} className="text-lead text-ink-strong">
                  {localize(p, locale)}
                </p>
              ))}
            </div>
          </Container>
        </Section>
      </article>

      {products.length > 0 && (
        <Section background="surface" spacing="sm">
          <Container>
            <SectionHeading title={t("articleProducts")} />
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
      )}

      {more.length > 0 && (
        <Section spacing="sm">
          <Container>
            <SectionHeading title={t("moreGuides")} />
            <ul className="grid gap-grid md:grid-cols-2">
              {more.map((a) => (
                <li key={a.slug}>
                  <Link href={routes.guide(a.slug)} className="group flex items-center gap-4 rounded-hero border border-border bg-surface p-2.5 pr-6 outline-none hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-(--focus-ring)">
                    <span className="relative size-24 shrink-0 overflow-hidden rounded-card bg-garden">
                      <Image src={img(a.image)} alt="" fill sizes="96px" className="object-cover" />
                    </span>
                    <span className="flex-1 text-h4 text-ink-strong">{localize(a.title, locale)}</span>
                    <ArrowUpRight aria-hidden className="size-5 text-(--link) transition-transform duration-300 group-hover:rotate-45" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}

export default function ArticlePage({ params }: PageProps<"/[locale]/beledciler/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<Container className="pt-6"><span aria-hidden className="block h-96 animate-pulse rounded-hero bg-garden" /></Container>}>
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}
