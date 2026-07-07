#!/usr/bin/env node
// Appends a rejected proposal to docs/runs/<run-id>/rejected_proposals/<scope>.yaml.
// Usage: append-rejected.mjs <run-id> <scope-slug> <pass-number> <branch> <proposal-text> <reason>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const [, , runId, scope, passNum, branch, proposal, reason] = process.argv;
if (!runId || !scope || !passNum || !branch || !proposal || !reason) {
  console.error("Usage: append-rejected.mjs <run-id> <scope> <pass-number> <branch> <proposal-text> <reason>");
  process.exit(2);
}

const path = resolve("docs", "runs", runId, "rejected_proposals", `${scope}.yaml`);

let entries = [];
if (existsSync(path)) {
  entries = yaml.load(readFileSync(path, "utf8")) || [];
}

entries.push({
  pass: Number(passNum),
  proposal,
  reason,
  branch,
});

writeFileSync(path, yaml.dump(entries, { lineWidth: 100 }));
console.log(`Appended rejection to ${path}`);
