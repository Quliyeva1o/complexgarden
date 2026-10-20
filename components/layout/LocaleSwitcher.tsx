"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = { tone?: "light" | "dark"; className?: string };

function Links({ tone = "dark", className }: Props) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const href = search ? `${pathname}?${search}` : pathname;

  return (
    <nav aria-label={t("language")} className={cn("flex items-center gap-0.5", className)}>
      {routing.locales.map((l) => {
        const current = l === locale;
        return (
          <Link
            key={l}
            href={href}
            locale={l}
            hrefLang={l}
            aria-current={current ? "true" : undefined}
            className={cn(
              "inline-flex h-7 min-w-9 items-center justify-center rounded-pill px-2 text-caption font-semibold uppercase outline-none",
              "transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
              tone === "dark"
                ? current
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:text-white"
                : current
                  ? "bg-ink-strong text-page"
                  : "text-ink-muted hover:text-ink-strong",
            )}
          >
            {l}
          </Link>
        );
      })}
    </nav>
  );
}

/** AZ / RU / EN — cari səhifədə qalaraq dili dəyişir (query parametrləri də saxlanılır) */
export function LocaleSwitcher(props: Props) {
  // useSearchParams statik prerender zamanı Suspense tələb edir
  return (
    <Suspense fallback={<span className={cn("h-7 w-30", props.className)} />}>
      <Links {...props} />
    </Suspense>
  );
}
