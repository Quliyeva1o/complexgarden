"use client";

import { AlertCircle, ArrowLeft, Banknote, CheckCircle2, Copy, CreditCard, MessageCircle, Smartphone } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatAzn } from "@/components/ui/Price";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import type { CartTotals } from "@/lib/cart/pricing";
import { formatDayLabel } from "@/lib/format";
import { useCartProducts } from "@/lib/cart/use-cart-products";
import { paymentProviders, type OrderPayload, type PaymentMethodId } from "@/lib/payments";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { CartSummary } from "./CartSummary";
import { CartSkeleton, EmptyCart } from "./CartView";

type Fields = { name: string; phone: string; district: string; street: string; date: string; slot: string; note: string; payment: PaymentMethodId };
type Errors = Partial<Record<keyof Fields, string>>;

const isPhone = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.length === 9 || (d.length === 12 && d.startsWith("994")) || (d.length === 10 && d.startsWith("0"));
};

// Bugünkü tarix yalnız brauzerdə oxunur (server prerender-ində yoxdur → hidratasiya uyğunsuzluğu olmur)
const noop = () => () => {};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Növbəti 7 gün: dəyər ISO tarix, etiket "21 oktyabr, çərşənbə axşamı" */
function useDeliveryDates(locale: string) {
  const today = useSyncExternalStore(noop, todayKey, () => "");
  if (!today) return [];
  const [y, m, d] = today.split("-").map(Number);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(y, m - 1, d + i + 1); // sabahdan başlayaraq
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { value, label: formatDayLabel(date, locale) };
  });
}

const paymentIcons: Record<PaymentMethodId, typeof Banknote> = {
  "cash-on-delivery": Banknote,
  "card-on-delivery": CreditCard,
  "online-card": Smartphone,
};

function OrderLinesPreview({ totals }: { totals: CartTotals }) {
  const locale = useLocale();
  return (
    <ul className="flex flex-col gap-3">
      {totals.lines.map(({ line, product, total }) => (
        <li key={line.key} className="flex items-center gap-3">
          <span className={cn("relative size-14 shrink-0 overflow-hidden rounded-media", product.world === "pool" ? "bg-pool" : "bg-garden")}>
            <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
            <span className="absolute top-0.5 right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-caption font-semibold text-on-primary">
              {line.quantity}
            </span>
          </span>
          <span className="min-w-0 flex-1 truncate text-small text-ink-strong">{product.name}</span>
          <span className="text-small font-medium text-ink-strong tabular-nums">{formatAzn(total, locale)}</span>
        </li>
      ))}
    </ul>
  );
}

