# Admin Plan 2 — Login, admin shell, overview, admins

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Staff can sign in at `/admin/giris` with e-mail + password, reset a forgotten password, see an overview page, and invite/remove other admins. Nothing under `/admin` is indexable.

**Architecture:** `/admin` is a second root layout (outside `app/[locale]`, Azerbaijani only, `noindex`). `proxy.ts` sends `/admin/*` to a Supabase session refresher (`@supabase/ssr`) and everything else to next-intl. Real authorization happens on the server in every page and Server Action (`requireAdmin()` → `admins` table via RLS); the proxy redirect is only UX. Session reads sit behind the root admin `<Suspense>` (Cache Components rule); admin segments use `instant = false`. Invite and reset e-mails link to `/admin/auth/confirm?token_hash=…&type=…`, which verifies the OTP and sends the user to `/admin/sifre-teyin`.

**Tech Stack:** Next.js 16.4 (proxy, Server Actions, `refresh()`), `@supabase/ssr` 0.12, `@supabase/supabase-js` 2, `zod` 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-22-admin-panel-design.md` (sections "Qərarlar", 2, 6 step 3). Builds on plan 1 (`lib/supabase/*`, tables `admins`, `audit_log`).

## Global Constraints

- Admin UI text is Azerbaijani only; no next-intl in `/admin`.
- Every `/admin` response: `robots` metadata `noindex, nofollow` and header `X-Robots-Tag: noindex, nofollow`; `robots.txt` disallows `/admin`.
- Never trust the proxy for authorization: each admin page/action calls `requireAdmin()`.
- `next` redirect targets must stay inside `/admin` (`safeNextPath`).
- Secret key client (`createServiceClient`) only after `requireAdmin()` succeeded, or in CLI scripts.
- Password min length 10. Login error text never reveals whether the e-mail exists.
- `cookies()` reads only inside `<Suspense>` (root admin layout provides it) or in Server Actions / Route Handlers.
- The agent must not type real passwords or sign in on Supabase (remote host). Real login, invite e-mails and password set are verified by the user.

---

## File structure

| File | Responsibility |
|---|---|
| `lib/admin/paths.ts` | Admin path constants, `isAdminPath`, `isPublicAdminPath`, `safeNextPath` |
| `lib/admin/validation.ts` | zod schemas + `fieldErrors`, `FormState` |
| `lib/admin/format.ts` | `formatDateTime` (Asia/Baku) |
| `lib/admin/labels.ts` | Status labels (orders, requests) |
| `lib/admin/nav.ts` | Sidebar items (plans 3–4 append) |
| `lib/supabase/server.ts` | Cookie-based server client |
| `lib/supabase/proxy.ts` | `updateAdminSession(request)` |
| `lib/admin/session.ts` | `getAdminSession`, `requireAdmin` |
| `lib/admin/audit.ts` | `writeAudit` |
| `lib/admin/auth-actions.ts` | `signIn`, `signOut`, `requestPasswordReset`, `updatePassword` |
| `lib/admin/admins-actions.ts` | `inviteAdmin`, `removeAdmin` |
| `proxy.ts` (modify) | Route `/admin` → session, rest → next-intl |
| `app/fonts.ts` | Inter / Inter Tight shared by both root layouts |
| `app/[locale]/layout.tsx` (modify) | Import fonts from `app/fonts.ts` |
| `app/admin/layout.tsx` | Admin root layout (html/body, Suspense, noindex) |
| `app/admin/giris/page.tsx`, `sifre-berpa/page.tsx`, `sifre-teyin/page.tsx` | Auth pages |
| `app/admin/auth/confirm/route.ts` | E-mail link handler |
| `app/admin/(panel)/layout.tsx` | `requireAdmin` + shell |
| `app/admin/(panel)/page.tsx` | Overview |
| `app/admin/(panel)/adminler/page.tsx` | Admins list + invite |
| `components/admin/*` | AuthCard, LoginForm, ResetRequestForm, SetPasswordForm, AdminShell, AdminNav, StatCard, InviteAdminForm, RemoveAdminButton, SubmitButton, FormMessage |
| `scripts/admin-invite.ts` | CLI: invite the first admin |
| `app/robots.ts` (modify) | Disallow `/admin` |

---

### Task 1: Pure helpers — paths, validation, formatting

**Files:**
- Create: `lib/admin/paths.ts`, `lib/admin/validation.ts`, `lib/admin/format.ts`, `lib/admin/labels.ts`, `tests/admin/paths.test.ts`, `tests/admin/validation.test.ts`, `tests/admin/format.test.ts`
- Modify: `package.json` (dependency `zod@4`)

**Interfaces:**
- Produces:
  ```ts
  // paths.ts
  export const ADMIN_HOME = "/admin";
  export const ADMIN_LOGIN = "/admin/giris";
  export const ADMIN_SET_PASSWORD = "/admin/sifre-teyin";
  export function isAdminPath(pathname: string): boolean;
  export function isPublicAdminPath(pathname: string): boolean;
  export function safeNextPath(next: string | null | undefined): string;
  // validation.ts
  export const emailSchema; export const loginSchema; export const resetRequestSchema;
  export const setPasswordSchema; export const inviteSchema;
  export type FieldErrors = Partial<Record<string, string>>;
  export interface FormState { status: "idle" | "error" | "success"; message?: string; errors?: FieldErrors }
  export const initialFormState: FormState;
  export function fieldErrors(error: z.ZodError): FieldErrors;
  // format.ts
  export function formatDateTime(iso: string): string; // "22.10.2026, 14:05" (Asia/Baku)
  // labels.ts
  export const orderStatusLabel: Record<"new" | "confirmed" | "delivered" | "cancelled", string>;
  export const requestStatusLabel: Record<"new" | "contacted" | "closed", string>;
  ```

- [ ] **Step 1: Install zod** — `npm i zod@4`

- [ ] **Step 2: Failing tests**

`tests/admin/paths.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isAdminPath, isPublicAdminPath, safeNextPath } from "@/lib/admin/paths";

describe("admin paths", () => {
  it("recognises admin paths only", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/mehsullar")).toBe(true);
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAdminPath("/az/admin")).toBe(false);
  });

  it("knows which admin pages work without a session", () => {
    expect(isPublicAdminPath("/admin/giris")).toBe(true);
    expect(isPublicAdminPath("/admin/sifre-berpa")).toBe(true);
    expect(isPublicAdminPath("/admin/auth/confirm")).toBe(true);
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/sifre-teyin")).toBe(false);
  });

  it("keeps redirects inside /admin", () => {
    expect(safeNextPath("/admin/adminler?x=1")).toBe("/admin/adminler?x=1");
    expect(safeNextPath(undefined)).toBe("/admin");
    expect(safeNextPath("https://evil.com")).toBe("/admin");
    expect(safeNextPath("//evil.com/admin")).toBe("/admin");
    expect(safeNextPath("/administrator")).toBe("/admin");
    expect(safeNextPath("/admin\\evil")).toBe("/admin");
  });
});
```

`tests/admin/validation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { fieldErrors, inviteSchema, loginSchema, setPasswordSchema } from "@/lib/admin/validation";

describe("admin validation", () => {
  it("normalises e-mail and requires a password", () => {
    const ok = loginSchema.safeParse({ email: "  Rena@Example.COM ", password: "x" });
    expect(ok.success && ok.data.email).toBe("rena@example.com");
    const bad = loginSchema.safeParse({ email: "yox", password: "" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(Object.keys(fieldErrors(bad.error)).sort()).toEqual(["email", "password"]);
  });

  it("requires 10+ chars and matching confirmation", () => {
    expect(setPasswordSchema.safeParse({ password: "short", confirm: "short" }).success).toBe(false);
    const mismatch = setPasswordSchema.safeParse({ password: "uzun-sifre-123", confirm: "basqa-sifre-123" });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) expect(fieldErrors(mismatch.error).confirm).toBeDefined();
    expect(setPasswordSchema.safeParse({ password: "uzun-sifre-123", confirm: "uzun-sifre-123" }).success).toBe(true);
  });

  it("needs a name and e-mail to invite", () => {
    expect(inviteSchema.safeParse({ name: "R", email: "a@b.az" }).success).toBe(false);
    expect(inviteSchema.safeParse({ name: "Rəna", email: "a@b.az" }).success).toBe(true);
  });
});
```

`tests/admin/format.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatDateTime } from "@/lib/admin/format";

describe("formatDateTime", () => {
  it("shows Baku local time (UTC+4)", () => {
    expect(formatDateTime("2026-10-22T10:05:00Z")).toBe("22.10.2026, 14:05");
  });
});
```

Run: `npx vitest run tests/admin` → FAIL (modules missing).

- [ ] **Step 3: Implement**

`lib/admin/paths.ts`:
```ts
export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/giris";
export const ADMIN_SET_PASSWORD = "/admin/sifre-teyin";

/** Sessiyasız açılan admin səhifələri */
const PUBLIC_ADMIN_PATHS = [ADMIN_LOGIN, "/admin/sifre-berpa", "/admin/auth/confirm"];

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
```

`lib/admin/validation.ts`:
```ts
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "E-poçt ünvanı düzgün deyil" }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Şifrəni yazın" }),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const setPasswordSchema = z
  .object({
    password: z.string().min(10, { error: "Şifrə ən azı 10 simvol olmalıdır" }),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { error: "Şifrələr eyni deyil", path: ["confirm"] });

export const inviteSchema = z.object({
  name: z.string().trim().min(2, { error: "Adı yazın" }).max(80),
  email: emailSchema,
});

export type FieldErrors = Partial<Record<string, string>>;

export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: FieldErrors;
}

