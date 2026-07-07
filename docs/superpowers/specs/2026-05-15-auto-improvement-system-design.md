# Auto-Improvement System — Design Spec

**Date:** 2026-05-15
**Status:** Draft, pending user review
**Author:** Brainstormed with Claude

## Goal

An autonomous, skill-driven loop that iteratively improves an existing website against a user-defined design system and brand brief. The loop runs unsupervised for hours (typical: overnight, ~10h), produces auto-merged "passes" of polish, stops gracefully on a wall-clock budget or a `STOP` file, and leaves behind a fully-traceable run log plus per-pass git history that can be reviewed, cherry-picked, or reverted in the morning.

The system improves what already exists. It does not design from scratch, decide on features, or evaluate market fit. The user ships it a working site; it polishes that site against an authored design contract.

## Non-Goals

- Designing a site from scratch.
- Deciding on product features or business direction.
- Cross-run learning (critics getting smarter from prior nights' rejected proposals beyond the current run).
- Critic peer-review (the synthesizer plays that role; critics stay independent).
- Parallel build/polish lanes ("D-mode" in brainstorming) — serial, scope-by-scope only in v1.
- Score calibration / anchoring against fixed baselines — deferred to a later version.

## Architectural Shape

The system is a **chain of Claude Code skills**, mirroring the structure of the superpowers package. There is no standalone CLI, no separate process, no external orchestrator. The user's parent Claude session, driven by a top-level skill, *is* the orchestrator. Subagents are dispatched via the `Agent` tool. Skills compose via natural skill-to-skill handoff, the same pattern superpowers uses for `brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch`.

### Why skills, not a CLI

- Mirrors the superpowers pattern the user already trusts and understands.
- The parent session has full context, full tool access, and can dispatch fresh subagents for each role.
- No language/runtime choice required — the "code" is markdown prompt files plus a small amount of bash for git operations and gate scripts.
- Reusable across projects via plugin install, exactly like superpowers.
- The state machine lives in skill instructions, where it can be read, audited, and edited like any other skill.

## Skills in the Package

The package is named `auto-improve` and contains:

### User-invokable entry skill

- **`auto-improve:running-the-loop`** — the orchestrator. Activates on phrases like "run the auto-improve loop," "start an overnight polish run," "auto-improve this site for the next N hours." This skill owns the outer loop, the state machine, stop-condition checks, branch management, and dispatch of all sub-skills and subagents.

### Sub-skills (dispatched by the entry skill, not directly user-invokable)

- **`auto-improve:setting-up-a-run`** — runs once at run-start. Validates pre-conditions (BRAND.md exists, handoff bundle exists, backlog is non-empty, working tree is clean), computes the run-id, cuts the trunk branch, creates `docs/runs/<run-id>/`, and dispatches the design-contract writer.
- **`auto-improve:writing-design-contract`** — one-shot subagent. Reads `handoff-bundle/` and `BRAND.md` and produces `DESIGN_CONTRACT.md` summarizing the authority every critic and implementer will reference for the rest of the run. Committed to trunk as the run's first commit.
- **`auto-improve:executing-a-pass`** — runs once per iteration of the outer loop. Encodes the per-pass state machine: scope selection, proposal, implementation, gates, critic council, synthesis, merge-or-reject, log entry, scope-advance check.

### Prompt files (used by the skills, not skills themselves)

These live alongside skill files and are referenced by name from the skills that dispatch them:

- `prompts/planner.md` — picks the next scope from the backlog.
- `prompts/proposer.md` — drafts one concrete improvement proposal for the current scope.
- `prompts/implementer.md` — implements the proposal on a fresh pass branch with TDD.
- `prompts/critics/design-system.md` — design-system fidelity critic.
- `prompts/critics/ux.md` — UX/structural critic.
- `prompts/critics/brand.md` — brand voice / copy critic.
- `prompts/critics/a11y-perf.md` — accessibility & performance critic.
- `prompts/synthesizer.md` — consumes all four critic reports + gate output, issues verdict.

## Pre-Run Inputs

Three artifacts the user authors / provides, committed to the project repo at the project root:

- **`BRAND.md`** — user-authored brand brief: voice, tone, vibe, do/don't examples. The brand critic's primary reference.
- **`handoff-bundle/`** — directory exported from Claude Design containing tokens, components, and design-system metadata in whatever format Claude Design produces. Treated as opaque by the rest of the system; the design-contract writer is responsible for extracting a plain-text summary.
- **`auto-improve.config.yaml`** — run dials (see Configuration section). Gitignored.
- **`backlog.yaml`** — ordered list of scopes the loop should work through. Gitignored.

`docs/runs/`, `auto-improve.config.yaml`, `backlog.yaml`, and `STOP` are all gitignored. Run logs are per-run artifacts; they don't pollute the project's permanent git history. If a particular run's log is worth keeping, the user can `git add -f docs/runs/<run-id>/` after the fact.

## Configuration

`auto-improve.config.yaml`, read once at run-start and frozen for the run's duration:

```yaml
wall_clock_hours: 10
iteration_cap_per_pass: 5
scope_advance_threshold: 0.5    # min critic-score delta over `scope_advance_window` passes
scope_advance_window: 2
critic_accept_threshold: 8       # all 4 critics must hit average >= this
critic_veto_threshold: 4         # any single dimension below this triggers forced revision
min_iterations_before_reject: 1  # no first-attempt rejects; force at least one revision
parallel_critics: true
critics:
  - design-system
  - ux
  - brand
  - a11y-perf
gates:
  - typescript
  - lint
  - test
  - lighthouse
  - axe
```

(Phase 7 finding: a `visual-regression` gate was originally specified and implemented. Removed during Phase 7 dry-run because comparing pre-pass vs post-pass screenshots within a single pass is structurally at odds with the loop's purpose — every successful pass intentionally changes pixels on the routes it owns. Visual judgment is delegated to the design-system and UX critics, which already see before/after screenshots and can reason about *whether* the change is an improvement, not just *whether* pixels moved.)

## Backlog

`backlog.yaml`, an ordered list of scopes:

```yaml
scopes:
  - slug: hero
    purpose: "Above-the-fold landing experience"
    routes: ["/"]
    files: ["src/components/Hero/**"]
  - slug: pricing-page
    purpose: "Convert prospects to trial signups"
    routes: ["/pricing"]
    files: ["src/pages/pricing/**", "src/components/PricingCard/**"]
  - slug: global-copy
    purpose: "Voice/tone consistency across all pages"
    routes: ["*"]
    files: ["**/*.tsx"]
    cross_cutting: true
```

Each scope has:
- `slug` — kebab-case identifier, used in branch names and log entries.
- `purpose` — one-line statement of why this scope exists, given to the proposer and critics for context.
- `routes` — URL paths Playwright will screenshot for visual context.
- `files` — file globs treated as **advisory focus areas**, not hard walls. The implementer is told these are the relevant paths but may touch others if it has a clear reason. Off-scope drift is caught by critics + synthesizer, not by file restrictions.
- `cross_cutting` (optional) — flag for scopes that intentionally span the whole codebase (copy sweeps, motion-safety audits).

The planner pops scopes from the top of `backlog.yaml`. It may *append* sub-scopes it discovers (e.g., breaking out "plan cards" from "pricing page") but never reorders.

## Branch Strategy

Trunk-based. All work for a run lands on a dedicated trunk branch cut from `main` at run-start. Per-pass branches branch off the current tip of trunk, do their work, and merge back with `--no-ff` so each pass is a single revertible merge commit on trunk.

### Naming

- **Run trunk:** `auto-improve/<run-id>/trunk`
- **Run-id:** `YYYY-MM-DD-NN`, where `NN` is a zero-padded sequence number computed by listing existing branches at run-start and picking the next.
- **Pass branch:** `auto-improve/<run-id>/passes/<pass-number>-<scope-slug>-<proposal-slug>`
- **Rejected pass branch:** `auto-improve/<run-id>/rejected/<pass-number>-<scope-slug>-<proposal-slug>`

Examples:
- `auto-improve/2026-05-15-01/trunk` (trunk for the first run started 2026-05-15)
- `auto-improve/2026-05-15-01/passes/03-pricing-page-tighten-card-rhythm`
- `auto-improve/2026-05-15-01/rejected/07-hero-add-cta-hover-bloom`

**Why nested.** Git stores branches as files under `.git/refs/heads/`. A flat scheme like `auto-improve/<run-id>` (trunk) plus `auto-improve/<run-id>/<pass-slug>` (pass) would require `auto-improve/<run-id>` to be both a file (the trunk ref) and a directory (containing the pass refs) simultaneously — git rejects this with `cannot lock ref ... exists`. Nesting the trunk one level deeper as `auto-improve/<run-id>/trunk` makes the `<run-id>` segment uniformly a directory.

### Lifecycle

```
Run start
  ├─ Compute run-id
  ├─ git checkout main && git pull
  ├─ git checkout -b auto-improve/<run-id>/trunk
  ├─ Generate DESIGN_CONTRACT.md, commit to trunk
  └─ Begin pass loop

Each pass
  ├─ git checkout auto-improve/<run-id>/trunk
  ├─ git checkout -b auto-improve/<run-id>/passes/<pass-branch-name>
  ├─ [pass state machine runs]
  ├─ ACCEPTED:  git checkout <trunk> && git merge --no-ff <pass-branch>
  ├─ REJECTED:  git branch -m auto-improve/<run-id>/passes/<...> auto-improve/<run-id>/rejected/<...>
  ├─ Append entry to docs/runs/<run-id>/log.md
  └─ Continue

Run end
  ├─ Final summary appended to log
  ├─ Trunk branch left in place for user review
  └─ User decides: ff-merge to main, squash-merge, cherry-pick, or discard
```

### Why branches, not stacked commits

Each pass is a first-class node in git history with a stable identity:
- Reverts are one command (`git revert -m 1 <merge>`) regardless of how many internal iterations happened on the branch.
- Iteration-within-a-pass (implementer drafts → critic feedback → revision → critic feedback → final) is private to the pass branch; trunk only sees the accepted state as one merge.
- `git log --first-parent <trunk>` reads as the night's story, one line per pass.
- Rejected passes are preserved in a separate namespace for archaeology and to inform `rejected_proposals.yaml` (see below).

## Pass State Machine

```
SELECTING_SCOPE → PROPOSING → IMPLEMENTING → GATING → CRITIQUING
  → SYNTHESIZING → {ACCEPTED | REQUEST_CHANGES | REJECTED}
  → LOGGING → SCOPE_ADVANCE_CHECK → next pass or STOP
```

| State | What happens | Failure mode |
|---|---|---|
| `SELECTING_SCOPE` | Planner subagent reads `backlog.yaml`, returns top scope. May append discovered sub-scopes. | If backlog empty: stop. If planner BLOCKED: stop. |
| `PROPOSING` | Proposer subagent reads scope + `DESIGN_CONTRACT.md` + `BRAND.md` + current site state + `rejected_proposals/<scope>.yaml`. Drafts one concrete proposal. | NEEDS_CONTEXT: re-dispatch with more. BLOCKED: skip, try fresh proposal. |
| `IMPLEMENTING` | Implementer subagent on a fresh pass branch, follows TDD discipline (uses `superpowers:test-driven-development`), commits. | DONE / NEEDS_CONTEXT / BLOCKED per superpowers protocol. |
| `GATING` | Sequential automated gates: TS compile → lint → tests → Lighthouse → axe. Fail fast. | Any gate fails: REQUEST_CHANGES with gate output; back to IMPLEMENTING. Counts toward iteration cap. |
| `CRITIQUING` | Four critic subagents dispatched **in parallel**, fresh context each, narrow inputs each. Each returns a structured score report. | Individual critic failure: retry once. Persistent failure: synthesizer sees N-1 reports and is told one is missing. |
| `SYNTHESIZING` | Synthesizer subagent reads all 4 reports + gate output + scope's prior-accepted score. Issues verdict. | — |
| `ACCEPTED` | Merge pass branch into trunk with `--no-ff`. Generate PR-style summary block for the log. | — |
| `REQUEST_CHANGES` | Aggregate critic complaints into a change brief. Re-dispatch implementer on the same pass branch. Iteration counter +=1. | If iter == cap (5): forced REJECTED. |
| `REJECTED` | Rename pass branch into `rejected/` namespace. Append to `rejected_proposals/<scope>.yaml`. | Only allowed after `min_iterations_before_reject` has been met. |
| `LOGGING` | Append pass entry to `docs/runs/<run-id>/log.md`. Idempotent. Must succeed; retry until it does. | — |
| `SCOPE_ADVANCE_CHECK` | If scope's most-recent-accepted-score has improved by less than `scope_advance_threshold` over `scope_advance_window` passes, mark scope done. Pop next from backlog. Otherwise stay on scope. | — |

### Iteration cap (5)

Combined across gate retries and critic revision rounds. After 5 failed iterations, the pass becomes REJECTED. Prevents pathological "critics keep finding 0.1-point complaints, implementer keeps trying" loops.

### `min_iterations_before_reject` (1)

A pass cannot be rejected on its first attempt even if a critic returns a hard veto. The first rejection-eligible attempt becomes a forced REQUEST_CHANGES with the veto's specific issues sent to the implementer. This was specifically chosen for higher polish — the loop earns the right to reject only after the implementer has had a chance to address concrete feedback.

### Scope advance (0.5 over 2 passes)

A scope's "score" is the average of the four critics' overall scores from the most recent ACCEPTED pass on that scope. Rejected passes don't count. If the scope's score hasn't risen by ≥ 0.5 across the last 2 accepted passes on that scope, it is marked done and the next scope is popped. This is the only mechanism that advances the loop through the backlog.

## Critic Council

Four critics, each as a standalone prompt file under `prompts/critics/`. Each runs as a fresh subagent per invocation, in parallel with the others.

### Independence enforcement

The single most load-bearing decision in this design. If critics converge, the council is theater. Concretely:

- **Narrow inputs per critic.** Each critic sees only what its mandate requires. The design-system critic does not see `BRAND.md`. The brand critic does not see tokens. The UX critic does not see Lighthouse output. This forces orthogonal viewpoints.
- **Fresh subagent each.** No conversation history. No accumulated preferences across passes.
- **Parallel dispatch.** All four critics dispatched in a single tool-use turn. They cannot read each other's outputs because the outputs don't exist yet.
- **No peer-review.** Critics never see other critics' reports. The synthesizer is the only agent that sees everything, and it doesn't talk back to the critics.
- **No example-leaking.** Critic prompts contain no examples drawn from prior passes; only their narrow input list and their mandate.

### The four critics

#### `design-system-critic`
- **Inputs:** the diff, before/after screenshots, `DESIGN_CONTRACT.md`, `handoff-bundle/tokens.json` (or equivalent token file extracted from the bundle).
- **Mandate:** token conformance, component-library usage, design-contract adherence.
- **Output:** scores on `token_conformance`, `component_usage`, `contract_adherence` (each 0-10) plus a list of specific violations with line refs.

#### `ux-critic`
- **Inputs:** the diff, before/after screenshots (desktop + mobile), interaction trace from Playwright if route is interactive, the scope's `purpose` statement.
- **Mandate:** layout, hierarchy, information density, interaction states, flow.
- **Output:** scores on `hierarchy`, `density`, `interaction`, `flow` plus prose.

#### `brand-critic`
- **Inputs:** the diff, before/after rendered text content, `BRAND.md`, current page's copy.
- **Mandate:** voice, tone, copy clarity, vibe alignment.
- **Output:** scores on `voice`, `clarity`, `vibe_match` plus flagged copy.

#### `a11y-perf-critic`
- **Inputs:** Lighthouse JSON, axe JSON, the diff, before/after screenshots.
- **Mandate:** confirm gates passed and find issues automated tools missed (focus order, ARIA semantics, motion sensitivity, contrast edge cases, layout shift on hover).
- **Output:** scores on `accessibility`, `performance`, `motion_safety` plus specific issues.

### Critic output schema

Every critic returns a YAML-or-JSON block with this shape:

```yaml
critic: design-system
overall_score: 8.5      # average of the dimensions
dimensions:
  token_conformance: 9
  component_usage: 8
  contract_adherence: 8.5
issues:
  - severity: minor      # or major | hard-veto
    location: "src/components/Hero/Headline.tsx:42"
    description: "Tracking value 0.12em not in token scale; closest tokens are 0.08em and 0.16em."
    suggestion: "Snap to 0.08em."
prose: |
  [2-4 sentences of qualitative read]
```

`hard-veto` severity on any issue triggers the synthesizer's veto rule.

## Synthesizer

A single subagent, fresh context, sees everything: all four critic reports, gate output, the proposal text, and the scope's prior accepted score (for delta calculation).

### Decision rules (deterministic)

1. **REJECT** if and only if:
   - Iteration count > `min_iterations_before_reject` (i.e., this is at least the second attempt), AND
   - At least one critic has issued a `hard-veto` severity issue, OR
   - Iteration count == `iteration_cap_per_pass` AND verdict still wouldn't be ACCEPT.
2. **ACCEPT** if and only if:
   - All four critics' `overall_score` ≥ `critic_accept_threshold` (8), AND
   - No critic has any single dimension below `critic_veto_threshold` (4), AND
   - All gates passed.
3. **REQUEST_CHANGES** in all other cases. The synthesizer aggregates critic complaints into a single change brief — deduplicated, prioritized by severity, framed as concrete edits — and that brief becomes the implementer's instruction for the next iteration.

### Synthesizer output

```yaml
verdict: ACCEPT | REQUEST_CHANGES | REJECT
rationale: |
  [2-3 sentences]
critic_summary:
  design-system: 8.5
  ux: 8.0
  brand: 9.0
  a11y-perf: 9.5
  average: 8.75
  delta_vs_prior_accepted: +0.55
change_brief: |    # only on REQUEST_CHANGES
  [aggregated, deduplicated edits]
```

## Rejected-Proposals Memory

`docs/runs/<run-id>/rejected_proposals/<scope-slug>.yaml`. Append-only.

```yaml
- pass: 7
  proposal: "Add a 200ms ease-out brightness shift on CTA hover."
  reason: "UX critic persistent veto on motion (4.5 → 5.0 → 5.5). a11y-perf flagged motion-sensitivity escalation."
  branch: auto-improve/2026-05-15-01/rejected/07-hero-add-cta-hover-bloom
```

The proposer reads this file before drafting. Its prompt forbids re-proposing semantically-similar ideas in the same run. Per-run, not global, because the site changes substantially across runs.

## Run Log

`docs/runs/<run-id>/log.md`. Appended after every pass. Never rewritten. Format:

```markdown
# Auto-improve run 2026-05-15-01

Started: 2026-05-15 22:14
Trunk: auto-improve/2026-05-15-01/trunk
Config: 10h wall clock, 5 iter cap, accept >=8

---

## Pass 01 — hero — sharpen-headline-rhythm
Started 22:18, ended 22:34 (16 min, 2 iterations)
Verdict: ACCEPTED
Branch: auto-improve/2026-05-15-01/passes/01-hero-sharpen-headline-rhythm
Merge: a7f3b2c

**Proposal:** [proposer's full proposal text]

**Critic scores:**
| Critic        | Score | Δ vs baseline |
|---------------|-------|---------------|
| design-system | 8.5   | +0.7          |
| ux            | 8.0   | +0.4          |
| brand         | 9.0   | +1.1          |
| a11y-perf     | 9.5   | +0.0          |
| **Avg**       | **8.75** | **+0.55**  |

**Synthesizer:** [verdict rationale]

**Iterations:**
1. Initial: brand critic flagged tracking widen as "too aggressive at 0.12em"
2. Revised: tracking reduced to 0.08em, all critics at threshold
```

A final summary block is appended when the run ends:

```markdown
---

## Run summary
Ended: 2026-05-16 06:14 (8h 0m elapsed)
Stop reason: wall_clock_hours
Passes: 14 (12 accepted, 2 rejected)
Scopes touched: hero, pricing-page, global-copy
Net critic-score deltas: hero +1.8, pricing +2.1, global-copy +0.9
```

## Stop Conditions

Checked **only at pass boundaries**, between `SCOPE_ADVANCE_CHECK` and the next pass's `SELECTING_SCOPE`. The current pass always finishes gracefully — writes its log entry, merges or rejects — before the loop exits.

1. **Wall-clock elapsed past `wall_clock_hours`.**
2. **`STOP` file present at repo root.** User's emergency brake. The user can `touch STOP` from any device that can SSH or access the repo.
3. **Backlog empty after scope-advance.** Natural exit when there's nothing left to work on.

No cost cap, no quality-ceiling exit, no thrashing detector for v1.

## Risks

- **Cost.** Four critics × ~5 iterations × ~20 passes ≈ 400 critic invocations per night, each reading the full diff plus screenshots. Real money. The `STOP` file is the user's mid-run safety valve.
- **Visual-regression flakiness.** Playwright visual diff is sensitive to antialiasing, font rendering, and dynamic content. Expect tuning the diff threshold across early runs.
- **Score inflation.** LLM critics on 0-10 scales drift toward 7-8 over time without anchors. Skipped for v1; revisit if it becomes apparent.
- **Brand critic strictness.** With `≥ 8 across all 4` as the accept rule, the brand critic (most subjective) is statistically the hardest to satisfy. Expect occasional copy-only oscillation. Tunable via config in v2 if it becomes annoying.
- **Off-scope drift.** Advisory file globs, not hard walls. Caught by critics + synthesizer, not prevented at the implementer level. If drift becomes a recurring problem, the v2 fix is a separate "scope-bounds critic" rather than tightening the implementer's tools.

## Open Questions for the Implementation Plan

These are real engineering decisions that belong in the plan, not the design:

1. **Plugin packaging.** Standalone plugin repo (`auto-improve`), or initially scaffolded as `.claude/skills/` inside this template repo and extracted later? Recommend the latter for v1 — fewer moving parts to test.
2. **Subagent dispatch mechanism.** The orchestrator skill dispatches subagents via the `Agent` tool from the parent session. Each role (planner, proposer, implementer, critics, synthesizer) gets its own prompt file and a documented dispatch pattern in the running-the-loop skill.
3. **Screenshot harness.** Playwright is the obvious choice. Needs a small `scripts/screenshot.sh` (or `.ts`) that boots the dev server, navigates to the route, captures desktop + mobile screenshots, tears down. Reused across passes.
4. **Gate scripts.** Each gate (`typescript`, `lint`, `test`, `lighthouse`, `axe`) is a small executable script under `scripts/gates/<name>.sh` that exits 0 on pass, non-zero on fail, and writes a JSON report to a known location for the a11y-perf critic to consume. Project-specific bits (the actual `tsc` command, the test runner) come from `auto-improve.config.yaml` overrides or just the project's `package.json` scripts.
5. **Critic dispatch model.** Whether to use the most capable model for critics, or differentiate (cheap model for design-system token check, capable model for brand judgment). Decide at plan time based on initial cost estimates.

## Phasing (Implementation Plan Will Refine)

- **Phase 0** — Skeleton: skill files scaffolded, config + backlog + brand schemas defined and validated, design-contract writer working end-to-end as a manual one-shot. Verifies the foundation without running any pass.
- **Phase 1** — Single pass with one critic (design-system) and cheap gates only (TS + lint + tests). Proves the per-pass state machine end-to-end. `auto-improve once` style invocation. No outer loop.
- **Phase 2** — Full critic council (all 4) and remaining gates (Lighthouse + axe + visual-reg). `rejected_proposals.yaml` wired up. Single pass quality at full bar.
- **Phase 3** — Outer loop: stop conditions, scope-advance, true overnight runs.
- **Phase 4** — Polish & operability: pre-flight `auto-improve check`, log scan summaries, automatic cleanup of `rejected/` branches after 14 days.

## Out of Scope for v1

- D-mode (parallel build + polish lanes).
- Score calibration / anchored scoring.
- Critic peer-review.
- Cross-run learning.
- Auto-tuning of config dials based on outcomes.

These are explicitly deferred. None of them block v1; all of them are easier to add once v1 has shipped one real overnight run.
