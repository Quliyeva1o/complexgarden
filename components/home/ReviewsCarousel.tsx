"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReviewsCarouselProps = {
  children: ReactNode;
  /** Sürüşən siyahının adı (klaviatura fokusu üçün) */
  label: string;
  prevLabel: string;
  nextLabel: string;
  header: ReactNode;
};

const arrowClass = cn(
  "inline-flex size-12 items-center justify-center rounded-pill border border-ink-strong/15 text-ink-strong outline-none",
  "transition-colors duration-300 hover:border-ink-strong hover:bg-ink-strong hover:text-page focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
);

/**
 * Rəy karuseli: scroll-snap ilə sürüşür (toxunma və trackpad), oxlar bir kart qədər keçir.
 * Avtomatik fırlanmır — oxumağa mane olmur (WAI: hərəkət edən məzmun istifadəçinin nəzarətində).
 */
export function ReviewsCarousel({ children, prevLabel, nextLabel, header, label }: ReviewsCarouselProps) {
  const track = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {header}
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label={prevLabel} className={arrowClass}>
            <ArrowLeft aria-hidden className="size-5" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={nextLabel} className={arrowClass}>
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      {/* scroll-padding = yan boşluq: snap başlanğıcda sürüşdürmür (yoxsa Chrome LCP-ni qeydə almır) */}
      <ul
        ref={track}
        tabIndex={0}
        aria-label={label}
        className="-mx-container-pad flex snap-x snap-mandatory scroll-px-container-pad gap-6 overflow-x-auto scroll-smooth px-container-pad pb-2 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-(--focus-ring) lg:mx-0 lg:px-0"
      >
        {children}
      </ul>
    </div>
  );
}
