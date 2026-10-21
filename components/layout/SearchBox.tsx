"use client";

import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { SearchResponse } from "@/app/api/search/route";
import { formatAzn } from "@/components/ui/Price";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Option = { href: string; key: string };

type SearchBoxProps = {
  className?: string;
  autoFocus?: boolean;
  /** Seçim edildikdən sonra (məs. mobil axtarış pəncərəsini bağlamaq üçün) */
  onNavigate?: () => void;
  /** true → nəticələr input-un altında axında göstərilir (mobil dialoqda kəsilməsin deyə) */
  inline?: boolean;
  /** Səhifədə ikinci axtarış forması varsa fərqli ad (landmark-lar unikal olsun) */
  label?: string;
};

/**
 * Axtarış + yazdıqca təkliflər (ARIA combobox). ↑/↓ seçir, Enter açır, Esc bağlayır.
 * Seçim olmadan Enter → axtarış nəticələri səhifəsi.
 */
export function SearchBox({ className, autoFocus, onNavigate, inline = false, label }: SearchBoxProps) {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = query.trim();

  // Dialoq (mobil axtarış) açılanda fokus bağlama düyməsinə düşür — input-a keçir
  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [autoFocus]);

  // Debounce + köhnə sorğunu ləğv et
  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&locale=${locale}`, {
          signal: controller.signal,
        });
        setResults((await res.json()) as SearchResponse);
        setActive(-1);
      } catch {
        // ləğv edilmiş sorğu — heç nə etmə
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, locale]);

  const visible = term.length >= 2 ? results : null;
  const options: Option[] = [
    ...(visible?.categories ?? []).map((c) => ({ key: `c-${c.slug}`, href: routes.category(c.slug) })),
    ...(visible?.products ?? []).map((p) => ({ key: `p-${p.slug}`, href: routes.product(p.slug) })),
  ];
  const showPanel = open && term.length >= 2 && visible !== null;

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (!options.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
    } else if (event.key === "Escape") {
      if (open) {
        event.stopPropagation();
        setOpen(false);
      } else {
        setQuery("");
      }
    }
  }

  const optionId = (key: string) => `${listId}-${key}`;

  return (
    <div className={cn("relative", className)}>
      <form
        role="search"
        aria-label={label ?? t("searchLabel")}
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && options[active]) go(options[active].href);
          else if (term) go(routes.search(term));
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-4.5 -translate-y-1/2 text-ink-muted" />
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            autoComplete="off"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 && options[active] ? optionId(options[active].key) : undefined}
            value={query}
            placeholder={t("searchPlaceholder")}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => !inline && setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
            className={cn(
              "h-12 w-full rounded-pill border border-ink-strong/12 bg-surface pr-12 pl-12 text-body text-ink-strong",
              "placeholder:text-ink-muted outline-none transition-[border-color,box-shadow] duration-300 ease-out",
              "hover:border-ink-strong/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
              "[&::-webkit-search-cancel-button]:hidden",
            )}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2">
            {loading && term.length >= 2 ? (
              <Loader2 aria-hidden className="size-4.5 animate-spin text-ink-muted" />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="inline-flex size-7 items-center justify-center rounded-pill text-ink-muted hover:bg-ink-strong/6 hover:text-ink-strong"
                  aria-label={t("closeMenu")}
                >
                  <X aria-hidden className="size-4" />
                </button>
              )
            )}
          </span>
        </div>
      </form>

      {showPanel && (
        <div
          className={cn(
            "overflow-hidden rounded-card border border-border bg-surface",
            inline ? "mt-3" : "absolute inset-x-0 top-full z-50 mt-2 shadow-card-hover",
          )}
        >
          <ul id={listId} role="listbox" aria-label={t("searchLabel")} className="max-h-[min(70vh,28rem)] overflow-y-auto p-2">
            {visible.categories.length > 0 && (
              <li role="presentation" className="px-3 pt-2 pb-1 text-caption">
                {t("searchCategories")}
              </li>
            )}
            {visible.categories.map((c, i) => {
              return (
                <li key={c.slug} id={optionId(`c-${c.slug}`)} role="option" aria-selected={active === i}>
                  <Link
                    href={routes.category(c.slug)}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center rounded-media px-3 py-2.5 text-body font-medium text-ink-strong",
                      active === i ? "bg-garden" : "hover:bg-garden",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}

            {visible.products.length > 0 && (
              <li role="presentation" className="px-3 pt-3 pb-1 text-caption">
                {t("searchProducts")}
              </li>
            )}
            {visible.products.map((p, pi) => {
              const i = visible.categories.length + pi;
              return (
                <li key={p.slug} id={optionId(`p-${p.slug}`)} role="option" aria-selected={active === i}>
                  <Link
                    href={routes.product(p.slug)}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-media p-2",
                      active === i ? "bg-garden" : "hover:bg-garden",
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-tag bg-garden">
                      <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body text-ink-strong">{p.name}</span>
                      <span className="text-caption">{p.category}</span>
                    </span>
                    <span className="font-heading text-body font-medium text-ink-strong tabular-nums">
                      {formatAzn(p.price, locale)}
                    </span>
                  </Link>
                </li>
              );
            })}

            {options.length === 0 && !loading && (
              <li role="presentation" className="px-3 py-4 text-small text-ink-muted">
                {t("searchEmpty", { q: term })}
              </li>
            )}
          </ul>
          {options.length > 0 && (
            <Link
              href={routes.search(term)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between border-t border-border px-5 py-3 text-small font-medium text-(--link) hover:bg-garden"
            >
              {t("searchAll")}
              <Search aria-hidden className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
