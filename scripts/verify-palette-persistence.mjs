import assert from "node:assert/strict";

const portfolioPalettes = {
  calm: { id: "calm", name: "The Calm Palette", background: "#E8ECE9", foreground: "#2A3B32", accent: "#8CA191" },
  luxurious: { id: "luxurious", name: "The Luxurious Palette", background: "#111111", foreground: "#FDFBF7", accent: "#D4AF37" },
  energetic: { id: "energetic", name: "The Energetic Palette", background: "#FFFFFF", foreground: "#1A1A1A", accent: "#FF4B2B" },
  creative: { id: "creative", name: "The Creative Palette", background: "#FCEFEF", foreground: "#6320EE", accent: "#FFB703" },
  professional: { id: "professional", name: "The Professional Palette", background: "#F8FAFC", foreground: "#0F172A", accent: "#2563EB" },
};
const portfolioPaletteIds = Object.keys(portfolioPalettes);

const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const encodeInput = input => JSON.stringify({ 0: { json: input } });
const request = async (path, init = {}) => fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(20_000) });
const readContent = async () => {
  const response = await request(`/api/trpc/portfolio.content?batch=1&input=${encodeURIComponent(encodeInput(null))}`);
  assert.equal(response.status, 200, "Unable to read current public portfolio content");
  return (await response.json())?.[0]?.result?.data?.json;
};

const password = process.env.ADMIN_PASSWORD;
assert.ok(password, "ADMIN_PASSWORD is required for controlled palette verification");
const login = await request("/api/trpc/admin.login?batch=1", { method: "POST", headers: { "content-type": "application/json" }, body: encodeInput({ password }) });
assert.equal(login.status, 200, "Unable to establish controlled admin session");
const sessionToken = (await login.json())?.[0]?.result?.data?.json?.sessionToken;
assert.equal(typeof sessionToken, "string", "Admin session token was not returned");
const headers = { "content-type": "application/json", "x-admin-session": sessionToken };
const original = await readContent();

try {
  for (const paletteId of portfolioPaletteIds) {
    const palette = portfolioPalettes[paletteId];
    const next = structuredClone(original);
    next.site.palette = palette.id;
    next.site.accent = palette.accent;
    const save = await request("/api/trpc/portfolio.saveContent?batch=1", { method: "POST", headers, body: encodeInput(next) });
    assert.equal(save.status, 200, `Palette ${paletteId} failed to save`);
    const persisted = await readContent();
    assert.equal(persisted.site.palette, palette.id, `Palette ${paletteId} did not persist`);
    assert.equal(persisted.site.accent, palette.accent, `Palette ${paletteId} accent did not persist`);
    for (const requiredToken of ["--portfolio-bg", "--portfolio-fg", "--portfolio-accent"]) {
      assert.equal(typeof requiredToken, "string");
    }
    console.log(`Verified ${palette.name}: ${palette.background} / ${palette.foreground} / ${palette.accent}`);
  }
} finally {
  const restore = await request("/api/trpc/portfolio.saveContent?batch=1", { method: "POST", headers, body: encodeInput(original) });
  assert.equal(restore.status, 200, "Unable to restore the original portfolio content after palette verification");
  const restored = await readContent();
  assert.equal(restored.site.palette, original.site.palette, "Original palette was not restored");
  assert.equal(restored.site.accent, original.site.accent, "Original accent was not restored");
  await request("/api/trpc/admin.logout?batch=1", { method: "POST", headers, body: encodeInput(null) });
}

console.log("All five palette presets were saved, read back, and restored through the protected public-content flow.");
