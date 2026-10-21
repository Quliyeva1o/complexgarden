import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Truck, Wallet, Wrench, type LucideIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { getNavData } from "./Header";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { SocialIcon, type SocialNetwork } from "./SocialIcon";

function TrustItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <li className="flex items-center gap-4">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-dashed border-ink-strong/25 text-primary">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <span className="flex flex-col">
        <span className="text-body font-medium text-ink-strong">{title}</span>
        <span className="text-small text-ink-muted">{text}</span>
      </span>
    </li>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h4 text-white">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-body text-white/75 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const t = await getTranslations("Footer");
  const locale = (await getLocale()) as Locale;
  const [{ categories }, services] = await Promise.all([getNavData(), catalog.getServices()]);
  const year = siteConfig.copyrightYear;

  const socials = Object.entries(siteConfig.social) as [SocialNetwork, string][];

  return (
    <footer className="mt-auto">
      {/* 1. Etibar zolağı */}
      <div className="border-t border-border">
        <Container>
          <ul className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            <TrustItem icon={Truck} title={t("trustDelivery")} text={t("trustDeliveryText")} />
            <TrustItem icon={ShieldCheck} title={t("trustWarranty")} text={t("trustWarrantyText")} />
            <TrustItem icon={Wrench} title={t("trustInstall")} text={t("trustInstallText")} />
            <TrustItem icon={Wallet} title={t("trustPayment")} text={t("trustPaymentText")} />
          </ul>
        </Container>
      </div>

      {/* 2. Tünd hissə */}
      <div className="on-dark relative overflow-hidden rounded-t-card bg-primary pb-28 text-ink lg:pb-0">
        <Container className="relative z-10">
          <div className="grid gap-10 border-b border-white/12 py-section-sm lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-5">
              <Logo onDark />
              <p className="max-w-md text-body">{t("about")}</p>
              <ul aria-label={t("follow")} className="flex gap-2">
                {socials.map(([network, href]) => (
                  <li key={network}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={network}
                      className="inline-flex size-11 items-center justify-center rounded-pill border border-white/20 text-white transition-colors duration-300 hover:border-fresh hover:bg-fresh hover:text-on-fresh"
                    >
                      <SocialIcon network={network} className="size-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-h3 text-white">{t("newsletterTitle")}</h2>
              <p className="text-small">{t("newsletterText")}</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid gap-10 py-section-sm sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn
              title={t("categories")}
              links={categories.map((c) => ({ href: routes.category(c.slug), label: c.name }))}
            />
            <FooterColumn
              title={t("customerService")}
              links={[
                { href: routes.delivery, label: t("delivery") },
                { href: routes.returns, label: t("returns") },
                { href: routes.faq, label: t("faq") },
                { href: routes.about, label: t("about2") },
                { href: routes.contact, label: t("contact") },
              ]}
            />
            <FooterColumn
              title={t("services")}
              links={services.map((s) => ({ href: routes.service(s.slug), label: localize(s.name, locale) }))}
            />
            <div className="flex flex-col gap-4">
              <h2 className="text-h4 text-white">{t("contact")}</h2>
              <ul className="flex flex-col gap-3 text-body text-white/75">
                <li>
                  <a href={siteConfig.phoneHref} className="inline-flex items-center gap-2.5 hover:text-white">
                    <Phone aria-hidden className="size-4 text-(--link)" />
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white">
                    <MessageCircle aria-hidden className="size-4 text-(--link)" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                    <Mail aria-hidden className="size-4 text-(--link)" />
                    {siteConfig.email}
                  </a>
                </li>
                <li className="inline-flex items-start gap-2.5">
                  <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-(--link)" />
                  {siteConfig.address[locale]}
                </li>
              </ul>
              <div className="mt-2 flex flex-col gap-1.5 rounded-card border border-white/12 p-4">
                <span className="inline-flex items-center gap-2 text-small font-medium text-white">
                  <Clock aria-hidden className="size-4 text-(--link)" />
                  {t("hours")}
                </span>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
                  <dt>{t("weekdays")}</dt>
                  <dd className="text-right text-white tabular-nums">{siteConfig.workingHours.weekdays}</dd>
                  <dt>{t("saturday")}</dt>
                  <dd className="text-right text-white tabular-nums">{siteConfig.workingHours.saturday}</dd>
                  <dt>{t("sunday")}</dt>
                  <dd className="text-right text-white">{siteConfig.workingHours.sunday ?? t("closed")}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/12 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-small">{t("copyright", { year, brand: siteConfig.name })}</p>
            <ul aria-label={t("payments")} className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", t("cash")].map((m) => (
                <li key={m} className="inline-flex h-8 items-center rounded-tag bg-white/10 px-3 text-caption font-semibold text-white">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </Container>

        {/* Dekorativ iri brend adı (Canopy footer ruhu) */}
        <div
          aria-hidden
          data-text={siteConfig.name}
          className="text-watermark pointer-events-none -mb-[0.12em] text-center whitespace-nowrap text-white/6 select-none before:content-[attr(data-text)]"
        />
      </div>
    </footer>
  );
}
