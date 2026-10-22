"use client";

import { Type } from "lucide-react";
import { useEffect, useState } from "react";
import { logoFontLabels, logoFonts, siteConfig, type LogoFont } from "@/config/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "logo-font";

/**
 * Müvəqqəti: loqo yazısının şriftini sayt üzərində sınamaq üçün düymə.
 * Hər klik növbəti varianta keçir (Shift+klik — əvvəlkinə), seçim brauzerdə yadda qalır.
 * 1024px-dən dar ekranlarda gizlidir (header-də yer yoxdur). Söndürmək: config/site.ts → `logo.fontPicker: false`.
 */
export function LogoFontPicker({ className }: { className?: string }) {
  const [font, setFont] = useState<LogoFont>(siteConfig.logo.font);

  // Yadda qalan seçimi bərpa et
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved && saved in logoFontLabels) apply(saved as LogoFont);
  }, []);

  function apply(next: LogoFont) {
    document.documentElement.dataset.logoFont = next;
    setFont(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  const index = logoFonts.indexOf(font);

  return (
    <button
      type="button"
      onClick={(e) => {
        const step = e.shiftKey ? -1 : 1;
        apply(logoFonts[(index + step + logoFonts.length) % logoFonts.length]);
      }}
      title="Loqo şriftini dəyiş (Shift+klik — əvvəlki)"
      className={cn(
        "hidden h-9 shrink-0 items-center gap-2 rounded-pill lg:inline-flex border border-dashed border-primary/40 px-2.5 text-caption text-primary outline-none hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
        className,
      )}
    >
      <Type aria-hidden className="size-4" />
      <span aria-live="polite" className="whitespace-nowrap">
        <span className="hidden xl:inline">{logoFontLabels[font]} </span>
        {index + 1}/{logoFonts.length}
      </span>
      <span className="sr-only">— loqo şriftini dəyiş</span>
    </button>
  );
}
