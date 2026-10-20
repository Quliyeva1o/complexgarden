import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { controlClass, describedBy, Field } from "./Field";

type TextareaProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function Textarea({ id, label, hint, error, required, rows = 4, className, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={cn(controlClass, "min-h-28 resize-y rounded-card py-3", className)}
        {...describedBy(id, Boolean(error), Boolean(hint))}
        {...props}
      />
    </Field>
  );
}
