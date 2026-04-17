# Intent Taxonomy

Every design decision is grounded in intent. Intent has three levels; load the relevant one for the task at hand.

## Level 1 — Project intent

Captured once per project in `docs/design/00-foundation/intent.json` (schema: `schemas/intent.schema.json`).

- **productType** — one of: marketing-site, saas-app, e-commerce, content-editorial, utility-tool, game, creative-tool, community-social, dashboard, internal-tool
- **primaryGoal** — one of: convert, activate, retain, inform, entertain, enable-productivity, build-trust, facilitate-transaction
- **audienceSophistication** — general-public / professionals / experts / power-users / mixed
- **emotionalRegister** — array of: serious-trustworthy, playful-fun, premium-refined, raw-honest, warm-personal, clinical-precise
- **stakes** — low (browsing), medium (signup), high (financial/health/irreversible)
- **oneLineDescription** — plain-English summary in under 20 words

## Level 2 — Surface intent

Captured per major surface in `docs/design/03-surfaces/<name>/intent.json`. Fields:

- **surfaceType** — pricing, landing, dashboard-home, detail-view, settings, checkout, empty-state, error, signup, onboarding, etc.
- **primaryAction** — the one thing the user should do on this surface, stated as a verb-phrase
- **successMetric** — how we'd measure this surface worked (click-through, time-to-action, completion-rate)
- **emotionalMoment** — what the user should feel arriving / completing

## Level 3 — Component intent

Captured per non-trivial component in the component-spec. Fields:

- **role** — primitive / pattern / template
- **job** — one sentence, user-facing purpose
- **states** — default, hover, focus, active, disabled, loading, error, empty, success (whichever apply)
- **variants** — by size, by emphasis, by context

## Use

Persona stacks are selected based on intent. A pricing surface (goal: convert) loads conversion-designer + visual-designer + ux-writer. A dashboard home (goal: enable-productivity) loads data-designer + visual-designer + accessibility-specialist. See each skill's `references/persona-stack.yaml` for mappings.
