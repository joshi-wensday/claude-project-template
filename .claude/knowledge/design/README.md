# .claude/knowledge/design/

Shared design knowledge referenced by UI/UX workflow skills. Content is persona-oriented (perspectives), domain-oriented (practitioner knowledge), and aesthetic-reference-oriented (named directions). Skills load subsets by path.

## Layout

```
.claude/knowledge/design/
├── personas/                  # what perspective to adopt
├── domains/                   # what knowledge to bring
├── aesthetic-references/      # what named direction to draw from
├── schemas/                   # JSON schemas for design artifacts
│   └── examples/              # valid + invalid examples per schema
├── intent-taxonomy.md         # 3-level intent spec
├── quality-bars.md            # good/anti-pattern bar + critic-rejection criteria
└── README.md                  # this file
```

## How skills use these files

Each skill's `references/persona-stack.yaml` lists the personas it loads by default (and any additional personas selected based on surface type or task intent). Knowledge files are read into the skill's working context at invocation.

## Personas (v0.1: 10)

**Foundation:** `art-director`, `visual-designer`, `design-systems-architect`

**Surface specialists:** `conversion-designer`, `data-designer`, `onboarding-designer`, `ux-writer`

**Critique:** `accessibility-specialist`, `design-critic`, `user-advocate`

**v0.2 adds:** `interaction-designer`, `ux-researcher`, `behavioral-designer`, `trust-designer`, `information-architect`, `enterprise-designer`, `editorial-designer`

## Domains (v0.1: 4)

`typography`, `color-and-contrast`, `layout-and-composition`, `accessibility-wcag`

## Aesthetic references (v0.1: 6)

`brutalist`, `swiss-international`, `editorial`, `warm-organic`, `tech-minimal`, `playful-maximalist`

## Schemas (v0.1: 5)

`intent`, `brand-foundation`, `design-system`, `surface-spec`, `component-spec`

Every schema has a valid and invalid example in `schemas/examples/`. Validate with:

```bash
npx -y ajv-cli@5 validate -s schemas/<name>.schema.json -d schemas/examples/<name>.valid.json --spec=draft2020
```

Each example pair is **self-contained** — the valid and invalid examples test the schema in isolation. Token and component names in one schema's example (e.g. `plan-card` in `surface-spec.valid.json`) may not match another schema's example (e.g. `design-system.valid.json` only defines `button`). This is intentional: schemas are validated independently, so examples are not required to mutually cross-reference. Do not edit examples to force cross-example consistency.

## Adding a new persona

1. Copy the template structure from any existing persona file.
2. Fill in frontmatter: `name`, `purpose`, `role`, `loadedBy`.
3. Fill body sections: What you own, What you care about, Heuristics, Vocabulary, What to avoid, How to collaborate, Typical outputs.
4. Add the persona to the list in this README.
5. Update `persona-stack.yaml` in any skill that should load it by default.

## Adding a new aesthetic reference

1. Frontmatter: `name`, `goodFor`, `badFor`.
2. Body: What it is, Characteristic moves (type/color/layout/motion/imagery), Good for, Bad for, Failure modes, Reference vibes, Translation to tokens.
3. Add to this README.
