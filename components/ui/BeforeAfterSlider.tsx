"use client";

import { MoveHorizontal } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type BeforeAfterSliderProps = {
  before: string;
  after: string;
  alt: string;
  className?: string;
  /** next/image sizes atributu */
  sizes?: string;
};

/**
 * Əvvəl/sonra müqayisəsi. Sürüşdürmə native range input-dur:
 * siçan, toxunma və klaviatura (ox düymələri) ilə işləyir.
 */
export function BeforeAfterSlider({ before, after, alt, className, sizes = "(min-width: 1024px) 50vw, 100vw" }: BeforeAfterSliderProps) {
  const t = useTranslations("BeforeAfter");
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div className={cn("relative aspect-4/3 overflow-hidden rounded-card bg-garden select-none", className)}>
      <Image src={after} alt={`${alt} — ${t("after")}`} fill sizes={sizes} className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={before} alt={`${alt} — ${t("before")}`} fill sizes={sizes} className="object-cover" />
      </div>

      <span className="absolute top-4 left-4 rounded-pill bg-surface px-3 py-1 text-caption font-medium text-ink-strong">
        {t("before")}
      </span>
      <span className="absolute top-4 right-4 rounded-pill bg-surface px-3 py-1 text-caption font-medium text-ink-strong">
        {t("after")}
      </span>

      {/* Ayırıcı xətt və tutacaq */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-surface text-primary shadow-card-hover">
          <MoveHorizontal className="size-5" />
        </span>
      </div>

      <label htmlFor={id} className="sr-only">
        {t("label")}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="peer absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
      {/* Klaviatura fokusu görünsün deyə */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-card peer-focus-visible:ring-2 peer-focus-visible:ring-(--focus-ring) peer-focus-visible:ring-inset" />
    </div>
  );
}
