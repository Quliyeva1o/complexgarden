import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Giriş" };

// `next` və `xeta` URL-dən oxunur — səhifə serverdə gözləyir (anında naviqasiya tələb olunmur)
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  return (
    <AuthCard title="Admin panelə giriş">
      {params.xeta === "link" && (
        <p role="alert" className="mb-5 rounded-card bg-danger/10 px-4 py-3 text-small text-danger">
          Link etibarsızdır və ya vaxtı keçib. Yenidən cəhd edin.
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
