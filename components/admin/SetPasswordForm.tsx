"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { updatePassword } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function SetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <Input id="password" name="password" type="password" label="Yeni şifrə" hint="Ən azı 10 simvol" autoComplete="new-password" required error={state.errors?.password} />
      <Input id="confirm" name="confirm" type="password" label="Şifrəni təkrarlayın" autoComplete="new-password" required error={state.errors?.confirm} />
      <SubmitButton pendingText="Saxlanılır…">Şifrəni saxla</SubmitButton>
    </form>
  );
}
