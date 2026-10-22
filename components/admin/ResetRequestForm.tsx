"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordReset, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <Input id="email" name="email" type="email" label="E-poçt" autoComplete="email" required error={state.errors?.email} />
      <SubmitButton pendingText="Göndərilir…">Bərpa linki göndər</SubmitButton>
      <Link href="/admin/giris" className="text-small text-(--link) underline underline-offset-4">
        Girişə qayıt
      </Link>
    </form>
  );
}
