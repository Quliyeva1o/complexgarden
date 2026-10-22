import type { Metadata } from "next";
import { AuthCallback } from "@/components/admin/AuthCallback";
import { AuthCard } from "@/components/admin/AuthCard";

export const metadata: Metadata = { title: "Giriş linki" };

export default function AuthCallbackPage() {
  return (
    <AuthCard title="Bir an…">
      <AuthCallback />
    </AuthCard>
  );
}
