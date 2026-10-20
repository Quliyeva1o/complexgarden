import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type PillProps = ComponentPropsWithoutRef<"button"> & {
  selected?: boolean;
  /** Pill yanında say (məs. nəticə sayı) */
  count?: number;
};

/** Filtr düyməsi. Seçilmiş vəziyyət aria-pressed ilə ekran oxuyuculara da bildirilir. */
export function Pill({ selected = false, count, className, children, type = "button", ...props }: PillProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 rounded-pill border px-5 text-small font-medium whitespace-nowrap",
        "transition-[background-color,border-color,color] duration-300 ease-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-page)",
        selected
          ? "border-ink-strong bg-ink-strong text-page"
          : "border-ink-strong/15 bg-transparent text-ink-strong hover:border-ink-strong",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn("text-caption tabular-nums", selected ? "text-page/70" : "text-ink-muted")}>{count}</span>
      )}
    </button>
  );
}
