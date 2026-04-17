# Project: [PROJECT_NAME]

## Tech Stack
- Language: [LANGUAGE]
- Framework: [FRAMEWORK]
- Database: [DATABASE]
- Package Manager: [PACKAGE_MANAGER]

## Essential Commands
- Build: `[BUILD_COMMAND]`
- Test: `[TEST_COMMAND]`
- Lint: `[LINT_COMMAND]`
- Dev Server: `[DEV_COMMAND]`

## Project Structure
- Source code: `[SOURCE_DIR]`
- Tests: `[TEST_DIR]`
- Config files: `[CONFIG_DIR]`

## Code Style
- [STYLE_GUIDE_OR_CONVENTIONS]

## Key Architecture Decisions
- [ARCHITECTURE_NOTES]

## Task Management
- Design specs live in `docs/superpowers/specs/`
- Implementation plans live in `docs/superpowers/plans/`
- Research documents live in `docs/research/`
- Delete task files after features are merged to keep the folder clean

## Skills System

If you think there is even a 1% chance a skill might apply to what you are doing, you MUST invoke the skill. This is not optional.

**Skill priority:** Process skills first (brainstorming, systematic-debugging), then implementation skills.

**Before responding to any user message, check if a skill applies:**
- "Build X" / "Create X" / "Add X" → brainstorming first
- "Fix this bug" / "This is broken" → systematic-debugging first
- "Research X" / "Look up X" → research skill
- "Implement the plan" → subagent-driven-development or executing-plans
- About to claim "done" → verification-before-completion

**The workflow chain auto-invokes:** brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch. You only need to trigger the first skill; the rest chain automatically.

## Model Policy

Use the right model for the right job to balance quality and cost.

| Role | Model | Rationale |
|------|-------|-----------|
| Main conversation (brainstorm, plan, architect, coordinate) | Opus | Design judgment, architecture decisions |
| Implementation subagents | Sonnet | Reliable code generation |
| Spec compliance review subagents | Haiku | Mechanical checklist — fast and cheap |
| Code quality review subagents | Sonnet | Needs judgment to catch subtle issues |

When dispatching subagents via the Agent tool, always set the `model` parameter explicitly.

## Design Workflow

UI-heavy projects use the UI/UX design workflow — gated, opt-in, composes with the normal skill chain.

**Artifacts:** project design outputs live in `docs/design/` (00-foundation, 01-direction, 02-system, 03-surfaces, 04-flows, 05-handoff). Shared knowledge lives in `.claude/knowledge/design/` (personas, domains, aesthetic-references, schemas, intent-taxonomy, quality-bars).

**Design-depth gate.** When `brainstorming` produces a spec describing visual surfaces or user flows, before invoking `writing-plans` ask the user: `full`, `function-first`, or `deferred`. Record the choice in the spec's `## Design depth` field (missing field is a spec-review failure).

- `full` — if `docs/design/02-system/design-system.json` is missing, offer `design-foundation` first. Then invoke surface/flow design skills as needed. Only after those complete, invoke `writing-plans`.
- `function-first` — invoke `writing-plans` directly; implementation uses a bare-minimum accessibility/structure baseline. Append a follow-up "design pass" task.
- `deferred` — invoke `writing-plans` with a blocking "design TBD" marker task gating any visible UI work.

**Model policy for design subagents.** Aesthetic-direction subagents and surface-variation subagents = **Sonnet**. Design critics and accessibility critics (judgment) = **Sonnet**. Schema-compliance checks (mechanical) = **Haiku**.

**Design skills:**
- `design-foundation` — establish project-wide foundation (intent + brand + aesthetic direction + design system v1)
- `ui-surface-design` — design a specific visual surface with 2–3 variations
- `design-component-creation` — fill a component gap in the design system (the only skill allowed to modify `design-system.json`)

Design skills do NOT invoke `writing-plans`; they return control to the orchestrator.

## Skills Available
- **research** — deep-research a topic and save findings to `docs/research/`
- **skill-creator** — create, test, and iteratively improve skills with quantitative evaluation
- **brainstorming** — turn ideas into designs through collaborative dialogue before any implementation
- **writing-plans** — create detailed implementation plans from approved specs
- **test-driven-development** — RED-GREEN-REFACTOR cycle for all features and bugfixes
- **subagent-driven-development** — execute plans via fresh subagent per task with two-stage review
- **executing-plans** — alternative: execute plans inline with checkpoints
- **using-git-worktrees** — create isolated workspaces for feature development
- **finishing-a-development-branch** — merge, PR, keep, or discard completed work
- **systematic-debugging** — 4-phase root cause investigation before any fix
- **verification-before-completion** — no completion claims without fresh evidence
- **requesting-code-review** — dispatch code-reviewer subagent
- **receiving-code-review** — respond to review feedback with technical rigor
- **dispatching-parallel-agents** — delegate independent tasks to concurrent agents
- **writing-skills** — create new skills using TDD applied to documentation
- **design-foundation** — establish project-wide design foundation (intent, brand, aesthetic direction, design system v1)
- **ui-surface-design** — design specific visual surfaces with 2–3 variations using the design system
- **design-component-creation** — fill component gaps in the design system (sole mutator of design-system.json)
- **using-superpowers** — how to find and use skills (bootstrap)
