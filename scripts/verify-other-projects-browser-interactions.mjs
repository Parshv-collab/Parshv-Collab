import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const port = 9241;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(join(tmpdir(), "signal-other-browser-"));
const chrome = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", detached: true });

let socket;
let sequence = 0;
const pending = new Map();
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

try {
  let target;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(base)}`, { method: "PUT", signal: AbortSignal.timeout(1_000) }).then(response => response.json()); break; } catch { await delay(250); }
  }
  assert.ok(target?.webSocketDebuggerUrl, "Chromium DevTools target was not ready");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const deferred = pending.get(message.id);
    if (!deferred) return;
    pending.delete(message.id);
    if (message.error) deferred.reject(new Error(message.error.message)); else deferred.resolve(message.result);
  });
  await cdp("Runtime.enable");
  await cdp("Page.enable");
  await cdp("Network.enable");
  await cdp("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: `${base}/?qaOtherProjects=7&other-projects-browser-check=${Date.now()}` });

  let fixtureReady = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await delay(200);
    const check = await cdp("Runtime.evaluate", { expression: "document.body.innerText.includes('QA Other Project 7')", returnByValue: true });
    if (check.result.value) { fixtureReady = true; break; }
  }
  if (!fixtureReady) {
    const diagnostic = await cdp("Runtime.evaluate", { expression: "JSON.stringify({ href: location.href, text: document.body.innerText.slice(0, 240), hasRoot: Boolean(document.querySelector('.portfolio-palette')), resources: performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('trpc')) })", returnByValue: true });
    console.error("Fixture browser diagnostic:", diagnostic.result.value);
  }
  assert.ok(fixtureReady, "The seven-item Other Projects fixture did not reach the browser");

  const interaction = await cdp("Runtime.evaluate", { expression: `(() => new Promise(resolve => {
    const rows = () => [...document.querySelectorAll('article[tabindex="0"]')].filter(node => node.textContent.includes('QA Other Project'));
    const loadButton = () => [...document.querySelectorAll('button')].find(button => button.textContent.includes('Load'));
    const firstCount = rows().length;
    const firstButton = loadButton()?.textContent.trim() || '';
    loadButton()?.click();
    setTimeout(() => {
      const secondCount = rows().length;
      const secondButton = loadButton()?.textContent.trim() || '';
      loadButton()?.click();
      setTimeout(() => {
        const finalCount = rows().length;
        const finalButtonPresent = Boolean(loadButton());
        const firstRow = rows()[0];
        firstRow?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        setTimeout(() => {
          const hoverPreview = document.body.innerText.includes('Quick preview');
          firstRow?.focus();
          setTimeout(() => resolve(JSON.stringify({ firstCount, firstButton, secondCount, secondButton, finalCount, finalButtonPresent, hoverPreview, focusedPreview: document.body.innerText.includes('Quick preview'), activeElementIsRow: document.activeElement === firstRow })), 120);
        }, 120);
      }, 120);
    }, 120);
  }))()`, awaitPromise: true, returnByValue: true });
  const result = JSON.parse(interaction.result.value);
  assert.equal(result.firstCount, 3, "Initial Other Projects view should render three items");
  assert.match(result.firstButton, /Load 3 more projects \(4\)/, "Initial Load More count should communicate four remaining projects");
  assert.equal(result.secondCount, 6, "First Load More click should reveal three additional items");
  assert.match(result.secondButton, /Load 1 more project \(1\)/, "Second Load More count should communicate one remaining project");
  assert.equal(result.finalCount, 7, "Second Load More click should reveal every staged Other Project");
  assert.equal(result.finalButtonPresent, false, "Load More should disappear once all items are visible");
  assert.equal(result.hoverPreview, true, "Hovering an Other Projects row should reveal the quick preview");
  assert.equal(result.focusedPreview, true, "Focusing an Other Projects row should reveal the quick preview");
  assert.equal(result.activeElementIsRow, true, "Keyboard focus should remain on the interactive Other Projects row");
  console.log("Verified Load More increments, full reveal, hover preview, and keyboard-focus preview in a real browser session.");
} finally {
  socket?.close();
  const exited = new Promise(resolve => chrome.once("exit", resolve));
  try { process.kill(-chrome.pid, "SIGTERM"); } catch { chrome.kill("SIGTERM"); }
  await Promise.race([exited, delay(5_000)]);
  await rm(profile, { recursive: true, force: true });
}
