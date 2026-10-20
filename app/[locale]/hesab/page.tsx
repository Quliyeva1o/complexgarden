import { Heart, MessageCircle, Package, Repeat, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pages");
  return { title: t("accountTitle"), robots: { index: false, follow: false } };
}

/** Şəxsi kabinet hələ yoxdur — müştərini mövcud kanallara yönləndiririk */
export default async function AccountPage() {
  const t = await getTranslations("Pages");
  const cards: { icon: LucideIcon; title: string; text: string; href: string; external?: boolean }[] = [
    { icon: Package, title: t("accountOrders"), text: t("accountOrdersText"), href: `https://wa.me/${siteConfig.whatsapp}`, external: true },
    { icon: Repeat, title: t("accountSubs"), text: t("accountSubsText"), href: routes.subscriptions },
    { icon: Heart, title: t("accountFavs"), text: t("accountFavsText"), href: routes.favorites },
  ];

  return (
    <main id="main">
      <PageHeader title={t("accountTitle")} lead={t("accountLead")} crumbs={[{ label: t("accountTitle") }]}>
        <span className="rounded-tag bg-fresh px-2.5 py-1 text-caption font-semibold text-on-fresh">{t("accountSoon")}</span>
      </PageHeader>
      <Section spacing="none" className="pb-section-sm">
        <Container>
          <ul className="grid gap-grid md:grid-cols-3">
            {cards.map(({ icon: Icon, title, text, href, external }) => {
              const inner = (
                <>
                  <span className="inline-flex size-12 items-center justify-center rounded-pill bg-garden text-primary">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="inline-flex items-center gap-2 text-h4 text-ink-strong">
                    {title}
                    {external && <MessageCircle aria-hidden className="size-4 text-(--link)" />}
                  </span>
                  <span className="text-small text-ink-muted">{text}</span>
                </>
              );
              const cls = "flex h-full flex-col gap-3 rounded-hero border border-border bg-surface p-6 outline-none transition-[box-shadow] hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-(--focus-ring)";
              return (
                <li key={title}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                  ) : (
                    <Link href={href} className={cls}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
