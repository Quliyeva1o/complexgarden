import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";

/** Dil prefiksi olmayan yol → mütləq URL: ("/faq", "ru") → https://example.az/ru/faq */
export function absoluteUrl(path: string, locale: Locale): string {
  return `${siteConfig.url}/${locale}${path === "/" ? "" : path}`;
}

/**
 * canonical + hreflang (az/ru/en + x-default → AZ). Hər indekslənən səhifənin metadata-sına əlavə olunur,
 * əks halda səhifə layout-un alternates-ini (ana səhifənin linklərini) miras alır.
 */
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: absoluteUrl(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(path, l)])),
      "x-default": absoluteUrl(path, routing.defaultLocale),
    },
  };
}

/** Səhifə metadata-sı: başlıq, təsvir, canonical/hreflang və Open Graph bir yerdə */
export function pageMetadata({
  path,
  locale,
  title,
  description,
  image,
  type = "website",
}: {
  path: string;
  locale: Locale;
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: localeAlternates(path, locale),
    openGraph: {
      type,
      title: `${title} — ${siteConfig.name}`,
      description,
      url: absoluteUrl(path, locale),
      siteName: siteConfig.name,
      locale: { az: "az_AZ", ru: "ru_RU", en: "en_US" }[locale],
      images: [image ?? siteConfig.logo.og],
    },
  };
}
