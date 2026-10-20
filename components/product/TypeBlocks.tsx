import { Calendar, Droplet, Leaf, MapPin, Ruler, ShieldCheck, Snowflake, Sprout, Sun } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn, localize } from "@/lib/utils";

/** 1–3 nöqtəli şkala (günəş / su tələbatı) — rəng tək göstərici deyil, mətn də yanındadır */
function Scale({ level, icon: Icon, label }: { level: 1 | 2 | 3; icon: typeof Sun; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <Icon key={i} className={cn("size-4", i <= level ? "fill-current text-primary" : "text-ink-strong/20")} />
        ))}
      </span>
      <span className="text-small font-medium text-ink-strong">{label}</span>
    </span>
  );
}

/** Bitki pasportu: hündürlük, yaş, dibçək, günəş/su tələbatı, şaxtaya davamlılıq, uyğun bölgələr */
export async function PlantPassport({ product }: { product: Product }) {
  const pp = product.plantPassport;
  if (!pp) return null;
  const t = await getTranslations("ProductPage");
  const locale = (await getLocale()) as Locale;
  const regions = await catalog.getPlantRegions();

  const sunLevel = { full: 3, partial: 2, shade: 1 } as const;
  const waterLevel = { low: 1, medium: 2, high: 3 } as const;
  const sunLabel = { full: t("sunFull"), partial: t("sunPartial"), shade: t("sunShade") };
  const waterLabel = { low: t("waterLow"), medium: t("waterMedium"), high: t("waterHigh") };

  const rows: { icon: typeof Sun; label: string; value: React.ReactNode }[] = [
    { icon: Ruler, label: t("height"), value: `${formatNumber(pp.heightCm / 100, locale)} m` },
    ...(pp.ageYears ? [{ icon: Calendar, label: t("age"), value: t("ageYears", { count: pp.ageYears }) }] : []),
    ...(pp.potSize ? [{ icon: Sprout, label: t("pot"), value: pp.potSize }] : []),
    { icon: Sun, label: t("sun"), value: <Scale level={sunLevel[pp.sun]} icon={Sun} label={sunLabel[pp.sun]} /> },
    { icon: Droplet, label: t("water"), value: <Scale level={waterLevel[pp.water]} icon={Droplet} label={waterLabel[pp.water]} /> },
    ...(pp.frostHardinessC !== undefined
      ? [{ icon: Snowflake, label: t("frost"), value: t("frostValue", { value: formatNumber(pp.frostHardinessC, locale) }) }]
      : []),
  ];

  return (
    <section aria-labelledby="passport-title" className="world-garden flex flex-col gap-4 rounded-card bg-garden p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="passport-title" className="inline-flex items-center gap-2 text-h4">
          <Leaf aria-hidden className="size-5 fill-current text-primary" />
          {t("passportTitle")}
        </h2>
        {pp.evergreen && <span className="rounded-pill bg-surface px-3 py-1 text-caption font-medium text-primary">{t("evergreen")}</span>}
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 border-b border-ink-strong/8 pb-3">
            <dt className="inline-flex items-center gap-1.5 text-caption">
              <Icon aria-hidden className="size-3.5" />
              {label}
            </dt>
            <dd className="text-body font-medium text-ink-strong">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 text-caption">
          <MapPin aria-hidden className="size-3.5" />
          {t("regions")}
        </span>
        <ul className="flex flex-wrap gap-1.5">
          {pp.regions.map((r) => (
            <li key={r} className="rounded-pill bg-surface px-3 py-1 text-small font-medium text-ink-strong">
              {regions[r] ? localize(regions[r], locale) : r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Avadanlıq: ilk 4 göstərici + zəmanət (tam cədvəl "Xüsusiyyətlər" tabındadır) */
export async function EquipmentSummary({ product }: { product: Product }) {
  const t = await getTranslations("ProductPage");
  const locale = (await getLocale()) as Locale;

  return (
    <section aria-labelledby="keyspecs-title" className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5">
      <h2 id="keyspecs-title" className="text-h4">
        {t("keySpecs")}
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {product.specs.slice(0, 4).map((s) => (
          <div key={s.label.az} className="rounded-media bg-page p-3">
            <dt className="text-caption">{localize(s.label, locale)}</dt>
            <dd className="text-body font-medium text-ink-strong">{localize(s.value, locale)}</dd>
          </div>
        ))}
      </dl>
      {product.warrantyMonths && (
        <p className="inline-flex items-center gap-2 text-small font-medium text-ink-strong">
          <ShieldCheck aria-hidden className="size-4.5 text-primary" />
          {t("warrantyMonths", { count: product.warrantyMonths })}
        </p>
      )}
    </section>
  );
}
