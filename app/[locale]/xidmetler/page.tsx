import { ArrowUpRight, Check, Repeat } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ServiceRequest } from "@/components/home/ServiceRequest";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { serviceIcons } from "@/lib/service-icons";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ path: routes.services, locale, title: t("servicesTitle"), description: t("servicesLead") });
}

export default async function ServicesPage() {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const services = await catalog.getServices();

  return (
    <main id="main">
      <PageHeader title={t("servicesTitle")} lead={t("servicesLead")} crumbs={[{ label: t("servicesTitle") }]} world="garden" image={img("planting")} />

      <Section spacing="none" className="pb-section-sm">
        <Container>
          <ul className="grid gap-grid md:grid-cols-2">
            {services.map((s) => {
              const Icon = serviceIcons[s.icon];
              return (
                <li key={s.slug} className="group relative flex flex-col overflow-hidden rounded-hero border border-border bg-surface p-2.5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-(--focus-ring)">
                  <div className="relative aspect-16/9 overflow-hidden rounded-card bg-garden">
                    <Image src={img(s.image)} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-103" />
                    {s.recurring && (
                      <Badge variant="subscription" className="absolute top-3 left-3">
                        <Repeat aria-hidden />
                        {t("recurring")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-fresh text-on-fresh">
                        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-right">
                        <span className="block font-heading text-h3 text-ink-strong">{t("priceFrom", { price: s.priceFrom })}</span>
                        <span className="text-caption">{t("perUnit", { unit: localize(s.priceUnit, locale) })}</span>
                      </span>
                    </div>
                    <h2 className="text-h3">
                      <Link href={routes.service(s.slug)} className="text-ink-strong outline-none after:absolute after:inset-0">
                        {localize(s.name, locale)}
                      </Link>
                    </h2>
                    <p className="text-body">{localize(s.summary, locale)}</p>
                    <ul className="flex flex-col gap-2">
                      {s.includes.slice(0, 3).map((inc) => (
                        <li key={inc.az} className="flex items-start gap-2 text-small">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                          {localize(inc, locale)}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-(--link)">
                      {t("details")}
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <ServiceRequest />
    </main>
  );
}
