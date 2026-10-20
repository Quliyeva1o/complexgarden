import { CalendarDays, Droplets, Leaf } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { formatAzn } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { getCurrentMonth, monthName } from "@/lib/date";
import { cn, localize } from "@/lib/utils";

/**
 * "Bu ay nə etməli?" — cari aya görə avtomatik seçilən tövsiyələr (data/seasonal.ts, 12 ay).
 * Hər tövsiyə öz "dünyasının" rəngində, altında 2–3 uyğun məhsul linki.
 */
export async function SeasonalGuide() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const month = await getCurrentMonth();
  const season = await catalog.getSeasonalMonth(month);
  if (!season) return null;

  const tips = await Promise.all(
    season.tips.map(async (tip) => ({ tip, products: await catalog.getProductsBySlugs(tip.productSlugs.slice(0, 3)) })),
  );

  return (
    <Section id="bu-ay" background="surface" className="reveal">
      <Container>
        <SectionHeading
          eyebrow={t("seasonEyebrow")}
          eyebrowIcon={CalendarDays}
          title={t("seasonTitle", { month: monthName(month, locale) })}
          description={t("seasonText")}
        />

        <ul className="grid gap-grid md:grid-cols-3">
          {tips.map(({ tip, products }) => {
            const pool = tip.world === "pool";
            const Icon = pool ? Droplets : Leaf;
            return (
              <li
                key={tip.title.az}
                className={cn("flex min-w-0 flex-col gap-5 rounded-hero p-6 sm:p-7", pool ? "world-pool bg-pool" : "world-garden bg-garden")}
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-surface px-3 py-1 text-caption font-medium text-ink-strong">
                  <Icon aria-hidden className={cn("size-3.5", pool ? "text-secondary" : "text-primary")} />
                  {pool ? t("seasonPool") : t("seasonGarden")}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-h3">{localize(tip.title, locale)}</h3>
                  <p className="text-body">{localize(tip.text, locale)}</p>
                </div>

                {products.length > 0 && (
                  <div className="mt-auto flex flex-col gap-2">
                    <span className="text-caption">{t("seasonProducts")}</span>
                    <ul className="flex flex-col gap-1.5">
                      {products.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={routes.product(p.slug)}
                            className="group/p flex items-center gap-3 rounded-media bg-surface p-1.5 pr-3 outline-none transition-shadow duration-300 hover:shadow-float focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
                          >
                            <span className="relative size-11 shrink-0 overflow-hidden rounded-tag bg-garden">
                              <Image src={img(p.images[0])} alt="" fill sizes="44px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-small font-medium text-ink-strong group-hover/p:text-(--link)">
                              {localize(p.name, locale)}
                            </span>
                            <span className="font-heading text-small font-medium text-ink-strong tabular-nums">
                              {formatAzn(p.price, locale)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
