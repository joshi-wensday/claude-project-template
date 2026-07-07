# Auto-Improvement System — Session Handoff

**Date:** 2026-05-15
**Purpose:** Carry context from the original brainstorm session into a future Claude session (likely on a different laptop / account) so it can continue the work without losing reasoning.

**TL;DR for a future Claude session:** Read this file, then the design spec, then the plan. After that, you have everything you need to start executing.

## Where to read, in order

1. **This file** — context that didn't make the spec.
2. **`docs/superpowers/specs/2026-05-15-auto-improvement-system-design.md`** — the design spec. Approved by the user.
3. **`docs/superpowers/plans/2026-05-15-auto-improvement-system.md`** — the implementation plan. 41 tasks, fully concrete, ready to execute via `superpowers:subagent-driven-development`.

## Decisions made by the user, with reasoning

These are not in the spec because the spec records *what was decided*, not *why* — but the why matters when execution surfaces edge cases.

### Goal shape: D-mode (scoped build then keep polishing)
The user picked option D from the four goal shapes (scoped delivery, open-ended improvement, exploratory search, mix). For v1 we descope the "build" half and only ship the "keep polishing" half. The build half can be added later by feeding the loop a backlog of new-feature scopes instead of polish scopes; the architecture supports it without changes.

### Critic strategy: hybrid C/D — automated gates plus a council of critics
Token cost is explicitly not a constraint. User wants a real critic for things automated tools can't judge. We use both: gates run first (fail fast on TS/lint/test/Lighthouse/axe/visual-reg), critics run second (judge what's left).

