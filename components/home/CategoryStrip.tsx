import { getLocale, getTranslations } from "next-intl/server";
import { CategoryCircle } from "@/components/ui/CategoryCircle";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

/**
 * "Bölməni seçin" — saytın əsas naviqasiya bölməsi (Plantiva "Plants For Every Lifestyle").
 * Desktop-da bir sıra, mobil-də üfüqi sürüşdürmə.
 */
export async function CategoryStrip() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const [categories, counts] = await Promise.all([catalog.getCategories(), catalog.getProductCounts()]);

  return (
    <Section id="bolmeler" className="reveal scroll-mt-40">
      <Container>
        <SectionHeading
          align="center"
          eyebrow={t("categoriesEyebrow")}
          title={t("categoriesTitle")}
          description={t("categoriesText")}
        />
        <ul className="-mx-container-pad flex snap-x snap-mandatory gap-5 overflow-x-auto px-container-pad pb-2 [scrollbar-width:none] lg:mx-0 lg:justify-center lg:gap-8 lg:overflow-visible lg:px-0">
          {categories.map((c) => (
            <li key={c.slug} className="snap-start">
              <CategoryCircle
                href={routes.category(c.slug)}
                name={localize(c.shortName ?? c.name, locale)}
                image={img(c.image)}
                world={c.world}
                productCount={counts[c.slug]}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
