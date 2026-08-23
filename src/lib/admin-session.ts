export const ADMIN_COOKIE = "velora_admin";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set");
  return value;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

export function parseAdminToken(token: string) {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const parts = payload.split(".");
  if (parts[0] !== "admin" || parts.length !== 3) return null;
  const userId = parts[1];
  const exp = Number(parts[2]);
  if (!userId || !Number.isFinite(exp)) return null;
  return { userId, exp, sig, payload };
}

export async function createAdminToken(userId: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `admin.${userId}.${exp}`;
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

export async function isValidAdminToken(token?: string | null) {
  if (!token) return false;
  const parsed = parseAdminToken(token);
  if (!parsed) return false;
  const expected = await hmacHex(parsed.payload);
  if (parsed.sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < parsed.sig.length; i += 1) {
    diff |= parsed.sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;
  return parsed.exp > Date.now();
}
