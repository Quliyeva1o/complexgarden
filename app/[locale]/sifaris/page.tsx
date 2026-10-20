import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CheckoutView } from "@/components/cart/CheckoutView";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/routes";
import { deliveryDistricts } from "@/data/regions";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function CheckoutPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Checkout");
  const tc = await getTranslations("Cart");

  return (
    <main id="main">
      <Section spacing="none" className="pt-6 pb-section-sm">
        <Container className="flex flex-col gap-6">
          <Breadcrumbs locale={locale} items={[{ label: tc("title"), href: routes.cart }, { label: t("title") }]} />
          <h1 className="text-h1">{t("title")}</h1>
          <CheckoutView districts={deliveryDistricts.map((d) => ({ value: d.slug, label: localize(d.name, locale) }))} />
        </Container>
      </Section>
    </main>
  );
}
