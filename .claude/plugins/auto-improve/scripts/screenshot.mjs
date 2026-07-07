#!/usr/bin/env node
// Boots the dev server, takes desktop + mobile screenshots of the given routes,
// and writes them to <out-dir>/<viewport>/<route-slug>.png.
// Usage: screenshot.mjs <dev-server-cmd> <dev-url> <routes-csv> <out-dir>

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const [, , devCmd, devUrl, routesCsv, outDir] = process.argv;
if (!devCmd || !devUrl || !routesCsv || !outDir) {
  console.error("Usage: screenshot.mjs <dev-cmd> <dev-url> <routes-csv> <out-dir>");
  process.exit(2);
}

const routes = routesCsv.split(",").map((r) => r.trim());

mkdirSync(resolve(outDir, "desktop"), { recursive: true });
mkdirSync(resolve(outDir, "mobile"), { recursive: true });

const server = spawn(devCmd, { shell: true, stdio: "ignore" });
server.unref();

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

const slug = (route) => route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");

try {
  await waitFor(devUrl);
  const browser = await chromium.launch();

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    for (const route of routes) {
      if (route === "*") continue;
      await page.goto(`${devUrl}${route}`, { waitUntil: "networkidle" });
      await page.screenshot({
        path: resolve(outDir, viewport.name, `${slug(route)}.png`),
        fullPage: true,
      });
    }
    await ctx.close();
  }

  await browser.close();
  console.log(`Screenshots written to ${outDir}`);
} finally {
  server.kill("SIGTERM");
}
