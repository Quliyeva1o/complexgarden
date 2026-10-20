"use client";

import { Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { formatAzn } from "@/components/ui/Price";
import { siteConfig } from "@/config/site";
import type { CartTotals } from "@/lib/cart/pricing";

/** Pulsuz çatdırılma proqresi — həddə qalan məbləğ və zolaq */
export function FreeDeliveryProgress({ totals }: { totals: CartTotals }) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const progress = Math.min(100, (totals.subtotal / siteConfig.freeDeliveryThreshold) * 100);
  const reached = totals.toFreeDelivery === 0;

  return (
    <div className="flex flex-col gap-2 rounded-media bg-garden p-4">
      <p className="inline-flex items-center gap-2 text-small font-medium text-ink-strong">
        <Truck aria-hidden className="size-4 text-primary" />
        {reached ? t("freeReached") : t("freeLeft", { amount: formatAzn(totals.toFreeDelivery, locale) })}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={siteConfig.freeDeliveryThreshold}
        aria-valuenow={Math.min(totals.subtotal, siteConfig.freeDeliveryThreshold)}
        aria-label={t("delivery")}
        className="h-2 overflow-hidden rounded-pill bg-surface"
      >
        <div className="h-full rounded-pill bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

/** Sifarişin xülasəsi: məhsullar, qənaət, çatdırılma, cəmi + altda istənilən əməliyyat (düymə) */
export function CartSummary({ totals, children }: { totals: CartTotals; children?: ReactNode }) {
  const t = useTranslations("Cart");
  const locale = useLocale();

  const row = (label: string, value: string, strong = false) => (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "text-body font-medium text-ink-strong" : "text-body text-ink"}>{label}</dt>
      <dd className={strong ? "font-heading text-h3 text-ink-strong tabular-nums" : "text-body font-medium text-ink-strong tabular-nums"}>{value}</dd>
    </div>
  );

  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-5 rounded-hero border border-border bg-surface p-6">
      <h2 id="summary-title" className="text-h4">
        {t("summary")}
      </h2>
      <FreeDeliveryProgress totals={totals} />
      <dl className="flex flex-col gap-3">
        {row(t("subtotal"), formatAzn(totals.subtotal, locale))}
        {totals.savings > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-body text-ink">{t("savings")}</dt>
            <dd className="text-body font-medium text-success tabular-nums">−{formatAzn(totals.savings, locale)}</dd>
          </div>
        )}
        {row(t("delivery"), totals.deliveryFee === 0 ? t("deliveryFree") : formatAzn(totals.deliveryFee, locale))}
        <div className="border-t border-border pt-3">{row(t("total"), formatAzn(totals.total, locale), true)}</div>
      </dl>
      {children}
    </section>
  );
}
