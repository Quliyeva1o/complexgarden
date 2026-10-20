import { ArrowUpRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { formatDayMonthYear } from "@/lib/format";
import { cn, localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("guidesTitle"), description: t("guidesLead") };
}

export default async function GuidesPage() {
  const t = await getTranslations("Pages");
  const th = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const articles = await catalog.getArticles();

  return (
    <main id="main">
      <PageHeader title={t("guidesTitle")} lead={t("guidesLead")} crumbs={[{ label: t("guidesTitle") }]} />

      <Section spacing="none" className="pb-section-sm">
        <Container>
          <ul className="grid gap-grid md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <li
                key={a.slug}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-hero border border-border bg-surface p-2.5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-(--focus-ring)",
                  i === 0 && "lg:col-span-2",
                )}
              >
                <div className={cn("relative overflow-hidden rounded-card", i === 0 ? "aspect-16/9" : "aspect-4/3", a.world === "pool" ? "bg-pool" : "bg-garden")}>
                  <Image src={img(a.image)} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-103" />
                  <span className="absolute top-3 left-3 rounded-tag bg-surface px-2 py-1 text-caption font-medium text-ink-strong">
                    {a.world === "pool" ? th("seasonPool") : th("seasonGarden")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                  <span className="inline-flex items-center gap-3 text-caption">
                    <time dateTime={a.publishedAt}>{formatDayMonthYear(a.publishedAt, locale)}</time>
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden className="size-3.5" />
                      {t("readingTime", { count: a.readingMinutes })}
                    </span>
                  </span>
                  <h2 className={i === 0 ? "text-h2" : "text-h3"}>
                    <Link href={routes.guide(a.slug)} className="text-ink-strong outline-none after:absolute after:inset-0">
                      {localize(a.title, locale)}
                    </Link>
                  </h2>
                  <p className="text-body">{localize(a.excerpt, locale)}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-(--link)">
                    {t("readMore")}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
