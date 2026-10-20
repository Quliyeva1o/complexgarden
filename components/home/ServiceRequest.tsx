import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { serviceIcons as icons } from "@/lib/service-icons";
import { localize } from "@/lib/utils";

/**
 * Xidmət sorğusu (Yard hero forması ruhu): böyük şəkil üzərində forma kartı,
 * yanında 4 xidmət — landşaft, əkin, suvarma, baxım. Hero-dakı "Pulsuz məsləhət" bura gəlir.
 */
export async function ServiceRequest() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const services = await catalog.getServices();

  return (
    <Section id="xidmet-sorgusu" className="reveal scroll-mt-40">
      <Container>
        <div className="relative overflow-hidden rounded-hero bg-primary">
          <Image src={img("houseGarden")} alt="" fill sizes="100vw" className="object-cover" />
          {/* Şəkil üzərindəki mətnin oxunması üçün tünd təbəqə */}
          <div aria-hidden className="absolute inset-0 bg-ink-strong/55" />

          <div className="relative grid gap-8 p-4 sm:p-8 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-12 lg:p-12">
            <div className="on-dark order-2 flex flex-col gap-4 lg:order-1">
              <span className="text-small font-medium">{t("reqServicesLabel")}</span>
              <ul className="grid gap-3 sm:grid-cols-2">
                {services.slice(0, 4).map((s) => {
                  const Icon = icons[s.icon];
                  return (
                    <li key={s.slug}>
                      <Link
                        href={routes.service(s.slug)}
                        className="group/s flex items-center gap-3 rounded-card border border-white/15 bg-white/10 p-3 backdrop-blur-md outline-none transition-colors duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
                      >
                        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-fresh text-on-fresh">
                          <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="text-body font-medium text-white">{localize(s.name, locale)}</span>
                          <span className="text-caption">{t("reqFrom", { price: s.priceFrom })} / {localize(s.priceUnit, locale)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="order-1 flex flex-col gap-5 rounded-hero bg-surface p-6 shadow-card-hover sm:p-8 lg:order-2">
              <div className="flex flex-col gap-2">
                <h2 className="text-h2">{t("reqTitle")}</h2>
                <p className="text-body">{t("reqText")}</p>
              </div>
              <ServiceRequestForm services={services.map((s) => ({ value: s.slug, label: localize(s.name, locale) }))} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
