import { describe, expect, it } from "vitest";
import { formatDateTime } from "@/lib/admin/format";

describe("formatDateTime", () => {
  it("shows Baku local time (UTC+4)", () => {
    expect(formatDateTime("2026-10-22T10:05:00Z")).toBe("22.10.2026, 14:05");
  });
});
