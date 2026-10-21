import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Loqo işarəsi (palma + dalğa) — public/brand/logo-mark.png */
export function LogoMark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        // Tünd fonda işarənin yaşılı itməsin deyə açıq dairə içində
        onDark && "rounded-pill bg-page p-1.5",
        className,
      )}
    >
      <Image
        src={siteConfig.logo.mark}
        alt=""
        width={siteConfig.logo.markSize.width}
        height={siteConfig.logo.markSize.height}
        sizes="56px"
        priority={!onDark}
        className="h-full w-auto"
      />
    </span>
  );
}

type LogoProps = {
  className?: string;
  onDark?: boolean;
  /** Link olmadan (nümayiş üçün) */
  asStatic?: boolean;
};

/**
 * Brend loqosu: işarə | ad + alt yazı (orijinal loqonun düzülüşü).
 * Ad və alt yazı şəkil deyil, mətndir — şrift `<html data-logo-font>` ilə seçilir (default: config/site.ts → `logo.font`),
 * rəng fona görə dəyişir (açıq fonda loqonun yaşılı/firuzəyisi, tünd fonda ağ).
 */
export function Logo({ className, onDark = false, asStatic = false }: LogoProps) {
  const content = (
    <>
      <LogoMark onDark={onDark} className={onDark ? "size-12" : "h-10 sm:h-12"} />
      <span aria-hidden className={cn("h-9 w-px shrink-0 sm:h-10", onDark ? "bg-white/30" : "bg-primary/60")} />
      <span className="flex flex-col">
        <span className={cn("logo-name text-h4 leading-none whitespace-nowrap sm:text-h3", onDark ? "text-white" : "text-primary")}>
          {siteConfig.name}
        </span>
        <span className={cn("logo-tagline text-caption leading-none whitespace-nowrap", onDark ? "text-white/80" : "text-secondary")}>
          {siteConfig.tagline}
        </span>
      </span>
    </>
  );

  const classes = cn("inline-flex shrink-0 items-center gap-3", className);

  if (asStatic) return <span className={classes}>{content}</span>;

  return (
    <Link
      href="/"
      className={cn(classes, "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2")}
    >
      {content}
    </Link>
  );
}
