"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { inviteAdmin } from "@/lib/admin/admins-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function InviteAdminForm() {
  const [state, action] = useActionState(inviteAdmin, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <Input id="invite-name" name="name" label="Ad" autoComplete="off" required error={state.errors?.name} />
      <Input id="invite-email" name="email" type="email" label="E-poçt" autoComplete="off" required error={state.errors?.email} />
      <SubmitButton pendingText="Göndərilir…">Dəvət göndər</SubmitButton>
    </form>
  );
}
