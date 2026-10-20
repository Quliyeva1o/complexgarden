import { MessageCircle, Phone, Truck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { HeaderActions } from "./HeaderActions";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { MenuButton, MobileMenu, MobileSearch } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import { StickyHeader } from "./StickyHeader";
import type { NavCampaign, NavCategory, NavLink } from "./types";

/** Header üçün kateqoriya, link və kampaniya məlumatını hazırlayır (footer də istifadə edir) */
export async function getNavData() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Header");
  const [categories, counts, campaigns] = await Promise.all([
    catalog.getCategories(),
    catalog.getProductCounts(),
    catalog.getCampaigns(),
  ]);

  const navCategories: NavCategory[] = categories.map((c) => ({
    slug: c.slug,
    name: localize(c.name, locale),
    shortName: localize(c.shortName ?? c.name, locale),
    description: localize(c.description, locale),
    world: c.world,
    image: img(c.image),
    count: counts[c.slug] ?? 0,
    subcategories: c.subcategories
      .filter((s) => s.active !== false)
      .map((s) => ({ slug: s.slug, name: localize(s.name, locale), recurring: Boolean(s.recurring) })),
  }));

  const links: NavLink[] = [
    { href: routes.services, label: t("services") },
    { href: routes.subscriptions, label: t("subscriptions") },
  ];

  const first = campaigns[0];
  const campaign: NavCampaign | undefined = first && {
    title: localize(first.title, locale),
    discountPercent: first.discountPercent,
    image: img(first.image),
  };

  return { categories: navCategories, links, campaign };
}

export async function Header() {
  const t = await getTranslations("Header");
  const { categories, links, campaign } = await getNavData();

  return (
    <>
      {/* 1. Üst zolaq — sürüşəndə yuxarıda qalmır */}
      <div className="on-dark bg-primary text-white">
        <Container className="flex h-10 items-center justify-center gap-6 text-small lg:justify-between">
          <p className="inline-flex items-center gap-2 truncate">
            <Truck aria-hidden className="size-4 shrink-0 text-(--link)" />
            <span className="sm:hidden">{t("freeDeliveryShort", { amount: siteConfig.freeDeliveryThreshold })}</span>
            <span className="hidden sm:inline">{t("freeDelivery", { amount: siteConfig.freeDeliveryThreshold })}</span>
          </p>
          <div className="hidden items-center gap-5 lg:flex">
            <a href={siteConfig.phoneHref} className="inline-flex items-center gap-1.5 text-white/85 hover:text-white">
              <Phone aria-hidden className="size-3.5" />
              {siteConfig.phone}
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/85 hover:text-white"
            >
              <MessageCircle aria-hidden className="size-3.5" />
              {t("whatsapp")}
            </a>
            <span aria-hidden className="h-4 w-px bg-white/20" />
            <LocaleSwitcher tone="dark" />
          </div>
        </Container>
      </div>

      {/* 2–4. Yapışqan hissə: ağ kapsul (Farmio) + tünd kateqoriya pill-i (Growvi) */}
      <StickyHeader className="pt-3">
        <Container>
          <div className="relative z-20 flex h-16 items-center gap-3 rounded-pill border border-border bg-surface/95 pr-2 pl-2 backdrop-blur transition-[height,box-shadow] duration-300 ease-out group-data-scrolled/header:shadow-float sm:pl-5 lg:h-18 lg:gap-6 lg:pr-2.5 lg:group-data-scrolled/header:h-16">
            <MenuButton />
            <Logo />
            <SearchBox className="ml-auto hidden max-w-xl flex-1 md:block" />
            <div className="ml-auto md:ml-0">
              <HeaderActions />
            </div>
          </div>

          <div className="mt-2 hidden lg:block">
            <MegaMenu categories={categories} links={links} campaign={campaign} />
          </div>
        </Container>
      </StickyHeader>

      <MobileMenu categories={categories} links={links} />
      <MobileSearch />
    </>
  );
}
