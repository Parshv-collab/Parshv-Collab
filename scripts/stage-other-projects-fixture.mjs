import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const backupPath = "/tmp/signal-atelier-other-projects-backup.json";
const mode = process.argv[2] || "stage";
const encodeInput = input => JSON.stringify({ 0: { json: input } });
const request = (path, init = {}) => fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(60_000) });

const login = await request("/api/trpc/admin.login?batch=1", { method: "POST", headers: { "content-type": "application/json" }, body: encodeInput({ password: process.env.ADMIN_PASSWORD }) });
assert.equal(login.status, 200, "Unable to establish controlled admin session");
const token = (await login.json())?.[0]?.result?.data?.json?.sessionToken;
assert.equal(typeof token, "string", "Admin session token was not returned");
const headers = { "content-type": "application/json", "x-admin-session": token };
const readContent = async () => {
  const response = await request(`/api/trpc/portfolio.content?batch=1&input=${encodeURIComponent(encodeInput(null))}`);
  assert.equal(response.status, 200, "Unable to read public portfolio content");
  return (await response.json())?.[0]?.result?.data?.json;
};
const saveContent = async content => {
  const response = await request("/api/trpc/portfolio.saveContent?batch=1", { method: "POST", headers, body: encodeInput(content) });
  assert.equal(response.status, 200, "Unable to save controlled fixture content");
};

try {
  if (mode === "restore") {
    const original = JSON.parse(await readFile(backupPath, "utf8"));
    await saveContent(original);
    console.log("Restored the original portfolio content after Other Projects verification.");
  } else {
    const original = await readContent();
    await writeFile(backupPath, JSON.stringify(original), "utf8");
    const seed = structuredClone(original.projects.find(project => !project.hidden) || original.projects[0]);
    const fixtureProjects = Array.from({ length: 7 }, (_, index) => ({
      ...seed,
      id: `qa-other-project-${index + 1}`,
      title: `QA Other Project ${index + 1}`,
      summary: `Temporary verification item ${index + 1} for progressive Other Projects loading and quick-preview behavior.`,
      visible: false,
      hidden: false,
      liveUrl: "",
      codeUrl: "",
      images: [],
    }));
    await saveContent({ ...original, projects: [...original.projects.filter(project => project.visible), ...fixtureProjects] });
    console.log("Staged seven temporary Other Projects for controlled visual verification.");
  }
} finally {
  await request("/api/trpc/admin.logout?batch=1", { method: "POST", headers, body: encodeInput(null) });
}
