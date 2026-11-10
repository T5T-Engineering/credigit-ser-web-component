#!/usr/bin/env node
// Usage: node scripts/screenshot-cdp.mjs <url> <output.png> [width] [height] [--browser <path>] [--wait <ms>]
// Headless Edge/Chrome screenshot at any viewport width (including phone widths < 500px) via the DevTools protocol:
// Emulation.setDeviceMetricsOverride → Page.navigate → wait for load + settle → Page.captureScreenshot.
// The page is loaded as a normal top-level document, so first-party storage (localStorage, cookies) works,
// unlike an iframe inside a file:// harness. No dependencies: Node 22 built-in fetch/WebSocket only.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const browser = flag("--browser", process.env.SCREENSHOT_BROWSER ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe");
const settle = Number(flag("--wait", "2500"));
const [url, out, w = "1440", h = "2400"] = args;
if (!url || !out) {
  console.error("Usage: node scripts/screenshot-cdp.mjs <url> <output.png> [width] [height] [--browser path] [--wait ms]");
  process.exit(2);
}
const width = Number(w);
const height = Number(h);
const mobile = width < 768;

const profile = mkdtempSync(join(tmpdir(), "cg-shot-"));
const child = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    `--window-size=${Math.max(width, 500)},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function devtoolsPort() {
  const file = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 100; i += 1) {
    if (existsSync(file)) {
      const [port] = readFileSync(file, "utf8").split(/\r?\n/);
      if (port) return Number(port);
    }
    await sleep(100);
  }
  throw new Error("Browser did not expose a DevTools port");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  return {
    ready,
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      }),
    once: (method, timeout) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          listeners.delete(fn);
          resolve(null);
        }, timeout);
        const fn = (msg) => {
          if (msg.method === method) {
            clearTimeout(timer);
            listeners.delete(fn);
            resolve(msg.params);
          }
        };
        listeners.add(fn);
      }),
    close: () => ws.close(),
  };
}

let exitCode = 0;
try {
  const port = await devtoolsPort();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("No page target");
  const cdp = connect(page.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  const loaded = cdp.once("Page.loadEventFired", 30000);
  await cdp.send("Page.navigate", { url });
  await loaded;
  await sleep(settle);
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height, scale: 1 },
    captureBeyondViewport: true,
  });
  writeFileSync(out, Buffer.from(data, "base64"));
  cdp.close();
  console.log(`${out} (${width}x${height})`);
} catch (error) {
  console.error(String(error?.message ?? error));
  exitCode = 1;
} finally {
  child.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // Profile may still be locked briefly on Windows; it lives in the temp directory.
  }
  process.exit(exitCode);
}
