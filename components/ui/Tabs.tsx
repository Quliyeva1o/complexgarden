"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: ReactNode; content: ReactNode };

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

/** WAI-ARIA tabs: ox düymələri, Home/End ilə naviqasiya; yalnız aktiv tab Tab sırasındadır */
export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "-mb-px shrink-0 border-b-2 py-3 text-body font-medium whitespace-nowrap",
                "transition-[border-color,color] duration-300 ease-out outline-none",
                "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
                selected
                  ? "border-primary text-ink-strong"
                  : "border-transparent text-ink-muted hover:text-ink-strong",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-6 outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
