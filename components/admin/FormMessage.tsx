import type { FormState } from "@/lib/admin/validation";
import { cn } from "@/lib/utils";

/** Formanın ümumi nəticə mesajı (xəta və ya uğur) */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-card px-4 py-3 text-small",
        state.status === "error" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary",
      )}
    >
      {state.message}
    </p>
  );
}
