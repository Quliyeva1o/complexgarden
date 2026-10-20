"use client";

import { Calculator, Minus, Plus, Repeat, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatAzn } from "@/components/ui/Price";
import { siteConfig } from "@/config/site";
import { computeDosage, formatAmount, recommendFrequency, subscriptionFrequencies, type SubscriptionFrequency } from "@/lib/dosage";
import type { Dosage } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductPurchaseProps = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  leadTimeDays?: number;
  subscriptionEligible: boolean;
  dosage?: Dosage;
  /** Əkin (bitki) və ya quraşdırma (avadanlıq) xidməti — qiymət hər ədəd üçün */
  service?: { kind: "planting" | "install"; price: number };
  /** Növə görə statik blok (bitki pasportu, əsas göstəricilər) — serverdə render olunur */
  children?: ReactNode;
};

const frequencyKey = { 14: "every14", 30: "every30", 60: "every60" } as const;

/** Dozaj kalkulyatoru — hovuz həcmi (m³) və ya sahə (m²) daxil edilir */
function DosageCalculator({ dosage, onRecommend }: { dosage: Dosage; onRecommend: (f: SubscriptionFrequency) => void }) {
  const t = useTranslations("ProductPage");
  const locale = useLocale();
  const id = useId();
  const [size, setSize] = useState(dosage.unit === "m3" ? "40" : "100");
  const result = computeDosage(dosage, Number(size.replace(",", ".")));
  const recommended = result ? recommendFrequency(result.lastsDays) : null;

  const lasts =
    result && result.lastsDays > 0
      ? result.lastsDays >= 60
        ? t("calcMonths", { count: Math.round(result.lastsDays / 30) })
        : t("calcWeeks", { count: Math.max(1, Math.round(result.lastsDays / 7)) })
      : t("calcLessThan");

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4 rounded-card bg-pool p-5 world-pool">
      <h2 id={`${id}-title`} className="inline-flex items-center gap-2 text-h4">
        <Calculator aria-hidden className="size-5 text-secondary" />
        {t("calcTitle")}
      </h2>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-small font-medium text-ink-strong">
          {dosage.unit === "m3" ? t("calcVolume") : t("calcArea")}
        </label>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={1}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          aria-describedby={`${id}-hint ${id}-result`}
          className="h-12 w-full rounded-pill border border-ink-strong/12 bg-surface px-5 text-body text-ink-strong tabular-nums outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
        />
        {dosage.unit === "m3" && (
          <span id={`${id}-hint`} className="text-caption">
            {t("calcHint")}
          </span>
        )}
      </div>
      {result && (
        <dl id={`${id}-result`} aria-live="polite" className="grid grid-cols-2 gap-3">
          <div className="rounded-media bg-surface p-3">
            <dt className="text-caption">{t("calcPerUse")}</dt>
            <dd className="font-heading text-h3 text-ink-strong tabular-nums">{formatAmount(result.perUse, dosage.packUnit, locale)}</dd>
            <dd className="text-caption">{t("calcEvery", { days: dosage.intervalDays })}</dd>
          </div>
          <div className="rounded-media bg-surface p-3">
            <dt className="text-caption">{t("calcLasts")}</dt>
            <dd className="font-heading text-h3 text-ink-strong">{lasts}</dd>
          </div>
        </dl>
      )}
      {recommended && result && result.lastsDays > 0 && (
        <button type="button" onClick={() => onRecommend(recommended)} className="w-fit text-left text-small font-medium text-(--link) underline underline-offset-4">
          {t("calcRecommend", { label: t(frequencyKey[recommended]) })}
        </button>
      )}
    </section>
  );
}

