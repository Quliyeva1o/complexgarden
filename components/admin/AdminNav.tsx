"use client";

import { LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, type AdminNavIcon } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

const icons: Record<AdminNavIcon, typeof Users> = { LayoutDashboard, Users };

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin menyu" className="flex gap-1 overflow-x-auto lg:flex-col">
      {adminNav.map((item) => {
        const Icon = icons[item.icon];
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-pill px-4 py-2.5 text-small font-medium whitespace-nowrap",
              active ? "bg-primary text-on-primary" : "text-ink-strong hover:bg-ink-strong/6",
            )}
          >
            <Icon aria-hidden className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
