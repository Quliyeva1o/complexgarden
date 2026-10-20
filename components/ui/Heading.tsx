import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type HeadingVisual = "display" | "h1" | "h2" | "h3" | "h4";

const visualClass: Record<HeadingVisual, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

type HeadingProps = ComponentPropsWithoutRef<"h2"> & {
  /** Semantik səviyyə (h1–h4) */
  level?: 1 | 2 | 3 | 4;
  /** Vizual ölçü — semantikadan asılı deyil */
  visual?: HeadingVisual;
};

/** Kart və digər başlıqlar. Ölçü və rəng yalnız tipoqrafiya siniflərindən gəlir. */
export function Heading({ level = 2, visual, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(visualClass[visual ?? (`h${level}` as HeadingVisual)], className)} {...props} />;
}
