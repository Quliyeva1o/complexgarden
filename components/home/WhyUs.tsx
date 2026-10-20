import { Headset, Repeat, ShieldCheck, Sprout, Star, Truck, Wrench, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { catalog } from "@/lib/data";
import { cn } from "@/lib/utils";

type Advantage = { icon: LucideIcon; title: string; text: string };

function AdvantageItem({ item, mirrored }: { item: Advantage; mirrored?: boolean }) {
  const Icon = item.icon;
  return (
    <li className={cn("flex gap-4", mirrored && "lg:flex-row-reverse lg:text-right")}>
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-dashed border-ink-strong/25 bg-surface text-primary">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-h4">{item.title}</h3>
        <p className="text-small text-ink-muted">{item.text}</p>
      </div>
    </li>
  );
}

/** Niyə biz? — mərkəzdə şəkil, ətrafında 6 üstünlük (Evergreen "Why Choose us" ruhu) */
export async function WhyUs() {
  const t = await getTranslations("Home");
  const reviews = await catalog.getReviews();

  const items: Advantage[] = [
    { icon: ShieldCheck, title: t("why1Title"), text: t("why1Text") },
    { icon: Sprout, title: t("why2Title"), text: t("why2Text") },
    { icon: Wrench, title: t("why3Title"), text: t("why3Text") },
    { icon: Truck, title: t("why4Title"), text: t("why4Text") },
    { icon: Headset, title: t("why5Title"), text: t("why5Text") },
    { icon: Repeat, title: t("why6Title"), text: t("why6Text") },
  ];

  return (
    <Section id="niye-biz" className="reveal">
      <Container>
        <SectionHeading align="center" eyebrow={t("whyEyebrow")} title={t("whyTitle")} description={t("whyText")} />

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,24rem)_1fr] lg:gap-12">
          <ul className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-12">
            {items.slice(0, 3).map((item) => (
              <AdvantageItem key={item.title} item={item} mirrored />
            ))}
          </ul>

          <div className="relative order-1 mx-auto w-full max-w-sm lg:order-2">
            <div className="relative aspect-3/4 overflow-hidden rounded-pill border-8 border-garden">
              <Image src={img("pruning")} alt="" fill sizes="(min-width: 1024px) 24rem, 90vw" className="object-cover" />
            </div>
            <span className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-pill bg-surface px-4 py-2.5 whitespace-nowrap shadow-float">
              <Star aria-hidden className="size-4 fill-current text-primary" />
              <span className="font-heading text-body font-medium text-ink-strong">{reviews.rating.toFixed(1)}</span>
              <span className="text-small text-ink-muted">{t("reviewsGoogle", { count: reviews.count })}</span>
            </span>
          </div>

          <ul className="order-3 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 lg:gap-12">
            {items.slice(3).map((item) => (
              <AdvantageItem key={item.title} item={item} />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
