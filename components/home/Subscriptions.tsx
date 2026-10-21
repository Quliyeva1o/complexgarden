import { Check, Droplets, Leaf, Repeat } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatAzn } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { cn, localize } from "@/lib/utils";

/**
 * Abunə paketləri: 3 kart, ortadakı "Ən populyar" tünd yaşıl panel kimi önə çıxır.
 * Qənaət faizi `regularPrice` və `monthlyPrice` fərqindən hesablanır.
 */
type SubscriptionsProps = {
  /** page → /abune səhifəsinə link (ana səhifə); whatsapp → hazır mesajla WhatsApp (/abune səhifəsi) */
  cta?: "page" | "whatsapp";
  /** /abune səhifəsində başlıq PageHeader-dədir */
  showHeading?: boolean;
};

export async function Subscriptions({ cta = "page", showHeading = true }: SubscriptionsProps = {}) {
  const t = await getTranslations("Home");
  const tp = await getTranslations("Pages");
  const locale = (await getLocale()) as Locale;
  const plans = await catalog.getSubscriptionPlans();

  return (
    <Section id="abune" spacing={showHeading ? "default" : "none"} className={showHeading ? "reveal" : "pb-section-sm"}>
      <Container>
        {!showHeading && <h2 className="sr-only">{t("subTitle")}</h2>}
        {showHeading && (
          <SectionHeading align="center" eyebrow={t("subEyebrow")} eyebrowIcon={Repeat} title={t("subTitle")} description={t("subText")} />
        )}

        <ul className="grid items-stretch gap-grid lg:grid-cols-3">
          {plans.map((plan) => {
            const popular = Boolean(plan.popular);
            const save = Math.round((1 - plan.monthlyPrice / plan.regularPrice) * 100);
            const WorldIcon = plan.world === "pool" ? Droplets : Leaf;

            return (
              <li
                key={plan.slug}
                id={`paket-${plan.slug}`}
                className={cn(
                  "scroll-mt-44",
                  "relative flex flex-col gap-6 rounded-hero p-6 sm:p-8",
                  popular ? "on-dark bg-primary lg:-my-4 lg:py-12" : "border border-border bg-surface",
                )}
              >
                {popular && (
                  <Badge variant="sale" className="absolute top-6 right-6">
                    {t("subPopular")}
                  </Badge>
                )}

                <div className="flex flex-col gap-3">
                  <span
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-pill",
                      popular ? "bg-white/10 text-(--link)" : plan.world === "pool" ? "bg-pool text-secondary" : "bg-garden text-primary",
                    )}
                  >
                    <WorldIcon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-h3">{localize(plan.name, locale)}</h3>
                  <p className="text-small">{localize(plan.description, locale)}</p>
                </div>

                <div className="flex flex-col gap-1.5 border-y border-current/10 py-5">
                  <p className="flex items-baseline gap-1.5">
                    <span className="font-heading text-h1 text-ink-strong tabular-nums">{formatAzn(plan.monthlyPrice, locale)}</span>
                    <span className="text-small">{t("subPerMonth")}</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-small">
                    <s className="text-ink-muted">{t("subInstead", { price: formatAzn(plan.regularPrice, locale) })}</s>
                    <Badge variant={popular ? "sale" : "garden"}>{t("subSave", { percent: save })}</Badge>
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  <span className="text-small font-medium text-ink-strong">{t("subIncludes")}</span>
                  <ul className="flex flex-col gap-2.5">
                    {plan.items.map((item) => (
                      <li key={item.az} className="flex items-start gap-2.5 text-small">
                        <Check aria-hidden className={cn("mt-0.5 size-4 shrink-0", popular ? "text-(--link)" : "text-primary")} />
                        {localize(item, locale)}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-2 text-caption">{localize(plan.frequency, locale)}</span>
                </div>

                <Button
                  href={
                    cta === "whatsapp"
                      ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(tp("subsWaText", { plan: localize(plan.name, locale) }))}`
                      : `${routes.subscriptions}#paket-${plan.slug}`
                  }
                  external={cta === "whatsapp"}
                  variant={popular ? "fresh" : "outline"}
                  arrow
                  className="w-full justify-between"
                >
                  {cta === "whatsapp" ? tp("subsCta") : t("subCta")}
                </Button>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
