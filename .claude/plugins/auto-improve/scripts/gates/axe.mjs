#!/usr/bin/env node
// Runs axe-core via Playwright against each backlog route.
// Usage: axe.mjs <out-json-path>

import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import yaml from "js-yaml";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const outPath = process.argv[2];
if (!outPath) { console.error("Usage: axe.mjs <out-path>"); process.exit(2); }

const config = yaml.load(readFileSync("auto-improve.config.yaml", "utf8"));
const backlog = yaml.load(readFileSync("backlog.yaml", "utf8"));

const devCmd = config.project.dev_server;
const devUrl = config.project.dev_url;
const routes = [...new Set(backlog.scopes.flatMap((s) => s.routes).filter((r) => r !== "*"))];

const server = spawn(devCmd, { shell: true, stdio: "ignore" });
server.unref();

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server not ready: ${url}`);
}

try {
  await waitFor(devUrl);
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const results = {};
  let totalCritical = 0;
  let totalSerious = 0;

  for (const route of routes) {
    await page.goto(`${devUrl}${route}`, { waitUntil: "networkidle" });
    const r = await new AxeBuilder({ page }).analyze();
    const critical = r.violations.filter((v) => v.impact === "critical").length;
    const serious = r.violations.filter((v) => v.impact === "serious").length;
    totalCritical += critical;
    totalSerious += serious;
    results[route] = {
      violations: r.violations.length,
      critical,
      serious,
      details: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
    };
  }

  await browser.close();

  const pass = totalCritical === 0 && totalSerious === 0;

  writeFileSync(outPath, JSON.stringify({
    gate: "axe",
    status: pass ? "pass" : "fail",
    thresholds: { critical: 0, serious: 0 },
    totals: { critical: totalCritical, serious: totalSerious },
    results,
  }, null, 2));

  console.log(pass ? "PASS: axe" : "FAIL: axe");
  process.exit(pass ? 0 : 1);
} finally {
  server.kill("SIGTERM");
}