export const initialFormState: FormState = { status: "idle" };

/** zod xətalarını sahə → ilk mesaj kimi qaytarır */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
```

`lib/admin/format.ts`:
```ts
const dateTime = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Baku",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Admin cədvəlləri üçün: "22.10.2026, 14:05" (Bakı vaxtı). Yalnız serverdə render olunur. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
```

`lib/admin/labels.ts`:
```ts
export const orderStatusLabel = {
  new: "Yeni",
  confirmed: "Təsdiqləndi",
  delivered: "Çatdırıldı",
  cancelled: "Ləğv edildi",
} as const;

export const requestStatusLabel = {
  new: "Yeni",
  contacted: "Əlaqə saxlanıldı",
  closed: "Bağlandı",
} as const;
```

- [ ] **Step 4: Run** — `npx vitest run && npx tsc --noEmit && npx eslint . --quiet` → all pass.

- [ ] **Step 5: Commit**
```bash
git add lib/admin tests/admin package.json package-lock.json
git commit -m "feat(admin): path, validation and formatting helpers"
```

---

### Task 2: Session plumbing — server client, proxy, requireAdmin, audit

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/proxy.ts`, `lib/admin/session.ts`, `lib/admin/audit.ts`
- Modify: `proxy.ts`, `app/robots.ts`, `package.json` (dependency `@supabase/ssr@0.12`)

