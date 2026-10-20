import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { controlClass, describedBy, Field } from "./Field";

type SelectProps = Omit<ComponentPropsWithoutRef<"select">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: { value: string; label: string }[];
  /** Boş ilk seçim mətni, məs. "Xidmət seçin" */
  placeholder?: string;
};

/** Native select — mobil cihazlarda sistem seçicisi açılır, klaviatura ilə tam işləyir */
export function Select({ id, label, hint, error, options, placeholder, required, className, ...props }: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          id={id}
          required={required}
          className={cn(controlClass, "h-13 cursor-pointer appearance-none rounded-pill pr-12", className)}
          {...describedBy(id, Boolean(error), Boolean(hint))}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-5 size-4.5 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </Field>
  );
}