export function CheckoutView({ districts }: { districts: { value: string; label: string }[] }) {
  const t = useTranslations("Checkout");
  const tc = useTranslations("Cart");
  const locale = useLocale();
  const { totals, ready } = useCartProducts();
  const clear = useCart((s) => s.clear);
  const dates = useDeliveryDates(locale);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [fields, setFields] = useState<Fields>({ name: "", phone: "", district: "", street: "", date: "", slot: "any", note: "", payment: "cash-on-delivery" });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ id: string; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const slots = [
    { value: "any", label: t("slotAny") },
    { value: "morning", label: t("slotMorning") },
    { value: "afternoon", label: t("slotAfternoon") },
    { value: "evening", label: t("slotEvening") },
  ];
  const paymentLabel: Record<PaymentMethodId, string> = { "cash-on-delivery": t("payCash"), "card-on-delivery": t("payCard"), "online-card": t("payOnline") };

  const validate = (f: Fields): Errors => ({
    ...(f.name.trim().length < 2 && { name: t("errName") }),
    ...(!isPhone(f.phone) && { phone: t("errPhone") }),
    ...(!f.district && { district: t("errDistrict") }),
    ...(f.street.trim().length < 4 && { street: t("errStreet") }),
    ...(!f.date && { date: t("errDate") }),
  });

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validate({ ...fields, [key]: value })[key] }));
  };

  const fieldProps = (key: keyof Fields) => ({
    id: `co-${key}`,
    error: errors[key],
    onBlur: () => fields[key] && setErrors((e) => ({ ...e, [key]: validate(fields)[key] })),
  });

  function buildMessage(id: string): string {
    const district = districts.find((d) => d.value === fields.district)?.label ?? fields.district;
    const date = dates.find((d) => d.value === fields.date)?.label ?? fields.date;
    const slot = slots.find((s) => s.value === fields.slot)?.label ?? "";
    const items = totals.lines.map(({ line, product, total }) => {
      const extras = [
        line.options.subscriptionDays && product.subscriptionEligible ? tc("subscription", { days: line.options.subscriptionDays }) : null,
        line.options.service && product.service ? tc(product.service.kind) : null,
      ].filter(Boolean);
      return `• ${product.name} × ${line.quantity} — ${formatAzn(total, locale)}${extras.length ? ` (${extras.join(", ")})` : ""}`;
    });
    return [
      t("waTitle", { id }),
      "",
      t("waCustomer", { name: fields.name.trim(), phone: fields.phone.trim() }),
      t("waAddress", { district, street: fields.street.trim() }),
      t("waWhen", { date, slot }),
      t("waPayment", { method: paymentLabel[fields.payment] }),
      ...(fields.note.trim() ? [t("waNote", { note: fields.note.trim() })] : []),
      "",
      t("waItems"),
      ...items,
      "",
      t("waSubtotal", { amount: formatAzn(totals.subtotal, locale) }),
      t("waDelivery", { amount: totals.deliveryFee ? formatAzn(totals.deliveryFee, locale) : tc("deliveryFree") }),
      t("waTotal", { amount: formatAzn(totals.total, locale) }),
    ].join("\n");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      // Çox xəta varsa — xülasəyə, birdirsə — sahəyə fokus
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const id = `${todayKey().slice(2).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const text = buildMessage(id);
    // WhatsApp istifadəçinin kliki ilə sinxron açılır — brauzer popup-u bloklamasın
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

    const order: OrderPayload = {
      id,
      currency: "AZN",
      lines: totals.lines.map(({ line, product, unitPrice, servicePrice }) => ({
        slug: product.slug,
        name: product.name,
        quantity: line.quantity,
        unitPrice: unitPrice + servicePrice,
        options: [line.options.subscriptionDays ? `sub:${line.options.subscriptionDays}` : "", line.options.service ? "service" : ""].filter(Boolean),
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      customer: { name: fields.name, phone: fields.phone, district: fields.district, address: fields.street, deliverySlot: `${fields.date} ${fields.slot}`, note: fields.note },
    };
    // Qapıda ödəniş — provayder "pending-on-delivery" qaytarır; onlayn kart qoşulanda burada yönləndirmə olacaq
    void paymentProviders[fields.payment].createPayment(order);

    setDone({ id, text });
    clear();
    window.scrollTo({ top: 0 });
  }

  if (done) {
    const url = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(done.text)}`;
    return (
      <div role="status" className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-hero border border-border bg-surface px-6 py-14 text-center">
        <CheckCircle2 aria-hidden className="size-14 text-primary" strokeWidth={1.5} />
        <h2 className="text-h2">{t("doneTitle", { id: done.id.replace("-", "‑") /* qırılmayan defis — nömrə iki sətrə bölünməsin */ })}</h2>
        <p className="max-w-md text-body">{t("doneText")}</p>
        <pre className="max-h-64 w-full overflow-auto rounded-card bg-page p-4 text-left font-body text-small whitespace-pre-wrap text-ink-strong">{done.text}</pre>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={url} external variant="primary" arrow>
            <MessageCircle aria-hidden />
            {t("doneReopen")}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard?.writeText(done.text);
              setCopied(true);
            }}
          >
            <Copy aria-hidden />
            {copied ? t("doneCopied") : t("doneCopy")}
          </Button>
          <Button href={routes.home} variant="ghost">
            {t("doneHome")}
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) return <CartSkeleton />;
  if (totals.lines.length === 0) return <EmptyCart title={t("emptyTitle")} text={t("emptyText")} cta={tc("emptyCta")} />;

  const errorList = (Object.keys(errors) as (keyof Fields)[]).filter((k) => errors[k]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-start">
      <form id="checkout-form" ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-card border border-danger/40 bg-danger/5 p-4 outline-none focus-visible:ring-2 focus-visible:ring-danger">
            <p className="inline-flex items-center gap-2 font-medium text-danger">
              <AlertCircle aria-hidden className="size-4.5" />
              {t("errSummary", { count: errorList.length })}
            </p>
            <ul className="mt-2 flex flex-col gap-1 pl-6 text-small">
              {errorList.map((k) => (
                <li key={k}>
                  <a href={`#co-${k}`} className="text-danger underline underline-offset-2">
                    {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="flex flex-col gap-4 rounded-hero border border-border bg-surface p-6">
          <legend className="float-left mb-2 w-full text-h4">{t("contact")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...fieldProps("name")} label={t("name")} placeholder={t("namePh")} autoComplete="name" required value={fields.name} onChange={(e) => set("name", e.target.value)} />
            <Input {...fieldProps("phone")} type="tel" inputMode="tel" label={t("phone")} placeholder={t("phonePh")} autoComplete="tel" required value={fields.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-hero border border-border bg-surface p-6">
          <legend className="float-left mb-2 w-full text-h4">{t("address")}</legend>
          <Select {...fieldProps("district")} label={t("district")} placeholder={t("districtPh")} options={districts} required value={fields.district} onChange={(e) => set("district", e.target.value)} />
          <Input {...fieldProps("street")} label={t("street")} placeholder={t("streetPh")} autoComplete="street-address" required value={fields.street} onChange={(e) => set("street", e.target.value)} />
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-hero border border-border bg-surface p-6">
          <legend className="float-left mb-2 w-full text-h4">{t("when")}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select {...fieldProps("date")} label={t("date")} placeholder="—" options={dates} required value={fields.date} onChange={(e) => set("date", e.target.value)} />
            <Select id="co-slot" label={t("slot")} options={slots} value={fields.slot} onChange={(e) => set("slot", e.target.value)} />
          </div>
          <Textarea id="co-note" label={t("note")} placeholder={t("notePh")} rows={3} value={fields.note} onChange={(e) => set("note", e.target.value)} />
        </fieldset>

        <fieldset className="flex flex-col gap-3 rounded-hero border border-border bg-surface p-6">
          <legend className="float-left mb-2 w-full text-h4">{t("payment")}</legend>
          {(Object.keys(paymentProviders) as PaymentMethodId[]).map((id) => {
            const provider = paymentProviders[id];
            const Icon = paymentIcons[id];
            return (
              <label
                key={id}
                className={cn(
                  "flex items-center gap-4 rounded-card border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-(--focus-ring)",
                  !provider.available
                    ? "cursor-not-allowed border-border opacity-60"
                    : fields.payment === id
                      ? "cursor-pointer border-primary bg-garden"
                      : "cursor-pointer border-border hover:border-ink-strong/30",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={id}
                  disabled={!provider.available}
                  checked={fields.payment === id}
                  onChange={() => set("payment", id)}
                  className="size-4.5 accent-(--color-primary)"
                />
                <Icon aria-hidden className="size-5 text-primary" strokeWidth={1.75} />
                <span className="flex-1 text-body font-medium text-ink-strong">{paymentLabel[id]}</span>
                {!provider.available && <span className="rounded-tag bg-page px-2 py-0.5 text-caption font-medium">{t("soon")}</span>}
              </label>
            );
          })}
        </fieldset>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-44">
        <CartSummary totals={totals}>
          <OrderLinesPreview totals={totals} />
          <Button type="submit" form="checkout-form" variant="primary" size="lg" className="w-full">
            <MessageCircle aria-hidden />
            {t("confirm")}
          </Button>
          <p className="text-caption">{t("confirmNote")}</p>
        </CartSummary>
        <Link href={routes.cart} className="inline-flex items-center gap-2 text-small font-medium text-(--link)">
          <ArrowLeft aria-hidden className="size-4" />
          {t("backToCart")}
        </Link>
      </div>
    </div>
  );
}
