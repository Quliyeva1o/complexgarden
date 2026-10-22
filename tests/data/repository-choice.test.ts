import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

describe("chooseRepository", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses local files without Supabase env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const { chooseRepository } = await import("@/lib/data");
    const { localRepository } = await import("@/lib/data/local");
    expect(chooseRepository()).toBe(localRepository);
  });

  it("uses Supabase when env is present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");
    const { chooseRepository } = await import("@/lib/data");
    const { supabaseRepository } = await import("@/lib/data/supabase");
    expect(chooseRepository()).toBe(supabaseRepository);
  });
});
