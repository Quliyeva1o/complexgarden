import { Repeat } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { img } from "@/config/images";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Product, World } from "@/lib/types";
import { cn, localize } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { FavoriteButton } from "./FavoriteButton";
import { Price } from "./Price";
import { Rating } from "./Rating";

type ProductCardProps = {
  product: Product;
  /** Kateqoriya etiketi (adın üstündə) */
  categoryName?: string;
  /** Şəkil fonunun rəngi — kateqoriyanın dünyası */
  world?: World;
  /** next/image sizes — şəbəkə sütun sayına uyğun */
  sizes?: string;
  /** Yalnız /design nümayişi üçün: hover/focus vəziyyətini məcburi göstər */
  forceState?: "hover" | "focus";
  className?: string;
};

/**
 * Məhsul kartı (Plantiva / Loree's ruhu): çərçivəli kart, içində boşluqla yerləşən yumru şəkil,
 * kiçik nişanlar, ad, reytinq, qiymət və konturlu "səbətə at" düyməsi.
 * Bütün kart məhsul səhifəsinə linkdir (stretched link), düymələr onun üstündədir.
 */
export function ProductCard({
  product,
  categoryName,
  world = "garden",
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  forceState,
  className,
}: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Product");
  const name = localize(product.name, locale);
  const [first, second] = product.images;
  const hovered = forceState === "hover";
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <Card padding="inset" interactive data-force={forceState} className={cn("group flex flex-col", className)}>
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-media",
          world === "pool" ? "bg-pool" : "bg-garden",
        )}
      >
        <Image
          src={img(first)}
          alt={name}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-103",
            second && "group-hover:opacity-0",
            hovered && "scale-103",
            hovered && second && "opacity-0",
          )}
        />
        {second && (
          <Image
            src={img(second)}
            alt=""
            fill
            sizes={sizes}
            className={cn(
              "scale-103 object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100",
              hovered && "opacity-100",
            )}
          />
        )}

        {/* sağda ürək düyməsi üçün yer saxlanılır */}
        <div className="absolute top-2.5 right-14 left-2.5 flex flex-wrap gap-1">
          {discount !== null && <Badge variant="sale">−{discount}%</Badge>}
          {product.badges?.includes("new") && <Badge variant="new">{t("badgeNew")}</Badge>}
          {product.badges?.includes("subscription") && (
            <Badge variant="subscription">
              <Repeat aria-hidden />
              {t("badgeSubscription")}
            </Badge>
          )}
        </div>
        <FavoriteButton slug={product.slug} productName={name} className="absolute top-2 right-2" />
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1.5 sm:px-3">
        {categoryName && <span className="text-caption">{categoryName}</span>}
        <h3 className="mt-1 text-h4">
          <Link
            href={`/mehsul/${product.slug}`}
            className="text-ink-strong outline-none after:absolute after:inset-0 after:rounded-card"
          >
            {name}
          </Link>
        </h3>
        {product.rating !== undefined && (
          <Rating value={product.rating} count={product.reviewsCount} className="mt-2" />
        )}
        <span className="mt-2 inline-flex items-center gap-1.5 text-caption">
          <span
            aria-hidden
            className={cn("size-1.5 shrink-0 rounded-pill", product.inStock ? "bg-success" : "bg-ink-muted")}
          />
          {product.inStock ? t("inStock") : t("onOrder", { days: product.leadTimeDays ?? 0 })}
        </span>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <Price value={product.price} oldValue={product.oldPrice} className="min-w-0" />
          <AddToCartButton slug={product.slug} productName={name} />
        </div>
      </div>
    </Card>
  );
}
