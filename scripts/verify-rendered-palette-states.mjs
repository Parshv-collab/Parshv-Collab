import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const palettes = {
  calm: { name: "The Calm Palette", background: "#E8ECE9", foreground: "#2A3B32", accent: "#8CA191" },
  luxurious: { name: "The Luxurious Palette", background: "#111111", foreground: "#FDFBF7", accent: "#D4AF37" },
  energetic: { name: "The Energetic Palette", background: "#FFFFFF", foreground: "#1A1A1A", accent: "#FF4B2B" },
  creative: { name: "The Creative Palette", background: "#FCEFEF", foreground: "#6320EE", accent: "#FFB703" },
  professional: { name: "The Professional Palette", background: "#F8FAFC", foreground: "#0F172A", accent: "#2563EB" },
};
const base = process.env.PROBE_BASE_URL || "http://127.0.0.1:3000";
const port = 9238;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const rgb = hex => `rgb(${[1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16)).join(", ")})`;
const profile = await mkdtemp(join(tmpdir(), "signal-palette-render-"));
const chromium = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", detached: true });

let socket;
let nextId = 0;
const pending = new Map();
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
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
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
  });
  await cdp("Page.enable");
  await cdp("Network.enable");
  await cdp("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(1_500);

  for (const palette of Object.values(palettes)) {
    const result = await cdp("Runtime.evaluate", { expression: `(() => {
      const root = document.querySelector('.portfolio-palette');
      const assign = node => { for (const [key, value] of Object.entries({ '--portfolio-bg': '${palette.background}', '--portfolio-fg': '${palette.foreground}', '--portfolio-accent': '${palette.accent}' })) node.style.setProperty(key, value); };
      assign(document.documentElement); assign(root);
      const form = document.querySelector('#contact form');
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      document.querySelector('button[aria-label^="View details"]')?.click();
      return new Promise(resolve => setTimeout(() => {
        const style = node => getComputedStyle(node);
        const dialog = document.querySelector('[role="dialog"]');
        const alert = document.querySelector('#contact [role="alert"]');
        const submit = document.querySelector('#contact button[type="submit"]');
        const availability = document.querySelector('header i');
        const project = document.querySelector('button[aria-label^="View details"]');
        resolve(JSON.stringify({ rootBg: style(root).backgroundColor, rootFg: style(root).color, accent: style(root).getPropertyValue('--portfolio-accent').trim(), availabilityBg: style(availability).backgroundColor, submitBg: style(submit).backgroundColor, projectBg: style(project).backgroundColor, contactBg: style(form).backgroundColor, alertBg: style(alert).backgroundColor, dialogBg: style(dialog).backgroundColor }));
      }, 220));
    })()`, awaitPromise: true, returnByValue: true });
    const states = JSON.parse(result.result.value);
    assert.equal(states.rootBg, rgb(palette.background), `${palette.name} root background failed`);
    assert.equal(states.rootFg, rgb(palette.foreground), `${palette.name} root foreground failed`);
    assert.equal(states.accent, palette.accent, `${palette.name} accent variable failed`);
    assert.equal(states.availabilityBg, rgb(palette.accent), `${palette.name} availability state failed`);
    assert.equal(states.submitBg, rgb(palette.accent), `${palette.name} primary action state failed`);
    assert.equal(states.projectBg, rgb(palette.background), `${palette.name} project fallback state failed`);
    assert.equal(states.contactBg, rgb(palette.background), `${palette.name} contact surface failed`);
    assert.match(states.alertBg, /\/ 0\.1\)$/, `${palette.name} contact error state failed`);
    assert.equal(states.dialogBg, rgb(palette.background), `${palette.name} dialog state failed`);
    console.log(`Rendered all public state tokens for ${palette.name}.`);
  }
} finally {
  socket?.close();
  const chromiumExited = new Promise(resolve => chromium.once("exit", resolve));
  try { process.kill(-chromium.pid, "SIGTERM"); } catch { chromium.kill("SIGTERM"); }
  await Promise.race([chromiumExited, delay(5_000)]);
  await rm(profile, { recursive: true, force: true });
}

console.log("All five palette presets passed rendered public-state verification.");
