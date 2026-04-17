---
name: design-foundation
description: |
  Use this skill at the start of a UI-heavy project (or mid-project when the UI needs a foundation) to establish project-wide design intent, brand voice, aesthetic direction, and a versioned design system v1. Produces artifacts in docs/design/00-foundation/, 01-direction/, 02-system/.

  TRIGGER on: "set up the design system", "establish design foundation", "start the UI design", "we need a design system", "run Phase 1 design", "pick an aesthetic direction", "start design work".

  SKIP if: docs/design/02-system/design-system.json already exists and the user hasn't asked to redo it. Recommend ui-surface-design or design-component-creation instead.

  IMPORTANT — this skill does NOT call writing-plans. It produces design artifacts and returns control to the orchestrator.
---

# Design Foundation

Establish project-wide design foundation: intent, brand, aesthetic direction, design system v1.

**Announce at start:** "Using the design-foundation skill. This will produce docs/design/00-foundation/, 01-direction/, and 02-system/."

## When this skill runs

- At the start of a UI-heavy project (after or before initial brainstorming — the gate in CLAUDE.md decides)
- Mid-project when no foundation exists and the user wants to establish one before further UI work
- In v0.1, **greenfield mode only**. Retrofit (reverse-engineering from existing UI) is v0.3.

## Flow (greenfield)

Follow `references/greenfield-flow.md` end-to-end. High-level stages:

1. **Intent capture.** Fill out Level 1 intent via structured questions. Write `docs/design/00-foundation/intent.json` (schema: `.claude/knowledge/design/schemas/intent.schema.json`).
2. **Brand import.** Interview for brand attributes, voice, tone, do-say/don't-say, anti-references, strictness. Write `brand-foundation.md` + `.json` (schema: `brand-foundation.schema.json`).
3. **Aesthetic direction divergence.** Spawn 3–6 parallel Sonnet subagents, each with the `art-director` persona and a *different* aesthetic stake. Each produces a style-tile file in `01-direction/explorations/`. Run a design-critic convergence check; re-spawn if directions collapsed to the same three adjectives.
4. **User selection.** Present variations. User picks / hybridizes / rejects. Iterate. Write `selected-direction.md`.
5. **Design system v1 synthesis.** Using the chosen direction, produce `design-system.json` v1.0.0 with primitive tokens (color, type, space, radius, shadow, motion), semantic tokens, and base components (button, input, card, link, heading). Write `design-system.json`, `design-system.md`, `changelog.md` (all in `02-system/`).

## Required personas

See `references/persona-stack.yaml`. Default: `art-director`, `visual-designer`, `design-systems-architect`, `design-critic`, `ux-writer`, `accessibility-specialist`.

## Model policy

- Orchestrator (main session running this skill): Opus (inherits from parent)
- Aesthetic-direction subagents (stage 3): **Sonnet**, `model: sonnet` in each Agent call
- Design-critic convergence check: **Sonnet**
- Spec-compliance checks against JSON schemas: **Haiku**

## Knowledge references

Before each stage, load the relevant knowledge files:

- Stage 1–2: `intent-taxonomy.md`, `brand-foundation.schema.json`
- Stage 3: selected persona files from `.claude/knowledge/design/personas/`, applicable aesthetic references from `.claude/knowledge/design/aesthetic-references/`, `quality-bars.md`
- Stage 5: `.claude/knowledge/design/domains/typography.md`, `color-and-contrast.md`, `layout-and-composition.md`, `accessibility-wcag.md`, `design-system.schema.json`

## Invariants

- **Forced distinctiveness.** If 2+ aesthetic explorations can be described with the same three adjectives, reject and re-spawn.
- **No auto-selection.** Orchestrator never picks a direction; always returns to user.
- **Token discipline.** `design-system.json` uses only tokens for its semantic layer; components reference semantic tokens, not primitives.
- **Schema validation.** Every artifact written passes its JSON schema before commit.

## Artifacts produced

```
docs/design/
├── 00-foundation/
│   ├── intent.json
│   ├── brand-foundation.md
│   └── brand-foundation.json
├── 01-direction/
│   ├── explorations/
│   │   └── direction-{a..f}.md
│   └── selected-direction.md
└── 02-system/
    ├── design-system.json        # v1.0.0
    ├── design-system.md
    └── changelog.md
```

## Completion

Once all artifacts are written and pass schema validation:

- Commit artifacts
- Report summary to orchestrator (what was produced, path to `design-system.json`, version)
- **Do not invoke writing-plans.** Return control.
