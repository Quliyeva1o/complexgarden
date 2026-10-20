"use client";

import { useState, type ReactNode } from "react";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

type BestsellerFilterProps = {
  allLabel: string;
  emptyLabel: string;
  groupLabel: string;
  filters: { key: string; label: string }[];
  /** Serverdə render olunmuş kartlar — `filterKey` ilə qruplaşdırılıb */
  items: { id: string; filterKey: string; node: ReactNode }[];
  /** "Hamısı" seçiləndə göstərilən maksimum say */
  limit?: number;
};

/** Ən çox satılanlar: pill filtrləri ilə client tərəfdə süzgəc (səhifə yenidən yüklənmir) */
export function BestsellerFilter({ allLabel, emptyLabel, groupLabel, filters, items, limit = 8 }: BestsellerFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  const visible = (active ? items.filter((i) => i.filterKey === active) : items).slice(0, limit);
  const count = (key: string) => items.filter((i) => i.filterKey === key).length;

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label={groupLabel} className="-mx-container-pad flex gap-2 overflow-x-auto px-container-pad [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Pill selected={active === null} onClick={() => setActive(null)}>
          {allLabel}
        </Pill>
        {filters.map((f) => (
          <Pill key={f.key} selected={active === f.key} count={count(f.key)} onClick={() => setActive(f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul aria-live="polite" className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4">
          {visible.map((i, index) => (
            // Planşetdə (3 sütun) 6, desktop-da (4 sütun) 8 kart — son sıra yarımçıq qalmasın
            <li key={i.id} className={cn("flex", index >= 6 && "md:max-lg:hidden")}>
              {i.node}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-ink-muted">{emptyLabel}</p>
      )}
    </div>
  );
}
