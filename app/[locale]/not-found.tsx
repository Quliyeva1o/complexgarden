import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SearchBox } from "@/components/layout/SearchBox";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

/** Brend üslubunda 404: iri rəqəm, izah, axtarış və bölmələrə keçid */
export default async function NotFound() {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const categories = await catalog.getCategories();

  return (
    <main id="main">
      <Section spacing="sm">
        <Container className="flex flex-col items-center gap-6 text-center">
          <div aria-hidden data-text="404" className="text-watermark text-garden select-none before:content-[attr(data-text)]" />
          <h1 className="text-h1 -mt-4">{t("notFoundTitle")}</h1>
          <p className="max-w-xl text-lead">{t("notFoundText")}</p>
          <SearchBox className="w-full max-w-xl text-left" label={t("notFoundTitle")} />
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={routes.home} arrow>
              {t("notFoundHome")}
            </Button>
            <Button href={routes.search()} variant="outline">
              {t("notFoundCatalog")}
            </Button>
          </div>
          <ul className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={routes.category(c.slug)}
                  className={`${c.world === "pool" ? "bg-pool" : "bg-garden"} group inline-flex h-10 items-center gap-1.5 rounded-pill px-4 text-small font-medium text-ink-strong hover:text-(--link)`}
                >
                  {localize(c.shortName ?? c.name, locale)}
                  <ArrowUpRight aria-hidden className="size-3.5 transition-transform group-hover:rotate-45" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
