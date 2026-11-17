export function authSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production");
  return new TextEncoder().encode(s || "dev-only-secret-change-me-please-32-chars!!");
}
export const SESSION_COOKIE = "nafsity_session";