export function ProductPurchase({
  slug,
  name,
  price,
  oldPrice,
  inStock,
  leadTimeDays,
  subscriptionEligible,
  dosage,
  service,
  children,
}: ProductPurchaseProps) {
  const t = useTranslations("ProductPage");
  const locale = useLocale();
  const id = useId();
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<"once" | "subscribe">("once");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(30);
  const [withService, setWithService] = useState(false);

  const discount = siteConfig.subscriptionDiscountPercent;
  const subscribed = subscriptionEligible && mode === "subscribe";
  const unit = subscribed ? Math.round(price * (1 - discount / 100) * 100) / 100 : price;
  const serviceCost = service && withService ? service.price : 0;
  const total = (unit + serviceCost) * quantity;

  const serviceLabel = service ? (service.kind === "planting" ? t("plantingService") : t("installService")) : "";
  const options = {
    ...(subscribed && { subscriptionDays: frequency }),
    ...(withService && { service: true }),
  };

  const whatsappText = () =>
    t("whatsappText", {
      name,
      qty: quantity,
      options: [subscribed && t("optSubscription", { days: frequency }), withService && t("optService", { service: serviceLabel.toLocaleLowerCase(locale) })]
        .filter(Boolean)
        .map((s) => `${s}\n`)
        .join(""),
      total: formatAzn(total, locale),
      url: typeof window === "undefined" ? siteConfig.url : window.location.href,
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Qiymət + stok */}
      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-heading text-h1 text-ink-strong tabular-nums">{formatAzn(unit, locale)}</span>
          {(subscribed || (oldPrice && oldPrice > price)) && (
            <s className="text-lead text-ink-muted tabular-nums">{formatAzn(subscribed ? price : (oldPrice ?? price), locale)}</s>
          )}
        </p>
        <p className={cn("inline-flex items-center gap-2 text-small font-medium", inStock ? "text-success" : "text-ink-muted")}>
          <Truck aria-hidden className="size-4" />
          {inStock ? t("inStock") : t("onOrder", { days: leadTimeDays ?? 0 })}
        </p>
      </div>

      {children}

      {dosage && <DosageCalculator dosage={dosage} onRecommend={(f) => { setMode("subscribe"); setFrequency(f); }} />}

      {/* Birdəfəlik / Abunə */}
      {subscriptionEligible && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-small font-medium text-ink-strong">{t("purchaseType")}</legend>
          <div className="grid grid-cols-2 gap-2 rounded-pill bg-garden p-1">
            {(["once", "subscribe"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "relative flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill text-small font-medium transition-colors duration-300 has-focus-visible:ring-2 has-focus-visible:ring-(--focus-ring)",
                  mode === m ? "bg-surface text-ink-strong shadow-card" : "text-ink-muted hover:text-ink-strong",
                )}
              >
                <input type="radio" name={`${id}-mode`} value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                {m === "subscribe" && <Repeat aria-hidden className="size-4" />}
                {m === "once" ? t("oneTime") : t("subscribe")}
                {m === "subscribe" && <span className="rounded-tag bg-fresh px-1.5 py-0.5 text-caption font-semibold text-on-fresh">{t("subscribeSave", { percent: discount })}</span>}
              </label>
            ))}
          </div>
          {subscribed && (
            <div className="flex flex-col gap-2">
              <span className="text-small text-ink-muted">{t("frequency")}</span>
              <div className="flex flex-wrap gap-2">
                {subscriptionFrequencies.map((f) => (
                  <label
                    key={f}
                    className={cn(
                      "inline-flex h-10 cursor-pointer items-center rounded-pill border px-4 text-small font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--focus-ring)",
                      frequency === f ? "border-ink-strong bg-ink-strong text-page" : "border-ink-strong/15 text-ink-strong hover:border-ink-strong",
                    )}
                  >
                    <input type="radio" name={`${id}-freq`} value={f} checked={frequency === f} onChange={() => setFrequency(f)} className="sr-only" />
                    {t(frequencyKey[f])}
                  </label>
                ))}
              </div>
              <span className="text-caption">{t("subscribeNote")}</span>
            </div>
          )}
        </fieldset>
      )}

      {/* Əkin / quraşdırma xidməti */}
      {service && (
        <div className="rounded-card border border-border bg-surface p-4">
          <Checkbox
            id={`${id}-service`}
            label={`${serviceLabel} (+${formatAzn(service.price, locale)})`}
            description={service.kind === "planting" ? t("plantingNote") : t("installNote")}
            checked={withService}
            onChange={(e) => setWithService(e.target.checked)}
          />
        </div>
      )}

      {/* Say + cəmi + düymələr */}
      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span id={`${id}-qty`} className="text-small font-medium text-ink-strong">
              {t("quantity")}
            </span>
            <div role="group" aria-labelledby={`${id}-qty`} className="inline-flex h-12 items-center rounded-pill border border-ink-strong/15 bg-surface">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label={t("decrease")} className="inline-flex size-12 items-center justify-center rounded-pill text-ink-strong outline-none hover:bg-ink-strong/6 focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:opacity-40">
                <Minus aria-hidden className="size-4" />
              </button>
              <output aria-live="polite" className="min-w-8 text-center font-medium text-ink-strong tabular-nums">
                {quantity}
              </output>
              <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label={t("increase")} className="inline-flex size-12 items-center justify-center rounded-pill text-ink-strong outline-none hover:bg-ink-strong/6 focus-visible:ring-2 focus-visible:ring-(--focus-ring)">
                <Plus aria-hidden className="size-4" />
              </button>
            </div>
          </div>
          <p className="text-right">
            <span className="block text-caption">{t("total")}</span>
            <span className="font-heading text-h3 text-ink-strong tabular-nums">{formatAzn(total, locale)}</span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AddToCartButton slug={slug} productName={name} quantity={quantity} options={options} display="full" className="w-full" />
          <Button
            variant="outline"
            size="lg"
            href={`https://wa.me/${siteConfig.whatsapp}`}
            external
            onClick={(e) => {
              // Mətn klik anında qurulur — cari seçimlər və səhifə linki ilə
              e.currentTarget.href = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappText())}`;
            }}
          >
            {t("whatsappOrder")}
          </Button>
        </div>
      </div>
    </div>
  );
}
