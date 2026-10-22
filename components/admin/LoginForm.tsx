"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next} />
      <Input id="email" name="email" type="email" label="E-poçt" autoComplete="email" required error={state.errors?.email} />
      <Input id="password" name="password" type="password" label="Şifrə" autoComplete="current-password" required error={state.errors?.password} />
      <SubmitButton pendingText="Daxil olunur…">Daxil ol</SubmitButton>
      <Link href="/admin/sifre-berpa" className="text-small text-(--link) underline underline-offset-4">
        Şifrəni unutmusunuz?
      </Link>
    </form>
  );
}