**Interfaces:**
- Consumes: `supabasePublicEnv` (plan 1), Task 1 paths.
- Produces:
  ```ts
  export async function createServerSupabase(): Promise<SupabaseClient>;          // lib/supabase/server.ts
  export async function updateAdminSession(request: NextRequest): Promise<NextResponse>; // lib/supabase/proxy.ts
  export interface AdminSession { userId: string; email: string; name: string }
  export async function getAdminSession(): Promise<AdminSession | null>;           // lib/admin/session.ts
  export async function requireAdmin(): Promise<AdminSession>;                     // redirects to /admin/giris
  export async function writeAudit(entry: { entity: "product" | "category" | "order" | "request" | "admin";
    entityId: string; action: string; changes?: unknown }): Promise<void>;        // lib/admin/audit.ts
  ```

- [ ] **Step 1: Install** — `npm i @supabase/ssr@0.12`

- [ ] **Step 2: `lib/supabase/server.ts`**
```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabasePublicEnv } from "./env";

/**
 * Sessiyalı klient (admin). cookies() oxuyur — yalnız <Suspense> daxilində,
 * Server Action və ya Route Handler-də çağırın.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const env = supabasePublicEnv();
  if (!env) throw new Error("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY təyin olunmayıb");
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Component-dən çağırılıb — sessiyanı proxy yeniləyir
        }
      },
    },
  });
}
```

- [ ] **Step 3: `lib/supabase/proxy.ts`**
```ts
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
```

- [ ] **Step 4: Replace `proxy.ts`**
```ts
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
```

- [ ] **Step 5: `lib/admin/session.ts`**
```ts
import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_LOGIN } from "./paths";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

/** Daxil olmuş və `admins` cədvəlində olan istifadəçi; əks halda null */
export async function getAdminSession(): Promise<AdminSession | null> {
  const db = await createServerSupabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  // RLS: admins cədvəlini yalnız adminlər oxuyur — sətir gəlmirsə, admin deyil
  const { data } = await db.from("admins").select("name").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  const email = user.email ?? "";
  return { userId: user.id, email, name: data.name || email };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN);
  return session;
}
```

- [ ] **Step 6: `lib/admin/audit.ts`**
```ts
import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "./session";

type AuditEntity = "product" | "category" | "order" | "request" | "admin";

/** Tarixçəyə yazır (RLS: yalnız admin, yalnız öz adına). Uğursuzluq əsas əməliyyatı dayandırmır. */
export async function writeAudit(entry: { entity: AuditEntity; entityId: string; action: string; changes?: unknown }) {
  const me = await requireAdmin();
  const db = await createServerSupabase();
  const { error } = await db.from("audit_log").insert({
    user_id: me.userId,
    entity: entry.entity,
    entity_id: entry.entityId,
    action: entry.action,
    changes: entry.changes ?? null,
  });
  if (error) console.error("audit_log yazılmadı:", error.message);
}
```

- [ ] **Step 7: `app/robots.ts`** — change the disallow line to:
```ts
      disallow: ["/api/", "/admin", ...privatePaths.flatMap((p) => ["az", "ru", "en"].map((l) => `/${l}/${p}`))],
```

