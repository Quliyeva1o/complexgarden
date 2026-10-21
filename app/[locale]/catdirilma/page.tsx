import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { routes } from "@/config/routes";
import { InfoPageView } from "@/components/layout/InfoPageView";
import type { Locale } from "@/i18n/routing";
import { fillContent } from "@/lib/content";
import { catalog } from "@/lib/data";
import { localize } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const page = await catalog.getInfoPage("delivery");
  return page ? pageMetadata({ path: routes.delivery, locale, title: localize(page.title, locale), description: fillContent(localize(page.lead, locale)) }) : {};
}

export default function Page() {
  return <InfoPageView slug="delivery" />;
}
