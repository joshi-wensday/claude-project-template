---
name: ui-surface-design
description: |
  Use this skill to design a specific visual surface (a page or screen) — landing, pricing, dashboard, settings, onboarding, checkout, etc. Generates 2–3 distinct variations using the existing design system, runs critic passes, and writes a selected surface spec.

  TRIGGER on: "design the pricing page", "design the landing surface", "design the dashboard home", "design this screen", "I need variations of <surface>", phrases naming a specific UI surface to produce variations for.

  IMPORTANT — this skill does NOT call writing-plans. It produces surface specs and returns control.

  PREREQUISITE — docs/design/02-system/design-system.json should exist (from design-foundation). If it doesn't, this skill operates in "one-off mode" (variations are self-contained; surface spec flagged system-unbound: true). The orchestrator should have already offered the user the choice to run design-foundation first (per CLAUDE.md gate).
---

# UI Surface Design

Design a specific visual surface with 2–3 variations from distinct strategic angles.

**Announce at start:** "Using the ui-surface-design skill for <surface-name>. Generating 2–3 variations."

## When this skill runs

- After brainstorming has produced a spec with `Design depth: full` and identified a visual surface to design
- When a user names a specific surface and wants variations ("design the pricing page")

## Inputs

- `surfaceName` — kebab-case (e.g., `pricing`, `landing`, `dashboard-home`)
- `surfaceIntent` (Level 2) — surfaceType, primaryAction, successMetric, emotionalMoment. Read from the spec if present; else interview.
- `docs/design/02-system/design-system.json` — the active design system (if missing, one-off mode)

## Flow

Follow `references/surface-flow.md` end-to-end. High-level stages:

1. **Intent confirmation.** Read surface intent from spec if available; otherwise interview the user.
2. **Persona stack selection.** Look up in `references/persona-stack.yaml` based on `surfaceType`. Use fallback stack if no match.
3. **Variation generation.** Spawn 2–3 Sonnet subagents in parallel. Each gets:
   - The persona stack for this surface type
   - The design system (or none, if one-off mode)
   - A distinct strategic angle (e.g., for pricing: "comparison table," "guided choice," "outcome-led")
   - Explicit instruction to use only tokens/components from the system and flag gaps
4. **Gap handling.** If any variation flagged a component gap, pause and route to `design-component-creation`. On return, re-validate the variation against the updated system.
5. **Critic passes:**
   - `design-critic` — cohesion across variations and with existing surfaces
   - `accessibility-specialist` — contrast, focus, semantic structure
6. **User selection.** Present variations side-by-side. User picks, hybridizes, rejects, or requests refinement.
7. **Write artifacts.**
   - `docs/design/03-surfaces/<name>/intent.json`
   - `docs/design/03-surfaces/<name>/variations/variation-{a..c}.md`
   - `docs/design/03-surfaces/<name>/selected.md` (with `systemUnbound: true/false` and conforming to `surface-spec.schema.json`)

## Model policy

- Orchestrator: Opus (inherits)
- Variation subagents: **Sonnet**
- Critic (design-critic, accessibility-specialist): **Sonnet** for judgment; **Haiku** for mechanical schema-compliance passes

## Invariants

- **Token discipline.** Surface spec references tokens only; no raw hex/px. Validator check before writing.
- **No ad-hoc components.** If the design system lacks a needed component, flag and route; do not invent.
- **User selects.** Never auto-pick.
- **No-foundation mode is flagged.** If `design-system.json` is missing, `systemUnbound: true` in the written spec, and a note is added asking the user to run `design-foundation` soon.

## Knowledge references

See `references/persona-stack.yaml` for which personas and knowledge files are loaded per surface type.

## Completion

- Commit artifacts
- Report summary to orchestrator (surface spec path, selected variation, flagged components if any)
- **Do not invoke writing-plans.** Return control.
