import { Check } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "id"> & {
  id: string;
  label: ReactNode;
  /** Etiketin altında kiçik izah (məs. "+15 ₼") */
  description?: ReactNode;
};

/** Native checkbox üzərində qurulub — klaviatura və forma davranışı brauzerdən gəlir */
export function Checkbox({ id, label, description, className, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("group inline-flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-sm border border-ink-muted bg-surface",
            "transition-[background-color,border-color] duration-300 ease-out outline-none",
            "hover:border-primary checked:border-primary checked:bg-primary",
            "focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-page)",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...props}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0.5 size-4 text-on-primary opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="flex flex-col">
        <span className="text-body text-ink-strong">{label}</span>
        {description && <span className="text-small text-ink-muted">{description}</span>}
      </span>
    </label>
  );
}
