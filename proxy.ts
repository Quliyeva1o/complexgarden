import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { isAdminPath } from "./lib/admin/paths";
import { updateAdminSession } from "./lib/supabase/proxy";

const intl = createMiddleware(routing);

/** /admin — Supabase sessiyası (dil prefiksi yoxdur); qalan hər şey — next-intl */
export default function proxy(request: NextRequest) {
  return isAdminPath(request.nextUrl.pathname) ? updateAdminSession(request) : intl(request);
}

export const config = {
  // _next, api, statik fayllar (nöqtəli yollar) istisna olunur
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
