import Image from "next/image";
import { siteConfig } from "@/config/site";

/** Giriş / şifrə səhifələrinin ortada kartı */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-float">
        <div className="mb-6 flex items-center gap-3">
          <Image src={siteConfig.logo.mark} alt="" width={40} height={43} priority />
          <div>
            <p className="font-medium text-ink-strong">{siteConfig.name}</p>
            <p className="text-caption">Admin panel</p>
          </div>
        </div>
        <h1 className="mb-6 text-h4 text-ink-strong">{title}</h1>
        {children}
      </div>
    </main>
  );
}
