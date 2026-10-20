import { ArrowDown, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Price } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

/** Yard hero-sundakı fırlanan dairəvi "aşağı" düyməsi — mətn dairə boyunca yazılır */
function RotatingBadge({ text, label }: { text: string; label: string }) {
  return (
    <a
      href="#bolmeler"
      aria-label={label}
      className="group/badge absolute top-8 -left-10 hidden size-32 items-center justify-center rounded-pill bg-fresh text-on-fresh outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-4 lg:flex"
    >
      <svg viewBox="0 0 120 120" aria-hidden className="animate-spin-slow absolute inset-0 size-full">
        <defs>
          <path id="hero-badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-on-fresh text-caption font-medium" style={{ letterSpacing: "0.06em" }}>
          <textPath href="#hero-badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="inline-flex size-11 items-center justify-center rounded-pill bg-primary text-on-primary transition-transform duration-300 ease-out group-hover/badge:translate-y-0.5">
        <ArrowDown aria-hidden className="size-5" />
      </span>
    </a>
  );
}

export async function Hero() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const [{ hero }, reviews] = await Promise.all([catalog.getHomeContent(), catalog.getReviews()]);
  const featured = await catalog.getProduct(hero.featuredProductSlug);
  const featuredName = featured ? localize(featured.name, locale) : "";

  const trust = [
    { icon: ShieldCheck, label: t("trustWarranty") },
    { icon: Wrench, label: t("trustInstall") },
    { icon: Truck, label: t("trustDelivery") },
  ];

  return (
    <Section id="hero" spacing="none" className="pt-8 pb-section-sm lg:pt-14">
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Sol: mətn */}
        <div className="flex flex-col items-start gap-6 lg:col-span-6">
          <Eyebrow>{t("heroEyebrow")}</Eyebrow>
          <h1 className="text-display">{t("heroTitle")}</h1>
          <p className="text-lead max-w-lg">{t("heroText")}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Button href="#bolmeler" size="lg" arrow>
              {t("heroCta")}
            </Button>
            <Button href="#xidmet-sorgusu" size="lg" variant="outline">
              {t("heroConsult")}
            </Button>
          </div>

          {/* Reytinq + müştəri avatarları (Loree's) */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {hero.avatars.map((a) => (
                <span key={a} className="relative size-11 overflow-hidden rounded-pill ring-3 ring-page">
                  <Image src={img(a)} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="inline-flex items-center gap-1.5 font-heading text-h4 text-ink-strong">
                {reviews.rating.toFixed(1)}
                <span className="text-small text-ink-muted">/ 5</span>
                <Star aria-hidden className="size-4 fill-current text-primary" />
              </span>
              <span className="text-small text-ink-muted">{t("heroRating", { count: reviews.count })}</span>
            </div>
          </div>

          <ul className="grid w-full gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2.5 text-small font-medium text-ink-strong">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-garden text-primary">
                  <Icon aria-hidden className="size-4.5" strokeWidth={1.75} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Sağ: şəkil + "Mövsümün məhsulu" kartı (Growvi) + fırlanan nişan (Yard) */}
        <div className="relative lg:col-span-6">
          <div className="relative aspect-4/5 overflow-hidden rounded-hero bg-pool sm:aspect-5/4 lg:aspect-square">
            <Image
              src={img(hero.image)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <RotatingBadge text={t("rotatingText")} label={t("scrollDown")} />

          {featured && (
            <div className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-card bg-surface p-2.5 shadow-float sm:right-auto sm:bottom-5 sm:left-5 sm:w-96">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-media bg-garden">
                <Image src={img(featured.images[0])} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-caption">{t("featured")}</span>
                <Link href={routes.product(featured.slug)} className="truncate text-body font-medium text-ink-strong hover:text-(--link)">
                  {featuredName}
                </Link>
                <Price value={featured.price} oldValue={featured.oldPrice} size="sm" />
              </div>
              <AddToCartButton slug={featured.slug} productName={featuredName} />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
