import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { routes } from "@/config/routes";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { BestsellerFilter } from "./BestsellerFilter";

/** Ən çox satılanlar + filtr düymələri (Silver Garden / Loree's ruhu): 4 / 3 / 2 sütun */
export async function Bestsellers() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const [products, categories, { bestsellerFilters }] = await Promise.all([
    catalog.getBestsellers(16),
    catalog.getCategories(),
    catalog.getHomeContent(),
  ]);

  const items = products.map((p) => {
    const category = categories.find((c) => c.slug === p.categorySlug);
    const filterKey = bestsellerFilters.find((f) => f.categories.includes(p.categorySlug))?.key ?? "other";
    return {
      id: p.slug,
      filterKey,
      node: (
        <ProductCard
          product={p}
          categoryName={category ? localize(category.shortName ?? category.name, locale) : undefined}
          world={category?.world}
          className="w-full"
        />
      ),
    };
  });

  return (
    <Section id="bestsellerler" background="surface" className="reveal">
      <Container>
        <SectionHeading
          eyebrow={t("bestEyebrow")}
          title={t("bestTitle")}
          description={t("bestText")}
          action={
            <Button href={routes.search()} variant="link">
              {t("bestAllLink")}
              <ArrowRight aria-hidden />
            </Button>
          }
        />
        <BestsellerFilter
          allLabel={t("bestAll")}
          emptyLabel={t("bestEmpty")}
          groupLabel={t("bestEyebrow")}
          filters={bestsellerFilters.map((f) => ({ key: f.key, label: localize(f.label, locale) }))}
          items={items}
        />
      </Container>
    </Section>
  );
}
