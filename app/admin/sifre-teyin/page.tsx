import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { SetPasswordForm } from "@/components/admin/SetPasswordForm";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Şifrə təyin et" };

export default async function SetPasswordPage() {
  const me = await requireAdmin();
  return (
    <AuthCard title="Yeni şifrə təyin edin">
      <p className="mb-5 text-small">{me.email}</p>
      <SetPasswordForm />
    </AuthCard>
  );
}
