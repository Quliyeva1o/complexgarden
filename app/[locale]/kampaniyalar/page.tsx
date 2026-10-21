import { Percent } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Countdown } from "@/components/ui/Countdown";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ path: routes.campaigns, locale, title: t("campaignsTitle"), description: t("campaignsLead") });
}

export default async function CampaignsPage() {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const [campaigns, categories] = await Promise.all([catalog.getCampaigns(), catalog.getCategories()]);
  const withProducts = await Promise.all(campaigns.map(async (c) => ({ c, products: await catalog.getProductsBySlugs(c.productSlugs) })));

  return (
    <main id="main">
      <PageHeader title={t("campaignsTitle")} lead={t("campaignsLead")} crumbs={[{ label: t("campaignsTitle") }]} />

      {withProducts.length === 0 && (
        <Section spacing="none" className="pb-section-sm">
          <Container>
            <p className="rounded-hero border border-dashed border-ink-strong/20 px-6 py-16 text-center text-body">{t("campaignsEmpty")}</p>
          </Container>
        </Section>
      )}

      {withProducts.map(({ c, products }) => (
        <Section key={c.slug} id={c.slug} spacing="none" className="scroll-mt-44 pb-section-sm">
          <Container className="flex flex-col gap-8">
            <div className="on-dark grid overflow-hidden rounded-hero bg-primary lg:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col items-start gap-5 p-6 sm:p-10">
                <Eyebrow icon={Percent}>−{c.discountPercent}%</Eyebrow>
                <h2 className="text-h2">{localize(c.title, locale)}</h2>
                <p className="max-w-md text-body">{localize(c.description, locale)}</p>
                <div className="flex flex-col gap-3">
                  <span className="text-small">{t("campaignEnds")}</span>
                  <Countdown endsAt={c.endsAt} tone="dark" />
                </div>
              </div>
              <div className="relative min-h-64">
                <Image src={img(c.image)} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-h4">{t("campaignProducts")}</h3>
              <ul className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => {
                  const cat = categories.find((x) => x.slug === p.categorySlug);
                  return (
                    <li key={p.slug} className="flex">
                      <ProductCard product={p} categoryName={cat ? localize(cat.shortName ?? cat.name, locale) : undefined} world={cat?.world} className="w-full" />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Container>
        </Section>
      ))}
    </main>
  );
}
