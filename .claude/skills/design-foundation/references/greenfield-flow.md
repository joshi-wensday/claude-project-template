# design-foundation / greenfield flow

Detailed step-by-step flow the skill follows.

## Stage 1 — Intent capture

Ask the user the following (in natural conversation, not a form):

1. What are you building? (One sentence summary.)
2. What kind of product is it? (Pick from: marketing-site, saas-app, e-commerce, content-editorial, utility-tool, game, creative-tool, community-social, dashboard, internal-tool.)
3. What's the primary goal? (convert, activate, retain, inform, entertain, enable-productivity, build-trust, facilitate-transaction.)
4. Who's it for? (general-public, professionals, experts, power-users, mixed.)
5. What should users feel using it? (Pick 1–3: serious-trustworthy, playful-fun, premium-refined, raw-honest, warm-personal, clinical-precise.)
6. What are the stakes if something goes wrong? (low / medium / high.)

Write `docs/design/00-foundation/intent.json` conforming to `intent.schema.json`. Validate with ajv-cli before proceeding.

## Stage 2 — Brand import

Ask:

1. Do you have existing brand assets (logo, guidelines, existing product, Figma)?
   - If yes in v0.1: note the assets as `inspirationReferences` but do NOT attempt to parse files. Interview for attributes manually.
2. In 3–5 words, how should the brand feel?
3. What should the brand NEVER feel like? (Anti-references, as specific as possible — "not like generic-enterprise-saas", "not like purple-gradient-consumer-app".)
4. Voice: tone (e.g., friendly-expert, reserved-precise, warm-personal), personality in one sentence.
5. Do-say / don't-say word lists.
6. Strictness: `strict` (brand locked, no divergence — v0.2 enforces), `flexible` (brand as starting point, evolution allowed — default), `fresh` (no prior constraints).

Write `brand-foundation.md` (human-readable) and `brand-foundation.json` (conforming to `brand-foundation.schema.json`). Validate.

## Stage 3 — Aesthetic direction divergence

Given the filled intent + brand, spawn N parallel subagents where N is between 3 and 6:
- N=3 for `strict` strictness
- N=4 for `flexible` (default)
- N=6 for `fresh`

Each subagent:
- Gets Sonnet model
- Wears the `art-director` persona (load `personas/art-director.md`)
- Is given the intent + brand foundation + one specific aesthetic stake from a pre-selected distinct set (e.g., "editorial brutalist," "warm organic," "swiss precision," "tech-minimal with a twist," "playful maximalist," "raw editorial")
- Also loads the relevant `aesthetic-references/*.md` file for its assigned direction as grounding
- Produces a markdown file in `01-direction/explorations/direction-{letter}.md` with:
  - Direction name + 3-adjective description
  - Typography pairing with rationale
  - Color palette (primitive tokens) with semantic role suggestions
  - One "hero moment" mock description (signature component or moment)
  - Motion character (short description: 120ms ease-out / 240ms spring / etc.)
  - 3–5 reference vibes (named, not URLs)
  - One-paragraph manifesto

**Critical:** explicitly instruct at least one subagent to "make a direction that feels risky." Explicit guard against all 4–6 landing in safe territory.

After all subagents return, run a design-critic convergence check (Sonnet agent, `design-critic` persona loaded):
- Take all N direction files.
- Ask: can any two be described using the same three adjectives?
- If yes → reject that pair, re-spawn those subagents with adjusted stakes that push further apart.
- Re-check. Maximum 2 re-spawn rounds before presenting to user with a note about convergence risk.

## Stage 4 — User selection

Present the N directions side-by-side (Markdown summary table with the 3-adjective descriptions and hero-moment one-liners).

Ask: "Pick one, combine two, reject all (new round), or refine a specific one?"

If user picks / hybrids:
- Write `docs/design/01-direction/selected-direction.md` combining the selected direction(s) with any refinement notes from the user.

If reject-all: re-enter Stage 3 with feedback. Max 2 full re-rounds before escalating to user ("we've tried several rounds; want to change the intent or brand foundation?").

## Stage 5 — Design system v1 synthesis

Given the selected direction, the `design-systems-architect` persona takes over (load `personas/design-systems-architect.md`).

Produce `design-system.json` v1.0.0:
- **Primitive tokens:**
  - Color: neutral ramp (8–10 stops, OKLCH-spaced), accent(s) (1–2), semantic accents (danger, warning, success — optional)
  - Type: font family declarations (2–3 families max), 5–7 size steps, 3 weights
  - Space: multiplier base (4 or 8px), 8–10 steps
  - Radius: 3–5 stops
  - Shadow: 2–4 stops (or none if the direction doesn't use them)
  - Motion: 3 duration stops, 1–2 easing curves
- **Semantic tokens** (minimum): background, foreground, surface, border, action, action-foreground, muted, muted-foreground
- **Base components** (minimum): button (with emphasis variants + size variants + states), input, card, link, heading (scale assignment)
  - Each component spec goes in `02-system/components/<name>.md`

Write:
- `02-system/design-system.json` (validate against `design-system.schema.json`)
- `02-system/design-system.md` (human rationale: why these choices, tied back to intent + direction)
- `02-system/changelog.md` (initial entry: "v1.0.0 — initial design system. Reason: design-foundation greenfield run.")

## Completion

- Commit all artifacts: `git add docs/design && git commit -m "run design-foundation — v1 design system established"`
- Report to orchestrator:
  ```
  design-foundation complete.
  - Intent: docs/design/00-foundation/intent.json
  - Direction: docs/design/01-direction/selected-direction.md
  - System: docs/design/02-system/design-system.json (v1.0.0)
  Next: invoke ui-surface-design for specific surfaces, or continue with writing-plans.
  ```
- Do NOT invoke writing-plans.