- [ ] **Step 8: Verify** — `npx tsc --noEmit && npx eslint . --quiet && npx vitest run`; then with the dev server running: `curl -sI localhost:3000/az | grep -i location` (none) and `curl -sI localhost:3000/admin` → `307`, `location: /admin/giris`, `x-robots-tag: noindex, nofollow`; `curl -s localhost:3000/robots.txt | grep admin` → `Disallow: /admin`.

- [ ] **Step 9: Commit**
```bash
git add lib/supabase/server.ts lib/supabase/proxy.ts lib/admin/session.ts lib/admin/audit.ts proxy.ts app/robots.ts package.json package-lock.json
git commit -m "feat(admin): Supabase session in proxy, requireAdmin, audit log"
```

---

### Task 3: Admin root layout + auth pages + e-mail confirm route

**Files:**
- Create: `app/fonts.ts`, `app/admin/layout.tsx`, `app/admin/giris/page.tsx`, `app/admin/sifre-berpa/page.tsx`, `app/admin/sifre-teyin/page.tsx`, `app/admin/auth/confirm/route.ts`, `lib/admin/auth-actions.ts`, `components/admin/AuthCard.tsx`, `components/admin/SubmitButton.tsx`, `components/admin/FormMessage.tsx`, `components/admin/LoginForm.tsx`, `components/admin/ResetRequestForm.tsx`, `components/admin/SetPasswordForm.tsx`
- Modify: `app/[locale]/layout.tsx` (fonts import)

**Interfaces:**
- Consumes: Task 1 schemas/`FormState`, Task 2 `createServerSupabase`, `getAdminSession`, `requireAdmin`.
- Produces: Server Actions `signIn(prev, formData)`, `signOut()`, `requestPasswordReset(prev, formData)`, `updatePassword(prev, formData)` (all in `lib/admin/auth-actions.ts`); components `SubmitButton({ children, pendingText? })`, `FormMessage({ state })`.

- [ ] **Step 1: Share fonts** — create `app/fonts.ts` by moving the `inter` / `interTight` definitions (and their comment) out of `app/[locale]/layout.tsx`:
```ts
import { Inter, Inter_Tight } from "next/font/google";

// latin-ext — Ə ə Ğ ğ İ ı Ş ş Ç ç Ö ö Ü ü; cyrillic — RU versiyası üçün.
// Qeyd: kiril dəstini ayrıca, preload-suz şriftə ayırmaq və variable Inter Tight sınaqdan keçirildi —
// ümumi şrift həcmi 300 KB-dan 527 KB-a artdı, ona görə bu konfiqurasiya saxlanılır.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600"],
  display: "swap",
});
```
(Copy option values exactly from the current layout.) In `app/[locale]/layout.tsx` delete those definitions and the `next/font/google` import, add `import { inter, interTight } from "@/app/fonts";`.

- [ ] **Step 2: `app/admin/layout.tsx`**
```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { inter, interTight } from "@/app/fonts";
import { siteConfig } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin panel", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

// Sessiyadan asılıdır — statik qabıq yoxdur, naviqasiya serverdə gözləyir
export const instant = false;

/** Admin paneli: ayrıca root layout, yalnız AZ, indekslənmir */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" data-theme={siteConfig.theme} className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-dvh bg-page text-ink">
        <Suspense fallback={<p className="p-10 text-ink-muted">Yüklənir…</p>}>{children}</Suspense>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Shared form bits**

`components/admin/SubmitButton.tsx`:
```tsx
"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({ children, pendingText = "Gözləyin…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full">
      {pending ? pendingText : children}
    </Button>
  );
}
```

`components/admin/FormMessage.tsx`:
```tsx
import type { FormState } from "@/lib/admin/validation";
import { cn } from "@/lib/utils";

/** Formanın ümumi nəticə mesajı (xəta və ya uğur) */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-card px-4 py-3 text-small",
        state.status === "error" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary",
      )}
    >
      {state.message}
    </p>
  );
}
```

`components/admin/AuthCard.tsx`:
```tsx
import Image from "next/image";
import { siteConfig } from "@/config/site";

/** Giriş / şifrə səhifələrinin ortada kartı */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-float">
        <div className="mb-6 flex items-center gap-3">
          <Image src={siteConfig.logo.mark} alt="" width={40} height={43} priority />
          <div>
            <p className="font-medium text-ink-strong">{siteConfig.name}</p>
            <p className="text-caption">Admin panel</p>
          </div>
        </div>
        <h1 className="mb-6 text-h4 text-ink-strong">{title}</h1>
        {children}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: `lib/admin/auth-actions.ts`**
