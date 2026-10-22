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
