export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/giris";
export const ADMIN_SET_PASSWORD = "/admin/sifre-teyin";
/** Dəvət və şifrə bərpası linkləri buraya qayıdır (Supabase standart şablonları) */
export const ADMIN_AUTH_CALLBACK = "/admin/auth/callback";

/** Sessiyasız açılan admin səhifələri (/admin/auth — e-poçt linklərinin qəbulu) */
const PUBLIC_ADMIN_PATHS = [ADMIN_LOGIN, "/admin/sifre-berpa", "/admin/auth"];

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_HOME || pathname.startsWith(`${ADMIN_HOME}/`);
}

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** `next` parametri yalnız admin daxilinə yönləndirə bilər (açıq yönləndirməyə qarşı) */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || next.startsWith("//") || next.includes("\\")) return ADMIN_HOME;
  const pathname = next.split(/[?#]/)[0];
  return isAdminPath(pathname) ? next : ADMIN_HOME;
}