```ts
"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ADMIN_HOME, ADMIN_LOGIN, safeNextPath } from "./paths";
import { getAdminSession, requireAdmin } from "./session";
import {
  fieldErrors,
  loginSchema,
  resetRequestSchema,
  setPasswordSchema,
  type FormState,
} from "./validation";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: "E-poçt və ya şifrə yanlışdır" };

  if (!(await getAdminSession())) {
    await db.auth.signOut();
    return { status: "error", message: "Bu hesabın admin panelə girişi yoxdur" };
  }
  redirect(safeNextPath(String(formData.get("next") ?? "")));
}

export async function signOut(): Promise<void> {
  const db = await createServerSupabase();
  await db.auth.signOut();
  redirect(ADMIN_LOGIN);
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  // Link e-poçt şablonundadır: {{ .SiteURL }}/admin/auth/confirm?token_hash=…&type=recovery
  await db.auth.resetPasswordForEmail(parsed.data.email);
  // E-poçtun mövcudluğunu bildirmirik
  return {
    status: "success",
    message: "Bu e-poçt admin hesabına aiddirsə, şifrə bərpa linki göndərildi. Poçtunuzu yoxlayın.",
  };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = setPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const db = await createServerSupabase();
  const { error } = await db.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: `Şifrəni yeniləmək olmadı: ${error.message}` };
  redirect(ADMIN_HOME);
}
```

- [ ] **Step 5: Client forms**

`components/admin/LoginForm.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next} />
      <Input id="email" name="email" type="email" label="E-poçt" autoComplete="email" required error={state.errors?.email} />
      <Input id="password" name="password" type="password" label="Şifrə" autoComplete="current-password" required error={state.errors?.password} />
      <SubmitButton pendingText="Daxil olunur…">Daxil ol</SubmitButton>
      <Link href="/admin/sifre-berpa" className="text-small text-(--link) underline underline-offset-4">
        Şifrəni unutmusunuz?
      </Link>
    </form>
  );
}
```

`components/admin/ResetRequestForm.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordReset, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <Input id="email" name="email" type="email" label="E-poçt" autoComplete="email" required error={state.errors?.email} />
      <SubmitButton pendingText="Göndərilir…">Bərpa linki göndər</SubmitButton>
      <Link href="/admin/giris" className="text-small text-(--link) underline underline-offset-4">
        Girişə qayıt
      </Link>
    </form>
  );
}
```

`components/admin/SetPasswordForm.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { updatePassword } from "@/lib/admin/auth-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function SetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <Input id="password" name="password" type="password" label="Yeni şifrə" hint="Ən azı 10 simvol" autoComplete="new-password" required error={state.errors?.password} />
      <Input id="confirm" name="confirm" type="password" label="Şifrəni təkrarlayın" autoComplete="new-password" required error={state.errors?.confirm} />
      <SubmitButton pendingText="Saxlanılır…">Şifrəni saxla</SubmitButton>
    </form>
  );
}
```

- [ ] **Step 6: Pages and confirm route**

`app/admin/giris/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  return (
    <AuthCard title="Admin panelə giriş">
      {params.xeta === "link" && (
        <p role="alert" className="mb-5 rounded-card bg-danger/10 px-4 py-3 text-small text-danger">
          Link etibarsızdır və ya vaxtı keçib. Yenidən cəhd edin.
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
```

`app/admin/sifre-berpa/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { ResetRequestForm } from "@/components/admin/ResetRequestForm";

export const metadata: Metadata = { title: "Şifrə bərpası" };

export default function ResetPage() {
  return (
    <AuthCard title="Şifrəni bərpa et">
      <p className="mb-5 text-small">E-poçtunuzu yazın, yeni şifrə təyin etmək üçün link göndərəcəyik.</p>
      <ResetRequestForm />
    </AuthCard>
  );
}
```

`app/admin/sifre-teyin/page.tsx`:
```tsx
import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/AuthCard";
import { SetPasswordForm } from "@/components/admin/SetPasswordForm";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Şifrə təyin et" };

export default async function SetPasswordPage() {
  const me = await requireAdmin();
  return (
    <AuthCard title="Yeni şifrə təyin edin">
      <p className="mb-5 text-small">{me.email}</p>
      <SetPasswordForm />
    </AuthCard>
  );
}
```

`app/admin/auth/confirm/route.ts`:
```ts
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ADMIN_LOGIN, ADMIN_SET_PASSWORD } from "@/lib/admin/paths";
import { createServerSupabase } from "@/lib/supabase/server";

const ALLOWED: EmailOtpType[] = ["invite", "recovery"];

/** Dəvət və şifrə bərpası e-poçtundakı link: token-i yoxlayır, sessiya açır, şifrə səhifəsinə aparır */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type && ALLOWED.includes(type)) {
    const db = await createServerSupabase();
    const { error } = await db.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(ADMIN_SET_PASSWORD);
  }
  redirect(`${ADMIN_LOGIN}?xeta=link`);
}
```

