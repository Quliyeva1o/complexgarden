import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ServiceRequest } from "@/components/home/ServiceRequest";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("contactTitle"), description: t("contactLead") };
}

function Channel({ icon: Icon, label, value, href, external }: { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean }) {
  const content = (
    <>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-garden text-primary">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-caption">{label}</span>
        <span className="text-h4 break-words text-ink-strong">{value}</span>
      </span>
    </>
  );
  const cls = "flex items-center gap-4 rounded-hero border border-border bg-surface p-5";
  return href ? (
    <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} className={`${cls} transition-colors hover:border-ink-strong/30`}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export default async function ContactPage() {
  const t = await getTranslations("Pages");
  const tf = await getTranslations("Footer");
  const locale = (await getLocale()) as Locale;
  const { lat, lng } = siteConfig.geo;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <main id="main">
      <PageHeader title={t("contactTitle")} lead={t("contactLead")} crumbs={[{ label: t("contactTitle") }]} />

      <Section spacing="none" className="pb-section-sm">
        <Container className="grid gap-grid lg:grid-cols-[1fr_1.2fr]">
          <div className="grid content-start gap-grid sm:grid-cols-2 lg:grid-cols-1">
            <Channel icon={Phone} label={t("contactPhone")} value={siteConfig.phone} href={siteConfig.phoneHref} />
            <Channel icon={MessageCircle} label={t("contactWhatsapp")} value={siteConfig.whatsappDisplay} href={`https://wa.me/${siteConfig.whatsapp}`} external />
            <Channel icon={Mail} label={t("contactEmail")} value={siteConfig.email} href={`mailto:${siteConfig.email}`} />
            <Channel icon={MapPin} label={t("contactAddress")} value={siteConfig.address[locale]} href={mapsUrl} external />
            <div className="flex items-start gap-4 rounded-hero border border-border bg-surface p-5 sm:col-span-2 lg:col-span-1">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-garden text-primary">
                <Clock aria-hidden className="size-5" strokeWidth={1.75} />
              </span>
              <dl className="grid flex-1 grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
                <dt className="col-span-2 text-caption">{t("contactHours")}</dt>
                <dt className="text-body">{tf("weekdays")}</dt>
                <dd className="text-body font-medium text-ink-strong tabular-nums">{siteConfig.workingHours.weekdays}</dd>
                <dt className="text-body">{tf("saturday")}</dt>
                <dd className="text-body font-medium text-ink-strong tabular-nums">{siteConfig.workingHours.saturday}</dd>
                <dt className="text-body">{tf("sunday")}</dt>
                <dd className="text-body font-medium text-ink-strong">{siteConfig.workingHours.sunday ?? tf("closed")}</dd>
              </dl>
            </div>
          </div>

          {/* Xəritə üçün yer — Google Maps / Yandex embed sonra bura qoşulacaq */}
          <div className="relative flex min-h-96 flex-col items-center justify-center gap-4 overflow-hidden rounded-hero border border-dashed border-ink-strong/25 bg-pool p-8 text-center world-pool">
            <span className="inline-flex size-16 items-center justify-center rounded-pill bg-surface text-secondary shadow-float">
              <MapPin aria-hidden className="size-7" />
            </span>
            <p className="text-h4">{t("mapPlaceholder")}</p>
            <p className="max-w-xs text-small">{siteConfig.address[locale]}</p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-small font-medium text-(--link) underline underline-offset-4">
              {t("mapOpen")}
            </a>
          </div>
        </Container>
      </Section>

      <ServiceRequest />
    </main>
  );
}
