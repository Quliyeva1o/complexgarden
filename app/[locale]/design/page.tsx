import { ArrowRight, Droplets, Leaf } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { StateLabel, Swatch, ThemeCompare } from "@/components/design/ThemeCompare";
import { ThemeSwitcher } from "@/components/design/ThemeSwitcher";
import { Accordion } from "@/components/ui/Accordion";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryCircle } from "@/components/ui/CategoryCircle";
import { Checkbox } from "@/components/ui/Checkbox";
import { Container } from "@/components/ui/Container";
import { Countdown } from "@/components/ui/Countdown";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Price } from "@/components/ui/Price";
import { ProductCard } from "@/components/ui/ProductCard";
import { Rating } from "@/components/ui/Rating";
import { Section, type SectionBackground } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Text } from "@/components/ui/Text";
import { Textarea } from "@/components/ui/Textarea";
import { img } from "@/config/images";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Design");
  // Daxili səhifə — axtarış sistemlərində görünməsin
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

const buttonVariantsList = ["primary", "secondary", "outline", "ghost", "fresh", "link"] as const;
const badgeVariantsList: BadgeVariant[] = ["sale", "new", "subscription", "bestseller", "pool", "garden"];
const headingBackgrounds: SectionBackground[] = ["page", "surface", "pool", "garden", "dark"];
/** Ox yalnız dolu əsas CTA-larda və konturda — ghost və link sadə qalır */
const withArrow = (variant: (typeof buttonVariantsList)[number]) => variant !== "ghost" && variant !== "link";

/** Bölmə başlığı — /design səhifəsinin öz naviqasiya başlığı */
function DemoBlock({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 py-section-sm">
      <Heading level={2} visual="h3" id={`${id}-title`} className="mb-heading-gap">
        {title}
      </Heading>
      {children}
    </section>
  );
}

