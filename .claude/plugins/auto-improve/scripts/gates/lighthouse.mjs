#!/usr/bin/env node
// Runs Lighthouse via @lhci/cli against the dev URL for each backlog route.
// Usage: lighthouse.mjs <out-json-path>
// Reads dev_server, dev_url, and backlog routes from config + backlog.

import { spawn, execSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const outPath = process.argv[2];
if (!outPath) { console.error("Usage: lighthouse.mjs <out-path>"); process.exit(2); }

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

const PERF_MIN = 0.7;
const A11Y_MIN = 0.9;

try {
  await waitFor(devUrl);
  const results = {};
  let allPass = true;

  for (const route of routes) {
    const url = `${devUrl}${route}`;
    const json = execSync(
      `npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless" --only-categories=performance,accessibility`,
      { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );
    const lh = JSON.parse(json);
    const perf = lh.categories.performance.score;
    const a11y = lh.categories.accessibility.score;
    const pass = perf >= PERF_MIN && a11y >= A11Y_MIN;
    if (!pass) allPass = false;
    results[route] = { performance: perf, accessibility: a11y, pass };
  }

  writeFileSync(outPath, JSON.stringify({
    gate: "lighthouse",
    status: allPass ? "pass" : "fail",
    thresholds: { performance: PERF_MIN, accessibility: A11Y_MIN },
    results,
  }, null, 2));

  console.log(allPass ? "PASS: lighthouse" : "FAIL: lighthouse");
  process.exit(allPass ? 0 : 1);
} finally {
  server.kill("SIGTERM");
}
