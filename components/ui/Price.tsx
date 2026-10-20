import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** AZN məbləğini formatlayır: tam ədəd olduqda qəpiksiz, əks halda 2 rəqəmlə — "1 290 ₼", "12,50 ₼" */
export function formatAzn(amount: number, locale: string): string {
  // Intl əvəzinə deterministik formatlayıcı — server və brauzer eyni nəticəni versin (hidratasiya)
  const number = formatNumber(amount, locale, 2, Number.isInteger(amount) ? 0 : 2);
  return `${number} ₼`;
}

type PriceProps = {
  value: number;
  oldValue?: number;
  /** "/ ay" kimi əlavə */
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Qiymət + üstündən xətt çəkilmiş köhnə qiymət */
export function Price({ value, oldValue, suffix, size = "md", className }: PriceProps) {
  const locale = useLocale();
  const t = useTranslations("Price");
  const sizeClass = { sm: "text-body", md: "text-h4", lg: "text-h2 tracking-tight" }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-heading font-medium text-ink-strong tabular-nums", sizeClass)}>
        {formatAzn(value, locale)}
        {suffix && <span className="text-small font-normal text-ink-muted"> {suffix}</span>}
      </span>
      {oldValue !== undefined && oldValue > value && (
        <span className="text-small text-ink-muted tabular-nums">
          <span className="sr-only">{t("old")} </span>
          <s>{formatAzn(oldValue, locale)}</s>
        </span>
      )}
    </div>
  );
}
