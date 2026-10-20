"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCart, type CartLineOptions } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

type AddToCartButtonProps = {
  slug: string;
  productName: string;
  quantity?: number;
  options?: CartLineOptions;
  /** icon = kartdakı yumru ikon düymə; full = məhsul səhifəsindəki mətnli düymə */
  display?: "icon" | "full";
  className?: string;
  "data-force"?: string;
};

/** Səbətə at. Əlavə olunanda 1.5 san. təsdiq ikonu göstərir və ekran oxuyucuya bildirir. */
export function AddToCartButton({
  slug,
  productName,
  quantity = 1,
  options,
  display = "icon",
  className,
  ...rest
}: AddToCartButtonProps) {
  const t = useTranslations("Product");
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(id);
  }, [added]);

  const Icon = added ? Check : ShoppingBag;
  const label = added ? t("added") : t("addToCart");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          add(slug, quantity, options);
          setAdded(true);
        }}
        aria-label={display === "icon" ? `${t("addToCart")}: ${productName}` : undefined}
        className={cn(
          display === "icon"
            ? // Kartda konturlu dairə — hover-də dolur; əlavə olunanda yaşıl dolu qalır
              cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "size-10 sm:size-11 hover:border-primary hover:bg-primary hover:text-on-primary",
                added && "border-primary bg-primary text-on-primary",
              )
            : buttonVariants({ variant: "primary", size: "lg" }),
          "relative z-10",
          className,
        )}
        {...rest}
      >
        <Icon aria-hidden />
        {display === "full" && label}
      </button>
      <span className="sr-only" role="status">
        {added ? t("addedAnnouncement", { name: productName }) : ""}
      </span>
    </>
  );
}
