import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

const ADMIN_SESSION_HEADER = "x-admin-session";
const ADMIN_SESSION_AUDIENCE = "signal-atelier-admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const revokedSessionIds = new Set<string>();

function getPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not configured.");
  return password;
}

function getSessionKey() {
  return new TextEncoder().encode(createHash("sha256").update(getPassword()).digest("hex"));
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = Buffer.from(getPassword());
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createAdminSession(): Promise<string> {
  const sessionId = randomUUID();
  return new SignJWT({ scope: "portfolio:admin", sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(ADMIN_SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSessionKey());
}

export function getAdminSessionToken(headers: Record<string, unknown>): string | null {
  const value = headers[ADMIN_SESSION_HEADER];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function verifyAdminSession(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionKey(), { audience: ADMIN_SESSION_AUDIENCE });
    return payload.scope === "portfolio:admin" && typeof payload.sid === "string" && !revokedSessionIds.has(payload.sid);
  } catch {
    return false;
  }
}

export async function revokeAdminSession(token: string | null): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, getSessionKey(), { audience: ADMIN_SESSION_AUDIENCE });
    if (typeof payload.sid === "string") revokedSessionIds.add(payload.sid);
  } catch {
    // Invalid tokens are already unusable; logout remains idempotent.
  }
}
