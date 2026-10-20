import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccordionItem = { id: string; title: ReactNode; content: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  /** Başlanğıcda açıq olan elementin id-si */
  defaultOpen?: string;
  className?: string;
};

/**
 * Native <details>/<summary> üzərində — JS tələb etmir, klaviatura və ekran oxuyucu dəstəyi brauzerdən gəlir.
 * FAQ və filtr qrupları üçün.
 */
export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <details key={item.id} className="group" open={item.id === defaultOpen}>
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-h4 text-ink-strong",
              "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            {item.title}
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill border border-ink-strong/15 text-ink-strong transition-[transform,background-color,color,border-color] duration-300 ease-out group-open:rotate-45 group-open:border-fresh group-open:bg-fresh group-open:text-on-fresh">
              <Plus aria-hidden className="size-4" />
            </span>
          </summary>
          <div className="max-w-3xl pr-16 pb-6 text-ink">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
