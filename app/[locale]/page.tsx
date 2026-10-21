import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { Bestsellers } from "@/components/home/Bestsellers";
import { CampaignBanner } from "@/components/home/CampaignBanner";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { Hero } from "@/components/home/Hero";
import { SeasonalGuide } from "@/components/home/SeasonalGuide";
import { ServiceRequest } from "@/components/home/ServiceRequest";
import { Subscriptions } from "@/components/home/Subscriptions";
import { WhyUs } from "@/components/home/WhyUs";
import { Works } from "@/components/home/Works";
import { WorldBanners } from "@/components/home/WorldBanners";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Metadata");
  const title = t("title", { brand: siteConfig.name });
  const meta = pageMetadata({ path: "/", locale, title, description: t("description") });
  // Ana səhifədə şablon ("… — BRAND") tətbiq olunmur — başlıq artıq brendlə başlayır
  return { ...meta, title: { absolute: title }, openGraph: { ...meta.openGraph, title } };
}

/**
 * Ana səhifə — spesifikasiyadakı 10 bölmə bu ardıcıllıqla:
 * 1 Hero · 2 Bölməni seçin · 3 İki dünya · 4 Bestsellerlər · 5 Kampaniya ·
 * 6 Abunə · 7 Bu ay nə etməli · 8 Niyə biz · 9 Əvvəl/sonra + rəylər · 10 Xidmət sorğusu
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <CategoryStrip />
      <WorldBanners />
      <Bestsellers />
      <CampaignBanner />
      <Subscriptions />
      <SeasonalGuide />
      <WhyUs />
      <Works />
      <ServiceRequest />
    </main>
  );
}
