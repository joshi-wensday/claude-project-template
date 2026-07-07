---
name: executing-a-pass
description: Use to execute one auto-improve pass: select scope, propose, implement, run gates, run critic council, synthesize verdict, accept-or-reject, log. Invoked by the running-the-loop skill once per iteration of the outer loop.
---

# Executing One Auto-Improve Pass

This skill encodes the per-pass state machine described in the design spec. It is invoked once per iteration of the outer loop. It does NOT manage stop conditions or scope-advance — those are the outer loop's job.

## Inputs (from caller)

- `RUN_ID`
- `PASS_NUMBER` (1-indexed)
- `CONFIG` (parsed config object)
- `BACKLOG` (parsed backlog object)
- `SCOPE` (the scope object selected by the planner)
- `RUN_DIR`: `docs/runs/<RUN_ID>`

## State machine

States execute in this order. A state's failure mode determines the next state.

### State 1: PROPOSING

Dispatch the proposer subagent with `${CLAUDE_PLUGIN_ROOT}/prompts/proposer.md`. Build inputs:
- `SCOPE`
- `DESIGN_CONTRACT.md` contents
- `BRAND.md` contents
- Files in scope (read each path in `SCOPE.files`)
- Current screenshots (run `${CLAUDE_PLUGIN_ROOT}/scripts/screenshot.mjs` and pass paths)
- `REJECTED_PROPOSALS`: contents of `<RUN_DIR>/rejected_proposals/<scope-slug>.yaml` (or empty list)
- Prior accepted-pass summaries from the run log

Parse the proposer's YAML output.
- If `status: BLOCKED` or `NEEDS_CONTEXT`: try once more with adjusted inputs; if still BLOCKED, abort the pass and return `PASS_ABORTED`.

### State 2: IMPLEMENTING

1. Compute `BRANCH_NAME = auto-improve/<RUN_ID>/passes/<NN>-<scope-slug>-<proposal-slug>`.
2. Run `${CLAUDE_PLUGIN_ROOT}/scripts/start-pass.sh <RUN_ID> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture branch name.
3. Dispatch implementer subagent with `${CLAUDE_PLUGIN_ROOT}/prompts/implementer.md`. Inputs:
   - `RUN_ID`, `PASS_NUMBER`, `SCOPE`, `PROPOSAL_SLUG`, `PROPOSAL_TEXT`
   - `TARGET_FILES`
   - `BRANCH_NAME`
   - `DESIGN_CONTRACT.md`, `BRAND.md`
   - On revision iterations: `CHANGE_BRIEF` and `PRIOR_DIFF`
4. Parse implementer output.
   - DONE: continue.
   - DONE_WITH_CONCERNS: log concerns, continue.
   - NEEDS_CONTEXT: provide additional context, re-dispatch.
   - BLOCKED: REJECT the pass.

### State 3: GATING

Run gate scripts in this order, fail fast:
1. `${CLAUDE_PLUGIN_ROOT}/scripts/gates/typescript.sh /tmp/<RUN_ID>-<PASS_NUMBER>-ts.json`
2. `${CLAUDE_PLUGIN_ROOT}/scripts/gates/lint.sh /tmp/<RUN_ID>-<PASS_NUMBER>-lint.json`
3. `${CLAUDE_PLUGIN_ROOT}/scripts/gates/test.sh /tmp/<RUN_ID>-<PASS_NUMBER>-test.json`
4. `node ${CLAUDE_PLUGIN_ROOT}/scripts/gates/lighthouse.mjs /tmp/<RUN_ID>-<PASS_NUMBER>-lh.json`
5. `node ${CLAUDE_PLUGIN_ROOT}/scripts/gates/axe.mjs /tmp/<RUN_ID>-<PASS_NUMBER>-axe.json`

If any gate fails: build a `change_brief` from the failure JSON, increment iteration count, return to IMPLEMENTING. If iteration count reaches `iteration_cap_per_pass`, REJECT.

### State 4: CRITIQUING

Take fresh after-screenshots. Then dispatch all four critics **in parallel** in a single tool-use turn. Each critic is a fresh subagent with narrow inputs:

- design-system: DIFF, BEFORE/AFTER screenshots, DESIGN_CONTRACT, tokens.json
- ux: DIFF, BEFORE/AFTER screenshots, SCOPE.purpose, PROPOSAL_TEXT
- brand: DIFF, BEFORE/AFTER rendered text, BRAND.md, PROPOSAL_TEXT
- a11y-perf: DIFF, Lighthouse JSON, axe JSON, BEFORE/AFTER screenshots

Critic prompt files live at `${CLAUDE_PLUGIN_ROOT}/prompts/critics/<name>.md`.

Parse all four critic YAML reports. If any critic crashes, retry that one once. If still failing, proceed to SYNTHESIZING with that critic's report marked "missing".

### State 5: SYNTHESIZING

Dispatch the synthesizer with `${CLAUDE_PLUGIN_ROOT}/prompts/synthesizer.md`. Inputs: 4 critic reports, gate JSONs, proposal text, prior accepted score, iteration number, config thresholds.

Parse the synthesizer's verdict.

### State 6: APPLY VERDICT

Branch on verdict:

**ACCEPT:**
1. Run `${CLAUDE_PLUGIN_ROOT}/scripts/accept-pass.sh <RUN_ID> <BRANCH_NAME> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture merge SHA.
2. Build the log entry JSON (see `${CLAUDE_PLUGIN_ROOT}/prompts/synthesizer.md` and append-log script).
3. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/append-log.mjs <RUN_ID> <entry.json>`.
4. Return `verdict: ACCEPT, scope_score: <avg>` to the outer loop.

**REQUEST_CHANGES:**
1. Increment iteration count.
2. If iteration count > iteration_cap_per_pass, treat as REJECT.
3. Otherwise: feed `change_brief` and `PRIOR_DIFF` back to State 2 (IMPLEMENTING).

**REJECT:**
1. Run `${CLAUDE_PLUGIN_ROOT}/scripts/reject-pass.sh <RUN_ID> <BRANCH_NAME> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture new (rejected) branch name.
2. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/append-rejected.mjs <RUN_ID> <scope-slug> <PASS_NUMBER> <new-branch> <proposal-text> <reason>`.
3. Build log entry JSON with verdict REJECTED.
4. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/append-log.mjs <RUN_ID> <entry.json>`.
5. Return `verdict: REJECT` to the outer loop.

## Output to caller

~~~yaml
verdict: ACCEPT | REJECT | PASS_ABORTED
scope_score: <avg of 4 critics>     # only on ACCEPT
iterations_used: <n>
~~~

## Forbidden

- Never skip a state.
- Never run critics serially when parallel is configured.
- Never accept a pass with a hard-veto critic issue.
- Never advance to the next pass while this pass's branch is still active (not merged or renamed).
- Never write to docs/runs/ except via the append-log and append-rejected scripts.
