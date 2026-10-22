import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_HOME, ADMIN_LOGIN, isPublicAdminPath } from "@/lib/admin/paths";
import { supabasePublicEnv } from "./env";

const NO_INDEX = "noindex, nofollow";

/**
 * /admin sorğuları: Supabase sessiyasını yeniləyir, girişsiz istifadəçini giriş səhifəsinə aparır.
 * Bu yalnız rahatlıq üçündür — əsl yoxlama hər səhifə və Server Action-da requireAdmin() ilədir.
 */
export async function updateAdminSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const env = supabasePublicEnv();
  if (!env) {
    response.headers.set("X-Robots-Tag", NO_INDEX);
    return response;
  }

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && !isPublicAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.search = "";
    if (pathname !== ADMIN_HOME) url.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", NO_INDEX);
    return redirect;
  }

  response.headers.set("X-Robots-Tag", NO_INDEX);
  return response;
}
