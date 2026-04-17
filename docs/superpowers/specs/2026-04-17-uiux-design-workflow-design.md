# UI/UX Design Workflow — Design Spec

**Date:** 2026-04-17
**Status:** Draft — awaiting user review
**Branch:** `feature/uiux-design-workflow`
**Source brainstorm:** `uiux-agentic-framework.md` (root of repo)

---

## 1. Goals & Non-Goals

### Goals
- Add a first-class design phase to the template repo that produces intentional, coherent UI/UX rather than AI-generic output.
- Integrate without disrupting the existing skill chain (`brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch`). Non-UI projects are unaffected.
- Allow design foundation work to run at any project moment — greenfield, mid-project, or never.
- Make per-feature design opt-in and visible: users explicitly choose *full design*, *function-first*, or *deferred* and the choice is captured in the spec.
- Produce artifacts in a form downstream coding agents can consume as a contract, not a suggestion.

### Non-goals
- Do not replace `brainstorming` or `writing-plans`. They remain general-purpose and unchanged.
- Do not auto-generate production code. Design skills produce specs; implementation happens via the existing coding chain.
- Do not encode all ~25 personas from the source framework on day one. Start with a core set and expand as gaps appear.
- Do not build elaborate brand-asset parsing. Structured interview first; file parsing is later work.

---

## 2. Architecture Overview

### Two phases, both gated

**Phase 1 — Design Foundation** (once per project; deferrable or skippable)
- Single orchestrator skill: `design-foundation`
- Internal stages: intent capture → brand import → aesthetic direction divergence (parallel subagents) → user selection → design system v1 synthesis
- Two modes: **greenfield** (interview-driven) and **retrofit** (reverse-engineers existing UI). Retrofit is v0.3.

**Phase 2 — Feature Design** (opt-in per feature, called from the normal workflow)
- `ui-surface-design` — for visual surfaces (landing, pricing, dashboard, settings, etc.)
- `ux-flow-design` — for multi-step flows (signup, checkout, onboarding, recovery)
- `design-component-creation` — for filling gaps in the design system when a surface needs a component that does not yet exist

### The gate (CLAUDE.md-level, no new skill)

- Every `brainstorming` spec gains a new field at the end: `Design depth: [full | function-first | deferred]`.
- CLAUDE.md adds a rule the orchestrator follows: when a brainstorming spec describes visual surfaces or multi-step user flows, before invoking `writing-plans` the orchestrator asks the user for the design-depth choice.
- If the user picks `full` and no `docs/design/00-foundation/` exists, the orchestrator offers either to run `design-foundation` first or to do a lightweight one-off direction for just that feature (flagged as not-yet-system-tied).

### The build order

```
┌───────────────┐     ┌──────────────────┐     ┌────────────────┐     ┌──────────────────┐
│ brainstorming │ ──▶ │ design-depth     │ ──▶ │ Phase 2 design │ ──▶ │ writing-plans    │
│ (produces     │     │ gate (CLAUDE.md) │     │ (if full)      │     │ (reads design    │
│  spec)        │     └──────────────────┘     └────────────────┘     │  artifacts)      │
└───────────────┘                                                     └──────────────────┘
                                                                               │
                      ┌─────────────────┐                                      ▼
                      │ design-         │                             ┌──────────────────────┐
                      │ foundation      │  ◀── run once per project ──│ subagent-driven-     │
                      │ (Phase 1)       │     (optional, deferrable)  │ development          │
                      └─────────────────┘                             └──────────────────────┘
```

---

## 3. Skill Specifications

Each skill is an orchestrator that loads persona stacks from `.claude/knowledge/design/personas/` and knowledge slices from `.claude/knowledge/design/domains/` and `aesthetic-references/`.

### 3.1 `design-foundation`

**Purpose:** Establish the project-wide design foundation — intent, brand, aesthetic direction, and design system v1.

**Modes:**
- `greenfield` — interview-driven, no prior design exists (v0.1)
- `retrofit` — reverse-engineer from existing code/UI (v0.3)

