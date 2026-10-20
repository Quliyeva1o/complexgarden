import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Kiçik, demək olar düzbucaqlı nişan (Plantiva "Sale!" ruhu) — pill deyil, ki, düymə ilə qarışmasın */
export const badgeVariants = cva(
  [
    "inline-flex h-6 items-center gap-1 rounded-tag px-2 text-caption font-medium leading-none",
    "transition-[background-color,box-shadow,color] duration-300 ease-out",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // --color-fresh yalnız aksentdir — endirim nişanı onun əsas yeridir
        sale: "bg-fresh text-on-fresh",
        new: "bg-primary text-on-primary",
        subscription: "bg-surface text-secondary ring-1 ring-secondary/25 ring-inset",
        bestseller: "bg-ink-strong text-page",
        pool: "bg-pool text-secondary",
        garden: "bg-garden text-primary",
      },
      /** Klikləmək mümkün olan nişan (filtr teqi kimi) — hover/focus vəziyyəti ilə */
      interactive: {
        true: [
          "cursor-pointer outline-none hover:shadow-float",
          "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-page)",
        ],
        false: "",
      },
    },
    defaultVariants: { variant: "garden", interactive: false },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

type BadgeProps = ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ variant, interactive, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, interactive }), className)} {...props} />;
}
