import { describe, expect, it } from "vitest";
import { applicationSchema } from "@/lib/application-schema";

const valid = { full_name: "Demo Katılımcı", phone: "+90 555 000 00 00", course: "MAT 1 · 20–21–22 Kasım 2026", notes: "" };

describe("application form rules", () => {
  it("accepts a complete application", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });
  it("requires a full name", () => {
    expect(applicationSchema.safeParse({ ...valid, full_name: " " }).success).toBe(false);
  });
  it("rejects a phone number that is too short", () => {
    expect(applicationSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
  });
  it("requires a selected course or module", () => {
    expect(applicationSchema.safeParse({ ...valid, course: "" }).success).toBe(false);
  });
  it("limits notes to 1000 characters", () => {
    expect(applicationSchema.safeParse({ ...valid, notes: "a".repeat(1001) }).success).toBe(false);
  });
});
