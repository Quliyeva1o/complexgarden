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
