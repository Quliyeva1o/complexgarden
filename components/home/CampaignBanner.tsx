import { Timer } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Countdown } from "@/components/ui/Countdown";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { img } from "@/config/images";
import { routes } from "@/config/routes";
import type { Locale } from "@/i18n/routing";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";

/**
 * Kampaniya banneri + geri sayım taymeri. Bitmə tarixi data/campaigns.ts-dən gəlir.
 * Tünd yaşıl panel, lime düymə (--color-fresh yalnız burada və endirim nişanında).
 */
export async function CampaignBanner() {
  const t = await getTranslations("Home");
  const locale = (await getLocale()) as Locale;
  const [campaign] = await catalog.getCampaigns();
  if (!campaign) return null;

  return (
    <Section id="kampaniya" spacing="sm" className="reveal" aria-labelledby="campaign-title">
      <Container>
        <div className="on-dark grid overflow-hidden rounded-hero bg-primary text-ink lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col items-start gap-6 p-6 sm:p-10 lg:p-14">
            <Eyebrow icon={Timer}>{t("campaignEyebrow")}</Eyebrow>
            <h2 id="campaign-title" className="text-h2">
              {localize(campaign.title, locale)}
            </h2>
            <p className="max-w-md text-body">{localize(campaign.description, locale)}</p>
            <div className="flex flex-col gap-3">
              <span className="text-small">{t("campaignEnds")}</span>
              <Countdown endsAt={campaign.endsAt} tone="dark" />
            </div>
            <Button href={routes.campaigns} variant="fresh" size="lg" arrow className="mt-2">
              {t("campaignCta")}
            </Button>
          </div>

          <div className="relative min-h-72 lg:min-h-full">
            <Image src={img(campaign.image)} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            {/* Endirim stikeri */}
            <span className="absolute top-6 right-6 flex size-28 -rotate-6 flex-col items-center justify-center rounded-pill bg-fresh text-on-fresh shadow-float">
              <span className="font-heading text-h2 leading-none font-medium">−{campaign.discountPercent}%</span>
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
