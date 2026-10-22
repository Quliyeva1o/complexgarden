import Link from "next/link";

export function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <span className="text-small">{label}</span>
      <span className="text-h2 text-ink-strong">{value}</span>
    </>
  );
  const className = "flex flex-col gap-2 rounded-card border border-border bg-surface p-5";
  return href ? (
    <Link href={href} className={`${className} hover:border-ink-strong/30`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
