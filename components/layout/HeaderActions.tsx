"use client";

import { Heart, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { selectCartCount, useCart } from "@/lib/store/cart";
import { useFavorites } from "@/lib/store/favorites";
import { useHydrated } from "@/lib/store/use-hydrated";
import { cn } from "@/lib/utils";

const iconLink = cn(
  "relative inline-flex size-11 items-center justify-center rounded-pill text-ink-strong",
  "transition-colors duration-300 ease-out hover:bg-ink-strong/6 outline-none",
  "focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
);

/** Sayğac nişanı — 0 olanda gizlidir */
function CountDot({ count, tone = "dark" }: { count: number; tone?: "dark" | "light" }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1 text-caption font-semibold tabular-nums",
        tone === "dark" ? "bg-primary text-on-primary" : "bg-fresh text-on-fresh",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Səbət sayı (hidratasiyadan sonra) — header, alt panel və mobil menyu üçün */
export function useCounts() {
  const hydrated = useHydrated();
  const cart = useCart(selectCartCount);
  const favorites = useFavorites((s) => s.slugs.length);
  return { cart: hydrated ? cart : 0, favorites: hydrated ? favorites : 0 };
}

/** Desktop: seçilmişlər + hesab ikonları və lime "Səbət" pill-i (Farmio CTA ruhu) */
export function HeaderActions() {
  const t = useTranslations("Header");
  const counts = useCounts();

  return (
    <div className="flex items-center gap-1">
      <Link href={routes.favorites} className={cn(iconLink, "hidden md:inline-flex")} aria-label={t("favoritesCount", { count: counts.favorites })}>
        <Heart aria-hidden className="size-5" strokeWidth={1.75} />
        <CountDot count={counts.favorites} />
      </Link>
      <Link href={routes.account} className={cn(iconLink, "hidden md:inline-flex")} aria-label={t("account")}>
        <User aria-hidden className="size-5" strokeWidth={1.75} />
      </Link>

      {/* Mobil: yalnız ikon */}
      <Link href={routes.cart} className={cn(iconLink, "md:hidden")} aria-label={t("cartCount", { count: counts.cart })}>
        <ShoppingBag aria-hidden className="size-5" strokeWidth={1.75} />
        <CountDot count={counts.cart} />
      </Link>

      {/* Desktop: lime pill, sağda tünd dairədə say */}
      <Link
        href={routes.cart}
        aria-label={t("cartCount", { count: counts.cart })}
        className={cn(
          "ml-2 hidden h-12 items-center gap-3 rounded-pill bg-fresh pr-1.5 pl-5 font-medium text-on-fresh md:inline-flex",
          "transition-colors duration-300 ease-out hover:bg-fresh-hover outline-none",
          "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2",
        )}
      >
        <ShoppingBag aria-hidden className="size-4.5" strokeWidth={1.75} />
        {t("cart")}
        <span className="inline-flex size-9 items-center justify-center rounded-pill bg-primary text-small font-semibold text-on-primary tabular-nums">
          {counts.cart}
        </span>
      </Link>
    </div>
  );
}
