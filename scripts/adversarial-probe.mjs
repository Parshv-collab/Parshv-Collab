import assert from "node:assert/strict";
import { MongoClient } from "mongodb";

const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const expectedPublicOrigin = process.env.PROBE_EXPECTED_ORIGIN || base;
const trpcInput = input => encodeURIComponent(JSON.stringify({ 0: { json: input } }));
const get = async (path, init) => {
  console.log(`Probe: ${init?.method ?? "GET"} ${path}`);
  return fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(20_000) });
};
const expectStatus = async (path, status, init) => {
  const response = await get(path, init);
  assert.equal(response.status, status, `${path} returned ${response.status}, expected ${status}`);
  return response;
};

const home = await expectStatus("/", 200);
const html = await home.text();
for (const expected of ["rel=\"canonical\"", "property=\"og:image\"", "name=\"twitter:image\"", "portfolio-jsonld", "name=\"robots\""]) {
  assert.ok(html.includes(expected), `Home is missing ${expected}`);
}
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/u)?.[1];
assert.ok(canonical?.startsWith(expectedPublicOrigin), "Canonical URL is not absolute for the configured public origin");
const jsonLd = html.match(/<script id="portfolio-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
assert.doesNotThrow(() => JSON.parse(jsonLd ?? ""), "Structured data is not valid JSON");

await expectStatus("/admin", 200);
const retiredWritingRoute = await expectStatus("/writing", 200);
assert.ok((await retiredWritingRoute.text()).includes('id="root"'), "Removed writing route no longer returns the application shell");
const robots = await expectStatus("/robots.txt", 200);
assert.ok((await robots.text()).includes("Sitemap: /sitemap.xml"));
const sitemap = await expectStatus("/sitemap.xml", 200);
assert.ok((await sitemap.text()).includes(`<loc>${expectedPublicOrigin}/</loc>`), "Sitemap did not use the configured public origin");
await expectStatus("/api/media/not-an-object-id", 404);
await expectStatus("/api/media/000000000000000000000000", 404);
const social = await expectStatus("/api/media/6a8d1bd3391f6915811f4985", 200);
assert.equal(social.headers.get("content-type"), "image/png");

const content = await expectStatus(`/api/trpc/portfolio.content?batch=1&input=${trpcInput(null)}`, 200);
const contentPayload = await content.json();
assert.ok(JSON.stringify(contentPayload).includes("Jarvis"), "Public content API lost the Jarvis project");
assert.ok(JSON.stringify(contentPayload).includes("sample-pulseboard"), "Public content API lost the first sample project");
assert.ok(!JSON.stringify(contentPayload).match(/testimonials|writingPosts/iu), "Retired writing or testimonial content leaked through the public API");

const status = await expectStatus(`/api/trpc/admin.status?batch=1&input=${trpcInput(null)}`, 200);
assert.ok((await status.text()).includes("false"), "Anonymous admin status unexpectedly permits editing");
for (const init of [undefined, { headers: { "x-admin-session": "forged-session" } }]) {
  const response = await get(`/api/trpc/portfolio.inquiries?batch=1&input=${trpcInput(null)}`, init);
  assert.ok([401, 403].includes(response.status), `Protected inquiry route returned ${response.status}`);
  assert.ok((await response.text()).includes("UNAUTHORIZED"), "Protected inquiry route did not reject unauthenticated access");
}

const invalidLogin = await get("/api/trpc/admin.login?batch=1", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ 0: { json: { password: "definitely-not-the-admin-password" } } }),
});
assert.ok([401, 403].includes(invalidLogin.status), `Invalid password returned ${invalidLogin.status}`);

const adminPassword = process.env.ADMIN_PASSWORD;
assert.ok(adminPassword, "ADMIN_PASSWORD is unavailable for controlled admin-session verification");
const validLogin = await get("/api/trpc/admin.login?batch=1", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ 0: { json: { password: adminPassword } } }),
});
assert.equal(validLogin.status, 200, "Correct admin password failed to create an editing session");
const loginPayload = await validLogin.json();
const sessionToken = loginPayload?.[0]?.result?.data?.json?.sessionToken;
assert.equal(typeof sessionToken, "string", "Correct admin login returned no session token");
const sessionHeaders = { "x-admin-session": sessionToken };
const authenticatedStatus = await expectStatus(`/api/trpc/admin.status?batch=1&input=${trpcInput(null)}`, 200, { headers: sessionHeaders });
assert.ok((await authenticatedStatus.text()).includes("true"), "Fresh admin session did not enable editing");
await expectStatus(`/api/trpc/portfolio.inquiries?batch=1&input=${trpcInput(null)}`, 200, { headers: sessionHeaders });
const mongoStatus = await expectStatus(`/api/trpc/admin.mongoStatus?batch=1&input=${trpcInput(null)}`, 200, { headers: sessionHeaders });
assert.match(await mongoStatus.text(), /connected|checkedAt/u, "Admin MongoDB status did not return its health payload");
for (const [path, input] of [
  ["/api/trpc/portfolio.saveContent?batch=1", {}],
  ["/api/trpc/portfolio.uploadMedia?batch=1", { filename: "../escape.png", contentType: "image/png", dataBase64: "data:image/png;base64,AAAAAAAAAAAAAAAAAAAA" }],
]) {
  const malformedMutation = await get(path, {
    method: "POST",
    headers: { ...sessionHeaders, "content-type": "application/json" },
    body: JSON.stringify({ 0: { json: input } }),
  });
  assert.ok([400, 422].includes(malformedMutation.status), `Malformed protected mutation ${path} returned ${malformedMutation.status}`);
}
await expectStatus("/api/trpc/admin.logout?batch=1", 200, { method: "POST", headers: { ...sessionHeaders, "content-type": "application/json" }, body: JSON.stringify({ 0: { json: null } }) });
const revokedStatus = await expectStatus(`/api/trpc/admin.status?batch=1&input=${trpcInput(null)}`, 200, { headers: sessionHeaders });
assert.ok((await revokedStatus.text()).includes("false"), "Logged-out admin session remained active");

const invalidInquiry = await get("/api/trpc/portfolio.submitInquiry?batch=1", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ 0: { json: { name: "x", email: "not-an-email", message: "short" } } }),
});
assert.ok([400, 422].includes(invalidInquiry.status), `Invalid inquiry returned ${invalidInquiry.status}`);

const verification = {
  name: "Adversarial verification",
  email: "adversarial-verification@example.com",
  message: "This controlled adversarial verification confirms that a valid public inquiry reaches MongoDB and is then removed without leaving test content in the owner inbox.",
};
const validInquiry = await get("/api/trpc/portfolio.submitInquiry?batch=1", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ 0: { json: verification } }),
});
assert.equal(validInquiry.status, 200, "Valid inquiry failed to submit");

const uri = process.env.MONGODB_URI;
assert.ok(uri, "MONGODB_URI is unavailable for controlled inquiry cleanup");
const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 12000 }).connect();
try {
  const inquiries = client.db().collection("inquiries");
  const record = await inquiries.findOne({ email: verification.email, message: verification.message });
  assert.ok(record, "Valid inquiry was not persisted to MongoDB");
  await inquiries.deleteOne({ _id: record._id });
} finally {
  await client.close();
}

console.log("Adversarial probe passed: public routes, SEO, media, API validation, inquiry persistence, and admin boundaries behaved as expected.");
