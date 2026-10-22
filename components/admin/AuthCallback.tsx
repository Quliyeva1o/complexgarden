"use client";

import { useEffect, useRef } from "react";
import { ADMIN_LOGIN, ADMIN_SET_PASSWORD } from "@/lib/admin/paths";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Supabase standart e-poçt linkindən qayıdış:
 * - şifrə bərpası: `?code=…` (PKCE — sorğunun göndərildiyi brauzerdə açılmalıdır)
 * - dəvət: `#access_token=…&refresh_token=…`
 * Sessiya cookie-yə yazılır, sonra şifrə təyin etmə səhifəsinə keçilir.
 */
export function AuthCallback() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const supabase = createBrowserSupabase();

    (async () => {
      let ok = false;
      if (!hash.get("error")) {
        const code = url.searchParams.get("code");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (code) {
          ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
        } else if (accessToken && refreshToken) {
          ok = !(await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })).error;
        }
      }
      // Tam yükləmə — server yeni cookie-ləri görsün
      window.location.replace(ok ? ADMIN_SET_PASSWORD : `${ADMIN_LOGIN}?xeta=link`);
    })();
  }, []);

  return <p className="text-small">Link yoxlanılır…</p>;
}
