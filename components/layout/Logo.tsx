import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Müvəqqəti loqo işarəsi: lime dairə içində yarpaq və su dalğası (bağ + hovuz).
 * Real loqo gələndə yalnız bu komponenti dəyişmək kifayətdir.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("shrink-0", className)}>
      <circle cx="20" cy="20" r="20" fill="var(--color-fresh)" />
      <path d="M20 7.5c5.6 3.8 7.6 8.6 5.7 14.3-1.9 1.4-3.8 1.9-5.7 1.9s-3.8-.5-5.7-1.9C12.4 16.1 14.4 11.3 20 7.5Z" fill="var(--color-primary)" />
      <path d="M20 11.5v12.5" stroke="var(--color-fresh)" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M9.5 29c2.1 0 2.1-1.4 4.2-1.4s2.1 1.4 4.2 1.4 2.1-1.4 4.2-1.4 2.1 1.4 4.2 1.4 2.1-1.4 4.2-1.4"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 rounded-pill outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)",
        className,
      )}
    >
      <LogoMark className="size-10" />
      <span className={cn("font-heading text-h4 font-medium tracking-tight", onDark ? "text-white" : "text-ink-strong")}>
        {siteConfig.name}
      </span>
    </Link>
  );
}
