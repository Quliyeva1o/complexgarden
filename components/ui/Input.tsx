import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { controlClass, describedBy, Field } from "./Field";

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Etiketi vizual gizlət (yalnız ekran oxuyucular üçün) — məs. axtarış sahəsi */
  hideLabel?: boolean;
};

export function Input({ id, label, hint, error, hideLabel, required, className, ...props }: InputProps) {
  const input = (
    <input
      id={id}
      required={required}
      className={cn(controlClass, "h-13 rounded-pill", className)}
      {...describedBy(id, Boolean(error), Boolean(hint))}
      {...props}
    />
  );

  if (hideLabel) {
    return (
      <>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        {input}
      </>
    );
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      {input}
    </Field>
  );
}
