import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // _next, api, statik fayllar (nöqtəli yollar) istisna olunur
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
