import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart");
  // Şəxsi səhifə — indekslənmir
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function CartPage() {
  const locale = await getLocale();
  const t = await getTranslations("Cart");

  return (
    <main id="main">
      <Section spacing="none" className="pt-6 pb-section-sm">
        <Container className="flex flex-col gap-6">
          <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
          <h1 className="text-h1">{t("title")}</h1>
          <CartView />
        </Container>
      </Section>
    </main>
  );
}
