"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { formatAzn } from "@/components/ui/Price";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useProductsBySlugs } from "@/lib/cart/use-products";
import { useFavorites } from "@/lib/store/favorites";
import { useHydrated } from "@/lib/store/use-hydrated";
import { cn } from "@/lib/utils";
import { CartSkeleton } from "./CartView";

/** Seçilmişlər — localStorage-dakı slug-lar üzrə aktual məhsullar, ProductCard ilə eyni vizual dil */
export function FavoritesView() {
  const t = useTranslations("Pages");
  const tp = useTranslations("Product");
  const locale = useLocale();
  const hydrated = useHydrated();
  const slugs = useFavorites((s) => s.slugs);
  const { products, ready, empty } = useProductsBySlugs(slugs, hydrated);

  if (!ready) return <CartSkeleton />;

  if (empty || products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-hero border border-dashed border-ink-strong/20 px-6 py-20 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-pill bg-garden text-primary">
          <Heart aria-hidden className="size-7" strokeWidth={1.5} />
        </span>
        <h2 className="text-h3">{t("favoritesEmpty")}</h2>
        <p className="max-w-md text-body">{t("favoritesEmptyText")}</p>
        <Button href={routes.search()} arrow className="mt-2">
          {t("favoritesCta")}
        </Button>
      </div>
    );
  }

  // Seçilmə sırası saxlanılsın (sonuncu əlavə olunan sonda)
  const ordered = slugs.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);

  return (
    <ul className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4">
      {ordered.map((p) => (
        <li key={p.slug} className="group relative flex flex-col rounded-card border border-border bg-surface p-2.5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
          <div className={cn("relative aspect-square overflow-hidden rounded-media", p.world === "pool" ? "bg-pool" : "bg-garden")}>
            <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-103" />
            <FavoriteButton slug={p.slug} productName={p.name} className="absolute top-2 right-2" />
          </div>
          <div className="flex flex-1 flex-col px-2 pt-4 pb-1.5 sm:px-3">
            <span className="text-caption">{p.category}</span>
            <h2 className="mt-1 text-h4">
              <Link href={routes.product(p.slug)} className="text-ink-strong outline-none after:absolute after:inset-0 after:rounded-card">
                {p.name}
              </Link>
            </h2>
            <span className="mt-2 text-caption">{p.inStock ? tp("inStock") : tp("onOrder", { days: p.leadTimeDays ?? 0 })}</span>
            <div className="mt-auto flex items-end justify-between gap-2 pt-4">
              <span className="font-heading text-h4 text-ink-strong tabular-nums">{formatAzn(p.price, locale)}</span>
              <AddToCartButton slug={p.slug} productName={p.name} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
