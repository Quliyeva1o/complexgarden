import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Subscriptions } from "@/components/home/Subscriptions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { fillContent } from "@/lib/content";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("subsTitle"), description: t("subsLead", { discount: siteConfig.subscriptionDiscountPercent }) };
}

export default async function SubscriptionsPage() {
  const t = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const faq = await catalog.getFaq();
  // FAQ-dan yalnız abunə qrupu (data/pages.ts-də 3-cü qrup)
  const subFaq = faq.find((g) => g.title.az === "Abunə");

  return (
    <main id="main">
      <PageHeader
        title={t("subsTitle")}
        lead={t("subsLead", { discount: siteConfig.subscriptionDiscountPercent })}
        crumbs={[{ label: t("subsTitle") }]}
        world="pool"
        image={img("poolWater")}
      />

      <Subscriptions cta="whatsapp" showHeading={false} />

      <Section background="surface" spacing="sm">
        <Container>
          <SectionHeading title={t("howTitle")} />
          <ProcessSteps
            steps={[
              { title: t("how1Title"), text: t("how1Text") },
              { title: t("how2Title"), text: t("how2Text") },
              { title: t("how3Title"), text: t("how3Text") },
            ]}
          />
        </Container>
      </Section>

      {subFaq && (
        <Section spacing="sm">
          <Container className="max-w-3xl">
            <SectionHeading title={t("faqTitle")} />
            <Accordion
              defaultOpen="sub-0"
              items={subFaq.items.map((item, i) => ({
                id: `sub-${i}`,
                title: fillContent(localize(item.q, locale)),
                content: fillContent(localize(item.a, locale)),
              }))}
            />
          </Container>
        </Section>
      )}
    </main>
  );
}
