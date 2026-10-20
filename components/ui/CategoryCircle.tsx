import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { World } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryCircleProps = {
  href: string;
  name: string;
  image: string;
  world: World;
  productCount?: number;
  /** Yalnız /design nümayişi üçün */
  forceState?: "hover" | "focus";
  className?: string;
};

/**
 * Ana səhifənin əsas naviqasiyası (Plantiva "Plants For Every Lifestyle" ruhu):
 * dünya rəngində qalın halqa, içində şəkil. Hover-də şəkil böyüyür və halqa tündləşir.
 */
export function CategoryCircle({ href, name, image, world, productCount, forceState, className }: CategoryCircleProps) {
  const t = useTranslations("Common");
  const hovered = forceState === "hover";

  return (
    <Link
      href={href}
      data-force={forceState}
      className={cn(
        "group flex w-32 shrink-0 flex-col items-center gap-3 rounded-card text-center outline-none sm:w-40",
        "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-4 focus-visible:ring-offset-(--bg-page)",
        className,
      )}
    >
      <span
        className={cn(
          "block rounded-pill p-2 transition-colors duration-300 ease-out",
          world === "pool"
            ? cn("bg-pool group-hover:bg-secondary", hovered && "bg-secondary")
            : cn("bg-garden group-hover:bg-primary", hovered && "bg-primary"),
        )}
      >
        <span className="relative block size-28 overflow-hidden rounded-pill sm:size-36">
          <Image
            src={image}
            alt=""
            fill
            sizes="144px"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-110",
              hovered && "scale-110",
            )}
          />
        </span>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-body font-medium text-ink-strong">{name}</span>
        {productCount !== undefined && <span className="text-caption">{t("products", { count: productCount })}</span>}
      </span>
    </Link>
  );
}