- [ ] **Step 7: Verify (no real credentials)**

`npx tsc --noEmit && npx eslint . --quiet && npx vitest run`. Dev server (restart after `proxy.ts` change):
- `/admin/giris` renders the card; `read_page` shows labels "E-poçt", "Şifrə"; `<meta name="robots" content="noindex, nofollow">` present.
- Submit the empty form → inline errors "E-poçt ünvanı düzgün deyil" and "Şifrəni yazın" (no request reaches Supabase).
- `/admin/auth/confirm?token_hash=x&type=recovery` → redirected to `/admin/giris?xeta=link` with the alert text.
- `/admin/sifre-teyin` without session → `/admin/giris?next=%2Fadmin%2Fsifre-teyin`.
- Public site unchanged: `node <scratchpad>/sweep.mjs` → "no problems".

- [ ] **Step 8: Commit**
```bash
git add app/fonts.ts "app/[locale]/layout.tsx" app/admin lib/admin/auth-actions.ts components/admin
git commit -m "feat(admin): admin root layout, login, password reset and set-password"
```

---

### Task 4: Panel shell + overview

**Files:**
- Create: `lib/admin/nav.ts`, `components/admin/AdminShell.tsx`, `components/admin/AdminNav.tsx`, `components/admin/StatCard.tsx`, `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/page.tsx`

**Interfaces:**
- Consumes: `requireAdmin`, `signOut`, `formatDateTime`, `orderStatusLabel`.
- Produces: `adminNav: { href: string; label: string; icon: LucideIconName }[]` — plans 3/4 add entries; `AdminShell({ session, children })`; `StatCard({ label, value, href? })`; `PageTitle` pattern: each panel page renders its own `<h1 className="text-h3">`.

- [ ] **Step 1: `lib/admin/nav.ts`**
```ts
/** Yan menyu. Növbəti planlar bura bölmə əlavə edir (Məhsullar, Kateqoriyalar, Sifarişlər, Sorğular). */
export const adminNav = [
  { href: "/admin", label: "İcmal", icon: "LayoutDashboard" },
  { href: "/admin/adminler", label: "Adminlər", icon: "Users" },
] as const;

export type AdminNavIcon = (typeof adminNav)[number]["icon"];
```

- [ ] **Step 2: `components/admin/AdminNav.tsx`** (client — active state)
```tsx
"use client";

import { LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, type AdminNavIcon } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

const icons: Record<AdminNavIcon, typeof Users> = { LayoutDashboard, Users };

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin menyu" className="flex gap-1 overflow-x-auto lg:flex-col">
      {adminNav.map((item) => {
        const Icon = icons[item.icon];
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-pill px-4 py-2.5 text-small font-medium whitespace-nowrap",
              active ? "bg-primary text-on-primary" : "text-ink-strong hover:bg-ink-strong/6",
            )}
          >
            <Icon aria-hidden className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: `components/admin/AdminShell.tsx`**
```tsx
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { signOut } from "@/lib/admin/auth-actions";
import type { AdminSession } from "@/lib/admin/session";
import { AdminNav } from "./AdminNav";

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-surface p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src={siteConfig.logo.mark} alt="" width={32} height={35} />
            <span className="leading-tight">
              <span className="block font-medium text-ink-strong">{siteConfig.name}</span>
              <span className="block text-caption">Admin panel</span>
            </span>
          </Link>
        </div>
        <AdminNav />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-surface px-4 py-3 lg:px-8">
          <span className="text-small text-ink-strong">{session.name}</span>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-pill px-3 py-2 text-small text-ink-strong hover:bg-ink-strong/6">
              <LogOut aria-hidden className="size-4" />
              Çıxış
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `components/admin/StatCard.tsx`**
```tsx
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
```

- [ ] **Step 5: `app/admin/(panel)/layout.tsx`**
```tsx
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/session";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
```

- [ ] **Step 6: `app/admin/(panel)/page.tsx`**
```tsx
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
        <h2 id="latest-orders" className="border-b border-border px-5 py-4 text-h5 text-ink-strong">Son sifarişlər</h2>
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
```
(If `text-h5` is not a token in `globals.css`, use `text-body font-medium`; check with `grep -n "text-h5\|--text-h5" app/globals.css` before writing.)

- [ ] **Step 7: Verify** — tsc, lint, tests; `curl -sI localhost:3000/admin` still `307 → /admin/giris`. Authenticated rendering is verified by the user in Task 6.

- [ ] **Step 8: Commit**
```bash
git add lib/admin/nav.ts components/admin/AdminShell.tsx components/admin/AdminNav.tsx components/admin/StatCard.tsx "app/admin/(panel)"
git commit -m "feat(admin): panel shell and overview page"
```

