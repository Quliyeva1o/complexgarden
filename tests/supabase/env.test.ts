import { afterEach, describe, expect, it, vi } from "vitest";
import { supabasePublicEnv, supabaseSecretKey } from "@/lib/supabase/env";

describe("supabase env", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is null when the public vars are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(supabasePublicEnv()).toBeNull();
  });

  it("returns url and key when both are set", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");
    expect(supabasePublicEnv()).toEqual({ url: "https://abc.supabase.co", key: "sb_publishable_x" });
  });

  it("throws a clear error when the secret key is missing", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(() => supabaseSecretKey()).toThrow(/SUPABASE_SECRET_KEY/);
  });
});
