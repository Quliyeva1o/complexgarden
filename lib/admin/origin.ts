import "server-only";
import { headers } from "next/headers";

/** Cari sorğunun ünvanı (məs. http://localhost:3000) — e-poçt linklərinin qayıdacağı yer üçün */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