**Inputs:**
- Project description (auto-detected from repo + user conversation)
- Optional: existing brand assets (logo, guidelines doc, existing site URL, Figma)
- Optional: user-provided inspiration references
- Optional: strictness setting (`strict` / `flexible` / `fresh`) — captured in `brand-foundation.json` in v0.1; formally enforced (divergence width, locked tokens) in v0.2. In v0.1 it is informational only.
- Optional: technical constraints (framework, CSS approach, target browsers/devices)

**Stages (greenfield mode):**

1. **Intent capture.** Structured elicitation filling out the 3-level intent taxonomy (Level 1 project intent only at this stage; Levels 2 and 3 are per-surface/per-component and happen later). Writes `docs/design/00-foundation/intent.json`.
2. **Brand import.** If brand assets exist, parse them into `brand-foundation.json`. If not, interview for brand attributes (voice, tone, emotional register, personality). Writes `docs/design/00-foundation/brand-foundation.md` + `.json`.
3. **Aesthetic direction divergence.** Spawn 3–6 Sonnet subagents in parallel. Each wears the `art-director` persona and is given a *different* aesthetic stake (e.g., "editorial brutalist," "warm organic," "swiss precision"). Each produces a one-page style tile: typography pairing, color palette with semantic roles, one "hero moment" description, manifesto paragraph, reference vibes. Orchestrator sanity-checks that directions are genuinely distinct — if they converged, re-spawn with an "at least one risky direction" instruction. Writes `docs/design/01-direction/explorations/direction-*.md`.
4. **User selection (convergence gate).** Present side-by-side to user. User picks one, hybridizes, rejects all (→ new round), or requests refinement. Iterate until user locks in. Writes `docs/design/01-direction/selected-direction.md`.
5. **Design system v1 synthesis.** The `design-systems-architect` persona formalizes the chosen direction into `design-system.json` v1: primitive tokens (color, type, space, radius, shadow, motion), semantic tokens (background, surface, foreground, border, action), base components (button, input, card, link, heading scale). Writes `docs/design/02-system/design-system.json`, `design-system.md`, `changelog.md`.

**Exit criterion:** User confirms the foundation doc captures their intent AND the design system v1 feels right.

**Persona stack:** art-director, brand-strategist, design-systems-architect, design-critic (loaded as reference knowledge).

**Model assignment (per repo policy):**
- Orchestrator (main conversation): Opus
- Aesthetic-direction subagents: Sonnet
- Design critic sub-pass (convergence check on exploration set): Sonnet

**Anti-pattern guards:**
- **Forced distinctiveness.** If 2+ aesthetic explorations read as variations of the same theme, reject the set and re-spawn. Explicit instruction to subagents: "make at least one direction that feels risky."
- **No auto-selection.** Orchestrator never picks a direction; always returns to user.

### 3.2 `ui-surface-design`

**Purpose:** Design a specific visual surface (a page or screen), producing 2–3 distinct variations, getting user selection, and writing a final surface spec.

**Inputs:**
- Surface intent (Level 2 intent taxonomy): surface type, primary action, success metric, emotional moment
- The current `design-system.json`
- Optional: reference surfaces from competitors or inspiration
- `docs/design/00-foundation/` artifacts

**Flow:**

1. Confirm surface intent with user if ambiguous.
2. Select persona stack based on surface type. In v0.1 the stacks are:
   - Pricing/landing → art-director + visual-designer + conversion-designer + ux-writer
   - Dashboard → art-director + visual-designer + data-designer + accessibility-specialist
   - Onboarding → visual-designer + onboarding-designer + ux-writer
   - Checkout → visual-designer + conversion-designer + ux-writer (trust-designer added in v0.2)
   - **Fallback** (any surface type without a dedicated stack in v0.1, e.g. settings, editorial) → art-director + visual-designer + ux-writer
   - v0.2 introduces enhanced stacks for settings (information-architect + enterprise-designer), editorial (editorial-designer), checkout (trust-designer), and flows via `ux-flow-design` (interaction-designer + ux-researcher + behavioral-designer).
