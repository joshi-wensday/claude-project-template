#!/usr/bin/env node
// Appends a structured pass entry to docs/runs/<run-id>/log.md.
// Usage: append-log.mjs <run-id> <entry-json-path>
//
// entry-json-path points to a JSON file with shape:
// {
//   pass: 1,
//   scope: "hero",
//   proposal_slug: "tighten-rhythm",
//   started: "2026-05-15T22:18:00Z",
//   ended: "2026-05-15T22:34:00Z",
//   verdict: "ACCEPTED" | "REJECTED" | "REQUEST_CHANGES",
//   branch: "auto-improve/...",
//   merge_sha: "abc123" (or null),
//   proposal_text: "...",
//   critic_scores: { "design-system": 8.5, ux: 8.0, brand: 9.0, "a11y-perf": 9.5 },
//   prior_score: 8.2 (or null),
//   synthesizer_rationale: "...",
//   iterations: ["iter 1: ...", "iter 2: ..."]
// }

import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , runId, entryPath] = process.argv;
if (!runId || !entryPath) {
  console.error("Usage: append-log.mjs <run-id> <entry-json-path>");
  process.exit(2);
}

const entry = JSON.parse(readFileSync(entryPath, "utf8"));
const logPath = resolve("docs", "runs", runId, "log.md");

const fmtDate = (iso) => new Date(iso).toLocaleString("en-GB", { hour12: false });

const passNum = String(entry.pass).padStart(2, "0");
const elapsedMin = Math.round((new Date(entry.ended) - new Date(entry.started)) / 60000);
const iterCount = entry.iterations.length;

const scoreLines = Object.entries(entry.critic_scores)
  .map(([critic, score]) => {
    const delta = entry.prior_score == null ? "—" :
      ((score - entry.prior_score) >= 0 ? "+" : "") + (score - entry.prior_score).toFixed(2);
    return `| ${critic.padEnd(13)} | ${String(score).padEnd(5)} | ${delta.padEnd(13)} |`;
  })
  .join("\n");

const avgScore = (
  Object.values(entry.critic_scores).reduce((a, b) => a + b, 0) /
  Object.values(entry.critic_scores).length
).toFixed(2);

const md = `

## Pass ${passNum} — ${entry.scope} — ${entry.proposal_slug}
Started ${fmtDate(entry.started)}, ended ${fmtDate(entry.ended)} (${elapsedMin} min, ${iterCount} iteration${iterCount === 1 ? "" : "s"})
Verdict: ${entry.verdict}
Branch: ${entry.branch}
${entry.merge_sha ? `Merge: ${entry.merge_sha}` : ""}

**Proposal:** ${entry.proposal_text}

**Critic scores:**
| Critic        | Score | Δ vs baseline |
|---------------|-------|---------------|
${scoreLines}
| **Avg**       | **${avgScore}** | |

**Synthesizer:** ${entry.synthesizer_rationale}

**Iterations:**
${entry.iterations.map((line, i) => `${i + 1}. ${line}`).join("\n")}

---
`;

appendFileSync(logPath, md);
console.log(`Appended pass ${passNum} to ${logPath}`);
