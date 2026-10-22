import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "E-poçt ünvanı düzgün deyil" }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Şifrəni yazın" }),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const setPasswordSchema = z
  .object({
    password: z.string().min(10, { error: "Şifrə ən azı 10 simvol olmalıdır" }),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { error: "Şifrələr eyni deyil", path: ["confirm"] });

export const inviteSchema = z.object({
  name: z.string().trim().min(2, { error: "Adı yazın" }).max(80),
  email: emailSchema,
});

export type FieldErrors = Partial<Record<string, string>>;

export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: FieldErrors;
}

export const initialFormState: FormState = { status: "idle" };

/** zod xətalarını sahə → ilk mesaj kimi qaytarır */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
