#!/usr/bin/env node
// Appends a final run-summary block to docs/runs/<run-id>/log.md.
// Usage: finalize-run.mjs <run-id> <stop-reason> <summary-json-path>
//
// summary-json shape:
// { passes_total, passes_accepted, passes_rejected, scopes_touched: [...], score_deltas: { scope: delta } }

import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , runId, stopReason, summaryPath] = process.argv;
if (!runId || !stopReason || !summaryPath) {
  console.error("Usage: finalize-run.mjs <run-id> <stop-reason> <summary-json-path>");
  process.exit(2);
}

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
const logPath = resolve("docs", "runs", runId, "log.md");

const deltas = Object.entries(summary.score_deltas)
  .map(([scope, delta]) => `${scope} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`)
  .join(", ");

const md = `

## Run summary
Ended: ${new Date().toLocaleString("en-GB", { hour12: false })}
Stop reason: ${stopReason}
Passes: ${summary.passes_total} (${summary.passes_accepted} accepted, ${summary.passes_rejected} rejected)
Scopes touched: ${summary.scopes_touched.join(", ")}
Net critic-score deltas: ${deltas}
`;

appendFileSync(logPath, md);
console.log(`Finalized log at ${logPath}`);
