"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  world: "pool" | "garden";
  /** Şəklin üstündə göstəriləcək nişanlar (serverdə render olunur) */
  badges?: React.ReactNode;
};

/**
 * Məhsul qalereyası: böyük şəkil + miniatürlər. Desktop-da kursorun ardınca 2× böyütmə,
 * klik/Enter → tam ekran baxış (native <dialog>, Esc ilə bağlanır, ox düymələri ilə keçid).
 */
export function ProductGallery({ images, alt, world, badges }: ProductGalleryProps) {
  const t = useTranslations("ProductPage");
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const bg = world === "pool" ? "bg-pool" : "bg-garden";

  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onMove(e: MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <div className="flex flex-col gap-3" aria-label={t("galleryLabel")} role="region">
      <div className="relative">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          onMouseMove={onMove}
          onMouseLeave={() => setOrigin(null)}
          aria-label={`${t("zoom")}: ${alt}`}
          className={cn(
            "group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-hero outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
            bg,
          )}
        >
          <Image
            src={images[active]}
            alt={`${alt} — ${t("imageOf", { n: active + 1, total: images.length })}`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 ease-out"
            style={origin ? { transform: "scale(2)", transformOrigin: origin } : undefined}
          />
          <span className="absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-pill bg-surface/90 text-ink-strong opacity-0 shadow-float transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 aria-hidden className="size-4.5" />
          </span>
        </button>
        {badges && <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-1.5">{badges}</div>}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("imageOf", { n: i + 1, total: images.length })}
                aria-current={i === active}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-media outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-(--focus-ring) sm:size-24",
                  bg,
                  i === active ? "ring-2 ring-ink-strong" : "opacity-80 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={alt}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto size-full max-h-none max-w-none bg-ink-strong/90 p-0 backdrop:bg-transparent"
      >
        <div className="relative flex size-full items-center justify-center p-4 sm:p-10">
          <div className="relative size-full max-w-5xl">
            <Image src={images[active]} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t("closeZoom")}
            className="absolute top-4 right-4 inline-flex size-12 items-center justify-center rounded-pill bg-surface text-ink-strong outline-none focus-visible:ring-2 focus-visible:ring-fresh"
          >
            <X aria-hidden className="size-5" />
          </button>
          {images.length > 1 && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-pill bg-surface px-4 py-1.5 text-small text-ink-strong">
              {t("imageOf", { n: active + 1, total: images.length })}
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
