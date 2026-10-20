"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, use, useOptimistic, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Sheet } from "@/components/layout/Sheet";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Pill } from "@/components/ui/Pill";
import { usePathname, useRouter } from "@/i18n/navigation";
import { countActiveFilters, productSorts, serializeCatalogQuery, type FacetCounts, type ProductQuery, type ProductSort } from "@/lib/data";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Kontekst: cari sorğu + URL-i yeniləyən naviqasiya                           */
/* -------------------------------------------------------------------------- */

/** Serverdə tərcümə olunmuş filtr təsviri (range bucket-ləri də "options" kimi gəlir) */
export type PanelFilter = {
  key: string;
  label: string;
  type: "options" | "boolean";
  options: { value: string; label: string }[];
};

type CatalogContextValue = {
  query: ProductQuery;
  q?: string;
  counts: FacetCounts;
  total: number;
  filters: PanelFilter[];
  brands: string[];
  isPending: boolean;
  update: (next: ProductQuery) => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function useCatalog() {
  const ctx = use(CatalogContext);
  if (!ctx) throw new Error("CatalogProvider tapılmadı");
  return ctx;
}

type ProviderProps = Omit<CatalogContextValue, "isPending" | "update"> & { children: ReactNode };

/**
 * Filtr dəyişəndə URL `router.replace` ilə yenilənir (paylaşıla bilən link, səhifə yuxarı atılmır).
 * Seçim `useOptimistic` ilə dərhal görünür; server yeni nəticələri render edənə qədər
 * `isPending` → nəticələr yüngül solğunlaşır.
 */
export function CatalogProvider({ children, ...value }: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setOptimisticQuery] = useOptimistic(value.query);

  const update = (next: ProductQuery) => {
    const params = serializeCatalogQuery(next, { q: value.q }).toString();
    startTransition(() => {
      setOptimisticQuery(next);
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  };

  return <CatalogContext value={{ ...value, query, isPending, update }}>{children}</CatalogContext>;
}

/* -------------------------------------------------------------------------- */
/* Köməkçilər                                                                  */
/* -------------------------------------------------------------------------- */

const toggle = (list: string[] | undefined, value: string) =>
  list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];

const clearedQuery = (q: ProductQuery): ProductQuery => ({ subcategorySlug: q.subcategorySlug, sort: q.sort });

/* -------------------------------------------------------------------------- */
/* Alt bölmə pill-ləri                                                          */
/* -------------------------------------------------------------------------- */

export function SubcategoryPills({ items }: { items: { slug: string; name: string }[] }) {
  const t = useTranslations("Catalog");
  const { query, counts, update } = useCatalog();
  if (!items.length) return null;
  const total = Object.values(counts.subcategories).reduce((a, b) => a + b, 0);

  return (
    <div role="group" aria-label={t("subcategories")} className="-mx-container-pad flex gap-2 overflow-x-auto px-container-pad pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
      <Pill selected={!query.subcategorySlug} count={total} onClick={() => update({ ...query, subcategorySlug: undefined })}>
        {t("allSubcategories")}
      </Pill>
      {items.map((s) => (
        <Pill
          key={s.slug}
          selected={query.subcategorySlug === s.slug}
          count={counts.subcategories[s.slug] ?? 0}
          onClick={() => update({ ...query, subcategorySlug: query.subcategorySlug === s.slug ? undefined : s.slug })}
        >
          {s.name}
        </Pill>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filtr paneli                                                                */
/* -------------------------------------------------------------------------- */

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-border py-4 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body font-medium text-ink-strong outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown aria-hidden className="size-4 text-ink-muted transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 pt-4">{children}</div>
    </details>
  );
}

function OptionRow({ id, label, count, checked, onChange }: { id: string; label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Checkbox id={id} label={label} checked={checked} onChange={onChange} disabled={!checked && count === 0} />
      <span className="text-caption tabular-nums">{count}</span>
    </div>
  );
}

function PriceFilter({ idPrefix }: { idPrefix: string }) {
  const t = useTranslations("Catalog");
  const { query, counts, update } = useCatalog();
  // URL dəyişəndə (məs. "təmizlə") inputlar yenilənsin deyə açar kimi istifadə olunur
  const key = `${query.priceMin ?? ""}-${query.priceMax ?? ""}`;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const read = (name: string) => {
      const v = String(data.get(name) ?? "").trim();
      return v === "" || Number.isNaN(Number(v)) ? undefined : Math.max(0, Number(v));
    };
    let min = read("min");
    let max = read("max");
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
    update({ ...query, priceMin: min, priceMax: max });
  }

  const inputClass =
    "h-11 w-full min-w-0 rounded-pill border border-ink-strong/12 bg-surface px-4 text-body text-ink-strong tabular-nums outline-none placeholder:text-ink-muted focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10";

  return (
    <form key={key} onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-caption">{t("priceMin")}</span>
          <input id={`${idPrefix}-min`} name="min" type="number" inputMode="numeric" min={0} defaultValue={query.priceMin} placeholder={String(counts.priceRange.min)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption">{t("priceMax")}</span>
          <input id={`${idPrefix}-max`} name="max" type="number" inputMode="numeric" min={0} defaultValue={query.priceMax} placeholder={String(counts.priceRange.max)} className={inputClass} />
        </label>
      </div>
      <Button type="submit" variant="outline" size="sm">
        {t("priceApply")}
      </Button>
    </form>
  );
}

/** Filtr paneli — desktop-da sol sütunda, mobil-də aşağıdan açılan paneldə */
export function FilterPanel({ idPrefix = "f" }: { idPrefix?: string }) {
  const t = useTranslations("Catalog");
  const { query, counts, filters, brands, update } = useCatalog();

  return (
    <div className="flex flex-col">
      <FilterGroup title={t("price")}>
        <PriceFilter idPrefix={idPrefix} />
      </FilterGroup>

      {filters.map((f) => (
        <FilterGroup key={f.key} title={f.label}>
          {f.type === "boolean" ? (
            <OptionRow
              id={`${idPrefix}-${f.key}`}
              label={f.label}
              count={counts.facets[f.key]?.true ?? 0}
              checked={Boolean(query.facets?.[f.key]?.length)}
              onChange={() =>
                update({ ...query, facets: { ...query.facets, [f.key]: query.facets?.[f.key]?.length ? [] : ["true"] } })
              }
            />
          ) : (
            f.options.map((o) => (
              <OptionRow
                key={o.value}
                id={`${idPrefix}-${f.key}-${o.value}`}
                label={o.label}
                count={counts.facets[f.key]?.[o.value] ?? 0}
                checked={Boolean(query.facets?.[f.key]?.includes(o.value))}
                onChange={() => update({ ...query, facets: { ...query.facets, [f.key]: toggle(query.facets?.[f.key], o.value) } })}
              />
            ))
          )}
        </FilterGroup>
      ))}

      {brands.length > 1 && (
        <FilterGroup title={t("brand")}>
          {brands.map((b) => (
            <OptionRow
              key={b}
              id={`${idPrefix}-brand-${b}`}
              label={b}
              count={counts.brands[b] ?? 0}
              checked={Boolean(query.brands?.includes(b))}
              onChange={() => update({ ...query, brands: toggle(query.brands, b) })}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title={t("availability")}>
        <OptionRow
          id={`${idPrefix}-stock`}
          label={t("inStock")}
          count={counts.inStock}
          checked={Boolean(query.inStock)}
          onChange={() => update({ ...query, inStock: query.inStock ? undefined : true })}
        />
        <OptionRow
          id={`${idPrefix}-sub`}
          label={t("subscription")}
          count={counts.subscription}
          checked={Boolean(query.subscription)}
          onChange={() => update({ ...query, subscription: query.subscription ? undefined : true })}
        />
      </FilterGroup>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Üst panel: nəticə sayı, sıralama, mobil filtr düyməsi, aktiv çiplər          */
/* -------------------------------------------------------------------------- */

const sortLabelKey: Record<ProductSort, "sortPopular" | "sortNew" | "sortPriceAsc" | "sortPriceDesc"> = {
  popular: "sortPopular",
  new: "sortNew",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
};

export function CatalogToolbar() {
  const t = useTranslations("Catalog");
  const { query, total, update } = useCatalog();
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(query);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-body text-ink-strong" aria-live="polite">
        {t("results", { count: total })}
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="lg:hidden" aria-haspopup="dialog">
          <SlidersHorizontal aria-hidden />
          {active ? t("filtersCount", { count: active }) : t("filters")}
        </Button>

        <label className="relative">
          <span className="sr-only">{t("sort")}</span>
          <select
            value={query.sort ?? "popular"}
            onChange={(e) => update({ ...query, sort: e.target.value as ProductSort })}
            className="h-10 cursor-pointer appearance-none rounded-pill border border-ink-strong/15 bg-surface pr-10 pl-4 text-small font-medium text-ink-strong outline-none hover:border-ink-strong focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            {productSorts.map((s) => (
              <option key={s} value={s}>
                {t(sortLabelKey[s])}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-muted" />
        </label>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        label={t("filters")}
        closeLabel={t("filters")}
        variant="bottom"
        header={<span className="text-h4">{t("filters")}</span>}
        footer={
          <div className="flex gap-2">
            {active > 0 && (
              <Button variant="ghost" onClick={() => update(clearedQuery(query))}>
                {t("clearAll")}
              </Button>
            )}
            <Button className="flex-1" onClick={() => setOpen(false)}>
              {t("showResults", { count: total })}
            </Button>
          </div>
        }
      >
        <div className="overflow-y-auto px-container-pad py-5">
          <FilterPanel idPrefix="mf" />
        </div>
      </Sheet>
    </div>
  );
}

/** Seçilmiş filtrlər çip kimi — hər biri ayrıca götürülə bilir */
export function ActiveFilters() {
  const t = useTranslations("Catalog");
  const { query, filters, update } = useCatalog();

  const chips: { label: string; remove: ProductQuery }[] = [];
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    chips.push({ label: `${query.priceMin ?? 0} – ${query.priceMax ?? "∞"} ₼`, remove: { ...query, priceMin: undefined, priceMax: undefined } });
  }
  for (const f of filters) {
    for (const value of query.facets?.[f.key] ?? []) {
      const label = f.type === "boolean" ? f.label : f.options.find((o) => o.value === value)?.label ?? value;
      chips.push({ label, remove: { ...query, facets: { ...query.facets, [f.key]: toggle(query.facets?.[f.key], value) } } });
    }
  }
  for (const b of query.brands ?? []) chips.push({ label: b, remove: { ...query, brands: toggle(query.brands, b) } });
  if (query.inStock) chips.push({ label: t("inStock"), remove: { ...query, inStock: undefined } });
  if (query.subscription) chips.push({ label: t("subscription"), remove: { ...query, subscription: undefined } });

  if (!chips.length) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <li key={c.label}>
          <button
            type="button"
            onClick={() => update(c.remove)}
            aria-label={t("removeFilter", { label: c.label })}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-garden pr-2 pl-3 text-small font-medium text-ink-strong outline-none hover:bg-ink-strong hover:text-page focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            {c.label}
            <X aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={() => update(clearedQuery(query))} className="px-2 text-small font-medium text-(--link) underline underline-offset-4">
          {t("clearAll")}
        </button>
      </li>
    </ul>
  );
}

/** Nəticələr — server yeni siyahını göndərənə qədər yüngül solğun */
export function ResultsArea({ children }: { children: ReactNode }) {
  const { isPending } = useCatalog();
  return (
    <div aria-busy={isPending} className={cn("transition-opacity duration-300", isPending && "pointer-events-none opacity-50")}>
      {children}
    </div>
  );
}

/** Boş nəticə: izah + filtrləri təmizləmə düyməsi */
export function EmptyResults({ title, text }: { title: string; text: string }) {
  const t = useTranslations("Catalog");
  const { query, update } = useCatalog();
  return (
    <div className="flex flex-col items-center gap-3 rounded-hero border border-dashed border-ink-strong/20 px-6 py-16 text-center">
      <SlidersHorizontal aria-hidden className="size-8 text-ink-muted" strokeWidth={1.5} />
      <h2 className="text-h3">{title}</h2>
      <p className="max-w-md text-body">{text}</p>
      {countActiveFilters(query) > 0 && (
        <Button variant="outline" onClick={() => update(clearedQuery(query))} className="mt-2">
          {t("emptyCta")}
        </Button>
      )}
    </div>
  );
}