---

### Task 5: Admins page (invite, remove) + first-admin script

**Files:**
- Create: `lib/admin/admins-actions.ts`, `components/admin/InviteAdminForm.tsx`, `components/admin/RemoveAdminButton.tsx`, `app/admin/(panel)/adminler/page.tsx`, `scripts/admin-invite.ts`
- Modify: `package.json` (`"admin:invite": "tsx --env-file=.env.local scripts/admin-invite.ts"`)

**Interfaces:**
- Consumes: `requireAdmin`, `writeAudit`, `createServiceClient`, `inviteSchema`, `FormState`.
- Produces: `inviteAdmin(prev, formData): Promise<FormState>`, `removeAdmin(userId: string): Promise<FormState>`.

- [ ] **Step 1: `lib/admin/admins-actions.ts`**
```ts
"use server";

import { refresh } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { writeAudit } from "./audit";
import { requireAdmin } from "./session";
import { fieldErrors, inviteSchema, type FormState } from "./validation";

export async function inviteAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = inviteSchema.safeParse({ name: formData.get("name"), email: formData.get("email") });
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };
  const { name, email } = parsed.data;

  const service = createServiceClient();
  const invited = await service.auth.admin.inviteUserByEmail(email, { data: { name } });
  if (invited.error) {
    const exists = /already|registered|exists/i.test(invited.error.message);
    return {
      status: "error",
      message: exists ? "Bu e-poçtla hesab artıq var" : `Dəvət göndərilmədi: ${invited.error.message}`,
    };
  }

  const userId = invited.data.user.id;
  const insert = await service.from("admins").upsert({ user_id: userId, name }, { onConflict: "user_id" });
  if (insert.error) return { status: "error", message: `Admin siyahısına əlavə olunmadı: ${insert.error.message}` };

  await writeAudit({ entity: "admin", entityId: userId, action: "invite", changes: { email, name } });
  refresh();
  return { status: "success", message: `${email} ünvanına dəvət göndərildi` };
}

export async function removeAdmin(userId: string): Promise<FormState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { status: "error", message: "Özünüzü silə bilməzsiniz" };

  const service = createServiceClient();
  const { count } = await service.from("admins").select("user_id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { status: "error", message: "Sonuncu admini silmək olmaz" };

  const removed = await service.from("admins").delete().eq("user_id", userId);
  if (removed.error) return { status: "error", message: `Silinmədi: ${removed.error.message}` };

  await writeAudit({ entity: "admin", entityId: userId, action: "remove" });
  refresh();
  return { status: "success", message: "Admin hüququ götürüldü" };
}
```

- [ ] **Step 2: `components/admin/InviteAdminForm.tsx`**
```tsx
"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { inviteAdmin } from "@/lib/admin/admins-actions";
import { initialFormState } from "@/lib/admin/validation";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function InviteAdminForm() {
  const [state, action] = useActionState(inviteAdmin, initialFormState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <Input id="invite-name" name="name" label="Ad" autoComplete="off" required error={state.errors?.name} />
      <Input id="invite-email" name="email" type="email" label="E-poçt" autoComplete="off" required error={state.errors?.email} />
      <SubmitButton pendingText="Göndərilir…">Dəvət göndər</SubmitButton>
    </form>
  );
}
```

