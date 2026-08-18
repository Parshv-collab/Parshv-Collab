import { afterEach, describe, expect, it } from "vitest";
import { createAdminSession, getAdminSessionToken, revokeAdminSession, verifyAdminPassword, verifyAdminSession } from "./adminPassword";

const originalPassword = process.env.ADMIN_PASSWORD;

afterEach(() => {
  process.env.ADMIN_PASSWORD = originalPassword;
});

describe("password admin session", () => {
  it("accepts the configured password, issues a valid session, and revokes it on exit", async () => {
    expect(verifyAdminPassword(process.env.ADMIN_PASSWORD!)).toBe(true);
    expect(verifyAdminPassword("incorrect-password")).toBe(false);

    const token = await createAdminSession();
    expect(getAdminSessionToken({ "x-admin-session": token })).toBe(token);
    expect(await verifyAdminSession(token)).toBe(true);

    await revokeAdminSession(token);
    expect(await verifyAdminSession(token)).toBe(false);
  });
});