3. Spawn 2–3 Sonnet subagents in parallel. Each produces a variation with a different strategic angle (e.g., pricing as "comparison table" vs "guided choice" vs "outcome-led").
4. Each subagent uses only tokens and components from the current `design-system.json`. If a needed component does not exist, flag a gap (do not invent).
5. If gaps are flagged, pause and route to `design-component-creation`. Resume when the component is added.
6. Run critic passes: design-critic (cohesion), accessibility-specialist (contrast, focus, semantic structure).
7. Present variations to user. User selects or hybridizes. Iterate.
8. Write `docs/design/03-surfaces/<name>/intent.json`, `variations/*.md`, `selected.md`.

**No-foundation case (one-off mode):** If `docs/design/02-system/design-system.json` does not exist, the skill operates in *one-off mode*. Variations are self-contained (each declares its own typography, color, spacing choices) rather than drawing from a shared system. The resulting `selected.md` is flagged `system-unbound: true` so writing-plans knows this design is not yet tied to a reusable system. The orchestrator should have already offered the user the choice between running `design-foundation` first vs. proceeding one-off (per CLAUDE.md). One-off mode is a fallback, not a recommended path.

**Exit criterion:** User confirms selected surface spec is ready.

**Model assignment:** Orchestrator Opus, variation subagents Sonnet, accessibility/spec-compliance check Haiku, critic judgment Sonnet.

### 3.3 `ux-flow-design`

**Purpose:** Design a multi-step user flow as a sequence of states, transitions, and decisions.

**Inputs:**
- Flow intent: what the user is trying to accomplish, starting state, ending state, primary and secondary success metrics
- List of surfaces involved (existing or to-be-designed)
- The current `design-system.json`

**Flow:**
1. Map the happy path as a sequence of steps.
2. For each step, identify: surface, primary action, decision points, back-navigation rules, validation rules.
3. Enumerate alternate paths: error recovery, abandonment recovery, edge cases (already-authenticated, invalid state, etc.).
4. Identify missing surfaces or components; route to `ui-surface-design` or `design-component-creation` as needed.
5. Run user-advocate critic pass: trace each path end-to-end, flag friction and dead-ends.
6. Write `docs/design/04-flows/<name>.md` with step spec, state machine, and references to surfaces and components used.

**Persona stack:** interaction-designer, ux-researcher, behavioral-designer, user-advocate. Add trust-designer for high-stakes flows (payment, irreversible actions). *(The interaction/ux-researcher/behavioral/trust personas are added in v0.2 alongside this skill.)*

**Exit criterion:** User confirms the flow handles all relevant paths; no orphaned states.

**Model assignment:** Orchestrator Opus, flow-variation subagents (if used) Sonnet, critic Sonnet.

### 3.4 `design-component-creation`

**Purpose:** Add a new component to the design system when a surface or flow needs something that does not yet exist. Only this skill may mutate `design-system.json`.

**Inputs:**
- Component gap description (from surface or flow design)
- The current `design-system.json`
- Intent for the component (role: primitive / pattern / template; job; states; variants)

**Flow:**
1. Confirm the gap is real — is there an existing component that could be extended or composed instead?
2. If extension is appropriate, modify the existing component; version bump is a minor (e.g., v1 → v1.1).
3. If a new component is genuinely needed, design it within the system (using existing tokens) and define its props, variants, states, layout, semantic HTML, accessibility requirements.
4. Append to `design-system.json`; major vs minor version bump based on whether tokens were also added.
5. Append a changelog entry: what was added, why, which surface/flow triggered it.
6. Return control to the paused skill that requested the gap fill.

**Persona stack:** design-systems-architect, interaction-designer, accessibility-specialist.

**Invariant:** No other skill may write to `design-system.json`. If a surface design subagent tries, the artifact is rejected and the gap is routed here.

**Model assignment:** Orchestrator Opus, design work Sonnet.

---

## 4. Knowledge Base Structure

### `.claude/knowledge/design/` (shared across skills)

