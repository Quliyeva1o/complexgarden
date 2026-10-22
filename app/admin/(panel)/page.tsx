import type { Metadata } from "next";
import { StatCard } from "@/components/admin/StatCard";
import { formatDateTime } from "@/lib/admin/format";
import { orderStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/admin/session";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "İcmal" };

type LatestOrder = {
  id: string;
  created_at: string;
  status: keyof typeof orderStatusLabel;
  customer: { name?: string; phone?: string };
  total: number;
};

export default async function OverviewPage() {
  await requireAdmin();
  const db = await createServerSupabase();
  const head = { count: "exact" as const, head: true };
  const [newOrders, newRequests, outOfStock, drafts, latest] = await Promise.all([
    db.from("orders").select("id", head).eq("status", "new"),
    db.from("service_requests").select("id", head).eq("status", "new"),
    db.from("products").select("id", head).eq("in_stock", false).neq("status", "archived"),
    db.from("products").select("id", head).eq("status", "draft"),
    db.from("orders").select("id, created_at, status, customer, total").order("created_at", { ascending: false }).limit(10),
  ]);
  const orders = (latest.data ?? []) as LatestOrder[];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h3 text-ink-strong">İcmal</h1>
      <section aria-label="Bu günün rəqəmləri" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Yeni sifarişlər" value={newOrders.count ?? 0} />
        <StatCard label="Yeni sorğular" value={newRequests.count ?? 0} />
        <StatCard label="Stokda olmayan məhsullar" value={outOfStock.count ?? 0} />
        <StatCard label="Qaralamalar" value={drafts.count ?? 0} />
      </section>
      <section aria-labelledby="latest-orders" className="rounded-card border border-border bg-surface">
        <h2 id="latest-orders" className="border-b border-border px-5 py-4 text-body font-medium text-ink-strong">Son sifarişlər</h2>
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-small">Hələ sifariş yoxdur.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="text-ink-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Nömrə</th>
                  <th scope="col" className="px-5 py-3 font-medium">Tarix</th>
                  <th scope="col" className="px-5 py-3 font-medium">Müştəri</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Məbləğ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium text-ink-strong">{o.id}</td>
                    <td className="px-5 py-3">{formatDateTime(o.created_at)}</td>
                    <td className="px-5 py-3">{o.customer.name ?? "—"}</td>
                    <td className="px-5 py-3">{orderStatusLabel[o.status]}</td>
                    <td className="px-5 py-3 text-right">{Number(o.total)} ₼</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