- [ ] **Step 3: `components/admin/RemoveAdminButton.tsx`**
```tsx
"use client";

import { useState, useTransition } from "react";
import { removeAdmin } from "@/lib/admin/admins-actions";

export function RemoveAdminButton({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string>();
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`${name} admin siyahısından çıxarılsın?`)) return;
          start(async () => {
            const result = await removeAdmin(userId);
            setMessage(result.status === "error" ? result.message : undefined);
          });
        }}
        className="rounded-pill px-3 py-1.5 text-small text-danger hover:bg-danger/10 disabled:opacity-60"
      >
        {pending ? "Silinir…" : "Çıxar"}
      </button>
      {message && (
        <span role="alert" className="text-caption text-danger">
          {message}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: `app/admin/(panel)/adminler/page.tsx`**
```tsx
import type { Metadata } from "next";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { RemoveAdminButton } from "@/components/admin/RemoveAdminButton";
import { formatDateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = { title: "Adminlər" };

export default async function AdminsPage() {
  const me = await requireAdmin();
  const service = createServiceClient();
  const [{ data: rows }, { data: users }] = await Promise.all([
    service.from("admins").select("user_id, name, created_at").order("created_at"),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  const byId = new Map(users.users.map((u) => [u.id, u]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h3 text-ink-strong">Adminlər</h1>
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section aria-label="Admin siyahısı" className="rounded-card border border-border bg-surface">
          <ul>
            {(rows ?? []).map((row) => {
              const user = byId.get(row.user_id);
              const pendingInvite = user && !user.last_sign_in_at;
              return (
                <li key={row.user_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 last:border-b-0">
                  <span>
                    <span className="block font-medium text-ink-strong">
                      {row.name}
                      {row.user_id === me.userId && <span className="text-caption"> (siz)</span>}
                    </span>
                    <span className="block text-small">
                      {user?.email ?? "—"} · əlavə olunub {formatDateTime(row.created_at)}
                      {pendingInvite && " · dəvət gözləyir"}
                    </span>
                  </span>
                  {row.user_id !== me.userId && <RemoveAdminButton userId={row.user_id} name={row.name} />}
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="invite-title" className="rounded-card border border-border bg-surface p-5">
          <h2 id="invite-title" className="mb-4 font-medium text-ink-strong">Yeni admin dəvət et</h2>
          <InviteAdminForm />
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `scripts/admin-invite.ts`** (first admin; the user runs it)
```ts
/**
 * İlk admini dəvət edir (və ya mövcud istifadəçini admin edir).
 * İşlətmək: npm.cmd run admin:invite -- ad@example.com "Ad Soyad"
 */
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv, supabaseSecretKey } from "../lib/supabase/env";

async function main() {
  const [email, name = ""] = process.argv.slice(2);
  if (!email) throw new Error('İstifadə: npm run admin:invite -- ad@example.com "Ad Soyad"');
  const env = supabasePublicEnv();
  if (!env) throw new Error("Supabase env yoxdur");
  const db = createClient(env.url, supabaseSecretKey(), { auth: { persistSession: false } });

  let userId: string | undefined;
  const invited = await db.auth.admin.inviteUserByEmail(email, { data: { name } });
  if (invited.error) {
    const { data } = await db.auth.admin.listUsers({ perPage: 200 });
    userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) throw invited.error;
    console.log("İstifadəçi artıq var — admin hüququ verilir");
  } else {
    userId = invited.data.user.id;
    console.log(`Dəvət e-poçtu göndərildi: ${email}`);
  }

  const res = await db.from("admins").upsert({ user_id: userId, name: name || email }, { onConflict: "user_id" });
  if (res.error) throw res.error;
  console.log("Admin siyahısına əlavə olundu");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
Add the npm script.

- [ ] **Step 6: Verify** — tsc, lint, tests; `curl -sI localhost:3000/admin/adminler` → `307` to `/admin/giris?next=%2Fadmin%2Fadminler`.

- [ ] **Step 7: Commit**
```bash
git add lib/admin/admins-actions.ts components/admin/InviteAdminForm.tsx components/admin/RemoveAdminButton.tsx "app/admin/(panel)/adminler" scripts/admin-invite.ts package.json
git commit -m "feat(admin): admins page with invite/remove and first-admin script"
```

---

### Task 6: Supabase Auth settings + end-to-end check with the user

**Files:** none (dashboard configuration; ask the user's permission before changing project settings).

- [ ] **Step 1: Auth settings** (Supabase Dashboard; agent may do it in the browser pane only after the user agrees in chat)
1. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up" (admins come only by invite).
2. Authentication → URL Configuration → Site URL `http://localhost:3000` (change to the real domain at deploy); Redirect URLs add `http://localhost:3000/admin/**`.
3. Authentication → Emails → **Invite user** template, link:
   `<a href="{{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Dəvəti qəbul et</a>`
4. **Reset password** template, link:
   `<a href="{{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Şifrəni yenilə</a>`

Note: Supabase's built-in mailer sends only a few e-mails per hour — enough for a handful of admins; a custom SMTP can be added later.

- [ ] **Step 2: First admin (user runs in the Terminal panel)**
```bash
npm.cmd run admin:invite -- <their-email> "<Ad Soyad>"
```
Expected: "Dəvət e-poçtu göndərildi" + "Admin siyahısına əlavə olundu".

- [ ] **Step 3: User walkthrough** — open the invite e-mail → link → `/admin/sifre-teyin` → set password → lands on `/admin` (overview with 0 counts, "Hələ sifariş yoxdur") → "Adminlər" lists them with "(siz)" → "Çıxış" → back to `/admin/giris` → sign in again → `/admin`. Then "Şifrəni unutmusunuz?" → e-mail → link → set password works.

- [ ] **Step 4: Agent checks after the user signs in** — `read_console_messages` on `/admin` (no errors), `npx vitest run`, public sweep "no problems", axe on `/admin/giris` "No violations".

- [ ] **Step 5: Commit any fixes; update `docs/superpowers/specs/...` only if behaviour changed.**

---

## Out of scope (plans 3–4)

Products/categories CRUD, image upload, orders/requests pages and Telegram — nav entries are added by those plans.
