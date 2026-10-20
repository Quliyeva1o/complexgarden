import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export type Crumb = { label: string; href?: string };

/** Breadcrumb + schema.org BreadcrumbList (JSON-LD). Son element cari səhifədir (link deyil). */
export async function Breadcrumbs({ items, locale }: { items: Crumb[]; locale: string }) {
  const t = await getTranslations("Catalog");
  const all: Crumb[] = [{ label: t("home"), href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href && { item: `${siteConfig.url}/${locale}${c.href === "/" ? "" : c.href}` }),
    })),
  };

  return (
    <nav aria-label={t("breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-1.5 text-small">
        {all.map((c, i) => (
          <li key={c.label} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-ink-muted" />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="text-ink-muted hover:text-ink-strong">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink-strong">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
