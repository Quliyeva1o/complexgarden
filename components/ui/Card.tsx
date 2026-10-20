import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Kart: istinadlardakı kimi əsasən nazik çərçivə ilə ayrılır, kölgə yalnız hover-də görünür.
 */
export const cardVariants = cva("relative rounded-card", {
  variants: {
    tone: {
      surface: "border border-border bg-surface",
      pool: "world-pool bg-pool",
      garden: "world-garden bg-garden",
      /** Fonu olmayan, yalnız çərçivə — krem fon üzərində */
      outline: "border border-border bg-transparent",
    },
    padding: {
      default: "p-card",
      /** Şəkil kartın içində boşluqla yerləşir (Plantiva məhsul kartı) */
      inset: "p-2.5",
      none: "",
    },
    /** Hover-də kart 2px qalxır və yumşaq kölgə alır; içindəki link fokusda olanda halqa kartın özündə görünür */
    interactive: {
      true: [
        "transition-[box-shadow,transform,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-ink-strong/15 hover:shadow-card-hover",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-(--focus-ring)",
        "outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
      ],
      false: "",
    },
  },
  defaultVariants: { tone: "surface", padding: "default", interactive: false },
});

type CardProps = ComponentPropsWithoutRef<"div"> & VariantProps<typeof cardVariants>;

export function Card({ tone, padding, interactive, className, ...props }: CardProps) {
  return <div className={cn(cardVariants({ tone, padding, interactive }), className)} {...props} />;
}
