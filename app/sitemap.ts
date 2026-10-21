import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { routing } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

/** Bütün indekslənən səhifələr, hər biri 3 dildə alternates ilə (sebet, sifaris, axtaris, hesab daxil deyil) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, services, articles] = await Promise.all([
    catalog.getCategories(),
    catalog.getProducts(),
    catalog.getServices(),
    catalog.getArticles(),
  ]);

  const entries: { path: string; priority: number; lastModified?: string }[] = [
    { path: routes.home, priority: 1 },
    ...categories.map((c) => ({ path: routes.category(c.slug), priority: 0.9 })),
    ...products.map((p) => ({ path: routes.product(p.slug), priority: 0.8, lastModified: p.createdAt })),
    { path: routes.services, priority: 0.7 },
    ...services.map((s) => ({ path: routes.service(s.slug), priority: 0.6 })),
    { path: routes.subscriptions, priority: 0.7 },
    { path: routes.campaigns, priority: 0.6 },
    { path: routes.guides, priority: 0.5 },
    ...articles.map((a) => ({ path: routes.guide(a.slug), priority: 0.5, lastModified: a.publishedAt })),
    ...[routes.about, routes.delivery, routes.returns, routes.faq, routes.contact].map((path) => ({ path, priority: 0.3 })),
  ];

  return entries.flatMap(({ path, priority, lastModified }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(path, locale),
      ...(lastModified && { lastModified }),
      priority,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(path, l)])) },
    })),
  );
}
