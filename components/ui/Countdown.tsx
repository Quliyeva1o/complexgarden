"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// Saniyədə bir dəfə yenilənən ortaq "saat" — bütün taymerlər eyni intervalı paylaşır
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const nowInSeconds = () => Math.floor(Date.now() / 1000);
// Serverdə və hidratasiyada vaxt bilinmir → "--" göstərilir (hidratasiya uyğunsuzluğu olmur)
const serverSnapshot = () => null;

type CountdownProps = {
  /** ISO tarix */
  endsAt: string;
  className?: string;
  /** dark = tünd banner üzərində */
  tone?: "light" | "dark";
};

/** Kampaniya üçün gün / saat / dəqiqə / saniyə taymeri */
export function Countdown({ endsAt, className, tone = "light" }: CountdownProps) {
  const t = useTranslations("Countdown");
  const now = useSyncExternalStore(subscribe, nowInSeconds, serverSnapshot);
  const end = Math.floor(new Date(endsAt).getTime() / 1000);
  const left = now === null ? null : Math.max(0, end - now);

  const parts = [
    { key: "days", value: left === null ? null : Math.floor(left / 86400) },
    { key: "hours", value: left === null ? null : Math.floor((left % 86400) / 3600) },
    { key: "minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { key: "seconds", value: left === null ? null : left % 60 },
  ] as const;

  if (left === 0) {
    return <p className={cn("text-small font-medium", className)}>{t("ended")}</p>;
  }

  return (
    <div className={cn("flex items-start gap-1.5 sm:gap-2", className)} role="timer" aria-label={t("label")}>
      {parts.map((part, i) => (
        <div key={part.key} className="flex items-start gap-1.5 sm:gap-2">
          {i > 0 && (
            <span aria-hidden className="pt-3 font-heading text-h3 text-ink-muted sm:pt-4">
              :
            </span>
          )}
          <div className="flex flex-col items-center gap-1.5">
            <span
              aria-hidden={part.key === "seconds"}
              className={cn(
                "flex h-16 min-w-16 items-center justify-center rounded-media border px-2 font-heading text-h2 font-medium tabular-nums sm:h-20 sm:min-w-20",
                tone === "dark" ? "border-white/15 bg-white/8 text-white" : "border-border bg-surface text-ink-strong",
              )}
            >
              {part.value === null ? "--" : String(part.value).padStart(2, "0")}
            </span>
            <span className="text-caption">{t(part.key)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
