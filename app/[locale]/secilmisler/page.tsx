import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FavoritesView } from "@/components/cart/FavoritesView";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("favoritesTitle"), robots: { index: false, follow: false } };
}

export default async function FavoritesPage() {
  const t = await getTranslations("Pages");
  return (
    <main id="main">
      <PageHeader title={t("favoritesTitle")} lead={t("favoritesLead")} crumbs={[{ label: t("favoritesTitle") }]} />
      <Section spacing="none" className="pb-section-sm">
        <Container>
          <FavoritesView />
        </Container>
      </Section>
    </main>
  );
}
