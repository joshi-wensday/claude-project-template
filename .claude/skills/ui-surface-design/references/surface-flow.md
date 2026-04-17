# ui-surface-design / surface flow

Detailed step-by-step flow.

## Stage 1 — Intent confirmation

If the calling context has a surface intent, validate it has all required fields (surfaceType, primaryAction, successMetric, emotionalMoment). If missing or the skill was invoked without a spec, ask the user the four questions directly.

Write `docs/design/03-surfaces/<name>/intent.json` conforming to the intent part of `surface-spec.schema.json`. (Not a separate schema — this is written into the spec's `intent` field at selection time; during confirmation stage, keep in memory or write a scratch copy.)

## Stage 2 — Persona stack selection

Look up `surfaceType` in `references/persona-stack.yaml`:

```yaml
by_surface_type:
  pricing:    [art-director, visual-designer, conversion-designer, ux-writer, accessibility-specialist]
  landing:    [art-director, visual-designer, conversion-designer, ux-writer, accessibility-specialist]
  checkout:   [visual-designer, conversion-designer, ux-writer, accessibility-specialist]
  # (trust-designer added in v0.2)
  dashboard-home:  [art-director, visual-designer, data-designer, accessibility-specialist]
  dashboard-detail:[visual-designer, data-designer, accessibility-specialist]
  onboarding:      [visual-designer, onboarding-designer, ux-writer, accessibility-specialist]
  signup:          [visual-designer, onboarding-designer, conversion-designer, ux-writer, accessibility-specialist]
  empty-state:     [visual-designer, onboarding-designer, ux-writer]
  error:           [visual-designer, ux-writer]
```

If `surfaceType` isn't in the map → fallback stack: `[art-director, visual-designer, ux-writer, accessibility-specialist]`. Log a note in the selected.md that a specialized stack for this surface type arrives in v0.2.

## Stage 3 — Variation generation

Spawn 2–3 Sonnet subagents in parallel (3 is default; use 2 if strictness is `strict`).

Each subagent receives:
- The persona stack files (read as context)
- The `design-system.json` (or a note "no system — operate in one-off mode")
- `intent-taxonomy.md` Level 2 section
- `quality-bars.md`
- A distinct strategic angle. Pre-selected angles by surface type:

```
pricing:     ["comparison-table", "guided-choice", "outcome-led"]
landing:     ["problem-first", "outcome-first", "social-proof-led"]
dashboard-home: ["metric-hero", "card-grid", "narrative-scannable"]
onboarding:  ["do-now-learn-later", "guided-setup", "sample-data-dive"]
checkout:    ["single-page", "stepper", "confidence-stacked"]
# fallback: ["angle-a", "angle-b", "angle-c"] — orchestrator picks distinct real angles for the specific surface
```

Each subagent produces a markdown file: `variation-{a..c}.md` with:
- Angle name + one-sentence strategic description
- Section-by-section layout (header, hero, features, CTA, footer — specific to the surface)
- Components used (list from the design system; flag any missing as `componentsFlagged`)
- Tokens used (list; any raw values are a bug)
- Copy notes (actual strings or copy voice + rules)
- Accessibility notes (focus order, keyboard, contrast checks)

## Stage 4 — Gap handling

After all subagents return, compile the union of `componentsFlagged` across variations.

For each flagged component:
- Pause.
- Invoke `design-component-creation` with the gap description.
- Wait for completion (design-system.json will bump to vN+1).
- Re-invoke the specific variation subagents that flagged this component with the updated system, to see if they can now implement the variation without the flag.

If more than 3 components are flagged by a single surface, escalate: ask the user "this surface needs several new components; want to proceed, simplify the surface, or revisit the design system?"

## Stage 5 — Critic passes

Run two critic subagents (Sonnet, personas loaded):

**design-critic pass:**
- Reads all N variations
- Checks: are they genuinely distinct angles, or variations on a theme?
- Checks: does each variation use tokens only, no raw values?
- Checks: are all required states enumerated (hover, focus, loading, empty, error per interactive element)?
- Output: accept all / reject specific ones (with reasons)

If any rejected: re-spawn those subagents with the critic's feedback; one retry allowed.

**accessibility-specialist pass:**
- Reads all surviving variations
- Checks contrast for every token pairing used
- Checks focus order, landmark structure, keyboard reachability
- Output: pass / fail per variation with specific issues

If any fail: fix issues in the variation file (small fixes directly; larger ones → reject variation).

**user-advocate pass (optional for large/complex surfaces):**
- Trace the primary user flow across the surface end-to-end for each persona described in `personas/user-advocate.md`'s "User-advocacy scenarios" (skip scenarios that don't apply).
- Flag friction, dead-ends, or confusion points.
- Output: issue list with proposed fixes. The variation subagent (or orchestrator) addresses issues before Stage 6 user selection.

On small or simple surfaces (empty states, error pages, single-CTA landing), skip this pass — the design-critic and accessibility passes suffice.

## Stage 6 — User selection

Present surviving variations to the user. Markdown comparison:

```
Variation A — <angle name>
  Hero: <one line>
  Strategic angle: <description>
  Highlights: <3 bullets>

Variation B — <angle name>
  ...
```

User picks 1, hybridizes, rejects all (→ re-run Stage 3 with new angles), or requests refinement on one.

Iterate refinement loop until user confirms.

## Stage 7 — Write artifacts

Write `docs/design/03-surfaces/<name>/selected.md` conforming to `surface-spec.schema.json`:

- `schemaVersion: "1"`
- `name: <surface-name>`
- `designSystemVersion: <read from design-system.json.version, or "0.0.0" if one-off>`
- `systemUnbound: <true if one-off mode, else false>`
- `intent: <from Stage 1>`
- `sections: [...]` (from the selected variation)
- `componentsUsed: [...]`
- `componentsFlagged: []` (should be empty by now; if any remain, that's a bug — escalate)
- `tokensUsed: [...]`
- `copyNotes: "..."`
- `accessibilityNotes: "..."`

Validate with ajv-cli before commit.

## Completion

- Commit artifacts
- Report to orchestrator:
  ```
  ui-surface-design complete for <name>.
  - Intent: docs/design/03-surfaces/<name>/intent.json
  - Selected variation: <angle name>
  - Spec: docs/design/03-surfaces/<name>/selected.md
  - System version used: <N.N.N>
  - Components added during this run: <list, if any>
  Next: more surfaces, or continue with writing-plans.
  ```
- Do NOT invoke writing-plans.
