import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { ResetRequestForm } from "@/components/admin/ResetRequestForm";

export const metadata: Metadata = { title: "Şifrə bərpası" };

export default function ResetPage() {
  return (
    <AuthCard title="Şifrəni bərpa et">
      <p className="mb-5 text-small">E-poçtunuzu yazın, yeni şifrə təyin etmək üçün link göndərəcəyik.</p>
      <ResetRequestForm />
    </AuthCard>
  );
}
