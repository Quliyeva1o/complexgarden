import { ArrowUpRight, Droplets, Leaf } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { cn, localize } from "@/lib/utils";

/**
 * İki dünya banneri: hovuz (pool fonu, firuzəyi) və bağ (garden fonu, yaşıl) yan-yana.
 * Brendin iki tərəfini birləşdirir — alıcı hansı "dünyada" olduğunu rəngdən anlayır.
 */
export async function WorldBanners() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const { worlds } = await catalog.getHomeContent();

  return (
    <Section id="dunyalar" spacing="sm" className="reveal" aria-label={t("worldsEyebrow")}>
      <Container className="grid gap-grid md:grid-cols-2">
        {worlds.map((w) => {
          const pool = w.world === "pool";
          return (
            <article
              key={w.world}
              className={cn(
                "flex flex-col overflow-hidden rounded-hero",
                pool ? "world-pool bg-pool" : "world-garden bg-garden",
              )}
            >
              <div className="flex flex-col items-start gap-4 p-6 sm:p-10">
                <Eyebrow icon={pool ? Droplets : Leaf}>{t("worldsEyebrow")}</Eyebrow>
                <h2 className="text-h2">{pool ? t("poolTitle") : t("gardenTitle")}</h2>
                <p className="max-w-md text-body">{pool ? t("poolText") : t("gardenText")}</p>
                <ul className="flex flex-wrap gap-2">
                  {w.links.map((l) => (
                    <li key={l.categorySlug + (l.subcategorySlug ?? "")}>
                      <Link
                        href={routes.category(l.categorySlug, l.subcategorySlug)}
                        className="group/chip inline-flex h-10 items-center gap-1.5 rounded-pill bg-surface px-4 text-small font-medium text-ink-strong outline-none transition-colors duration-300 hover:bg-ink-strong hover:text-page focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
                      >
                        {localize(l.label, locale)}
                        <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover/chip:rotate-45" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button href={routes.category(w.categorySlug)} variant="outline" arrow className="mt-2">
                  {t("worldCta")}
                </Button>
              </div>
              {/* Şəkil kartın içində boşluqla — Plantiva məhsul kartı ilə eyni dil */}
              <div className="relative mx-3 mt-auto mb-3 aspect-16/9 overflow-hidden rounded-card">
                <Image src={img(w.image)} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              </div>
            </article>
          );
        })}
      </Container>
    </Section>
  );
}