```
.claude/knowledge/design/
├── personas/                          # v0.1 ships 10; v0.2 adds 7 more
│   ├── art-director.md
│   ├── visual-designer.md
│   ├── conversion-designer.md
│   ├── data-designer.md
│   ├── onboarding-designer.md
│   ├── ux-writer.md
│   ├── accessibility-specialist.md
│   ├── design-systems-architect.md
│   ├── design-critic.md
│   └── user-advocate.md
├── domains/
│   ├── typography.md
│   ├── color-and-contrast.md
│   ├── layout-and-composition.md
│   └── accessibility-wcag.md
├── aesthetic-references/
│   ├── brutalist.md
│   ├── swiss-international.md
│   ├── editorial.md
│   ├── warm-organic.md
│   ├── tech-minimal.md
│   └── playful-maximalist.md
├── intent-taxonomy.md
├── quality-bars.md
└── README.md
```

**Persona file format:** frontmatter (name, one-line-purpose, what-they-care-about, typical-outputs) + body (heuristics, vocabulary, what to avoid, how to collaborate with other personas).

**Aesthetic reference file format:** frontmatter (name, good-for, bad-for) + body (characteristic moves for typography/color/layout/motion, failure modes, example references).

**Domain file format:** concise practitioner-grade reference — principles, heuristics, common mistakes, checklists.

**`intent-taxonomy.md`:** Full 3-level spec (project / surface / component intent) with JSON schemas inline and examples.

**`quality-bars.md`:** What "good" looks like (intentionality, cohesion, hierarchy, restraint, distinctiveness, feel, robustness, accessibility) + the anti-pattern list (AI-generic aesthetic, default everything, decoration without purpose, etc.).

### Skill-local `references/`

Each skill's `references/` directory holds:
- Flow documentation specific to that skill (greenfield-flow.md, retrofit-flow.md, etc.)
- JSON schemas for artifacts the skill produces (design-system.schema.json, surface-spec.schema.json, etc.)
- Persona-stack declaration (a small YAML file listing which personas this skill loads by default)

---

## 5. Artifact Layout in Projects

```
docs/design/
├── 00-foundation/
│   ├── intent.json                    # Level 1 intent spec
│   ├── brand-foundation.md            # human-readable
│   ├── brand-foundation.json          # machine-readable
│   └── references.md                  # user-provided inspiration
├── 01-direction/
│   ├── explorations/                  # from Phase 1 divergence
│   │   ├── direction-a.md
│   │   ├── direction-b.md
│   │   └── ...
│   └── selected-direction.md          # user's pick + refinement notes
├── 02-system/
│   ├── design-system.json             # versioned source of truth
│   ├── design-system.md               # human rationale
│   ├── changelog.md                   # every system change with reason
│   └── components/                    # per-component specs
│       └── <component-name>.md
├── 03-surfaces/
│   └── <surface-name>/
│       ├── intent.json                # Level 2 intent
│       ├── variations/                # from Phase 2 divergence
│       └── selected.md                # user's pick + refinement
├── 04-flows/
│   └── <flow-name>.md
└── 05-handoff/
    ├── tokens/                        # target-framework format (v0.3)
    ├── components/                    # implementation-ready specs (v0.3)
    ├── surfaces/                      # layout specs referencing components
    ├── design-rationale.md            # the "why" for coding agents
    └── do-not.md                      # guardrails against entropy
```

### Versioning rule

`design-system.json` is the only truly mutable artifact. Every change bumps its version and adds a changelog entry. Surfaces and flows reference a system version. If the system version bumps after a surface was designed, the orchestrator flags affected surfaces for re-review.

---

## 6. Integration Points

### 6.1 CLAUDE.md changes

Add a new section *"Design Workflow"* that includes:

1. **The gate rule.** When a brainstorming spec describes visual surfaces or user flows, before invoking `writing-plans` the orchestrator must ask the user: *full design / function-first / deferred*. The answer goes in the spec's `Design depth` field.
2. **Paths pointer.** Shared design knowledge lives in `.claude/knowledge/design/`. Project design artifacts live in `docs/design/`.
3. **Foundation prompt.** If the user chooses `full` and `docs/design/00-foundation/` does not exist, offer to run `design-foundation` first, or do a lightweight one-off feature direction (marked as not-yet-system-tied).
4. **Skill pointers.** List the four design skills with one-line descriptions.
5. **Model policy extension.** Aesthetic-direction subagents use Sonnet; design critics use Sonnet for judgment passes and Haiku for mechanical spec-compliance checks.

