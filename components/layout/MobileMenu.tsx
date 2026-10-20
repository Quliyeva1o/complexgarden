"use client";

import { ChevronDown, Menu, MessageCircle, Percent, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { Sheet } from "./Sheet";
import type { NavCategory, NavLink } from "./types";

/** Header-dəki lime kvadrat menyu düyməsi (Growvi mobil ruhu) — yalnız mobil/planşet */
export function MenuButton() {
  const t = useTranslations("Header");
  const setMenuOpen = useUi((s) => s.setMenuOpen);
  return (
    <button
      type="button"
      onClick={() => setMenuOpen(true)}
      aria-label={t("openMenu")}
      aria-haspopup="dialog"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-media bg-fresh text-on-fresh outline-none hover:bg-fresh-hover focus-visible:ring-2 focus-visible:ring-(--focus-ring) lg:hidden"
    >
      <Menu aria-hidden className="size-5" />
    </button>
  );
}

/** Mobil menyu: bölmələr akkordeon kimi, xidmətlər, kampaniyalar, əlaqə və dil */
export function MobileMenu({ categories, links }: { categories: NavCategory[]; links: NavLink[] }) {
  const t = useTranslations("Header");
  const tc = useTranslations("Common");
  const open = useUi((s) => s.menuOpen);
  const setMenuOpen = useUi((s) => s.setMenuOpen);
  const close = () => setMenuOpen(false);

  return (
    <Sheet open={open} onClose={close} label={t("menu")} closeLabel={t("closeMenu")} header={<Logo />}>
      <nav aria-label={t("mainNav")} className="flex-1 overflow-y-auto px-container-pad pt-4 pb-28">
        <p className="pb-2 text-caption">{t("categoriesNav")}</p>
        <ul className="divide-y divide-border border-y border-border">
          {categories.map((c) => (
            <li key={c.slug}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) [&::-webkit-details-marker]:hidden">
                  <span className={cn("relative size-11 shrink-0 overflow-hidden rounded-pill", c.world === "pool" ? "bg-pool" : "bg-garden")}>
                    <Image src={c.image} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-body font-medium text-ink-strong">{c.name}</span>
                    <span className="text-caption">{tc("products", { count: c.count })}</span>
                  </span>
                  <ChevronDown aria-hidden className="size-4.5 text-ink-muted transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <ul className="pb-3 pl-14">
                  <li>
                    <Link href={routes.category(c.slug)} onClick={close} className="block py-2 text-body font-medium text-(--link)">
                      {t("viewAll", { name: c.shortName.toLocaleLowerCase() })}
                    </Link>
                  </li>
                  {c.subcategories.map((s) => (
                    <li key={s.slug}>
                      <Link href={routes.category(c.slug, s.slug)} onClick={close} className="block py-2 text-body text-ink-strong">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={close} className="flex h-12 items-center text-h4 text-ink-strong">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href={routes.campaigns} onClick={close} className="mt-2 inline-flex h-11 items-center gap-2 rounded-pill bg-fresh px-5 font-medium text-on-fresh">
              <Percent aria-hidden className="size-4" />
              {t("campaigns")}
            </Link>
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-4 rounded-card border border-border bg-surface p-card">
          <a href={siteConfig.phoneHref} className="inline-flex items-center gap-3 text-body font-medium text-ink-strong">
            <Phone aria-hidden className="size-4.5 text-primary" />
            {siteConfig.phone}
          </a>
          <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-body font-medium text-ink-strong">
            <MessageCircle aria-hidden className="size-4.5 text-primary" />
            {t("whatsapp")}
          </a>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-small text-ink-muted">{t("language")}</span>
            <LocaleSwitcher tone="light" />
          </div>
        </div>
      </nav>
    </Sheet>
  );
}

/** Mobil axtarış pəncərəsi — alt paneldəki "Axtarış" düyməsi açır */
export function MobileSearch() {
  const t = useTranslations("Header");
  const open = useUi((s) => s.searchOpen);
  const setSearchOpen = useUi((s) => s.setSearchOpen);

  return (
    <Sheet open={open} onClose={() => setSearchOpen(false)} label={t("search")} closeLabel={t("closeMenu")} variant="top">
      <div className="pt-2">{open && <SearchBox autoFocus inline onNavigate={() => setSearchOpen(false)} />}</div>
    </Sheet>
  );
}
