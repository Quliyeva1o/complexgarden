"use client";

import { AlertCircle, Minus, Plus, Repeat, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { formatAzn } from "@/components/ui/Price";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import type { PricedLine } from "@/lib/cart/pricing";
import { useCartProducts } from "@/lib/cart/use-cart-products";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { CartSummary } from "./CartSummary";

function CartLineRow({ priced }: { priced: PricedLine }) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { line, product, unitPrice, servicePrice, total } = priced;
  const subscribed = Boolean(line.options.subscriptionDays) && product.subscriptionEligible;

  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 border-b border-border py-5 sm:grid-cols-[auto_1fr_auto]">
      <Link
        href={routes.product(product.slug)}
        className={cn("relative size-24 overflow-hidden rounded-media sm:size-28", product.world === "pool" ? "bg-pool" : "bg-garden")}
      >
        <Image src={product.image} alt="" fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-caption">{product.category}</span>
        <Link href={routes.product(product.slug)} className="text-h4 text-ink-strong hover:text-(--link)">
          {product.name}
        </Link>
        <span className="text-small text-ink-muted tabular-nums">
          {formatAzn(unitPrice, locale)}
          {subscribed && <s className="ml-2">{formatAzn(product.price, locale)}</s>}
        </span>
        <ul className="flex flex-wrap gap-1.5">
          {subscribed && (
            <li className="inline-flex items-center gap-1 rounded-tag bg-pool px-2 py-0.5 text-caption font-medium text-secondary">
              <Repeat aria-hidden className="size-3" />
              {t("subscription", { days: line.options.subscriptionDays ?? 30 })}
            </li>
          )}
          {servicePrice > 0 && product.service && (
            <li className="rounded-tag bg-garden px-2 py-0.5 text-caption font-medium text-primary">
              {t("service", { service: t(product.service.kind), price: formatAzn(servicePrice, locale) })}
            </li>
          )}
          {!product.inStock && (
            <li className="rounded-tag bg-page px-2 py-0.5 text-caption font-medium text-ink-muted">{t("onOrder", { days: product.leadTimeDays ?? 0 })}</li>
          )}
        </ul>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
        <div role="group" aria-label={t("quantity", { name: product.name })} className="inline-flex h-11 items-center rounded-pill border border-ink-strong/15 bg-surface">
          <button type="button" onClick={() => setQuantity(line.key, line.quantity - 1)} aria-label={t("decrease")} className="inline-flex size-11 items-center justify-center rounded-pill text-ink-strong outline-none hover:bg-ink-strong/6 focus-visible:ring-2 focus-visible:ring-(--focus-ring)">
            <Minus aria-hidden className="size-4" />
          </button>
          <output aria-live="polite" className="min-w-7 text-center font-medium text-ink-strong tabular-nums">
            {line.quantity}
          </output>
          <button type="button" onClick={() => setQuantity(line.key, Math.min(99, line.quantity + 1))} aria-label={t("increase")} className="inline-flex size-11 items-center justify-center rounded-pill text-ink-strong outline-none hover:bg-ink-strong/6 focus-visible:ring-2 focus-visible:ring-(--focus-ring)">
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-heading text-h4 text-ink-strong tabular-nums">{formatAzn(total, locale)}</span>
          <button
            type="button"
            onClick={() => remove(line.key)}
            aria-label={t("remove", { name: product.name })}
            className="inline-flex size-10 items-center justify-center rounded-pill text-ink-muted outline-none hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            <Trash2 aria-hidden className="size-4.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

/** Boş səbət — izah və kataloqa keçid */
export function EmptyCart({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-hero border border-dashed border-ink-strong/20 px-6 py-20 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-pill bg-garden text-primary">
        <ShoppingBag aria-hidden className="size-7" strokeWidth={1.5} />
      </span>
      <h2 className="text-h3">{title}</h2>
      <p className="max-w-md text-body">{text}</p>
      <Button href={routes.search()} arrow className="mt-2">
        {cta}
      </Button>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div aria-hidden className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <span key={i} className="h-32 animate-pulse rounded-card bg-garden" />
        ))}
      </div>
      <span className="h-80 animate-pulse rounded-hero bg-garden" />
    </div>
  );
}

/** Səbət səhifəsinin məzmunu (client — localStorage-dakı səbətdən) */
export function CartView() {
  const t = useTranslations("Cart");
  const { totals, ready } = useCartProducts();
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  // Satışdan çıxmış məhsulları səbətdən təmizlə (bildiriş göstərilir)
  const missingKeys = totals.missing.map((l) => l.key).join(",");
  useEffect(() => {
    if (!ready || !missingKeys) return;
    const id = setTimeout(() => missingKeys.split(",").forEach((k) => remove(k)), 4000);
    return () => clearTimeout(id);
  }, [ready, missingKeys, remove]);

  if (!ready) return <CartSkeleton />;
  if (totals.lines.length === 0 && totals.missing.length === 0) {
    return <EmptyCart title={t("emptyTitle")} text={t("emptyText")} cta={t("emptyCta")} />;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
      <div className="flex flex-col">
        {totals.missing.length > 0 && (
          <p role="status" className="mb-4 inline-flex items-center gap-2 rounded-card bg-danger/10 p-4 text-small font-medium text-danger">
            <AlertCircle aria-hidden className="size-4.5 shrink-0" />
            {t("unavailable", { count: totals.missing.length })}
          </p>
        )}
        <ul className="border-t border-border">
          {totals.lines.map((l) => (
            <CartLineRow key={l.line.key} priced={l} />
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <Button href={routes.search()} variant="ghost">
            {t("continue")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm(t("clearConfirm"))) clear();
            }}
            className="text-ink-muted"
          >
            <Trash2 aria-hidden />
            {t("clear")}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-44">
        <CartSummary totals={totals}>
          <Button href={routes.checkout} size="lg" arrow className="w-full justify-between">
            {t("checkout")}
          </Button>
          <p className="text-caption">
            {siteConfig.workingHours.weekdays} · {siteConfig.phone}
          </p>
        </CartSummary>
      </div>
    </div>
  );
}
