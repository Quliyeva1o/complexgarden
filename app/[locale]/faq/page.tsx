import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { fillContent } from "@/lib/content";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("faqTitle"), description: t("faqLead") };
}

export default async function FaqPage() {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const groups = await catalog.getFaq();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((i) => ({
        "@type": "Question",
        name: fillContent(localize(i.q, locale)),
        acceptedAnswer: { "@type": "Answer", text: fillContent(localize(i.a, locale)) },
      })),
    ),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title={t("faqTitle")} lead={t("faqLead")} crumbs={[{ label: t("faqTitle") }]}>
        <nav aria-label={t("faqTitle")} className="flex flex-wrap gap-2 pt-2">
          {groups.map((g, gi) => (
            <a key={g.title.az} href={`#faq-${gi}`} className="inline-flex h-10 items-center rounded-pill border border-ink-strong/15 px-4 text-small font-medium text-ink-strong hover:border-ink-strong">
              {localize(g.title, locale)}
            </a>
          ))}
        </nav>
      </PageHeader>

      <Section spacing="none" className="pb-section-sm">
        <Container className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div className="flex flex-col gap-12">
            {groups.map((g, gi) => (
              <section key={g.title.az} id={`faq-${gi}`} aria-labelledby={`faq-${gi}-title`} className="scroll-mt-44">
                <h2 id={`faq-${gi}-title`} className="mb-2 text-h3">
                  {localize(g.title, locale)}
                </h2>
                <Accordion
                  items={g.items.map((item, i) => ({
                    id: `${gi}-${i}`,
                    title: fillContent(localize(item.q, locale)),
                    content: fillContent(localize(item.a, locale)),
                  }))}
                />
              </section>
            ))}
          </div>
          <aside className="on-dark flex flex-col gap-4 self-start rounded-hero bg-primary p-6 lg:sticky lg:top-44">
            <p className="text-h4 text-white">{t("faqLead")}</p>
            <Button href={`https://wa.me/${siteConfig.whatsapp}`} external variant="fresh" arrow className="justify-between">
              <MessageCircle aria-hidden />
              WhatsApp
            </Button>
            <a href={siteConfig.phoneHref} className="text-body font-medium hover:text-white">
              {siteConfig.phone}
            </a>
          </aside>
        </Container>
      </Section>
    </main>
  );
}
