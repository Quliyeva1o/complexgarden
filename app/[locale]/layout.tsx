import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { logoFontVariables } from "@/components/layout/logo-fonts";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { inter, interTight } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale: param } = await params;
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title", { brand: siteConfig.name }), template: `%s — ${siteConfig.name}` },
    description: t("description"),
    openGraph: {
      siteName: siteConfig.name,
      locale: { az: "az_AZ", ru: "ru_RU", en: "en_US" }[locale],
      type: "website",
      images: [{ url: siteConfig.logo.og, width: 1200, height: 630, alt: siteConfig.name }],
    },
    icons: {
      icon: [
        { url: "/icons/favicon.ico", sizes: "any" },
        { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icons/favicon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: { url: "/icons/favicon-180.png", sizes: "180x180" },
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Client-ə yalnız client komponentlərin istifadə etdiyi mətnlər göndərilir (Design və Metadata yalnız serverdə lazımdır)
  const { Design: _design, Metadata: _meta, ...clientMessages } = await getMessages();
  void _design;
  void _meta;

  return (
    <html
      lang={locale}
      data-theme={siteConfig.theme}
      data-logo-font={siteConfig.logo.font}
      className={`${inter.variable} ${interTight.variable} ${logoFontVariables}`}
    >
      <body className="flex min-h-dvh flex-col bg-page text-ink">
        <NextIntlClientProvider messages={clientMessages}>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