export default async function DesignPage() {
  const t = await getTranslations("Design");
  const tp = await getTranslations("Product");
  const locale = (await getLocale()) as Locale;

  const [chlorine, leylandi, poolCategory, gardenCategory, counts, campaigns, services] = await Promise.all([
    catalog.getProduct("xlor-tabletleri-200q-5kq"),
    catalog.getProduct("leylandi-1-5m"),
    catalog.getCategory("hovuz-ve-spa"),
    catalog.getCategory("bitkiler-ve-agaclar"),
    catalog.getProductCounts(),
    catalog.getCampaigns(),
    catalog.getServices(),
  ]);
  if (!chlorine || !leylandi || !poolCategory || !gardenCategory) notFound();

  const states = ["default", "hover", "focus"] as const;

  const nav = [
    "colors", "typography", "headings", "buttons", "badges", "cards", "productCard",
    "categoryCircle", "forms", "pills", "disclosure", "data", "beforeAfter",
  ] as const;

  return (
    <main>
      <Section id="intro" background="surface" spacing="sm">
        <Container className="flex flex-col gap-heading-bottom">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} as="h1" size="large" className="mb-0" />
          <div className="flex flex-col gap-2">
            <Text variant="small" tone="strong" className="font-medium">{t("switcher")}</Text>
            <ThemeSwitcher label={t("switcher")} />
            <Text variant="caption">{t("switcherHint")}</Text>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map((key) => (
              <Button key={key} href={`#${key}`} variant="ghost" size="sm" className="border border-border">
                {t(`sections.${key}`)}
              </Button>
            ))}
          </nav>
        </Container>
      </Section>

      <Container>
        {/* ---------------------------------------------------------------- Rənglər */}
        <DemoBlock id="colors" title={t("sections.colors")}>
          <ThemeCompare>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              <Swatch token="--color-primary" label="primary" />
              <Swatch token="--color-primary-hover" label="primary-hover" />
              <Swatch token="--color-secondary" label="secondary" />
              <Swatch token="--color-accent" label="accent" />
              <Swatch token="--color-fresh" label="fresh" />
              <Swatch token="--color-on-fresh" label="on-fresh" />
              <Swatch token="--bg-page" label="page" />
              <Swatch token="--bg-surface" label="surface" />
              <Swatch token="--bg-pool" label="pool" />
              <Swatch token="--bg-garden" label="garden" />
              <Swatch token="--text-strong" label="text-strong" />
              <Swatch token="--text-body" label="text-body" />
              <Swatch token="--text-muted" label="text-muted" />
              <Swatch token="--border-soft" label="border-soft" />
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ---------------------------------------------------------- Tipoqrafiya */}
        <DemoBlock id="typography" title={t("sections.typography")}>
          <ThemeCompare>
            <div className="flex flex-col gap-4">
              <div><StateLabel>.text-display — 44→80px</StateLabel><p className="text-display">Həyətiniz üçün hər şey</p></div>
              <div><StateLabel>.text-h1 — 36→56px</StateLabel><p className="text-h1">Bağ və hovuz bir yerdə</p></div>
              <div><StateLabel>.text-h2 — 32→52px</StateLabel><p className="text-h2">Ən çox seçilənlər</p></div>
              <div><StateLabel>.text-h3 — 20→24px</StateLabel><p className="text-h3">Aylıq hovuz qulluğu</p></div>
              <div><StateLabel>.text-h4 — 18px</StateLabel><p className="text-h4">Leylandi, 1.5 m</p></div>
              <div><StateLabel>.text-lead — 17→20px</StateLabel><p className="text-lead">Öz tingliyimizdə yetişdirilən ağaclar, quraşdırma və sürətli çatdırılma.</p></div>
              <div><StateLabel>.text-body — 16px</StateLabel><Text>Şaxtaya davamlı palma — −15 °C-yə qədər dözür. Ə ə Ğ ğ İ ı Ş ş Ç ç Ö ö Ü ü.</Text></div>
              <div><StateLabel>.text-small — 14px</StateLabel><Text variant="small">Bakı daxili pulsuz çatdırılma</Text></div>
              <div><StateLabel>.text-caption — 12px</StateLabel><Text variant="caption">Hovuz və SPA · 8 məhsul</Text></div>
              <div><StateLabel>.eyebrow — 13px</StateLabel><div className="flex flex-wrap gap-2"><Eyebrow>{t("sample.eyebrow")}</Eyebrow><Eyebrow icon={Droplets} className="world-pool">{t("sample.pool")}</Eyebrow></div></div>
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ------------------------------------------------ SectionHeading variantları */}
        <DemoBlock id="headings" title={t("sections.headings")}>
          <div className="flex flex-col gap-grid">
            {headingBackgrounds.map((bg) => (
              <ThemeCompare key={bg} padded={false}>
                <Section background={bg} spacing="none" className="flex flex-col gap-8 p-card">
                  <StateLabel>{t(`bg.${bg}`)}</StateLabel>
                  <div>
                    <StateLabel>{t("variants.leftNoAction")}</StateLabel>
                    <SectionHeading eyebrow={t("sample.eyebrow")} title={t("sample.title")} description={t("sample.description")} />
                  </div>
                  <div>
                    <StateLabel>{t("variants.leftAction")}</StateLabel>
                    <SectionHeading
                      eyebrow={t("sample.eyebrow")}
                      title={t("sample.title")}
                      action={<Button href="/" variant="link">{t("sample.all")} <ArrowRight /></Button>}
                    />
                  </div>
                  <div>
                    <StateLabel>{t("variants.center")}</StateLabel>
                    <SectionHeading align="center" eyebrow={t("sample.eyebrow")} title={t("sample.title")} description={t("sample.description")} />
                  </div>
                  <div>
                    <StateLabel>{t("variants.centerAction")}</StateLabel>
                    <SectionHeading
                      align="center"
                      eyebrow={t("sample.eyebrow")}
                      title={t("sample.title")}
                      action={<Button href="/" arrow variant={bg === "dark" ? "fresh" : "outline"}>{t("sample.all")}</Button>}
                    />
                  </div>
                  {bg === "page" && (
                    <div>
                      <StateLabel>{t("variants.large")}</StateLabel>
                      <SectionHeading size="large" eyebrow={t("sample.eyebrow")} title={t("sample.title")} className="mb-0" />
                    </div>
                  )}
                </Section>
              </ThemeCompare>
            ))}
          </div>
        </DemoBlock>

        {/* ------------------------------------------------------------- Düymələr */}
        <DemoBlock id="buttons" title={t("sections.buttons")}>
          <ThemeCompare>
            <div className="flex flex-col gap-6">
              {buttonVariantsList.map((variant) => (
                <div key={variant}>
                  <StateLabel>variant=&quot;{variant}&quot;</StateLabel>
                  <div className="flex flex-wrap items-end gap-4">
                    {states.map((state) => (
                      <div key={state} className="flex flex-col gap-1">
                        <span className="text-caption">{t(`states.${state}`)}</span>
                        <Button
                          variant={variant}
                          arrow={withArrow(variant)}
                          data-force={state === "default" ? undefined : state}
                        >
                          {t("sample.button")}
                        </Button>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1">
                      <span className="text-caption">{t("states.disabled")}</span>
                      <Button variant={variant} arrow={withArrow(variant)} disabled>{t("sample.button")}</Button>
                    </div>
                  </div>
                </div>
              ))}
              <div>
                <StateLabel>size = sm · md · lg · icon · arrow-sız</StateLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">{t("sample.button")}</Button>
                  <Button size="md">{t("sample.button")}</Button>
                  <Button size="lg" arrow>{t("sample.button")}</Button>
                  <Button size="icon" aria-label={tp("addToCart")}><Leaf /></Button>
                </div>
              </div>
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* -------------------------------------------------------------- Nişanlar */}
        <DemoBlock id="badges" title={t("sections.badges")}>
          <ThemeCompare>
            <div className="flex flex-col gap-5">
              {states.map((state) => (
                <div key={state}>
                  <StateLabel>{t(`states.${state}`)}{state !== "default" && " — interactive"}</StateLabel>
                  <div className="flex flex-wrap gap-2">
                    {badgeVariantsList.map((variant) => (
                      <Badge
                        key={variant}
                        variant={variant}
                        interactive={state !== "default"}
                        data-force={state === "default" ? undefined : state}
                      >
                        {variant === "sale" ? "−20%" : variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ---------------------------------------------------------------- Kartlar */}
        <DemoBlock id="cards" title={t("sections.cards")}>
          <ThemeCompare>
            <div className="flex flex-col gap-6">
              <div>
                <StateLabel>tone = surface · outline · pool · garden</StateLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["surface", "outline", "pool", "garden"] as const).map((tone) => (
                    <Card key={tone} tone={tone}>
                      <Eyebrow>{tone}</Eyebrow>
                      <Heading level={3} visual="h4" className="mt-2">{t("sample.cardTitle")}</Heading>
                      <Text variant="small" className="mt-1">{t("sample.cardText")}</Text>
                    </Card>
                  ))}
                </div>
              </div>
              <div>
                <StateLabel>interactive</StateLabel>
                <div className="grid gap-4 sm:grid-cols-3">
                  {states.map((state) => (
                    <div key={state}>
                      <span className="mb-1 block text-caption">{t(`states.${state}`)}</span>
                      <Card interactive tabIndex={0} data-force={state === "default" ? undefined : state}>
                        <Heading level={3} visual="h4">{t("sample.cardTitle")}</Heading>
                        <Text variant="small" className="mt-1">{t("sample.cardText")}</Text>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* --------------------------------------------------------- Məhsul kartı */}
        <DemoBlock id="productCard" title={t("sections.productCard")}>
          <ThemeCompare>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {states.map((state, i) => {
                const product = i === 1 ? leylandi : chlorine;
                const category = i === 1 ? gardenCategory : poolCategory;
                return (
                  <div key={state}>
                    <StateLabel>{t(`states.${state}`)}</StateLabel>
                    <ProductCard
                      product={product}
                      categoryName={localize(category.shortName ?? category.name, locale)}
                      world={category.world}
                      forceState={state === "default" ? undefined : state}
                      sizes="(min-width: 1280px) 15vw, 40vw"
                    />
                  </div>
                );
              })}
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ---------------------------------------------------- Kateqoriya dairəsi */}
        <DemoBlock id="categoryCircle" title={t("sections.categoryCircle")}>
          <ThemeCompare>
            <div className="flex flex-wrap gap-6">
              {states.map((state, i) => {
                const category = i === 1 ? gardenCategory : poolCategory;
                return (
                  <div key={state} className="flex flex-col items-center">
                    <StateLabel>{t(`states.${state}`)}</StateLabel>
                    <CategoryCircle
                      href={`/kateqoriya/${category.slug}`}
                      name={localize(category.shortName ?? category.name, locale)}
                      image={img(category.image)}
                      world={category.world}
                      productCount={counts[category.slug]}
                      forceState={state === "default" ? undefined : state}
                    />
                  </div>
                );
              })}
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ------------------------------------------------------ Forma elementləri */}
        <DemoBlock id="forms" title={t("sections.forms")}>
          <ThemeCompare>
            {(theme) => (
            <div className="grid gap-5 sm:grid-cols-2">
              <Input id={`d-name-${theme}`} label={t("sample.name")} placeholder={t("sample.namePh")} required />
              <Input id={`d-phone-hint-${theme}`} label={t("sample.phone")} hint={t("sample.phoneHint")} type="tel" defaultValue="+994 50 " />
              <Input id={`d-phone-err-${theme}`} label={t("sample.phone")} error={t("sample.phoneError")} type="tel" required />
              <Input id={`d-focus-${theme}`} label={`${t("sample.name")} — ${t("states.focus")}`} data-force="focus" defaultValue="Leyla" />
              <Input id={`d-disabled-${theme}`} label={`${t("sample.name")} — ${t("states.disabled")}`} disabled defaultValue="Leyla" />
              <Select
                id={`d-service-${theme}`}
                label={t("sample.service")}
                placeholder={t("sample.servicePh")}
                options={services.map((svc) => ({ value: svc.slug, label: localize(svc.name, locale) }))}
              />
              <div className="sm:col-span-2">
                <Textarea id={`d-message-${theme}`} label={t("sample.message")} />
              </div>
              <Checkbox id={`d-check-${theme}`} label={t("sample.checkbox")} description={t("sample.checkboxHint")} />
              <Checkbox id={`d-check-on-${theme}`} label={t("sample.checkbox")} description={t("states.selected")} defaultChecked />
            </div>
            )}
          </ThemeCompare>
        </DemoBlock>

        {/* -------------------------------------------------------------- Pill-lər */}
        <DemoBlock id="pills" title={t("sections.pills")}>
          <ThemeCompare>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Pill selected count={36}>{t("sample.all2")}</Pill>
                <Pill count={8}>{t("sample.pool")}</Pill>
                <Pill count={8}>{t("sample.plants")}</Pill>
                <Pill count={7}>{t("sample.irrigation")}</Pill>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                {states.map((state) => (
                  <div key={state} className="flex flex-col gap-1">
                    <span className="text-caption">{t(`states.${state}`)}</span>
                    <Pill data-force={state === "default" ? undefined : state}>{t("sample.pool")}</Pill>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <span className="text-caption">{t("states.selected")}</span>
                  <Pill selected>{t("sample.pool")}</Pill>
                </div>
              </div>
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ---------------------------------------------------- Accordion və Tabs */}
        <DemoBlock id="disclosure" title={t("sections.disclosure")}>
          <ThemeCompare>
            <div className="flex flex-col gap-8">
              <Accordion
                defaultOpen="q1"
                items={[
                  { id: "q1", title: t("sample.faqQ1"), content: t("sample.faqA1") },
                  { id: "q2", title: t("sample.faqQ2"), content: t("sample.faqA2") },
                ]}
              />
              <Tabs
                tabs={[
                  { id: "desc", label: t("sample.tabDesc"), content: <Text>{t("sample.tabText")}</Text> },
                  { id: "specs", label: t("sample.tabSpecs"), content: <Text>{t("sample.tabText")}</Text> },
                  { id: "reviews", label: t("sample.tabReviews"), content: <Text>{t("sample.tabText")}</Text> },
                ]}
              />
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* ------------------------------------------------ Taymer, reytinq, qiymət */}
        <DemoBlock id="data" title={t("sections.data")}>
          <ThemeCompare>
            <div className="flex flex-col gap-6">
              <Countdown endsAt={campaigns[0].endsAt} />
              <div className="on-dark rounded-card bg-primary p-card">
                <Countdown endsAt={campaigns[0].endsAt} tone="dark" />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <Rating value={4.9} count={128} />
                <Rating value={4.5} size="md" />
              </div>
              <div className="flex flex-wrap items-baseline gap-6">
                <Price value={89} oldValue={105} />
                <Price value={1290} size="lg" />
                <Price value={45} suffix={t("sample.perMonth")} size="sm" />
              </div>
            </div>
          </ThemeCompare>
        </DemoBlock>

        {/* --------------------------------------------------------- Əvvəl / sonra */}
        <DemoBlock id="beforeAfter" title={t("sections.beforeAfter")}>
          <ThemeCompare>
            <BeforeAfterSlider before={img("soilHands")} after={img("houseGarden")} alt={t("sample.sliderAlt")} sizes="(min-width: 1024px) 40vw, 90vw" />
          </ThemeCompare>
        </DemoBlock>
      </Container>
    </main>
  );
}
