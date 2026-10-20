"use client";

import { ArrowUpRight, ChevronDown, Percent, Repeat } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavCampaign, NavCategory, NavLink } from "./types";

type MegaMenuProps = {
  categories: NavCategory[];
  links: NavLink[];
  campaign?: NavCampaign;
};

const pillLink = cn(
  "inline-flex h-10 items-center gap-1.5 rounded-pill px-4 text-small font-medium whitespace-nowrap xl:px-5",
  "transition-colors duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-fresh",
);

/**
 * Desktop kateqoriya menyusu (Growvi tünd pill ruhu) + mega panel.
 * Hover-də kiçik gecikmə ilə açılır; klik və klaviatura (Enter/Space, Esc) ilə də işləyir.
 */
export function MegaMenu({ categories, links, campaign }: MegaMenuProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});

  const schedule = (slug: string | null, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(slug), delay);
  };

  // Səhifə dəyişəndə paneli bağla
  useEffect(() => {
    clearTimeout(timer.current);
    const id = setTimeout(() => setOpen(null), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggers.current[open]?.focus();
        setOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = categories.find((c) => c.slug === open);

  return (
    <nav
      aria-label={t("categoriesNav")}
      className="relative"
      onPointerLeave={() => schedule(null, 180)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
      }}
    >
      <div className="flex items-center gap-1 rounded-pill bg-primary p-1.5">
        <ul className="flex min-w-0 items-center gap-0.5">
          {categories.map((c) => {
            const isOpen = open === c.slug;
            return (
              <li key={c.slug}>
                <button
                  ref={(el) => {
                    triggers.current[c.slug] = el;
                  }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls="mega-panel"
                  onClick={() => setOpen(isOpen ? null : c.slug)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && schedule(c.slug, open ? 0 : 120)}
                  className={cn(
                    pillLink,
                    isOpen ? "bg-page text-ink-strong" : "text-white/85 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {c.shortName}
                  <ChevronDown
                    aria-hidden
                    className={cn("size-3.5 transition-transform duration-300 ease-out", isOpen && "rotate-180")}
                  />
                </button>
              </li>
            );
          })}
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onPointerEnter={() => schedule(null, 120)}
                className={cn(pillLink, "text-white/85 hover:bg-white/10 hover:text-white")}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={routes.campaigns}
          onPointerEnter={() => schedule(null, 120)}
          className={cn(pillLink, "ml-auto bg-fresh text-on-fresh hover:bg-fresh-hover focus-visible:ring-white")}
        >
          <Percent aria-hidden className="size-4" />
          {t("campaigns")}
        </Link>
      </div>

      <div
        id="mega-panel"
        hidden={!active}
        onPointerEnter={() => clearTimeout(timer.current)}
        className="absolute inset-x-0 top-full z-50 pt-2"
      >
        {active && (
          <div className={cn("grid grid-cols-[1fr_18rem] gap-8 rounded-card border border-border bg-surface p-8 shadow-card-hover", active.world === "pool" ? "world-pool" : "world-garden")}>
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex max-w-xl flex-col gap-2">
                  <Eyebrow>{active.name}</Eyebrow>
                  <p className="text-small text-ink-muted">{active.description}</p>
                </div>
                <Button href={routes.category(active.slug)} variant="outline" size="sm" arrow onClick={() => setOpen(null)}>
                  {t("viewAll", { name: active.shortName.toLocaleLowerCase() })}
                </Button>
              </div>
              <ul className="grid grid-cols-2 gap-x-8 border-t border-border pt-2 lg:grid-cols-3">
                {active.subcategories.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={routes.category(active.slug, s.slug)}
                      onClick={() => setOpen(null)}
                      className="group/sub flex items-center justify-between gap-3 border-b border-border py-3.5 text-body text-ink-strong outline-none hover:text-(--link) focus-visible:text-(--link)"
                    >
                      <span className="inline-flex items-center gap-2">
                        {s.name}
                        {s.recurring && <Repeat aria-label={t("subscriptions")} className="size-3.5 text-secondary" />}
                      </span>
                      <ArrowUpRight aria-hidden className="size-4 opacity-0 transition-opacity duration-300 group-hover/sub:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {campaign && (
              <Link
                href={routes.campaigns}
                onClick={() => setOpen(null)}
                className="group/camp on-dark flex flex-col overflow-hidden rounded-media bg-primary outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
              >
                <span className="relative block aspect-4/3 overflow-hidden">
                  <Image src={campaign.image} alt="" fill sizes="288px" className="object-cover transition-transform duration-500 ease-out group-hover/camp:scale-105" />
                  <Badge variant="sale" className="absolute top-3 left-3">−{campaign.discountPercent}%</Badge>
                </span>
                <span className="flex flex-1 flex-col gap-3 p-5">
                  <span className="text-h4 text-white">{campaign.title}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-small font-medium text-(--link)">
                    {t("campaignCta")}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover/camp:rotate-45" />
                  </span>
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