Target: ~15–25 lines added to CLAUDE.md. Keep concise per the repo's "instruction budget" convention.

### 6.2 Brainstorming spec template

The brainstorming skill's output template gets one appended field:

```
## Design depth
`[full | function-first | deferred]`
```

This is a convention enforced by CLAUDE.md, not a modification of the brainstorming skill itself. The skill's existing self-review checklist gains one item: *"Is the Design depth field filled in?"*

### 6.3 Writing-plans behavior

Writing-plans reads the `Design depth` field:

- **`full`** — Plan references `docs/design/` artifacts. Tasks that build surfaces list the surface spec + component specs as inputs. Tasks are instructed not to invent tokens or components. The `do-not.md` (when it exists) is attached as an input to every task.
- **`function-first`** — Plan proceeds without design artifacts. Tasks use a bare-minimum accessibility/structural baseline (semantic HTML, keyboard nav, WCAG AA contrast on whatever colors are chosen). A follow-up task is appended: "design pass (run design-foundation + ui-surface-design when ready)."
- **`deferred`** — Plan includes a blocking "design TBD" marker task gating any visible UI work. Non-UI tasks proceed normally.

This is orchestrator-level behavior driven by CLAUDE.md; writing-plans itself does not need structural changes.

### 6.4 Subagent-driven-development behavior

No structural changes. Implementation subagents inherit design artifacts through the plan inputs. When an implementation subagent encounters a needed component or token that does not exist, it flags and routes back to `design-component-creation` (for components) or to the orchestrator (for tokens — which require user approval).

### 6.5 excalidraw-diagram-skill (v0.3 integration)

The `design-foundation` and `ui-surface-design` skills can optionally invoke `excalidraw-diagram-skill` to render style tiles and surface layouts as `.excalidraw` files. Not required for v0.1; text descriptions + token sets are sufficient for MVP.

---

## 7. Invariants the System Enforces

1. **Token discipline.** Surface and component specs reference tokens only. No raw hex values, pixel measurements, or font stacks. The handoff packager (v0.3) rejects any non-token values.
2. **System coherence.** Surface-design skills never mutate `design-system.json`. Gaps route to `design-component-creation` — the one skill allowed to modify it.
3. **Forced distinctiveness.** `design-foundation` rejects an aesthetic exploration set whose directions converged. Orchestrator re-spawns with an "at least one risky direction" instruction. This is the primary lever against AI-generic output.
4. **User in the loop at convergence.** Divergence (generating options) is AI's job. Selection (picking among options) is always the user's. No auto-picking ever.
5. **Versioned design system.** Every change to `design-system.json` bumps version and adds a changelog entry with rationale.
6. **Do-not contract.** `05-handoff/do-not.md` lists things coding agents must not unilaterally change. Writing-plans propagates it into task inputs.
7. **Spec field.** Every brainstorming-produced spec has `Design depth: [full | function-first | deferred]`. Missing field is a spec-review failure.

---

## 8. MVP Scope & Build Order

### v0.1 — Foundation slice (first PR)

**Infrastructure:**
- JSON schemas for: intent (Level 1), brand-foundation, design-system, surface-spec, component-spec
- `.claude/knowledge/design/` populated with:
  - 10 personas (art-director, visual-designer, conversion-designer, data-designer, onboarding-designer, ux-writer, accessibility-specialist, design-systems-architect, design-critic, user-advocate)
  - 4 domains (typography, color-and-contrast, layout-and-composition, accessibility-wcag)
  - 6 aesthetic references (brutalist, swiss-international, editorial, warm-organic, tech-minimal, playful-maximalist)
  - intent-taxonomy.md and quality-bars.md
  - README.md indexing the above

**Skills:**
- `design-foundation` skill — greenfield mode
- `ui-surface-design` skill — demonstrates the Phase 2 integration pattern
- `design-component-creation` skill — required so `ui-surface-design` has a place to route component gaps. Without it, the first gap-hit would stall the workflow.

