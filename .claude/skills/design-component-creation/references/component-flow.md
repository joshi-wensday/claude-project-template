# design-component-creation / component flow

Detailed step-by-step flow.

## Stage 1 — Gap validation

Given the gap description (e.g., "pricing surface needs a plan-card"):

1. Read `design-system.json.components`.
2. Check: is there an existing component that could be extended to handle this case? Candidates: any component with a similar role (e.g., `card` might be extended into `plan-card` via a variant).
3. If extension is possible and sensible:
   - Add a variant to the existing component.
   - Proceed to Stage 2 with extension intent (minor bump, reasonExtended in spec).
4. If genuinely new: proceed to Stage 2 with creation intent.

## Stage 2 — Design

Using the `design-systems-architect`, `visual-designer` (fallback for `interaction-designer` in v0.1), and `accessibility-specialist` personas:

Produce the component definition. Fields (conforming to `component-spec.schema.json`):

- `name` (kebab-case, unique in system)
- `role` — `primitive` (reusable base), `pattern` (composed, situated), or `template` (page/section-level scaffold)
- `job` — one sentence stating the user-facing purpose
- `props` — array of `{name, type, required, default?}`. Strive for composition over configuration: slots/children over endless props.
- `variants` — object mapping dimension → values (e.g., `{emphasis: ["default", "recommended"]}`)
- `states` — minimum default + at least 3 of [hover, focus, active, disabled, selected, loading, error, empty]
- `semanticHtml` — what HTML element(s) the component uses
- `accessibility` — array of requirements (focus management, ARIA, keyboard, contrast)
- `tokensUsed` — list of semantic token names only
- `composesComponents` — list of existing components this composes
- `reasonCreated` — why it was added (which surface flagged it)
- `reasonExtended` — if extending: what variant was added and why; else `null`

## Stage 3 — Token check

Scan `tokensUsed`: every entry must appear in `design-system.json.tokens.semantic` (or be a dotted reference into `tokens.primitive.*` for semantic-only tokens that reference primitives directly — typically only allowed for the semantic layer itself, not components).

If a needed token is missing:
- **Pause the skill.** Do not invent tokens.
- Report to user: "This component needs a new token: <name>. Tokens are a foundation-level concern. Want to add it (confirm + brief rationale), or rework the component to use existing tokens?"
- Wait for user decision. If user approves, update design-system.json.tokens + changelog with a **major version bump** (tokens changed), then proceed. If user reworks, restart Stage 2.

## Stage 4 — Spec write

Write `docs/design/02-system/components/<name>.md` (human-readable) with a frontmatter header containing the structured component-spec data. The frontmatter conforms to `component-spec.schema.json`.

Example:

```markdown
---
schemaVersion: "1"
name: plan-card
addedInDesignSystemVersion: "1.1.0"
role: pattern
job: "Display a single pricing plan with name, price, benefits, and selection CTA."
props:
  - { name: name, type: string, required: true }
  - { name: price, type: string, required: true }
  - { name: period, type: string, required: true }
  - { name: benefits, type: "string[]", required: true }
  - { name: recommended, type: boolean, required: false, default: false }
  - { name: ctaLabel, type: string, required: true }
  - { name: onSelect, type: "() => void", required: true }
variants:
  emphasis: ["default", "recommended"]
states: ["default", "hover", "focus", "selected", "disabled"]
semanticHtml: "article with h3 for name, p for price, ul/li for benefits, button for CTA"
accessibility:
  - "Focusable as an interactive region via the inner button"
  - "Recommended state announced via aria-label"
  - "Color is not the only indicator of recommended — label required"
tokensUsed:
  - color.surface
  - color.border
  - color.action
  - space.6
  - radius.md
composesComponents: [button]
reasonCreated: "Flagged by pricing surface; no existing card variant handled plan presentation."
reasonExtended: null
---

# plan-card

<body: layout diagram, usage examples, rationale>
```

## Stage 5 — System update

1. Read `docs/design/02-system/design-system.json`.
2. Add the new component (or extended variant) under `components.<name>`.
3. Bump `version`:
   - Minor bump (1.0.0 → 1.1.0) if: new component using existing tokens, or extended component
   - Major bump (1.0.0 → 2.0.0) if: new tokens were added
4. Update `lastUpdated` to current ISO timestamp.
5. Append a changelog entry:
   ```json
   {
     "version": "1.1.0",
     "at": "2026-04-17T12:00:00Z",
     "change": "added component: plan-card",
     "reason": "pricing surface design flagged gap — no card variant suited plan presentation"
   }
   ```

## Stage 6 — Validate

Run:

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/design-system.schema.json -d docs/design/02-system/design-system.json --spec=draft2020
```

Expected: `valid`.

Also extract the frontmatter of the component spec to a temp JSON file and validate against `component-spec.schema.json`.

If either validation fails, fix the errors before committing.

## Stage 7 — Commit and return

```bash
git add docs/design/02-system/design-system.json docs/design/02-system/components/<name>.md docs/design/02-system/changelog.md
git commit -m "design-system v<N.N.N>: add <component-name> component"
```

Report to caller:
```
design-component-creation complete.
- Component: <name> (role: <role>)
- System version: <previous> → <new>
- Spec: docs/design/02-system/components/<name>.md
```

Return control. Do NOT invoke writing-plans.
