import assert from "node:assert/strict";

const palettes = {
  calm: "#8CA191",
  luxurious: "#D4AF37",
  energetic: "#FF4B2B",
  creative: "#FFB703",
  professional: "#2563EB",
};
const paletteId = process.argv[2];
assert.ok(paletteId && paletteId in palettes, "Pass one approved palette id: calm, luxurious, energetic, creative, or professional.");
const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const encodeInput = input => JSON.stringify({ 0: { json: input } });
const request = (path, init = {}) => fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(20_000) });

const login = await request("/api/trpc/admin.login?batch=1", { method: "POST", headers: { "content-type": "application/json" }, body: encodeInput({ password: process.env.ADMIN_PASSWORD }) });
assert.equal(login.status, 200, "Unable to establish controlled admin session");
const token = (await login.json())?.[0]?.result?.data?.json?.sessionToken;
assert.equal(typeof token, "string", "Admin session token was not returned");
const headers = { "content-type": "application/json", "x-admin-session": token };
const contentResponse = await request(`/api/trpc/portfolio.content?batch=1&input=${encodeURIComponent(encodeInput(null))}`);
assert.equal(contentResponse.status, 200, "Unable to load content before visual check");
const content = (await contentResponse.json())?.[0]?.result?.data?.json;
content.site.palette = paletteId;
content.site.accent = palettes[paletteId];
const save = await request("/api/trpc/portfolio.saveContent?batch=1", { method: "POST", headers, body: encodeInput(content) });
assert.equal(save.status, 200, `Unable to stage ${paletteId} for visual check`);
await request("/api/trpc/admin.logout?batch=1", { method: "POST", headers, body: encodeInput(null) });
console.log(`Staged ${paletteId} for controlled visual verification.`);
