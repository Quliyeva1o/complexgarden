import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Forma elementlərinin ortaq stili — Input, Select, Textarea eyni görünür */
export const controlClass = cn(
  "w-full border border-ink-strong/12 bg-surface px-5 text-body text-ink-strong",
  "placeholder:text-ink-muted transition-[border-color,box-shadow] duration-300 ease-out outline-none",
  "hover:border-ink-strong/30",
  "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export const fieldHintId = (id: string) => `${id}-hint`;
export const fieldErrorId = (id: string) => `${id}-error`;

/**
 * Etiket + idarəetmə elementi + ipucu/xəta. Xəta inline göstərilir və
 * `aria-describedby` ilə elementə bağlanır (bunu Input/Select/Textarea özü edir).
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-medium text-ink-strong">
        {label}
        {required && (
          <span aria-hidden className="text-danger">
            {" "}*
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={fieldErrorId(id)} className="text-small text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={fieldHintId(id)} className="text-caption">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** aria-describedby və aria-invalid dəyərlərini qurur */
export function describedBy(id: string, hasError: boolean, hasHint: boolean) {
  if (hasError) return { "aria-describedby": fieldErrorId(id), "aria-invalid": true as const };
  if (hasHint) return { "aria-describedby": fieldHintId(id) };
  return {};
}
