import { Check, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { ProjectsShowcase, type ShowcaseProject } from "@/components/home/ProjectsShowcase";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const services = await catalog.getServices();
  return services.map((s) => ({ slug: s.slug }));
}

async function resolve(params: PageProps<"/[locale]/xidmetler/[slug]">["params"]) {
  const { locale: l, slug } = await params;
  const locale: Locale = hasLocale(routing.locales, l) ? l : routing.defaultLocale;
  return { locale, service: await catalog.getService(slug) };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/xidmetler/[slug]">): Promise<Metadata> {
  const { locale, service } = await resolve(params);
  if (!service) return {};
  return pageMetadata({
    path: routes.service(service.slug),
    locale,
    title: localize(service.name, locale),
    description: localize(service.summary, locale),
    image: img(service.image),
  });
}

async function ServiceContent({ params }: { params: PageProps<"/[locale]/xidmetler/[slug]">["params"] }) {
  const { locale, service } = await resolve(params);
  if (!service) notFound();

  const t = await getTranslations("Pages");
  const th = await getTranslations("Home");
  const [services, projects] = await Promise.all([catalog.getServices(), catalog.getProjects()]);
  const name = localize(service.name, locale);

  const showcase: ShowcaseProject[] = projects
    .filter((p) => service.projectSlugs.includes(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: localize(p.title, locale),
      location: localize(p.location, locale),
      year: String(p.year),
      world: p.world,
      before: img(p.before),
      after: img(p.after),
      tags: p.tags.map((tag) => localize(tag, locale)),
    }));

  const waText = encodeURIComponent(`${name} — ${t("requestTitle")}`);

  return (
    <>
      <PageHeader
        title={name}
        lead={localize(service.summary, locale)}
        crumbs={[{ label: t("servicesTitle"), href: routes.services }, { label: name }]}
        world="garden"
        image={img(service.image)}
      />

      <Section spacing="none" className="pb-section-sm">
        <Container className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <div className="flex flex-col gap-6">
            <p className="max-w-prose text-lead">{localize(service.description, locale)}</p>
            <div>
              <h2 className="mb-4 text-h3">{t("includes")}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {service.includes.map((inc) => (
                  <li key={inc.az} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 text-body text-ink-strong">
                    <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                    {localize(inc, locale)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="on-dark flex flex-col gap-5 self-start rounded-hero bg-primary p-6 lg:sticky lg:top-44">
            <span className="text-small">{t("perUnit", { unit: localize(service.priceUnit, locale) })}</span>
            <span className="-mt-3 font-heading text-h1 text-white">{t("priceFrom", { price: service.priceFrom })}</span>
            <Button href="#sorgu" variant="fresh" arrow className="justify-between">
              {t("requestTitle")}
            </Button>
            <div className="flex flex-col gap-2 border-t border-white/15 pt-4 text-small">
              <a href={siteConfig.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                <Phone aria-hidden className="size-4 text-(--link)" />
                {siteConfig.phone}
              </a>
              <a href={`https://wa.me/${siteConfig.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <MessageCircle aria-hidden className="size-4 text-(--link)" />
                WhatsApp
              </a>
            </div>
          </aside>
        </Container>
      </Section>

      <Section background="surface" spacing="sm">
        <Container>
          <SectionHeading title={t("process")} />
          <ProcessSteps steps={service.steps.map((s) => ({ title: localize(s.title, locale), text: localize(s.text, locale) }))} />
        </Container>
      </Section>

      {showcase.length > 0 && (
        <Section spacing="sm">
          <Container>
            <SectionHeading eyebrow={th("worksEyebrow")} title={t("gallery")} />
            <ProjectsShowcase projects={showcase} groupLabel={th("worksProject")} />
          </Container>
        </Section>
      )}

      <Section id="sorgu" spacing="sm" className="scroll-mt-40">
        <Container className="grid gap-8 rounded-hero border border-border bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-h2">{t("requestTitle")}</h2>
            <p className="text-body">{t("requestText")}</p>
          </div>
          <ServiceRequestForm
            idPrefix="svc"
            defaultService={service.slug}
            services={services.map((s) => ({ value: s.slug, label: localize(s.name, locale) }))}
          />
        </Container>
      </Section>
    </>
  );
}

export default function ServicePage({ params }: PageProps<"/[locale]/xidmetler/[slug]">) {
  return (
    <main id="main">
      <Suspense fallback={<Container className="pt-6"><span aria-hidden className="block h-56 animate-pulse rounded-hero bg-garden" /></Container>}>
        <ServiceContent params={params} />
      </Suspense>
    </main>
  );
}
