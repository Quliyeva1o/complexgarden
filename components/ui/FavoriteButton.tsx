"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/store/favorites";
import { useHydrated } from "@/lib/store/use-hydrated";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  slug: string;
  productName: string;
  className?: string;
  "data-force"?: string;
};

export function FavoriteButton({ slug, productName, className, ...rest }: FavoriteButtonProps) {
  const t = useTranslations("Product");
  const hydrated = useHydrated();
  const active = useFavorites((s) => s.slugs.includes(slug)) && hydrated;
  const toggle = useFavorites((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={active}
      aria-label={`${active ? t("favoriteRemove") : t("favoriteAdd")}: ${productName}`}
      className={cn(
        "relative z-10 inline-flex size-9 items-center justify-center rounded-pill bg-surface/90 text-ink-strong backdrop-blur-sm",
        "transition-[color,transform] duration-300 ease-out outline-none hover:text-secondary",
        "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-page)",
        className,
      )}
      {...rest}
    >
      <Heart aria-hidden strokeWidth={1.75} className={cn("size-4", active && "fill-secondary text-secondary")} />
    </button>
  );
}
