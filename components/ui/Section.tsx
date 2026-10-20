import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const sectionVariants = cva("", {
  variants: {
    spacing: {
      default: "py-section",
      sm: "py-section-sm",
      none: "",
    },
    background: {
      page: "bg-page",
      surface: "bg-surface",
      // world-* sinfi eyebrow və aksent rəngini də "dünyaya" uyğunlaşdırır
      pool: "world-pool bg-pool",
      garden: "world-garden bg-garden",
      dark: "on-dark bg-primary text-ink",
    },
  },
  defaultVariants: { spacing: "default", background: "page" },
});

export type SectionBackground = NonNullable<VariantProps<typeof sectionVariants>["background"]>;

type SectionProps = ComponentPropsWithoutRef<"section"> & VariantProps<typeof sectionVariants>;

/** Bölmə: şaquli boşluq və fon variantı. Boşluqlar yalnız buradan idarə olunur. */
export function Section({ spacing, background, className, ...props }: SectionProps) {
  return <section className={cn(sectionVariants({ spacing, background }), className)} {...props} />;
}
