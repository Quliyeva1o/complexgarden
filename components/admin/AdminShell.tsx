import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { signOut } from "@/lib/admin/auth-actions";
import type { AdminSession } from "@/lib/admin/session";
import { AdminNav } from "./AdminNav";

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-surface p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src={siteConfig.logo.mark} alt="" width={32} height={35} />
            <span className="leading-tight">
              <span className="block font-medium text-ink-strong">{siteConfig.name}</span>
              <span className="block text-caption">Admin panel</span>
            </span>
          </Link>
        </div>
        <AdminNav />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-surface px-4 py-3 lg:px-8">
          <span className="text-small text-ink-strong">{session.name}</span>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-pill px-3 py-2 text-small text-ink-strong hover:bg-ink-strong/6">
              <LogOut aria-hidden className="size-4" />
              Çıxış
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
