---
name: running-the-loop
description: Run an autonomous overnight loop that iteratively improves the website in this repo against BRAND.md and a Claude Design handoff bundle. Use when the user says "run the auto-improve loop", "start an overnight polish run", "auto-improve this site for N hours", "polish my site overnight", or any phrasing that asks for an unsupervised iteration loop. The loop runs until wall-clock budget, STOP file, or empty backlog.
---

# Running The Auto-Improve Loop

User-invokable entry point. Orchestrates the entire run. Dispatches `auto-improve:setting-up-a-run`, then loops over `auto-improve:executing-a-pass` until a stop condition fires.

## Pre-flight checks (do these BEFORE invoking setup)

1. Confirm `auto-improve.config.yaml`, `backlog.yaml`, `BRAND.md`, `handoff-bundle/` exist.
2. Confirm working tree is clean.
3. Print the run plan to the user: wall-clock budget, scope count, gate list, critic list. Ask for confirmation.
4. Acknowledge cost: "This run will dispatch ~4 critics × up to 5 iterations × N passes. Expect significant model cost." Ask for confirmation.

## Step 1: Set up the run

Invoke `auto-improve:setting-up-a-run`. Capture `run_id`. Note start time.

## Step 2: The outer loop

~~~
SCOPES_COMPLETED = []
SCOPE_SCORES = {}        # scope_slug -> [score_at_pass_N, ...]
CURRENT_SCOPE = null
SCOPE_ADVANCE_DECISION = "ADVANCE"  # initial — pick first scope
PASSES = 0
PASSES_ACCEPTED = 0
PASSES_REJECTED = 0

WHILE true:
  # Stop check
  Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-stop-conditions.mjs <start-iso> <wall-clock> <backlog-empty>`.
  IF exit code != 0: BREAK with stop reason from stdout.

  # Pick scope
  Dispatch planner with current state. Parse output.
  IF status == BACKLOG_EMPTY: BREAK with stop reason "backlog_empty".
  IF status == BLOCKED: log error and BREAK.
  CURRENT_SCOPE = output.selected_scope.

  # Execute one pass
  PASSES += 1
  Invoke `auto-improve:executing-a-pass` with PASS_NUMBER = PASSES, SCOPE = CURRENT_SCOPE, etc.
  Parse result.

  IF verdict == ACCEPT:
    PASSES_ACCEPTED += 1
    SCOPE_SCORES[CURRENT_SCOPE.slug].append(scope_score)
  ELSE IF verdict == REJECT:
    PASSES_REJECTED += 1
    # Score history unchanged.
  ELSE IF verdict == PASS_ABORTED:
    # Skip scoring; treat as a no-op pass for advance check.

  # Scope-advance check
  scores_csv = SCOPE_SCORES[CURRENT_SCOPE.slug].join(",") (or "")
  Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/scope-advance-check.mjs <threshold> <window> <scores_csv>`.
  IF stdout starts with "ADVANCE":
    SCOPES_COMPLETED.append(CURRENT_SCOPE.slug)
    SCOPE_ADVANCE_DECISION = "ADVANCE"
  ELSE:
    SCOPE_ADVANCE_DECISION = "STAY"
END WHILE
~~~

## Step 3: Finalize

Build the run summary JSON:

~~~json
{
  "passes_total": <PASSES>,
  "passes_accepted": <PASSES_ACCEPTED>,
  "passes_rejected": <PASSES_REJECTED>,
  "scopes_touched": [<unique scope slugs touched>],
  "score_deltas": {<slug>: <last_score - first_score> for each scope}
}
~~~

Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/finalize-run.mjs <RUN_ID> <stop-reason> <summary.json>`.

## Step 4: Hand off to the user

Tell the user:
- Trunk branch is `auto-improve/<RUN_ID>/trunk`, sitting N merges ahead of main.
- Run log is at `docs/runs/<RUN_ID>/log.md`.
- Rejected proposals at `docs/runs/<RUN_ID>/rejected_proposals/`.
- They can `git merge --ff-only`, squash-merge, cherry-pick, or discard.

## Forbidden

- Do not start work on `main`. Always go through setup-run.sh.
- Do not skip pre-flight cost confirmation.
- Do not invoke `executing-a-pass` while another pass is in flight.
- Do not write to docs/runs/ except via append-log and finalize-run scripts.
- Do not check stop conditions mid-pass — only between passes.
