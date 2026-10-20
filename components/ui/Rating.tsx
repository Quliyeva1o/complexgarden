import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type RatingProps = {
  value: number;
  /** Rəy sayı — verilsə yanında göstərilir */
  count?: number;
  size?: "sm" | "md";
  className?: string;
};

/** Ulduz reytinqi (yalnız göstərmə). Yarım ulduz kəsilmiş təbəqə ilə çəkilir. */
export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const t = useTranslations("Rating");
  const iconClass = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}>
      <span className="relative inline-flex" role="img" aria-label={t("label", { value: value.toFixed(1) })}>
        <span className="flex text-border">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} aria-hidden className={cn(iconClass, "fill-current")} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-primary" style={{ width: `${(value / 5) * 100}%` }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} aria-hidden className={cn(iconClass, "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      <span className={cn("text-ink-strong", size === "sm" ? "text-small" : "text-body")}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && <span className="text-small text-ink-muted">({count})</span>}
    </div>
  );
}
