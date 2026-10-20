"use client";

import { House, LayoutGrid, Search, ShoppingBag, User, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { routes } from "@/config/routes";
import { Link, usePathname } from "@/i18n/navigation";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import { useCounts } from "./HeaderActions";

const itemClass = (active: boolean) =>
  cn(
    "relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-pill text-caption font-medium outline-none",
    "transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:ring-fresh",
    active ? "bg-fresh text-on-fresh" : "text-white/80 hover:text-white",
  );

function Item({ icon: Icon, label, badge }: { icon: LucideIcon; label: string; badge?: number }) {
  return (
    <>
      <span className="relative">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
        {badge ? (
          <span aria-hidden className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-fresh px-1 text-caption leading-none font-semibold text-on-fresh tabular-nums">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </>
  );
}

/**
 * Mobil alt naviqasiya — ekranın altında üzən tünd pill (Growvi menyusunun mobil davamı).
 * Ana səhifə · Kataloq (menyunu açır) · Axtarış (pəncərə) · Səbət · Hesab
 */
export function BottomNav() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { cart } = useCounts();
  const { menuOpen, searchOpen, setMenuOpen, setSearchOpen } = useUi();

  return (
    <nav
      aria-label={t("mobileNav")}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <ul className="flex items-center gap-1 rounded-pill bg-primary p-1.5 shadow-card-hover">
        <li className="flex flex-1">
          <Link href={routes.home} aria-current={pathname === "/" ? "page" : undefined} className={itemClass(pathname === "/" && !menuOpen && !searchOpen)}>
            <Item icon={House} label={t("home")} />
          </Link>
        </li>
        <li className="flex flex-1">
          <button type="button" aria-haspopup="dialog" onClick={() => setMenuOpen(true)} className={itemClass(menuOpen)}>
            <Item icon={LayoutGrid} label={t("catalog")} />
          </button>
        </li>
        <li className="flex flex-1">
          <button type="button" aria-haspopup="dialog" onClick={() => setSearchOpen(true)} className={itemClass(searchOpen)}>
            <Item icon={Search} label={t("search")} />
          </button>
        </li>
        <li className="flex flex-1">
          <Link
            href={routes.cart}
            aria-label={t("cartCount", { count: cart })}
            aria-current={pathname === routes.cart ? "page" : undefined}
            className={itemClass(pathname === routes.cart)}
          >
            <Item icon={ShoppingBag} label={t("cart")} badge={cart} />
          </Link>
        </li>
        <li className="flex flex-1">
          <Link href={routes.account} aria-current={pathname === routes.account ? "page" : undefined} className={itemClass(pathname === routes.account)}>
            <Item icon={User} label={t("account")} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