### Design system source: BRAND.md plus Claude Design handoff bundle
User will author BRAND.md by hand; the handoff bundle comes from Claude Design (https://www.anthropic.com/news/claude-design-anthropic-labs). The bundle's exact format is undocumented publicly, so the design-contract writer skill is responsible for inspecting whatever's in the bundle and producing a plain-text DESIGN_CONTRACT.md that critics reference.

### Concurrency model: C — scoped polish passes
Not single-threaded random walk (A) and not parallel improvements (B). The loop picks one scope, does N improvements within that scope, advances when score plateaus, repeats. Reasoning: A produces incoherent random changelogs; B requires a merge coordinator we don't want to build for v1.

### Improvement decision source: i — planner with backlog
Not critic-driven (ii) or hybrid (iii). Reasoning: predictability beats optimality for v1. The user wants to know roughly what'll happen overnight by glancing at the backlog before bed. Graduate to (iii) only after 3-5 successful runs.

### Stop conditions: wall-clock + STOP file, with graceful pass-boundary checks
No cost cap, no quality-ceiling exit, no thrashing detector for v1. The user explicitly wanted the loop to keep going. We added the scope-advance rule (≥0.5 score lift over 2 passes) as a *progression* mechanism, not a stop — without it the loop never moves through the backlog.

### Synthesizer threshold: ≥8 average across all 4 critics, no first-attempt rejects
User explicitly wanted higher polish. The "no first-attempt rejects" rule means a critic can hard-veto, but the implementer gets at least one revision attempt before the pass is killed. Combined with iteration cap of 5, this gives genuinely flawed proposals room to be fixed.

### Observability: PR-as-record, fully autonomous
The user briefly worried that "merge a PR" implied human-in-the-loop. We clarified: each pass is auto-merged with `--no-ff`, but the *artifact* (a branch + merge commit + log entry) is preserved as a reviewable unit. Zero human-in-loop during the run.

### Branch model: trunk-based, with `auto-improve/<run-id>` as the run trunk
Not direct-to-main. The run trunk is cut from main at run-start; passes branch off the trunk and merge back into the trunk; main is never touched until the user decides what to do with the trunk in the morning.

### Run-id naming: `auto-improve/<YYYY-MM-DD-NN>`
NN is a zero-padded sequence so the user can run multiple loops in a day without conflict. User specifically asked for "auto-improve" instead of "nightly" because the loop might run during the day too.

### Branches > stacked commits
The user pushed back on this. The honest answer was the one in §"Branch Strategy" of the spec: branches give passes first-class identity in git, which makes reverts and per-pass review trivially clean. Stacked commits would force the user to manually identify "which commits belong to pass 7" every time they wanted to revert or read.

### Skill-package architecture (not a CLI)
The user's late-stage suggestion. This is the right call: the orchestrator has no need to be an external process — the parent Claude session is the orchestrator. Skill files compose via the same handoff pattern superpowers uses. Sub-skills get dispatched via the Skill tool; subagents get dispatched via the Agent tool with prompt-file references.

### Sample site, not the real project, for development
We chose Option 3 of the porting question: develop against `examples/sample-site/` (a minimal Next.js + Tailwind site we scaffold), then port to the user's real Next.js project on the other laptop as Phase 8 (out-of-plan; checklist documented in PORTING.md). Reasoning: real-project runs are expensive and risky for early iterations of the loop. Toy is a debugging environment, not a substitute.

## Things that were *considered and explicitly deferred*

- **D-mode parallel build/polish lanes.** Explicitly deferred from v1.
- **Score calibration / anchored scoring.** Skipped for v1 per user. Watch for inflation in early runs and revisit.
- **Critic peer-review.** Explicitly avoided. Synthesizer plays that role.
- **Cross-run learning.** rejected_proposals.yaml is per-run, not global.
- **Auto-tuning of config dials.** The dials are static; tune by hand between runs.
- **Thrashing detector.** No automatic detection of "this pass keeps oscillating." If it becomes a problem, add as v2.

## Patterns deliberately stolen from superpowers

For a future Claude session designing similar systems: this is the architecture-level reuse worth being explicit about.

1. **Pipelined skills with hard gates.** Same chain shape as superpowers' brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch. Each stage produces an artifact the next stage validates.
2. **Fresh subagent per task with curated context.** Critics in particular *must* be fresh — they're the part that fails first if context pollutes.
3. **Structured status protocol.** Superpowers uses DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED. We extended this with critic-specific verdict codes (ACCEPT / REQUEST_CHANGES / REJECT) and pass-level results (ACCEPTED / REJECTED / PASS_ABORTED).
4. **Two-stage review.** Superpowers does spec-compliance + code-quality. We do automated-gates + critic-council. Both must pass.
5. **The user's own `llm-council` skill** (in `.claude/skills/llm-council/`) is the conceptual ancestor of the critic council. Worth re-reading if implementing the critic dispatch logic.

## Risks the user has been informed about

- **Cost.** ~400 critic invocations per night, each reading a full diff plus screenshots. Several hundred dollars per overnight run depending on model. The STOP file is the user's mid-run safety valve.
- **Visual-regression flakiness.** Playwright pixel diff is sensitive to font antialiasing. Expect tuning.
- **Score inflation.** LLM 0-10 scores drift toward 7-8. Skipped calibration for v1; watch for it.
- **Brand-critic strictness.** With `≥8 across all 4`, the brand critic (most subjective) is statistically the hardest to satisfy. Expect occasional copy-only oscillation.

## Workflow recovery on a fresh laptop / account

```bash
git clone <this repo>
cd <repo>
claude
```

Then in the new Claude session, paste this:

> "Read docs/superpowers/specs/2026-05-15-auto-improvement-system-handoff.md, then the design spec next to it, then the plan at docs/superpowers/plans/2026-05-15-auto-improvement-system.md. Then start executing the plan using superpowers:subagent-driven-development."

The new session will pick up with full context.

## What still needs the user's input

Nothing blocking. The plan is concrete enough to execute end-to-end against the sample site without further user decisions, except for:

1. **Live confirmation at the end of Phase 7 (Tasks 39-40).** These are interactive — the user has to actually invoke `auto-improve:running-the-loop` and watch it run. Cannot be automated.
2. **The Phase 8 porting work** (Task 41 produces the checklist; the actual porting happens on the user's Next.js project, manually).
3. **Anthropic API key / Claude Code session.** The skill dispatches subagents via the Agent tool, which requires an active Claude Code session.
