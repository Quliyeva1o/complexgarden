import { MessageCircle, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { siteConfig } from "@/config/site";
import type { InfoPage } from "@/data/pages";
import type { Locale } from "@/i18n/routing";
import { fillContent } from "@/lib/content";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

const headerImage: Record<InfoPage["slug"], Parameters<typeof img>[0]> = {
  about: "houseGarden",
  delivery: "fields",
  returns: "technicianTools",
};

/** Haqqımızda / Çatdırılma / Qaytarma — eyni şablon: bölmə başlığı solda, mətn sağda, yanda əlaqə kartı */
export async function InfoPageView({ slug }: { slug: InfoPage["slug"] }) {
  const page = await catalog.getInfoPage(slug);
  if (!page) notFound();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Pages");
  const title = localize(page.title, locale);

  return (
    <main id="main">
      <PageHeader title={title} lead={fillContent(localize(page.lead, locale))} crumbs={[{ label: title }]} world="garden" image={img(headerImage[slug])} />

      <Section spacing="none" className="pb-section-sm">
        <Container className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div className="flex flex-col">
            {page.sections.map((section) => (
              <section key={section.title.az} className="grid gap-3 border-t border-border py-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-10">
                <h2 className="text-h3">{localize(section.title, locale)}</h2>
                <div className="flex max-w-prose flex-col gap-4">
                  {section.body.map((p) => (
                    <p key={p.az} className="text-body">
                      {fillContent(localize(p, locale))}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-hero border border-border bg-surface p-6 lg:sticky lg:top-44">
            <h2 className="text-h4">{t("faqLead")}</h2>
            <a href={siteConfig.phoneHref} className="inline-flex items-center gap-3 text-body font-medium text-ink-strong hover:text-(--link)">
              <Phone aria-hidden className="size-4.5 text-primary" />
              {siteConfig.phone}
            </a>
            <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-body font-medium text-ink-strong hover:text-(--link)">
              <MessageCircle aria-hidden className="size-4.5 text-primary" />
              {t("contactWhatsapp")}
            </a>
            <p className="text-caption">
              {t("contactHours")}: {siteConfig.workingHours.weekdays}
            </p>
          </aside>
        </Container>
      </Section>
    </main>
  );
}
