import { Droplets, Leaf, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const FILLED = new Set<LucideIcon>([Leaf, Droplets]);

type EyebrowProps = ComponentPropsWithoutRef<"span"> & {
  /** Standart: yarpaq. `null` → ikonsuz */
  icon?: LucideIcon | null;
};

/**
 * Bölmə başlığı üstündəki çip: qırıq xətli pill + ikon + qısa mətn.
 * İkonun rəngi bölmənin "dünyasından" (pool/garden/dark) gəlir.
 */
export function Eyebrow({ icon: Icon = Leaf, className, children, ...props }: EyebrowProps) {
  return (
    <span className={cn("eyebrow", className)} {...props}>
      {Icon && (
        <Icon
          aria-hidden
          // Yalnız qapalı formalı ikonlar (yarpaq, damla) doldurulur — qalanları xətt kimi qalır
          className={cn("size-3.5", FILLED.has(Icon) && "fill-current")}
          strokeWidth={1.75}
        />
      )}
      {children}
    </span>
  );
}
