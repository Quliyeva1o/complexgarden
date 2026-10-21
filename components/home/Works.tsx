import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { localize } from "@/lib/utils";
import { ProjectsShowcase, type ShowcaseProject } from "./ProjectsShowcase";
import { ReviewsCarousel } from "./ReviewsCarousel";

/** Görülmüş işlər: əvvəl/sonra + layihə kartı, altında Google reytinqi və rəy karuseli */
export async function Works() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const [projects, reviews] = await Promise.all([catalog.getProjects(), catalog.getReviews()]);

  const showcase: ShowcaseProject[] = projects.map((p) => ({
    slug: p.slug,
    title: localize(p.title, locale),
    location: localize(p.location, locale),
    year: t("worksYear", { year: p.year }),
    world: p.world,
    before: img(p.before),
    after: img(p.after),
    tags: p.tags.map((tag) => localize(tag, locale)),
  }));

  return (
    <Section id="islerimiz" className="reveal">
      <Container className="flex flex-col gap-section-sm">
        <div>
          <SectionHeading eyebrow={t("worksEyebrow")} title={t("worksTitle")} description={t("worksText")} />
          <ProjectsShowcase projects={showcase} groupLabel={t("worksProject")} />
        </div>

        <ReviewsCarousel
          label={t("reviewsTitle")}
          prevLabel={t("reviewsPrev")}
          nextLabel={t("reviewsNext")}
          header={
            <div className="flex items-center gap-4">
              <span className="font-heading text-display leading-none text-ink-strong">{reviews.rating.toFixed(1)}</span>
              <div className="flex flex-col gap-1">
                <h3 className="text-h4">{t("reviewsTitle")}</h3>
                <Rating value={reviews.rating} />
                <span className="text-small text-ink-muted">{t("reviewsGoogle", { count: reviews.count })}</span>
              </div>
            </div>
          }
        >
          {reviews.items.map((r) => (
            <li
              key={r.id}
              className="flex w-[85%] shrink-0 snap-start flex-col gap-5 rounded-hero border border-border bg-surface p-6 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <div className="flex items-center justify-between">
                <span role="img" className="inline-flex gap-0.5 text-primary" aria-label={`${r.rating}/5`}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Star key={i} aria-hidden className="size-4 fill-current" />
                  ))}
                </span>
                <Quote aria-hidden className="size-6 text-accent" />
              </div>
              <blockquote className="flex-1 text-body text-ink-strong">{localize(r.text, locale)}</blockquote>
              <footer className="flex items-center gap-3 border-t border-border pt-4">
                {r.avatar ? (
                  <span className="relative size-10 overflow-hidden rounded-pill">
                    <Image src={img(r.avatar)} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ) : (
                  <span aria-hidden className="inline-flex size-10 items-center justify-center rounded-pill bg-garden font-medium text-primary">
                    {r.author.charAt(0)}
                  </span>
                )}
                <div className="flex flex-col">
                  <cite className="text-small font-medium text-ink-strong not-italic">{r.author}</cite>
                  <span className="text-caption">{formatMonthYear(r.date, locale)}</span>
                </div>
              </footer>
            </li>
          ))}
        </ReviewsCarousel>
      </Container>
    </Section>
  );
}