**Integration:**
- CLAUDE.md updates: gate rule, Design depth field, paths, model policy extension, skill pointers
- `docs/design/` template / placeholder structure

**Rationale:** Per the source framework, foundation + design-system v1 is the highest-leverage piece. Shipping `ui-surface-design` + `design-component-creation` alongside makes v0.1 usable end-to-end (a surface design that hits a component gap has somewhere to go), and proves the Phase 2 integration pattern so v0.2 skills are extrapolation rather than new architecture.

### v0.2 — Phase 2 completion

- `ux-flow-design` skill
- New personas added to `.claude/knowledge/design/personas/`: interaction-designer, ux-researcher, behavioral-designer, trust-designer, information-architect, enterprise-designer, editorial-designer
- Enhanced persona stacks wired into `ui-surface-design` for settings, editorial, and high-stakes checkout
- Design critic + accessibility pass as a formal sub-step of Phase 2 skills
- Formal strictness-mode behavior in `design-foundation` (strict locks tokens; fresh allows full divergence; flexible is the default)

### v0.3 — Polish and scale

- Retrofit mode for `design-foundation` (reverse-engineer existing UI)
- Production handoff packager: tokens in target framework format (CSS vars, Tailwind config, theme object); implementation-ready component specs; `do-not.md` generation
- `excalidraw-diagram-skill` integration for rendering style tiles and surface layouts
- Optional: component library adapters (shadcn, Radix, etc.) as primitive importers

---

## 9. Key Risks & Mitigations

- **Convergence to safe.** Divergence steps are pointless if variations converge. Mitigated by the forced-distinctiveness invariant and explicit critic rejection of converged sets.
- **Token bypass.** Sub-agents tempted to use raw values. Mitigated by the token-discipline invariant and (v0.3) a packager that rejects non-token values.
- **State sprawl.** Artifact tree grows as surfaces multiply. Mitigated by the `docs/design/` directory structure and an index in `02-system/design-system.md`.
- **Persona overload.** Loading too many personas dilutes output. Each skill declares its persona stack (3–5 typical; hard cap at 6).
- **Skipping user-in-the-loop.** Convergence steps must be real gates. Mitigated by the invariant; violating it is a skill bug.
- **Critic toothlessness.** A "looks fine" critic is worse than none. Critics ship with explicit reject criteria in their persona files.
- **Scope creep in v0.1.** Tempting to build all four skills at once. Mitigated by the explicit v0.1/v0.2/v0.3 split above.

---

## 10. Explicitly Deferred

- **Brand-asset file parsing.** v0.1 uses structured interviews; file parsing (logo analysis, existing-site scrape, Figma import) is later.
- **Full persona library.** Source framework lists ~25 personas; v0.1 ships 8. Add on demand when a task needs one that does not exist.
- **Data contract integration.** The framework proposes design artifacts aware of backend data shape. Out of scope for v0.1; revisit after MVP proves the pattern.
- **Automated design-system versioning rigor.** v0.1 uses a simple changelog and manual version bumps. Semantic versioning enforcement is polish.
- **Retrofit mode.** v0.3.

---

## 11. Success Criteria for v0.1

- A user running this template on a new UI-heavy project can invoke `design-foundation` and produce a coherent design system v1 (tokens + base components) committed to `docs/design/`.
- A user running `ui-surface-design` on a named surface (e.g., "pricing") produces 2–3 genuinely distinct variations using only the design system, picks one, and ends up with a spec that `writing-plans` can consume.
- A non-UI project runs the existing `brainstorming → writing-plans → subagent-driven-development` chain without interference — the design workflow is invisible to them.
- CLAUDE.md growth is ≤25 lines of new content (instruction budget respected).
- The repo is usable as a template today: cloning it, running `design-foundation` on a fresh project, and proceeding produces output that looks intentional rather than AI-generic.

---

## Design depth
`full` (this spec drives a significant UI/UX-workflow addition; the implementation itself is skill-authoring work, not UI code — but the spec's own "design depth" marker is included to model the convention we're introducing)
