import { describe, it, expect } from "vitest";
import { generateSlots } from "@/lib/slots";
import { isCrisis } from "@/lib/crisis";
import { registerSchema, TN_PHONE } from "@/lib/validators";
import { tunisDateStr, tunisMidnightUTC, addDays } from "@/lib/date";

const rule = { startMinute: 540, endMinute: 1020, slotMinutes: 45, breakStartMinute: 720, breakEndMinute: 780 };
const farFuture = "2099-03-02"; // a Monday
describe("slots", () => {
  const now = new Date("2090-01-01T00:00:00Z");
  it("generates slots inside working hours and skips the break", () => {
    const s = generateSlots(farFuture, rule, [], now);
    const mins = s.map((d) => (d.getTime() - tunisMidnightUTC(farFuture).getTime()) / 60000);
    expect(Math.min(...mins)).toBe(540);
    expect(mins.every((m) => m + 45 <= 1020)).toBe(true);
    expect(mins.some((m) => m < 780 && m + 45 > 720)).toBe(false);
  });
  it("removes busy periods (no double booking / overlap)", () => {
    const first = generateSlots(farFuture, rule, [], now)[0];
    const busy = [{ startsAt: first, endsAt: new Date(+first + 45 * 60000) }];
    expect(generateSlots(farFuture, rule, busy, now).some((d) => +d === +first)).toBe(false);
  });
  it("returns nothing without an availability rule or in the past", () => {
    expect(generateSlots(farFuture, null, [], now)).toEqual([]);
    expect(generateSlots("2000-01-03", rule, [], new Date())).toEqual([]);
  });
});
describe("timezone", () => {
  it("uses Africa/Tunis (UTC+1)", () => { expect(tunisDateStr(new Date("2026-01-01T23:30:00Z"))).toBe("2026-01-02"); expect(addDays("2026-02-28", 1)).toBe("2026-03-01"); });
});
describe("crisis detection", () => {
  it("flags crisis language in FR/EN/AR", () => { expect(isCrisis("j'ai envie de me tuer")).toBe(true); expect(isCrisis("I want to die")).toBe(true); expect(isCrisis("أريد أن أموت")).toBe(true); expect(isCrisis("Comment réserver ?")).toBe(false); });
});
describe("validation", () => {
  it("accepts Tunisian phones", () => { expect(TN_PHONE.test("+216 22 345 678")).toBe(true); expect(TN_PHONE.test("22345678")).toBe(true); expect(TN_PHONE.test("12345678")).toBe(false); });
  it("rejects weak passwords and mismatches", () => {
    const base = { firstName: "Sami", lastName: "Ben", dateOfBirth: "1995-01-01", phone: "22345678", governorate: "Sfax", email: "a@b.co", password: "Abcdefg1", confirmPassword: "Abcdefg1", consent: true };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, password: "abc", confirmPassword: "abc" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirmPassword: "x" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });
});
