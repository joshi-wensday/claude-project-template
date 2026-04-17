# UI/UX Design Workflow v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v0.1 "foundation slice" of the UI/UX design workflow — five JSON schemas, a populated `.claude/knowledge/design/` knowledge base (10 personas + 4 domains + 6 aesthetic references + 2 taxonomies + index), three skills (`design-foundation`, `ui-surface-design`, `design-component-creation`), CLAUDE.md integration, and a `docs/design/` project-artifact template.

**Architecture:** Skills live in `.claude/skills/<name>/` with SKILL.md + `references/`. Shared knowledge (personas, domains, aesthetic references, intent taxonomy, quality bars) lives at `.claude/knowledge/design/` and is referenced by path from skills. Project design artifacts produced by users of the skills land in `docs/design/`. The gate mechanism ("Design depth: full/function-first/deferred") is enforced by CLAUDE.md convention, not by modifying the brainstorming skill.

**Tech Stack:** Markdown skills, JSON Schema (draft-07 or 2020-12), `ajv-cli` via `npx` for schema validation, no compiled code. Cross-platform (Windows + Unix) via forward-slash paths and `npx`.

**Spec reference:** `docs/superpowers/specs/2026-04-17-uiux-design-workflow-design.md`

---

## File Structure

Files created in this plan (all paths relative to repo root `C:\Users\Josh\Desktop\Creations\claude-project-template`):

**Directory scaffolding (Task 1):**
- `.claude/knowledge/design/` (+ subdirs: `personas/`, `domains/`, `aesthetic-references/`)
- `docs/design/00-foundation/`, `01-direction/explorations/`, `02-system/components/`, `03-surfaces/`, `04-flows/`, `05-handoff/`

**Schemas (Tasks 2–6):**
- `.claude/knowledge/design/schemas/intent.schema.json`
- `.claude/knowledge/design/schemas/brand-foundation.schema.json`
- `.claude/knowledge/design/schemas/design-system.schema.json`
- `.claude/knowledge/design/schemas/surface-spec.schema.json`
- `.claude/knowledge/design/schemas/component-spec.schema.json`
- One "valid example" and one "invalid example" per schema in `.claude/knowledge/design/schemas/examples/`

**Shared taxonomies (Task 7):**
- `.claude/knowledge/design/intent-taxonomy.md`
- `.claude/knowledge/design/quality-bars.md`

**Personas (Tasks 8–10):** 10 files in `.claude/knowledge/design/personas/`

**Domains (Task 11):** 4 files in `.claude/knowledge/design/domains/`

**Aesthetic references (Tasks 12–13):** 6 files in `.claude/knowledge/design/aesthetic-references/`

**Knowledge README (Task 14):**
- `.claude/knowledge/design/README.md`

**Skills (Tasks 15–17):**
- `.claude/skills/design-foundation/SKILL.md` + `references/`
- `.claude/skills/ui-surface-design/SKILL.md` + `references/`
- `.claude/skills/design-component-creation/SKILL.md` + `references/`

**Integration (Task 18):**
- `.claude/CLAUDE.md` — add Design Workflow section

**Validation (Task 19):**
- `.claude/knowledge/design/scripts/validate-all.sh` (small helper)

---

## Task 1: Directory scaffolding and top-level READMEs

**Files:**
- Create: `.claude/knowledge/design/personas/.gitkeep`
- Create: `.claude/knowledge/design/domains/.gitkeep`
- Create: `.claude/knowledge/design/aesthetic-references/.gitkeep`
- Create: `.claude/knowledge/design/schemas/examples/.gitkeep`
- Create: `.claude/knowledge/design/scripts/.gitkeep`
- Create: `docs/design/00-foundation/.gitkeep`
- Create: `docs/design/01-direction/explorations/.gitkeep`
- Create: `docs/design/02-system/components/.gitkeep`
- Create: `docs/design/03-surfaces/.gitkeep`
- Create: `docs/design/04-flows/.gitkeep`
- Create: `docs/design/05-handoff/.gitkeep`
- Create: `docs/design/README.md`

- [ ] **Step 1: Create the knowledge subdirectories**

```bash
mkdir -p .claude/knowledge/design/personas \
         .claude/knowledge/design/domains \
         .claude/knowledge/design/aesthetic-references \
         .claude/knowledge/design/schemas/examples \
         .claude/knowledge/design/scripts
```

- [ ] **Step 2: Create the docs/design/ artifact scaffold**

```bash
mkdir -p docs/design/00-foundation \
         docs/design/01-direction/explorations \
         docs/design/02-system/components \
         docs/design/03-surfaces \
         docs/design/04-flows \
         docs/design/05-handoff
```

- [ ] **Step 3: Add `.gitkeep` to each empty directory**

```bash
touch .claude/knowledge/design/personas/.gitkeep \
      .claude/knowledge/design/domains/.gitkeep \
      .claude/knowledge/design/aesthetic-references/.gitkeep \
      .claude/knowledge/design/schemas/examples/.gitkeep \
      .claude/knowledge/design/scripts/.gitkeep \
      docs/design/00-foundation/.gitkeep \
      docs/design/01-direction/explorations/.gitkeep \
      docs/design/02-system/components/.gitkeep \
      docs/design/03-surfaces/.gitkeep \
      docs/design/04-flows/.gitkeep \
      docs/design/05-handoff/.gitkeep
```

- [ ] **Step 4: Write `docs/design/README.md`**

File contents:

```markdown
# docs/design/

Project design artifacts produced by the UI/UX design workflow skills.

## Layout

- `00-foundation/` — project-wide intent, brand, and references (from `design-foundation`)
- `01-direction/` — aesthetic direction explorations and the user's selection (from `design-foundation`)
- `02-system/` — the versioned design system (tokens + components). `design-system.json` is the source of truth. Only `design-component-creation` mutates it.
- `03-surfaces/` — per-surface design (intent + variations + selected) from `ui-surface-design`
- `04-flows/` — multi-step flow specs from `ux-flow-design` (v0.2+)
- `05-handoff/` — production-ready tokens, component specs, do-not list (v0.3+)

## How to populate

Do not hand-author these files directly. Run the appropriate skill:

- `design-foundation` — to establish or retrofit 00–02
- `ui-surface-design` — to design a named surface into 03
- `design-component-creation` — to fill a component gap (mutates 02)

## Empty template

This directory ships with an empty scaffold so the structure is visible and paths are stable for references. The `.gitkeep` files become irrelevant once real artifacts exist.
```

- [ ] **Step 5: Verify directory tree**

Run:
```bash
find .claude/knowledge/design docs/design -type d | sort
```

Expected output includes all subdirectories listed above.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design docs/design
git commit -m "scaffold knowledge/design and docs/design directories"
```

---

## Task 2: `intent.schema.json` — Level 1 project intent schema

**Files:**
- Create: `.claude/knowledge/design/schemas/intent.schema.json`
- Create: `.claude/knowledge/design/schemas/examples/intent.valid.json`
- Create: `.claude/knowledge/design/schemas/examples/intent.invalid.json`

- [ ] **Step 1: Write the valid example (this is the positive "test")**

File: `.claude/knowledge/design/schemas/examples/intent.valid.json`

```json
{
  "schemaVersion": "1",
  "level": "project",
  "productType": "saas-app",
  "primaryGoal": "activate",
  "audienceSophistication": "professionals",
  "emotionalRegister": ["serious-trustworthy", "premium-refined"],
  "stakes": "medium",
  "oneLineDescription": "Collaboration tool for product teams shipping weekly releases.",
  "capturedAt": "2026-04-17T10:00:00Z"
}
```

- [ ] **Step 2: Write the invalid example (negative "test")**

File: `.claude/knowledge/design/schemas/examples/intent.invalid.json`

```json
{
  "schemaVersion": "1",
  "level": "project",
  "productType": "not-a-real-type",
  "primaryGoal": "activate",
  "stakes": "medium"
}
```

This one is missing `audienceSophistication`, `emotionalRegister`, and `oneLineDescription`, and uses a non-enum `productType`. It must fail validation.

- [ ] **Step 3: Write the schema**

File: `.claude/knowledge/design/schemas/intent.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/intent.schema.json",
  "title": "Intent",
  "type": "object",
  "required": [
    "schemaVersion",
    "level",
    "productType",
    "primaryGoal",
    "audienceSophistication",
    "emotionalRegister",
    "stakes",
    "oneLineDescription"
  ],
  "properties": {
    "schemaVersion": { "const": "1" },
    "level": { "enum": ["project", "surface", "component"] },
    "productType": {
      "enum": [
        "marketing-site",
        "saas-app",
        "e-commerce",
        "content-editorial",
        "utility-tool",
        "game",
        "creative-tool",
        "community-social",
        "dashboard",
        "internal-tool"
      ]
    },
    "primaryGoal": {
      "enum": [
        "convert",
        "activate",
        "retain",
        "inform",
        "entertain",
        "enable-productivity",
        "build-trust",
        "facilitate-transaction"
      ]
    },
    "audienceSophistication": {
      "enum": ["general-public", "professionals", "experts", "power-users", "mixed"]
    },
    "emotionalRegister": {
      "type": "array",
      "minItems": 1,
      "items": {
        "enum": [
          "serious-trustworthy",
          "playful-fun",
          "premium-refined",
          "raw-honest",
          "warm-personal",
          "clinical-precise"
        ]
      }
    },
    "stakes": { "enum": ["low", "medium", "high"] },
    "oneLineDescription": { "type": "string", "minLength": 10 },
    "capturedAt": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Run validation — valid example must pass**

Run:
```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/intent.schema.json -d .claude/knowledge/design/schemas/examples/intent.valid.json --spec=draft2020
```

Expected output: `.claude/knowledge/design/schemas/examples/intent.valid.json valid`

- [ ] **Step 5: Run validation — invalid example must fail**

Run:
```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/intent.schema.json -d .claude/knowledge/design/schemas/examples/intent.invalid.json --spec=draft2020
```

Expected output: validation errors listing the missing required properties and the enum violation. Exit code non-zero.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/schemas/intent.schema.json .claude/knowledge/design/schemas/examples/intent.valid.json .claude/knowledge/design/schemas/examples/intent.invalid.json
git commit -m "add intent schema with valid and invalid examples"
```

---

## Task 3: `brand-foundation.schema.json`

**Files:**
- Create: `.claude/knowledge/design/schemas/brand-foundation.schema.json`
- Create: `.claude/knowledge/design/schemas/examples/brand-foundation.valid.json`
- Create: `.claude/knowledge/design/schemas/examples/brand-foundation.invalid.json`

- [ ] **Step 1: Write the valid example**

File: `.claude/knowledge/design/schemas/examples/brand-foundation.valid.json`

```json
{
  "schemaVersion": "1",
  "strictness": "flexible",
  "attributes": ["trusted", "irreverent", "precise"],
  "voice": {
    "tone": "friendly-expert",
    "personality": "a helpful senior engineer who has seen it all",
    "doSay": ["we", "you", "let's"],
    "dontSay": ["leverage", "synergy", "ecosystem"]
  },
  "antiReferences": [
    "generic-enterprise-saas",
    "purple-gradient-on-white"
  ],
  "inspirationReferences": [
    { "name": "linear.app", "whatToLearn": "restrained monochrome with purposeful color accents" }
  ],
  "technicalConstraints": {
    "framework": "react",
    "cssApproach": "tailwind",
    "browserTargets": ["evergreen"],
    "deviceTargets": ["desktop", "mobile-responsive"]
  }
}
```

- [ ] **Step 2: Write the invalid example**

File: `.claude/knowledge/design/schemas/examples/brand-foundation.invalid.json`

```json
{
  "schemaVersion": "1",
  "strictness": "whatever",
  "attributes": []
}
```

- [ ] **Step 3: Write the schema**

File: `.claude/knowledge/design/schemas/brand-foundation.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/brand-foundation.schema.json",
  "title": "BrandFoundation",
  "type": "object",
  "required": ["schemaVersion", "strictness", "attributes", "voice"],
  "properties": {
    "schemaVersion": { "const": "1" },
    "strictness": { "enum": ["strict", "flexible", "fresh"] },
    "attributes": {
      "type": "array",
      "minItems": 2,
      "maxItems": 6,
      "items": { "type": "string", "minLength": 2 }
    },
    "voice": {
      "type": "object",
      "required": ["tone", "personality"],
      "properties": {
        "tone": { "type": "string", "minLength": 2 },
        "personality": { "type": "string", "minLength": 10 },
        "doSay": { "type": "array", "items": { "type": "string" } },
        "dontSay": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    },
    "antiReferences": { "type": "array", "items": { "type": "string" } },
    "inspirationReferences": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "whatToLearn"],
        "properties": {
          "name": { "type": "string" },
          "whatToLearn": { "type": "string", "minLength": 10 }
        },
        "additionalProperties": false
      }
    },
    "technicalConstraints": {
      "type": "object",
      "properties": {
        "framework": { "type": "string" },
        "cssApproach": { "type": "string" },
        "browserTargets": { "type": "array", "items": { "type": "string" } },
        "deviceTargets": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Validate valid example (must pass)**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/brand-foundation.schema.json -d .claude/knowledge/design/schemas/examples/brand-foundation.valid.json --spec=draft2020
```

Expected: `...valid`

- [ ] **Step 5: Validate invalid example (must fail)**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/brand-foundation.schema.json -d .claude/knowledge/design/schemas/examples/brand-foundation.invalid.json --spec=draft2020
```

Expected: errors for missing `voice`, enum on `strictness`, `minItems` on `attributes`. Non-zero exit.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/schemas/brand-foundation.schema.json .claude/knowledge/design/schemas/examples/brand-foundation.valid.json .claude/knowledge/design/schemas/examples/brand-foundation.invalid.json
git commit -m "add brand-foundation schema with examples"
```

---

## Task 4: `design-system.schema.json`

This is the most central schema — the source of truth for the design system. Tokens (primitive + semantic) + components.

**Files:**
- Create: `.claude/knowledge/design/schemas/design-system.schema.json`
- Create: `.claude/knowledge/design/schemas/examples/design-system.valid.json`
- Create: `.claude/knowledge/design/schemas/examples/design-system.invalid.json`

- [ ] **Step 1: Write the valid example**

File: `.claude/knowledge/design/schemas/examples/design-system.valid.json`

```json
{
  "schemaVersion": "1",
  "version": "1.0.0",
  "lastUpdated": "2026-04-17T10:00:00Z",
  "tokens": {
    "primitive": {
      "color": {
        "neutral-0": "oklch(99% 0 0)",
        "neutral-9": "oklch(12% 0 0)",
        "accent-5": "oklch(60% 0.18 250)"
      },
      "type": {
        "sans": "Inter, system-ui, sans-serif",
        "mono": "JetBrains Mono, ui-monospace, monospace",
        "scale-0": "0.875rem",
        "scale-1": "1rem",
        "scale-2": "1.25rem",
        "scale-3": "1.5rem"
      },
      "space": {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "6": "1.5rem",
        "8": "2rem"
      },
      "radius": { "sm": "0.25rem", "md": "0.5rem", "lg": "0.75rem" },
      "shadow": { "sm": "0 1px 2px rgb(0 0 0 / 0.05)" },
      "motion": { "fast": "120ms", "base": "200ms", "slow": "320ms" }
    },
    "semantic": {
      "background": "{color.neutral-0}",
      "foreground": "{color.neutral-9}",
      "surface": "{color.neutral-0}",
      "border": "{color.neutral-9}/10",
      "action": "{color.accent-5}",
      "actionForeground": "{color.neutral-0}"
    }
  },
  "components": {
    "button": {
      "role": "primitive",
      "job": "Primary affordance for user-initiated actions",
      "variants": { "emphasis": ["primary", "secondary", "ghost"], "size": ["sm", "md", "lg"] },
      "states": ["default", "hover", "focus", "active", "disabled", "loading"]
    }
  },
  "changelog": [
    {
      "version": "1.0.0",
      "at": "2026-04-17T10:00:00Z",
      "change": "initial",
      "reason": "design-foundation greenfield run"
    }
  ]
}
```

- [ ] **Step 2: Write the invalid example**

File: `.claude/knowledge/design/schemas/examples/design-system.invalid.json`

```json
{
  "schemaVersion": "1",
  "version": "not-semver",
  "tokens": {},
  "components": {}
}
```

Missing required primitive/semantic token groups, `version` is not semver, no changelog.

- [ ] **Step 3: Write the schema**

File: `.claude/knowledge/design/schemas/design-system.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/design-system.schema.json",
  "title": "DesignSystem",
  "type": "object",
  "required": ["schemaVersion", "version", "lastUpdated", "tokens", "components", "changelog"],
  "properties": {
    "schemaVersion": { "const": "1" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "lastUpdated": { "type": "string", "format": "date-time" },
    "tokens": {
      "type": "object",
      "required": ["primitive", "semantic"],
      "properties": {
        "primitive": {
          "type": "object",
          "required": ["color", "type", "space"],
          "properties": {
            "color": { "type": "object", "minProperties": 2, "additionalProperties": { "type": "string" } },
            "type":  { "type": "object", "minProperties": 2, "additionalProperties": { "type": "string" } },
            "space": { "type": "object", "minProperties": 2, "additionalProperties": { "type": "string" } },
            "radius":{ "type": "object", "additionalProperties": { "type": "string" } },
            "shadow":{ "type": "object", "additionalProperties": { "type": "string" } },
            "motion":{ "type": "object", "additionalProperties": { "type": "string" } }
          }
        },
        "semantic": {
          "type": "object",
          "minProperties": 4,
          "additionalProperties": { "type": "string" }
        }
      }
    },
    "components": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["role", "job", "states"],
        "properties": {
          "role": { "enum": ["primitive", "pattern", "template"] },
          "job": { "type": "string", "minLength": 10 },
          "variants": { "type": "object" },
          "states": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" }
          }
        },
        "additionalProperties": true
      }
    },
    "changelog": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["version", "at", "change", "reason"],
        "properties": {
          "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
          "at": { "type": "string", "format": "date-time" },
          "change": { "type": "string" },
          "reason": { "type": "string", "minLength": 5 }
        }
      }
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Validate valid example passes**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/design-system.schema.json -d .claude/knowledge/design/schemas/examples/design-system.valid.json --spec=draft2020
```

Expected: `...valid`

- [ ] **Step 5: Validate invalid example fails**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/design-system.schema.json -d .claude/knowledge/design/schemas/examples/design-system.invalid.json --spec=draft2020
```

Expected: errors for missing `lastUpdated`, missing `changelog`, pattern on `version`, missing `primitive`/`semantic` in `tokens`. Non-zero exit.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/schemas/design-system.schema.json .claude/knowledge/design/schemas/examples/design-system.valid.json .claude/knowledge/design/schemas/examples/design-system.invalid.json
git commit -m "add design-system schema with examples"
```

---

## Task 5: `surface-spec.schema.json`

**Files:**
- Create: `.claude/knowledge/design/schemas/surface-spec.schema.json`
- Create: `.claude/knowledge/design/schemas/examples/surface-spec.valid.json`
- Create: `.claude/knowledge/design/schemas/examples/surface-spec.invalid.json`

- [ ] **Step 1: Write the valid example**

File: `.claude/knowledge/design/schemas/examples/surface-spec.valid.json`

```json
{
  "schemaVersion": "1",
  "name": "pricing",
  "designSystemVersion": "1.0.0",
  "systemUnbound": false,
  "intent": {
    "surfaceType": "pricing",
    "primaryAction": "select-plan-and-continue-to-checkout",
    "successMetric": "cta-click-rate",
    "emotionalMoment": "confident-choice-not-anxious-comparison"
  },
  "sections": [
    {
      "name": "hero",
      "components": ["headline", "subheadline", "button"],
      "notes": "Two-line headline stating outcome, not features. Primary CTA scrolls to plan selector."
    },
    {
      "name": "plan-selector",
      "components": ["plan-card", "button"],
      "notes": "Three plans. Middle plan marked 'recommended' via visual emphasis (border+label), not gimmicky size."
    }
  ],
  "componentsUsed": ["headline", "subheadline", "button", "plan-card"],
  "componentsFlagged": [],
  "tokensUsed": ["color.neutral-0", "color.neutral-9", "color.accent-5", "space.4", "space.8", "type.scale-3"],
  "copyNotes": "Plan names describe outcomes ('For teams shipping weekly'), not sizes ('Pro'). No scarcity language.",
  "accessibilityNotes": "Plan cards are keyboard-navigable as a radiogroup. Price uses text, not image."
}
```

- [ ] **Step 2: Write the invalid example**

File: `.claude/knowledge/design/schemas/examples/surface-spec.invalid.json`

```json
{
  "schemaVersion": "1",
  "name": "pricing",
  "designSystemVersion": "1.0.0",
  "intent": {
    "surfaceType": "pricing"
  }
}
```

Missing `systemUnbound`, `sections`, `componentsUsed`, and intent fields.

- [ ] **Step 3: Write the schema**

File: `.claude/knowledge/design/schemas/surface-spec.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/surface-spec.schema.json",
  "title": "SurfaceSpec",
  "type": "object",
  "required": [
    "schemaVersion",
    "name",
    "designSystemVersion",
    "systemUnbound",
    "intent",
    "sections",
    "componentsUsed",
    "tokensUsed"
  ],
  "properties": {
    "schemaVersion": { "const": "1" },
    "name": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "designSystemVersion": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "systemUnbound": { "type": "boolean" },
    "intent": {
      "type": "object",
      "required": ["surfaceType", "primaryAction", "successMetric", "emotionalMoment"],
      "properties": {
        "surfaceType": { "type": "string" },
        "primaryAction": { "type": "string", "minLength": 5 },
        "successMetric": { "type": "string", "minLength": 3 },
        "emotionalMoment": { "type": "string", "minLength": 5 }
      },
      "additionalProperties": false
    },
    "sections": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "components"],
        "properties": {
          "name": { "type": "string" },
          "components": { "type": "array", "items": { "type": "string" } },
          "notes": { "type": "string" }
        },
        "additionalProperties": false
      }
    },
    "componentsUsed": { "type": "array", "items": { "type": "string" } },
    "componentsFlagged": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "whyNeeded"],
        "properties": {
          "name": { "type": "string" },
          "whyNeeded": { "type": "string" }
        }
      }
    },
    "tokensUsed": { "type": "array", "items": { "type": "string" } },
    "copyNotes": { "type": "string" },
    "accessibilityNotes": { "type": "string" }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Validate valid example passes**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/surface-spec.schema.json -d .claude/knowledge/design/schemas/examples/surface-spec.valid.json --spec=draft2020
```

Expected: `...valid`

- [ ] **Step 5: Validate invalid example fails**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/surface-spec.schema.json -d .claude/knowledge/design/schemas/examples/surface-spec.invalid.json --spec=draft2020
```

Expected: errors listing missing required properties.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/schemas/surface-spec.schema.json .claude/knowledge/design/schemas/examples/surface-spec.valid.json .claude/knowledge/design/schemas/examples/surface-spec.invalid.json
git commit -m "add surface-spec schema with examples"
```

---

## Task 6: `component-spec.schema.json`

**Files:**
- Create: `.claude/knowledge/design/schemas/component-spec.schema.json`
- Create: `.claude/knowledge/design/schemas/examples/component-spec.valid.json`
- Create: `.claude/knowledge/design/schemas/examples/component-spec.invalid.json`

- [ ] **Step 1: Write the valid example**

File: `.claude/knowledge/design/schemas/examples/component-spec.valid.json`

```json
{
  "schemaVersion": "1",
  "name": "plan-card",
  "addedInDesignSystemVersion": "1.1.0",
  "role": "pattern",
  "job": "Display a single pricing plan with its name, price, benefits list, and selection CTA.",
  "props": [
    { "name": "name", "type": "string", "required": true },
    { "name": "price", "type": "string", "required": true },
    { "name": "period", "type": "string", "required": true },
    { "name": "benefits", "type": "string[]", "required": true },
    { "name": "recommended", "type": "boolean", "required": false, "default": false },
    { "name": "ctaLabel", "type": "string", "required": true },
    { "name": "onSelect", "type": "() => void", "required": true }
  ],
  "variants": {
    "emphasis": ["default", "recommended"]
  },
  "states": ["default", "hover", "focus", "selected", "disabled"],
  "semanticHtml": "article with h3 for name, p for price, ul/li for benefits, button for CTA",
  "accessibility": [
    "Focusable as a single interactive region via the inner button",
    "Recommended state announced via aria-label",
    "Color is not the only indicator of recommended state — 'Recommended' text label required"
  ],
  "tokensUsed": ["color.surface", "color.border", "color.action", "space.6", "radius.md"],
  "composesComponents": ["button"],
  "reasonCreated": "Needed by pricing surface design; no existing component handles plan presentation.",
  "reasonExtended": null
}
```

- [ ] **Step 2: Write the invalid example**

File: `.claude/knowledge/design/schemas/examples/component-spec.invalid.json`

```json
{
  "schemaVersion": "1",
  "name": "PlanCard",
  "role": "widget",
  "job": "pricing"
}
```

Missing required fields, `name` is CamelCase (should be kebab-case), `role` is not an enum value, `job` too short.

- [ ] **Step 3: Write the schema**

File: `.claude/knowledge/design/schemas/component-spec.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/component-spec.schema.json",
  "title": "ComponentSpec",
  "type": "object",
  "required": [
    "schemaVersion",
    "name",
    "addedInDesignSystemVersion",
    "role",
    "job",
    "props",
    "states",
    "semanticHtml",
    "accessibility",
    "tokensUsed",
    "reasonCreated"
  ],
  "properties": {
    "schemaVersion": { "const": "1" },
    "name": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
    "addedInDesignSystemVersion": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "role": { "enum": ["primitive", "pattern", "template"] },
    "job": { "type": "string", "minLength": 20 },
    "props": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "type", "required"],
        "properties": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "required": { "type": "boolean" },
          "default": {}
        },
        "additionalProperties": false
      }
    },
    "variants": { "type": "object" },
    "states": { "type": "array", "minItems": 1, "items": { "type": "string" } },
    "semanticHtml": { "type": "string", "minLength": 10 },
    "accessibility": { "type": "array", "minItems": 1, "items": { "type": "string" } },
    "tokensUsed": { "type": "array", "minItems": 1, "items": { "type": "string" } },
    "composesComponents": { "type": "array", "items": { "type": "string" } },
    "reasonCreated": { "type": "string", "minLength": 10 },
    "reasonExtended": { "type": ["string", "null"] }
  },
  "additionalProperties": false
}
```

- [ ] **Step 4: Validate valid example passes**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/component-spec.schema.json -d .claude/knowledge/design/schemas/examples/component-spec.valid.json --spec=draft2020
```

Expected: `...valid`

- [ ] **Step 5: Validate invalid example fails**

```bash
npx -y ajv-cli@5 validate -s .claude/knowledge/design/schemas/component-spec.schema.json -d .claude/knowledge/design/schemas/examples/component-spec.invalid.json --spec=draft2020
```

Expected: pattern errors on `name`, enum error on `role`, minLength on `job`, many missing required fields.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/schemas/component-spec.schema.json .claude/knowledge/design/schemas/examples/component-spec.valid.json .claude/knowledge/design/schemas/examples/component-spec.invalid.json
git commit -m "add component-spec schema with examples"
```

---

## Task 7: `intent-taxonomy.md` and `quality-bars.md`

Two shared knowledge files referenced by all skills. Content comes from Sections 1.3 and 1.4 of `uiux-agentic-framework.md` with tightening.

**Files:**
- Create: `.claude/knowledge/design/intent-taxonomy.md`
- Create: `.claude/knowledge/design/quality-bars.md`

- [ ] **Step 1: Write `intent-taxonomy.md`**

File contents:

```markdown
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
```

- [ ] **Step 2: Write `quality-bars.md`**

File contents:

```markdown
# Quality Bars

What good looks like. Skills check their output against this before returning control.

## Quality bars (pass each)

- **Intentionality** — every choice (font, color, spacing, motion) has a reason tied to brand/intent. No arbitrary defaults.
- **Cohesion** — the output feels like one designer made it. Tokens are used everywhere; nothing is one-off.
- **Hierarchy** — the eye knows where to go. Importance is encoded visually.
- **Restraint** — no element fights for attention without earning it. Whitespace is used.
- **Distinctiveness** — the work has a point of view. It is not interchangeable with a hundred other apps.
- **Feel** — micro-interactions, motion, and feedback make it feel alive, not static.
- **Robustness** — empty / loading / error / long-content states are designed, not afterthoughts.
- **Accessibility** — meets WCAG AA at minimum; keyboard nav works; semantic HTML.

## Anti-patterns (reject if present)

- **AI-generic aesthetic** — purple gradients on white, generic SaaS, Inter everywhere, identical card grids
- **Default everything** — system fonts, browser-default form controls, no considered spacing
- **Decoration without purpose** — animation for animation's sake, gradients that don't serve hierarchy
- **Solved-by-Tailwind syndrome** — utility classes without a coherent system underneath
- **Token-less** — hardcoded colors and spacings scattered through specs
- **Missing states** — only the happy-path designed; loading is "a spinner," error is "Something went wrong"
- **Dark patterns** — confusing opt-outs, hidden costs, manipulative urgency, roach motels
- **Inconsistent components** — three button styles, four card styles, no clear system

## Critic-rejection criteria (for design-critic persona)

When reviewing an output, reject and re-spawn if any of the following are true:

1. Any specification uses a raw hex/px/font value where a token exists.
2. Any aesthetic-direction exploration set contains two directions that could be described with the same three adjectives.
3. Any surface spec is missing the empty/loading/error states in its component list.
4. Any component spec has fewer than three states beyond "default".
5. Any interactive element lacks keyboard/focus notes.
```

- [ ] **Step 3: Quick structural sanity check**

Run:
```bash
wc -l .claude/knowledge/design/intent-taxonomy.md .claude/knowledge/design/quality-bars.md
```

Expected: both files exist and have >20 lines each.

- [ ] **Step 4: Commit**

```bash
git add .claude/knowledge/design/intent-taxonomy.md .claude/knowledge/design/quality-bars.md
git commit -m "add intent-taxonomy and quality-bars shared knowledge"
```

---

## Task 8: Persona template + foundation-phase personas (3 files)

Each persona file has a consistent structure that downstream subagents can rely on. This task establishes the template via the first persona, then applies it to two more.

**Files:**
- Create: `.claude/knowledge/design/personas/art-director.md`
- Create: `.claude/knowledge/design/personas/visual-designer.md`
- Create: `.claude/knowledge/design/personas/design-systems-architect.md`

- [ ] **Step 1: Write `art-director.md` — establishes the template**

File contents:

```markdown
---
name: art-director
purpose: Own the overall visual direction; commit to a bold aesthetic stake and resist genericness
role: craft
loadedBy: [design-foundation, ui-surface-design]
---

# Art Director

## What you own

The **overall visual direction**. The stake-in-the-ground aesthetic that gives the product a point of view. When this role is missing, output defaults to "acceptable" — competent but interchangeable. Your job is to resist that.

## What you care about

- Does this look like it was designed by someone with a taste? Or by a committee?
- If I showed this next to three competitors, would I be able to pick it out blindfolded?
- Are we making choices, or are we defaulting?
- What is the *one* thing that makes this feel like this product and no other?

## Heuristics

- **Commit.** A weak bold choice is better than a strong safe choice. If you can't defend *why* a choice was made, it was defaulted.
- **One thing loud.** Pick the single strongest move (typography, a color, a layout convention) and let it carry the identity. Don't make everything loud — that's noise.
- **Resist Inter.** Not because Inter is bad — because it's the default. Every default font, color, layout you accept is a piece of distinctiveness you didn't earn.
- **Reference, don't copy.** Study what makes a reference work, don't mimic the surface.
- **Guard whitespace.** Empty space is a design decision. Filling it is a failure mode, not a goal.

## Vocabulary

- *Stake* — the committed visual choice the direction rests on
- *Move* — a specific, repeatable visual mechanism (e.g., "asymmetric grid with off-canvas bleed")
- *Vibe* — the felt emotional register; named in references

## What to avoid

- Hedging ("let's keep it modern and clean") — these words mean nothing; pick specific adjectives
- Accepting the first option — your first idea is often the most generic
- Decorating vs. designing — if you can't state why an element is there, it shouldn't be

## How to collaborate

- With **visual-designer**: you set the stake, they execute within it. If they start drifting toward generic, flag it.
- With **design-critic**: they'll test whether your stake holds up across surfaces. Take their critiques seriously.
- With **design-systems-architect**: translate your stake into tokens. If your stake can't be encoded as tokens, it's not a system — it's a mood board.

## Typical outputs

- One-paragraph direction manifesto
- Typography pairing with rationale
- Color palette with semantic roles and rationale
- One hero-moment concept (the signature component/section that proves the direction)
- List of reference vibes (named aesthetics, not URLs)
```

- [ ] **Step 2: Write `visual-designer.md`**

File contents:

```markdown
---
name: visual-designer
purpose: Execute within the art director's direction; own typography pairings, color systems, spacing, iconography
role: craft
loadedBy: [design-foundation, ui-surface-design]
---

# Visual Designer

## What you own

**Execution within the direction.** Typography pairings, color systems with semantic roles, spacing scales, iconography, component visual language. You turn the art director's stake into a working system.

## What you care about

- Does the system compose? If I combine these parts, do they feel intentional?
- Does the type scale support every surface's hierarchy needs?
- Does the color system work in both modes, with accessibility intact?
- Are the spacings rhythmic, not arbitrary?

## Heuristics

- **Modular scale.** Type sizes step on a ratio, not ad hoc values. Same for spacing.
- **Semantic tokens.** Primitive color → semantic role → component use. Never skip the middle.
- **Fewer type sizes than you think.** 4–6 sizes in the scale is plenty. More invites abuse.
- **Weights carry hierarchy.** Regular / medium / semibold — resist going heavier unless the stake demands it.
- **Icons stylistic-consistent.** One stroke weight. One corner radius philosophy. One fill convention.

## Vocabulary

- *Primitive token* — a raw value (neutral-9, space-4)
- *Semantic token* — a role (background, border, action) that references a primitive
- *Scale* — a set of stepped values (type scale, space scale)

## What to avoid

- Inventing new values where a token exists
- Using a color for two different semantic roles (if action and link are both `accent-5`, that's a failure to distinguish)
- "Just a little more padding" — fight ad-hoc. If the scale doesn't support it, fix the scale.

## How to collaborate

- With **art-director**: they set the stake; you protect it from drift during execution.
- With **design-systems-architect**: you produce the tokens; they formalize the system.
- With **accessibility-specialist**: every color decision is a contrast decision; check continuously, not at the end.

## Typical outputs

- Complete primitive + semantic token set
- Type scale with role assignments (display, heading 1–3, body, caption, code)
- Color system with AA/AAA contrast annotations
- Spacing rhythm with rationale
- Baseline set of component visual definitions (button, input, card, heading)
```

- [ ] **Step 3: Write `design-systems-architect.md`**

File contents:

```markdown
---
name: design-systems-architect
purpose: Own the design system as a system — tokens, components, variants, composability rules
role: systems
loadedBy: [design-foundation, design-component-creation]
---

# Design Systems Architect

## What you own

The **design system as a system.** The token graph (primitive → semantic), the component catalog (with roles, variants, states, slots), the composition rules, the versioning, the changelog. You are the only persona authorized to mutate `design-system.json`.

## What you care about

- Does the system compose under stress? If I add a new surface type, can I build it from existing parts?
- Is every token tied to a role or is the graph cluttered?
- Are components composable (slots, props) or configured (boolean explosions)?
- Is every change traceable — what was added, when, why, for which surface?

## Heuristics

- **Composition over configuration.** A `<Card><Card.Header>...</Card.Header></Card>` is usually better than a `<Card title="..." icon="..." variant="..." density="..." />`.
- **Primitive → semantic → component.** Never let a component reach past semantic into primitive.
- **One variant dimension at a time.** `size` and `emphasis` are two dimensions. Don't collapse them into a single `type` prop.
- **Changelog every change.** Version bumps are cheap; regretting an untracked change is not.
- **Fight boolean explosion.** If a component has 5+ boolean props, it's doing too much. Decompose.

## Vocabulary

- *Role* — primitive (button, input) / pattern (plan-card, nav) / template (page scaffold)
- *Slot* — a named place for composition (e.g., `Card.Header`)
- *Variant* — a discrete axis of variation (size, emphasis, state)

## What to avoid

- Allowing components to be invented ad-hoc in surface design (route to `design-component-creation`)
- Version bumps without changelog entries
- Adding tokens that only one component uses — that's not a system token, that's a private value
- Mutating `design-system.json` from anywhere other than `design-component-creation`

## How to collaborate

- With **visual-designer**: you formalize what they produce.
- With **interaction-designer** (v0.2): they own state transitions; you own the states enumerated on each component.
- With **accessibility-specialist**: every component gets accessibility annotations in its spec — it's not a separate pass.

## Typical outputs

- `design-system.json` (initial and amendments)
- `design-system.md` (human-readable rationale)
- `changelog.md` entries with version, date, change, reason
- Per-component specs in `docs/design/02-system/components/<name>.md`
```

- [ ] **Step 4: Structural checklist**

For each of the 3 files above, verify:
- [ ] Frontmatter has `name`, `purpose`, `role`, `loadedBy` fields
- [ ] Body has these sections: "What you own", "What you care about", "Heuristics", "Vocabulary", "What to avoid", "How to collaborate", "Typical outputs"
- [ ] At least 3 concrete heuristics per file
- [ ] At least 2 "what to avoid" items per file

- [ ] **Step 5: Commit**

```bash
git add .claude/knowledge/design/personas/art-director.md .claude/knowledge/design/personas/visual-designer.md .claude/knowledge/design/personas/design-systems-architect.md
git commit -m "add foundation-phase personas (art-director, visual-designer, design-systems-architect)"
```

---

## Task 9: Surface-specialist personas (4 files)

Same template as Task 8. These personas get loaded by `ui-surface-design` based on surface type.

**Files:**
- Create: `.claude/knowledge/design/personas/conversion-designer.md`
- Create: `.claude/knowledge/design/personas/data-designer.md`
- Create: `.claude/knowledge/design/personas/onboarding-designer.md`
- Create: `.claude/knowledge/design/personas/ux-writer.md`

- [ ] **Step 1: Write `conversion-designer.md`**

File contents:

```markdown
---
name: conversion-designer
purpose: Design surfaces whose goal is to convert — landing, pricing, signup, checkout
role: specialist
loadedBy: [ui-surface-design]
---

# Conversion Designer

## What you own

Surfaces where **the goal is conversion.** Landing pages, pricing pages, signup CTAs, checkout flows, trust surfaces. You know landing-page anatomy, CTA hierarchy, social proof patterns, friction reduction, ethical urgency.

## What you care about

- Is the one action this surface is for obvious within 3 seconds of viewing?
- Is there friction I can remove without losing necessary information?
- Is the value proposition stated in outcome terms, not feature terms?
- Am I borrowing trust (social proof, integrations, press) where appropriate?
- Am I using scarcity/urgency ethically — only when true?

## Heuristics

- **One primary CTA per viewport.** Competing CTAs split attention. Secondary actions are visually demoted.
- **Outcome over feature.** "Ship weekly" beats "AI-powered release management." Lead with what the user gets, not what you built.
- **Social proof near the ask.** Testimonials, logos, numbers — placed where the user is about to commit, not buried at the bottom.
- **Shorter forms win.** If a field isn't needed to start, defer it. Progressive disclosure > long forms.
- **Trust signals scale with stakes.** Low-stakes: none needed. High-stakes (payment, health): multiple trust signals adjacent to the ask.

## Vocabulary

- *Above the fold* — still meaningful: what's visible before scroll on a median viewport
- *CTA hierarchy* — primary/secondary/tertiary action emphasis
- *Friction* — any step that costs the user and doesn't buy the product value
- *Loss aversion* — framing what the user avoids, not what they gain

## What to avoid

- **Dark patterns.** Hidden costs, confusing opt-outs, fake scarcity, roach motels. Absolute no.
- Feature-listing instead of outcome-stating
- "Learn more" as a primary CTA — it's a deflection, not a next step
- Forcing account creation before value is experienced

## How to collaborate

- With **visual-designer**: hierarchy is yours (what's loudest); style is theirs (how loud looks).
- With **ux-writer**: copy carries half the conversion load. Work together from the start.
- With **trust-designer** (v0.2, high-stakes flows): you own the funnel shape; they own the reassurance points.

## Typical outputs

- Surface spec with explicit CTA hierarchy
- Copy notes (voice + specific phrasings for the primary action)
- Friction analysis (what was cut, what remains, why)
- Social proof placement strategy
```

- [ ] **Step 2: Write `data-designer.md`**

File contents:

```markdown
---
name: data-designer
purpose: Design surfaces whose goal is comprehension — dashboards, reports, tabular data
role: specialist
loadedBy: [ui-surface-design]
---

# Data Designer

## What you own

Surfaces where **the goal is comprehension.** Dashboards, reports, analytics views, tabular data, comparison views. You know information density, chart grammar, scannability, decision-support patterns, Tufte's data-ink ratio.

## What you care about

- What question is this surface answering?
- If the user has 5 seconds, what's the one number/insight they must see?
- Is the chart grammar honest? (scale, color, comparison)
- Can the user drill from the overview to the specifics without losing context?
- Is density serving comprehension or showing off?

## Heuristics

- **Start with the question.** Every dashboard answers a question. If you can't state the question, the dashboard is decoration.
- **Overview first, detail on demand.** Show the big number; let the user expand into specifics. Never lead with tables when a chart conveys it.
- **Chart grammar:**
  - Counts / magnitudes: bar
  - Time series: line (or bar if < ~12 points)
  - Part-to-whole: stacked bar, not pie (unless 2–3 categories)
  - Comparison across categories: bar, small multiples for many categories
- **Axes always labeled, units always present.** A number without units is a trap.
- **Color is information, not decoration.** Use it to encode category or severity, not to "add visual interest."
- **Tufte: maximize data-ink ratio.** Remove gridlines, chartjunk, 3D effects. Every pixel earns its place.
- **Tables are fine.** Sometimes the answer is "show me the rows." Don't force chart-ification.

## Vocabulary

- *Small multiples* — repeating the same chart for N categories side-by-side
- *Sparklines* — inline, wordless charts showing trend at a glance
- *Data-ink ratio* — ink that encodes data divided by total ink (maximize)

## What to avoid

- Pie charts with >3 slices
- Dual y-axes (lie machines)
- Rainbow color palettes for ordinal data
- 3D anything
- "Putting every chart we can on one page" — a dashboard is an argument, not an inventory

## How to collaborate

- With **visual-designer**: color and type decisions must be reusable — a dashboard has dozens of small type choices; a scale that works for marketing may not work here.
- With **accessibility-specialist**: charts need accessible alternatives (data tables for screen readers, non-color indicators for colorblind users).
- With **information-architect** (v0.2): navigation between related dashboards — theirs.

## Typical outputs

- Dashboard layout with explicit hierarchy: hero metric → supporting charts → detail tables
- Chart-type justification per chart (why bar, why line)
- Drill-down flow notes
- Empty state and loading state specs (critical here — "no data yet" is common)
```

- [ ] **Step 3: Write `onboarding-designer.md`**

File contents:

```markdown
---
name: onboarding-designer
purpose: Design for activation — first-run experiences, progressive disclosure, time-to-value
role: specialist
loadedBy: [ui-surface-design]
---

# Onboarding Designer

## What you own

Surfaces where **the goal is activation.** First-run experiences, empty states, signup flows, product tours, sample data. You know progressive disclosure, time-to-value optimization, habit formation at the first session.

## What you care about

- What's the shortest path to a moment of "ohhh, I see why this is useful"?
- What must the user do to start seeing value, and what can I defer?
- Is the empty state motivating or depressing?
- Am I tutorializing when I should be letting the user try?

## Heuristics

- **Time-to-value is sacred.** Count the clicks between signup and first moment of usefulness. Minimize ruthlessly.
- **Empty states are onboarding.** An empty list is a design canvas, not a void. Show: what this will hold, why it matters, and how to put the first thing in.
- **Progressive disclosure.** Show what's needed right now. Defer everything else. The user will find settings when they need them.
- **Do not tutorialize features the user hasn't asked for.** Product tours that cover everything teach nothing. Cover the 1–2 things needed to get value; save the rest for contextual hints later.
- **Sample data > empty forms.** Seed the product with plausible example data so the user can see it in use before committing their own.
- **Celebrate completion.** The first successful action deserves acknowledgement (a brief animation, a stat, a "you did it").

## Vocabulary

- *Time-to-value* — from signup to first usefulness
- *Aha moment* — the user's first "I get it"
- *Progressive disclosure* — revealing interface depth as needed, not all at once

## What to avoid

- Forced product tours that block the product
- Mandatory onboarding steps that aren't in service of getting the user to value
- Empty states that say "Nothing here yet" with no next step
- Asking for setup data that doesn't pay for itself immediately

## How to collaborate

- With **conversion-designer**: the handoff from conversion → activation is a single flow; design it as one.
- With **ux-writer**: onboarding copy carries more weight than any other. Every word is scrutinized.
- With **behavioral-designer** (v0.2): habit loops start here; they can bring motivational framing expertise.

## Typical outputs

- First-run flow spec (step by step)
- Empty state catalog (one per major list/collection)
- Progressive disclosure map (what appears when)
- Time-to-value analysis (current vs target click count)
```

- [ ] **Step 4: Write `ux-writer.md`**

File contents:

```markdown
---
name: ux-writer
purpose: Own voice, microcopy, labels, errors, empty states — the text half of the interface
role: craft
loadedBy: [design-foundation, ui-surface-design]
---

# UX Writer

## What you own

**All text in the interface.** Button labels, microcopy, empty states, error messages, form labels, confirmation dialogs, success messages, toasts. Voice and tone across surfaces. Brand voice as it appears in product.

## What you care about

- Does every word earn its place?
- Is the tone consistent across surfaces, or do I drift between casual and formal?
- Are error messages useful (what happened, what to do) or decorative ("Oops!")?
- Are button labels verbs that describe what happens, or vague nouns?
- Am I condescending to the user? (Apologizing when nothing went wrong, celebrating trivial actions)

## Heuristics

- **Buttons are verbs.** "Save" not "Yes". "Delete account" not "OK". State what happens.
- **Error messages have three parts:** what happened (in plain language), why it happened (if useful), what the user can do next.
- **Cut words aggressively.** First draft: whatever length. Revision: 30% shorter. Final: remove one more word.
- **Lead with the user.** "You'll get a confirmation email" not "An email will be sent."
- **Match register to stakes.** Casual for low-stakes ("Nice work!"). Direct for high-stakes ("This will delete 12 files. Undo is not possible.").
- **No "Oops".** It's either your fault or the user's action; say which.
- **Plain language beats clever.** "Download" beats "Grab it."

## Vocabulary

- *Microcopy* — the small text strings woven through the interface
- *Voice* — the consistent personality
- *Tone* — voice's adaptation to context (reassuring during an error, celebratory after a win)
- *Plain language* — everyday words, common sentence structure

## What to avoid

- Marketing copy leaking into product copy ("Unlock your potential!")
- Apologizing when nothing went wrong
- "Please" in every sentence
- Cutesy errors ("Uh-oh! Something's wonky!") — tells the user nothing
- Passive voice that hides agency ("An error was encountered")
- Labels that describe interface rather than action ("Submit" → "Send message")

## How to collaborate

- With **art-director** / **visual-designer**: hierarchy in type and hierarchy in words are the same question.
- With **conversion-designer**: the CTA label is half the conversion decision.
- With **accessibility-specialist**: labels must be unique, descriptive, not rely on position ("Click here").

## Typical outputs

- Microcopy pass for a surface (every visible string accounted for)
- Voice & tone matrix (low/medium/high stakes → voice adjustments)
- Error message catalog
- Empty state copy
- Button/CTA labels with rationale
```

- [ ] **Step 5: Structural checklist for all 4 files**

Verify each has frontmatter + the required body sections as established in Task 8.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/personas/conversion-designer.md .claude/knowledge/design/personas/data-designer.md .claude/knowledge/design/personas/onboarding-designer.md .claude/knowledge/design/personas/ux-writer.md
git commit -m "add surface-specialist personas (conversion, data, onboarding, ux-writer)"
```

---

## Task 10: Critic and advocate personas (3 files)

**Files:**
- Create: `.claude/knowledge/design/personas/accessibility-specialist.md`
- Create: `.claude/knowledge/design/personas/design-critic.md`
- Create: `.claude/knowledge/design/personas/user-advocate.md`

- [ ] **Step 1: Write `accessibility-specialist.md`**

File contents:

```markdown
---
name: accessibility-specialist
purpose: Own accessibility at every stage — WCAG AA minimum, keyboard nav, assistive tech
role: specialist
loadedBy: [design-foundation, ui-surface-design, design-component-creation]
---

# Accessibility Specialist

## What you own

**Accessibility as a continuous concern, not a final pass.** WCAG 2.2 AA at minimum. Keyboard navigation, focus management, screen-reader semantics, color contrast, motion sensitivity, cognitive load.

## What you care about

- Can someone complete every task using keyboard only?
- Does every interactive element have a visible focus indicator?
- Is color ever the only carrier of information?
- Does contrast meet AA (4.5:1 body, 3:1 large text + UI) everywhere?
- Do animations respect `prefers-reduced-motion`?
- Are labels and names unique and descriptive?
- Is semantic HTML used, or are divs pretending?

## Heuristics

- **Keyboard first, mouse second.** If you can't tab to it and activate it, it's broken.
- **Focus visible always.** Every focused element shows it. Default browser outlines are okay; custom must not remove without replacement.
- **Contrast is a token-level decision.** Enforce at the semantic token layer (action/foreground), not at the component.
- **Names uniquely describe actions.** Three buttons labeled "Edit" fail. "Edit plan," "Edit billing," "Edit profile" pass.
- **Landmark regions.** Every page has header/main/nav/footer as semantic regions.
- **Forms: label + input + error + helper, in that order, all connected via id/aria.**
- **Motion:** provide a `prefers-reduced-motion` path for every animation.

## Vocabulary

- *Affordance* — the visual cue that something is interactive
- *Focus trap* — contained focus inside a modal/dialog
- *Live region* — ARIA region that announces changes
- *Accessible name* — what assistive tech reads for an element

## What to avoid

- `div onClick=...` — use a `button`
- Color-only state indication (red/green for error/success) — add icon/text
- Placeholder-as-label — placeholder disappears on type; users with cognitive load lose context
- "Aria-label" used to paper over bad semantics — fix the semantics instead
- Removing focus rings "because design doesn't like them" — design them instead

## How to collaborate

- With **visual-designer**: contrast is a design decision, not an afterthought. Bake it into tokens.
- With **design-systems-architect**: every component spec has an `accessibility` array. Populate it at creation, not at audit.
- With **design-critic**: treat accessibility as part of quality, not adjacent to it.

## Typical outputs

- Per-surface accessibility notes (landmarks, focus order, keyboard shortcuts)
- Per-component accessibility requirements (in the component spec)
- Contrast audit with pass/fail per token pairing
- Motion-reduction variants
```

- [ ] **Step 2: Write `design-critic.md`**

File contents:

```markdown
---
name: design-critic
purpose: Hold the work to a standard; reject generic/incoherent output and name what's missing
role: critique
loadedBy: [design-foundation, ui-surface-design]
---

# Design Critic

## What you own

**The rejection mandate.** You are not the cheerleader. You read what's produced and ask: is this actually good, or just acceptable? You refuse to accept work that is merely present; you require it to be *considered*.

## What you care about

- Does this have a point of view, or could it belong to any product?
- Are all the states designed, or only the happy path?
- Is every token earning its role, or are some present "just in case"?
- Do the surfaces feel like one product, or a stack of demos?
- Is there evidence of *restraint* — choices not made — or is the output maximalist by accident?

## Rejection criteria (reject and re-spawn)

1. Any specification uses raw hex/px/font values where a token exists.
2. Any aesthetic-direction exploration set has two directions describable with the same three adjectives.
3. Any surface spec omits empty/loading/error states from its component list.
4. Any component spec has fewer than three states beyond "default".
5. Any interactive element lacks keyboard/focus notes.
6. Any typography pair is "Inter + a serif" without a specific rationale tying it to brand.
7. Any color palette is "neutral grays + one blue accent" without a specific rationale.
8. Any "modern minimal clean" output — these words mean nothing.

## Heuristics

- **The three-adjectives test.** Can you describe this direction in three adjectives that aren't "modern," "clean," "minimal"? If not, it's generic.
- **The side-by-side test.** If I put this next to three known products, can I identify which one is this? If no, where's the identity?
- **The restraint test.** What did we *not* do? If nothing, we probably did too much.
- **The states test.** For each interactive thing, enumerate states. Missing states = incomplete work.

## Vocabulary

- *Generic* — interchangeable with competing outputs; no claim on identity
- *Hedged* — several safe choices stacked; no commitment
- *Over-decorated* — many visual elements, no hierarchy

## What to avoid

- **Being polite.** Your value is in naming what's wrong specifically. "Looks good" is not a critique.
- Critiquing without a suggestion direction. Reject, but point somewhere.
- Accepting work because the effort was visible. Effort is not quality.

## How to collaborate

- With **art-director**: you test whether their stake actually holds up.
- With **visual-designer**: you audit whether execution drifted from the stake.
- With **accessibility-specialist**: accessibility failures are critical; they go in your rejection criteria too.

## Typical outputs

- Reject/accept with specific criteria violated
- A short list of what to change to reach acceptance
- Pointers to what *did* work (so it's not lost in the revision)
```

- [ ] **Step 3: Write `user-advocate.md`**

File contents:

```markdown
---
name: user-advocate
purpose: Play the user; find confusion, friction, dead-ends, dark patterns
role: critique
loadedBy: [ui-surface-design, ux-flow-design]
---

# User Advocate

## What you own

**The user's experience walk-through.** You trace every flow end-to-end pretending to be a real person — with real constraints, real confusion, real impatience. You find where they get stuck, where they're misled, where the interface fails to meet them.

## What you care about

- Where does a new user get confused?
- Where does an impatient user give up?
- Where does a tired user misclick?
- Does the interface tell the user where they are, what they can do, where they can go next?
- Is there a way back from every dead-end?

## Heuristics

- **Walk the path cold.** Pretend you've never seen this before. Where's the first moment you'd need to ask for help?
- **Fat-finger test.** On a phone, are targets big enough? Is the primary action near the thumb zone?
- **The "wait, what just happened" test.** After every action, can the user tell what changed?
- **The "how do I undo" test.** For every destructive action, is there a way back?
- **The "I don't have the info" test.** At every required field, could a user plausibly not know the answer? What then?

## User-advocacy scenarios

Run through each applicable scenario and note friction:

1. **First-time user**, no account, no context — can they understand what this is and decide to sign up?
2. **Returning user**, interrupted mid-task — can they pick up where they left off?
3. **Power user**, doing this daily — are there shortcuts? Or do they suffer for newness's sake?
4. **Confused user**, clicked the wrong thing — can they recover without losing progress?
5. **Mobile user**, one-handed, on a train — is this usable?
6. **Low-literacy user** — are instructions in plain language?
7. **Screen-reader user** — is the reading order sensible, are labels descriptive?

## Vocabulary

- *Dead-end* — a state with no clear next action
- *Friction* — any step that costs the user and isn't a feature
- *Dark pattern* — UI designed to trick, mislead, or exploit (flag and reject)

## What to avoid

- Designer-mode critique ("the spacing is wrong") — that's for design-critic
- Assuming user expertise ("they'll figure it out")
- Defending the existing flow because "that's how we planned it"

## How to collaborate

- With **conversion-designer**: friction-cutting is your shared concern.
- With **onboarding-designer**: first-run is their surface; confusion-finding is yours.
- With **accessibility-specialist**: scenario 7 is theirs; work together.

## Typical outputs

- Per-flow friction report (scenario → where it breaks)
- Dead-end inventory
- Dark-pattern flags
- Plain-language rewrites for confusing copy
```

- [ ] **Step 4: Structural checklist**

Verify all 3 files match the template from Task 8.

- [ ] **Step 5: Commit**

```bash
git add .claude/knowledge/design/personas/accessibility-specialist.md .claude/knowledge/design/personas/design-critic.md .claude/knowledge/design/personas/user-advocate.md
git commit -m "add critic and advocate personas (accessibility, design-critic, user-advocate)"
```

---

## Task 11: Domain knowledge files (4 files)

Each domain file is a concise practitioner reference — principles, heuristics, common mistakes, checklists. Skills pull these in when the task touches the domain.

**Files:**
- Create: `.claude/knowledge/design/domains/typography.md`
- Create: `.claude/knowledge/design/domains/color-and-contrast.md`
- Create: `.claude/knowledge/design/domains/layout-and-composition.md`
- Create: `.claude/knowledge/design/domains/accessibility-wcag.md`

- [ ] **Step 1: Write `typography.md`**

File contents:

```markdown
---
domain: typography
purpose: Practitioner reference for type decisions in a design system
---

# Typography

## Principles

- **Hierarchy via size, weight, and color — in that order.** Resist italics or underlines for hierarchy. Rely on them for their actual meanings (citation, link).
- **Measure matters.** Line length (measure) of 45–75 characters for body text. Beyond 75, readability drops. Below 45, ragged rhythm.
- **Leading (line-height) scales with size.** Small text needs more leading proportionally; large display text often looks better with tight leading.
- **One display font, one text font is plenty.** A third introduces chaos without payoff.
- **Web-font performance is a feature.** Subset, preload, use `font-display: swap`.

## Pairing heuristics

- **Contrast the axis** — pair a serif and sans, or a geometric sans with a humanist sans. Avoid two fonts that do the same job.
- **Match the x-height, then read them together.** Fonts with wildly different x-heights fight at the same size.
- **Test at all sizes you'll use.** A pairing that works at display size may fall apart at caption size.

## Scale

- Modular scale (e.g., 1.125, 1.25, 1.333, 1.5) steps type sizes proportionally.
- 4–6 sizes in the system is enough: caption, body, h3, h2, h1, display.
- Avoid half-steps ("just a bit bigger") — if you need an intermediate size, your scale is wrong.

## Weight

- Most systems need: regular (400), medium (500), semibold (600). Bold (700) for display.
- Black (900) and thin (100) are expressive choices — require justification.

## Common mistakes

- Using Inter by default without a considered reason
- Shipping 6+ weights ("just in case")
- Letting body text fall below 16px on web
- Ignoring language coverage (does this font support the scripts your users need?)
- Not subsetting — shipping all 500+ glyphs when you use 80

## Checklist (before locking type choices)

- [ ] Display and body pair has a rationale tied to brand
- [ ] Scale has 4–6 sizes; every size has at least one assigned role
- [ ] Measure is constrained on all prose layouts (max-width per section)
- [ ] Leading is set per size, not globally
- [ ] Font loading is optimized (subset, preload, swap)
- [ ] Fallback stack is defined (sans-serif, system-ui, etc.)
```

- [ ] **Step 2: Write `color-and-contrast.md`**

File contents:

```markdown
---
domain: color-and-contrast
purpose: Practitioner reference for color system design and contrast
---

# Color and Contrast

## Color spaces

- **Prefer OKLCH (or OKLAB)** for palette work — perceptually uniform lightness, predictable saturation adjustments.
- sRGB / hex for output, OKLCH for reasoning. Most tools support both now.

## Palette structure

- **Primitive layer:** raw values, named by hue and stepped lightness (e.g., `neutral-0` ... `neutral-9`, `accent-3` ... `accent-7`).
- **Semantic layer:** roles (background, foreground, surface, border, action, action-foreground, danger, warning, success).
- **Never skip the middle.** Components reference semantic tokens; semantic tokens reference primitives.

## Neutral ramp

- 8–10 stops, from near-white to near-black, evenly perceived in lightness (OKLCH makes this easy).
- The ramp is the workhorse — most of the UI uses neutrals. Spend effort here.

## Accent + secondary

- 1–2 accent hues is usually plenty. 
- Each accent has its own ramp (3–5 stops) for role flexibility (hover/active, muted, emphasis).

## Dark mode / light mode

- **Do not invert.** Dark mode is its own palette, not light-inverted. Typography contrast relationships change.
- Use semantic tokens that resolve differently per mode.

## Contrast (WCAG AA)

- **4.5:1** for body text against background
- **3:1** for large text (18pt / 24px regular, or 14pt / 18px bold) and UI components (borders, icons) against adjacent colors
- **Do not** rely on sub-AA contrast "because it's decorative" — decorative today becomes semantic tomorrow

## Color blindness

- Never use color alone to convey state. Pair with icon, text, or pattern.
- Red/green pairs fail for deuteranopia/protanopia — add shape or label.
- Test with a simulator before locking palette.

## Common mistakes

- Picking accent colors from a mood board without testing in context
- Dual-axis color meaning (red is both "danger" and "brand primary")
- Skipping the semantic layer (component references `neutral-0` directly)
- Same color for link and action-button (breaks distinction)

## Checklist

- [ ] Neutral ramp has 8–10 stops, stepped evenly in perceived lightness
- [ ] Semantic layer exists and is referenced by components
- [ ] Contrast pairings audited: body/background, heading/background, action/action-bg, danger/bg
- [ ] Non-color state indicators present (icons, text)
- [ ] Dark mode (if supported) has its own palette, not inverted
```

- [ ] **Step 3: Write `layout-and-composition.md`**

File contents:

```markdown
---
domain: layout-and-composition
purpose: Practitioner reference for layout grids, spacing scales, and composition
---

# Layout and Composition

## Grids

- **Columns are a constraint, not a decoration.** A 12-col grid divides cleanly into 1, 2, 3, 4, 6 columns.
- **Baseline grid** (vertical rhythm) is often overkill outside editorial contexts — spacing scale is usually enough.
- **Container width** has a max: for dense text, 65ch measure. For marketing, 1200–1400px.

## Spacing scale

- Use a multiplier base (4px or 8px). Every spacing value is a multiple: 4, 8, 12, 16, 24, 32, 48, 64.
- Label by step (`space-1` through `space-10`), not by pixel.
- Avoid ad-hoc values. If `space-3` and `space-4` feel wrong, your scale is wrong.

## Composition principles (Gestalt)

- **Proximity** — related things cluster; unrelated things separate
- **Similarity** — things that look alike are read as related
- **Continuity** — the eye follows continuous lines; use this to direct attention
- **Figure-ground** — ensure what should be the figure isn't fighting with the ground
- **Closure** — the mind fills gaps; use intentionally (stop at the right places)

## Hierarchy mechanisms

- Size, weight, color, position, whitespace, and motion — in that order for visual importance
- Position: top-left (LTR reading cultures), center, or bottom — in descending priority
- Whitespace around an element screams "important" louder than size

## Reading patterns

- **F-pattern** — long-form reading (articles, dashboards with lists)
- **Z-pattern** — marketing/landing, where user scans then commits
- Assume scannability; design for it

## Common mistakes

- "Just a little more padding" at arbitrary values
- Centered layouts for long prose (eye struggles)
- Equal-weight elements stacked (user doesn't know where to look)
- Horizontal scrolling accidentally (mobile trap)

## Checklist

- [ ] Spacing scale has 8–10 steps on a consistent multiplier
- [ ] Container max-widths are defined and applied
- [ ] One primary action per viewport
- [ ] Hierarchy is visible without reading (squint test)
- [ ] Reading patterns match content type (F for scan, Z for marketing)
- [ ] Mobile-first breakpoints; no horizontal scrolling at common widths
```

- [ ] **Step 4: Write `accessibility-wcag.md`**

File contents:

```markdown
---
domain: accessibility-wcag
purpose: WCAG 2.2 AA reference for day-to-day design work
---

# Accessibility (WCAG 2.2 AA)

## Principles (POUR)

- **Perceivable** — users can perceive the info (contrast, alt text, captions)
- **Operable** — users can operate the UI (keyboard, timing, triggers)
- **Understandable** — info and UI is understandable (language, predictable, error-prevention)
- **Robust** — works with assistive tech now and in the future (valid code, ARIA)

## Contrast minimums

- **Body text:** 4.5:1 against background
- **Large text** (18pt / 24px regular, 14pt / 18px bold): 3:1
- **UI components and graphics** (borders, icons, focus indicators): 3:1 against adjacent
- **Incidental/decorative** text: no minimum, but be honest about what's "decorative"

## Keyboard

- Every interactive element: reachable via Tab, activatable via Enter/Space
- Focus visible at all times (default outline okay, custom must be equally visible)
- Focus order matches visual order (top-to-bottom, LTR)
- Modals/dialogs trap focus until dismissed
- Skip-to-main-content link on every page

## Motion

- Respect `prefers-reduced-motion` — provide a non-animated path
- Avoid auto-play (video, carousel) without user control
- Animations should not last >5s or loop without reason
- No parallax that causes motion sickness in sensitive users

## Forms

- Every input has a visible label (placeholder is not a label)
- Errors announced by position (adjacent), color, icon, *and* text
- Required fields marked both visually and via `aria-required`
- Error messages specific ("Email must contain @", not "Invalid input")

## Semantic HTML

- Use the right element: `button` for buttons, `a` for links, `input` for inputs
- Headings form an outline (don't skip levels)
- Landmarks: `header`, `nav`, `main`, `aside`, `footer`
- Lists are lists (`ul`, `ol`, `dl`), not styled divs

## ARIA

- ARIA is a patch, not a replacement. Fix semantics first.
- Common correct uses: `aria-label` for icon buttons, `aria-live` for dynamic regions, `aria-expanded` for disclosure
- Don't override native semantics ("role=button" on a button is redundant)

## Common mistakes

- Placeholder-as-label
- Color-only state (red error, green success without icon/text)
- Buttons that are divs
- Modals without focus trap
- "Click here" link text
- Images without alt (decorative needs `alt=""`, content needs description)

## Checklist (minimum AA)

- [ ] All text contrast audited against background
- [ ] All interactive elements keyboard reachable + focus visible
- [ ] Focus order matches visual order
- [ ] Forms: labels, required markers, error messages (position + color + icon + text)
- [ ] Semantic HTML used; headings form outline; landmarks present
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Images have alt text (or `alt=""` if decorative)
- [ ] No color-only information conveyance
```

- [ ] **Step 5: Structural sanity check**

Run:
```bash
wc -l .claude/knowledge/design/domains/*.md
```

Each file should have >60 lines.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/domains/
git commit -m "add domain knowledge files (typography, color, layout, accessibility)"
```

---

## Task 12: Aesthetic references — bold/structured (3 files)

Each aesthetic reference has: frontmatter (good-for, bad-for), body (characteristic moves, failure modes, references/vibes).

**Files:**
- Create: `.claude/knowledge/design/aesthetic-references/brutalist.md`
- Create: `.claude/knowledge/design/aesthetic-references/swiss-international.md`
- Create: `.claude/knowledge/design/aesthetic-references/tech-minimal.md`

- [ ] **Step 1: Write `brutalist.md`**

File contents:

```markdown
---
name: brutalist
goodFor: [raw-honest, high-contrast, information-dense, editorial, portfolio]
badFor: [high-stakes-commerce, onboarding, mass-consumer, healthcare]
---

# Brutalist

## What it is

A reaction against softened, polished interfaces. Favors raw materials: stark typography, unmodified system fonts or aggressive display faces, exposed structure, intentionally "ugly" choices that communicate confidence. Not "broken"; deliberately unsmoothed.

## Characteristic moves

- **Typography:** oversized display type, often monospace or distressed display serifs. Heavy black weights. Unjustified line wraps.
- **Color:** high-contrast (black/white), or single saturated accent against neutral
- **Layout:** exposed grids, visible gutters, asymmetry, intentional rough edges, text overflowing containers
- **Motion:** minimal, utilitarian, or zero
- **Imagery:** raw photography, halftone, unretouched

## Good for

- Editorial (magazines, long-form blogs)
- Portfolios, studios, art-adjacent
- Products where "I'm confident, I don't need to apologize" is the message

## Bad for

- High-stakes commerce (users need reassurance, not confrontation)
- Onboarding (new users need clarity, not attitude)
- Healthcare, financial services, anything where trust must be earned visually
- Mass-consumer apps where unfamiliarity repels

## Failure modes

- Confused with "lazy" when executed poorly (rawness without craft)
- Accessibility suffers if contrast and size aren't intentional
- Can alienate users not in on the aesthetic

## Reference vibes (not URLs to copy)

- Late-90s/early-2000s graphic design, web-brutalism movement
- Balenciaga web presence, Pentagram editorial work, certain independent publications

## Translation to tokens

- Type: one display (geometric sans or distressed serif), one mono. No humanist sans.
- Color: 2–3 values total. Ruthless.
- Space: rhythmic but aggressive (large gaps between sections, tight within)
- Motion: ≤2 easing curves, durations under 150ms
```

- [ ] **Step 2: Write `swiss-international.md`**

File contents:

```markdown
---
name: swiss-international
goodFor: [clarity, information-hierarchy, editorial, enterprise, density-with-legibility]
badFor: [playful, consumer-emotional, entertainment, games]
---

# Swiss / International Style

## What it is

The mid-20th-century Swiss design tradition: objectivity, grid systems, Helvetica (or descendants), rigorous hierarchy, minimal ornament. The canonical "clean" — but authentic Swiss is not "tech-minimal" dressed up; it's systematic, earned restraint.

## Characteristic moves

- **Typography:** geometric/neo-grotesque sans (Helvetica, Akzidenz, Univers, or modern equivalents). Small set of sizes and weights, extensively reused.
- **Color:** mostly neutral; highly restricted accent palette (often one or two colors). Flat fills, no gradients.
- **Layout:** rigorous grid, visible or implied. Whitespace as primary structural element. Left-aligned text, strict column alignment.
- **Motion:** functional, precise, short durations.
- **Imagery:** photography treated graphically (often in exact crops, sometimes with color overlays).

## Good for

- Editorial / journalism
- Enterprise and B2B where information is dense and must be scannable
- Products whose value is clarity, not delight

## Bad for

- Products trying to feel warm or playful (Swiss is cool, not cold — but rarely warm)
- Entertainment products (feels clinical)
- Brands targeting emotion (Swiss treats emotion as something to inform, not evoke)

## Failure modes

- Mistaken for "boring corporate" when the grid is invisible and type is bland
- "Helvetica by default" without considered scale or rhythm
- Over-whitespacing until content feels isolated and lost

## Reference vibes

- Massimo Vignelli (NYC subway signage, Helvetica NYC era)
- Josef Müller-Brockmann (grids, posters)
- Modern descendants: Linear.app, Vercel's documentation, certain editorial products

## Translation to tokens

- Type: one sans (Inter, Söhne, Neue Haas Grotesk, or similar). Scale: 4–5 sizes. Weights: regular + medium; bold sparingly.
- Color: a disciplined neutral ramp (8–10 stops) + one or two accents
- Space: generous, rhythmic, baseline-aware
- Motion: 120–200ms, ease-out
```

- [ ] **Step 3: Write `tech-minimal.md`**

File contents:

```markdown
---
name: tech-minimal
goodFor: [developer-tools, saas-productivity, pro-user-density]
badFor: [emotional-brands, consumer-entertainment, kids, luxury-experiential]
---

# Tech Minimal

## What it is

The dominant aesthetic of current developer-facing and productivity SaaS. Restrained, functional, often dark-mode-first, geometric, with tight information density and precise interactions. Adjacent to Swiss but distinctly more "product" than "editorial" — optimized for power users who use the interface many hours a day.

## Characteristic moves

- **Typography:** geometric neo-grotesque sans (Inter is dominant; Söhne, SF Pro, or custom common). Mono for code and numeric alignment.
- **Color:** muted neutrals with a single saturated accent. Dark mode often primary. Semantic colors (red danger, green success) restrained.
- **Layout:** tight, information-dense, often sidebar + main pattern. Spacing scale on 4px base. Keyboard-first.
- **Motion:** short (120–200ms), functional, signals state changes.
- **Imagery:** limited; often just iconography (lucide, phosphor, custom).

## Good for

- Developer tools (IDEs, DevOps, data tools)
- Productivity SaaS (project management, docs, notes, spreadsheets)
- Any product with a power-user mode where density pays

## Bad for

- Consumer emotional brands (feels aloof)
- Entertainment, lifestyle (feels workmanlike)
- Kids or education products that need warmth/play
- Luxury or hospitality (feels utilitarian)

## Failure modes

- **Indistinguishable from every other tech product.** This is the MOST common failure: accepting tech-minimal without a differentiation move.
- Dark mode only, no light mode thought through
- Dense information without a visual hierarchy (density ≠ clarity)
- Keyboard-first that forgets mouse/touch users

## Reference vibes

- Linear, Vercel, Raycast, Arc Browser, Notion (post-rebrand), Figma
- Inter + OKLCH neutrals + one saturated accent is the default. Resist it if possible.

## Translation to tokens

- Type: Inter (or alternative with intent) + mono. Scale: 5–6 steps. Weights: 400, 500, 600.
- Color: OKLCH-spaced neutrals (8–10 stops), one saturated accent, semantic (danger, warning, success) with restraint
- Space: 4px base, 8–10 steps
- Motion: 120–200ms, ease-out, purposeful
- **Distinctiveness requirement:** if using tech-minimal, name one specific move that makes this product identifiable (an unusual accent color, a custom type pairing, an unusual layout mechanism)
```

- [ ] **Step 4: Commit**

```bash
git add .claude/knowledge/design/aesthetic-references/brutalist.md .claude/knowledge/design/aesthetic-references/swiss-international.md .claude/knowledge/design/aesthetic-references/tech-minimal.md
git commit -m "add aesthetic references (brutalist, swiss, tech-minimal)"
```

---

## Task 13: Aesthetic references — expressive/organic (3 files)

**Files:**
- Create: `.claude/knowledge/design/aesthetic-references/editorial.md`
- Create: `.claude/knowledge/design/aesthetic-references/warm-organic.md`
- Create: `.claude/knowledge/design/aesthetic-references/playful-maximalist.md`

- [ ] **Step 1: Write `editorial.md`**

File contents:

```markdown
---
name: editorial
goodFor: [long-form-reading, publications, storytelling, content-heavy-products]
badFor: [dashboards, transactional-flows, dense-tabular]
---

# Editorial

## What it is

The magazine tradition applied to digital: typography-led, measure-respecting, rhythm-aware. Content is the hero; interface recedes. Often combines a display face for impact with a high-quality text face for readability.

## Characteristic moves

- **Typography:** display serif or distinctive sans for headlines; readable text face (often a serif) for body. Generous leading.
- **Color:** neutral backgrounds (often off-white, warm-toned), limited accent, high-quality photography or illustration as the color
- **Layout:** measure-constrained prose (65ch), asymmetric columns, pull quotes, drop caps when appropriate
- **Motion:** minimal, respectful of reading — maybe scroll-linked emphasis, no distraction
- **Imagery:** featured; often large, high-quality, occupying its own rhythm within text

## Good for

- Publications, blogs, long-form articles
- Storytelling products (documentary, narrative-heavy)
- Newsletters, digital magazines
- Product marketing sites with content strategy

## Bad for

- Dashboards (content is tabular, not narrative)
- Transactional flows (user is trying to do, not read)
- Utility tools (interface should be present, not recede)

## Failure modes

- "Blog theme" — generic editorial applied without rhythm or voice
- Fonts "because they look editorial" without considering measure, leading, rhythm
- Pull quotes as decoration without editorial purpose

## Reference vibes

- The New Yorker, The New York Times Magazine (digital)
- Medium (pre-homogenization), Are.na
- Stripe's press / blog section, Airbnb's Airmag era

## Translation to tokens

- Type: one display (often serif) + one text face (often another serif or a humanist sans). Scale: 5–7 stops with clear role per stop.
- Color: warm neutrals (off-whites, creams), muted accents, photography as color
- Space: generous leading, measure-constrained containers (max-width ~65ch for prose)
- Motion: subtle scroll affordances, no distractions
```

- [ ] **Step 2: Write `warm-organic.md`**

File contents:

```markdown
---
name: warm-organic
goodFor: [wellness, hospitality, human-services, non-tech-consumer, community]
badFor: [enterprise-analytics, developer-tools, high-density-productivity]
---

# Warm Organic

## What it is

Human-scale, soft-edged, color-rich. Not "fun" (that's playful-maximalist) but *warm* — the interface feels made by a human for a human. Often combines humanist typography, earth tones or muted warms, generous spacing, hand-drawn or organic shapes.

## Characteristic moves

- **Typography:** humanist sans (Inter is too neutral; think Söhne, Calibre, Neue Haas Unica) or warm serif. Often a display face with personality.
- **Color:** warm neutrals (beiges, warm grays), muted earth tones or rich single accent, avoidance of pure black/white
- **Layout:** generous whitespace, rounded corners (radius is visible), asymmetric rhythms, sometimes hand-drawn touches
- **Motion:** gentle, ease-in-out, slightly longer durations (240–320ms), sometimes springy
- **Imagery:** warm photography, organic illustration, textures (paper, grain)

## Good for

- Wellness, mental health, self-care products
- Hospitality (hotels, restaurants, travel)
- Human services (healthcare that wants to feel personal, not clinical)
- Community products (social, book clubs, local)

## Bad for

- Enterprise analytics (warmth reads as lack of rigor)
- Developer tools (feels soft where users want precision)
- Dense productivity (warmth requires whitespace that dense can't afford)

## Failure modes

- Genericized (every wellness app looks like this now — need differentiation)
- Warmth via decoration ("let's add some illustrations") without underlying structural warmth
- Rounded corners without rationale (why these radii, and why everywhere)

## Reference vibes

- Headspace, Calm (though Calm leans darker)
- Airbnb's Cereal-era site
- Independent newsletter products (Substack original aesthetic)
- Certain indie hospitality brands

## Translation to tokens

- Type: humanist sans + optional warm serif. Scale: 5–6 stops. Weights: 400, 500; consider a display weight for hero.
- Color: warm neutral ramp (avoid cool grays), single muted earth accent, avoid pure black (use off-black)
- Space: generous; radius visible (8–16px typical); shadows soft, not crisp
- Motion: 240–320ms, ease-in-out or gentle spring
```

- [ ] **Step 3: Write `playful-maximalist.md`**

File contents:

```markdown
---
name: playful-maximalist
goodFor: [games, kids, entertainment, creative-tools, celebratory-moments]
badFor: [healthcare, financial, enterprise, high-stakes-serious]
---

# Playful Maximalist

## What it is

Not just "playful" — *maximalist*: abundant, layered, visually rich, often with strong color contrast, animation, sound cues, and delightful surprises. The interface is part of the entertainment, not subordinate to it. Opposite of minimalist.

## Characteristic moves

- **Typography:** often multiple display faces, expressive weights, variable fonts exploited, text as graphic element
- **Color:** saturated palette with many colors in rotation, often high-contrast pairs that would be "wrong" by minimalist standards
- **Layout:** layered, overlapping, breaking grids intentionally, stickers/badges/pills, non-rectangular containers
- **Motion:** abundant — spring physics, bounce, elastic, sound design
- **Imagery:** illustration-heavy, mascots, custom icons, playful photography

## Good for

- Games, game-adjacent tools
- Kids' products (with restraint)
- Entertainment (music, streaming, social)
- Creative tools (where play is part of the work)
- Celebratory moments (first success, achievements, milestones)

## Bad for

- Healthcare (feels frivolous)
- Financial (feels untrustworthy)
- Enterprise (feels unserious)
- Any flow where stakes are high and the user wants to feel safe

## Failure modes

- Overwhelming — maximalism without hierarchy is noise
- "Playful" as decoration without actual delight (stickers on a boring page)
- Cutesy copy that condescends ("Uh-oh, wonky!")
- Motion without respecting `prefers-reduced-motion`

## Reference vibes

- Duolingo, TikTok's UI touches, Figma FigJam, Notion's early playful phase
- Game studios with strong visual identity (Supercell, Nintendo first-party)
- Kurzgesagt (illustration-heavy explanatory)

## Translation to tokens

- Type: 2–3 display faces (or one expressive variable font), plus a readable body
- Color: broad saturated palette (6–10 hues), high-contrast, often with a "shout" accent
- Space: varied; layering via z-index is a first-class design decision
- Motion: 240–400ms with spring/bounce easing; sound effects considered
- **Distinctiveness isn't the problem here — restraint is.** Guard against noise by enforcing hierarchy (one thing loudest, others supporting).
```

- [ ] **Step 4: Commit**

```bash
git add .claude/knowledge/design/aesthetic-references/editorial.md .claude/knowledge/design/aesthetic-references/warm-organic.md .claude/knowledge/design/aesthetic-references/playful-maximalist.md
git commit -m "add aesthetic references (editorial, warm-organic, playful-maximalist)"
```

---

## Task 14: Knowledge base README (index)

**Files:**
- Create: `.claude/knowledge/design/README.md`

- [ ] **Step 1: Write the README**

File contents:

```markdown
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
```

- [ ] **Step 2: Verify knowledge base tree**

Run:
```bash
find .claude/knowledge/design -maxdepth 2 -type f -name "*.md" | sort
```

Expected: all 10 personas, 4 domains, 6 aesthetic references, intent-taxonomy.md, quality-bars.md, README.md.

- [ ] **Step 3: Commit**

```bash
git add .claude/knowledge/design/README.md
git commit -m "add knowledge/design README index"
```

---

## Task 15: `design-foundation` skill

This is the first of three skills. Greenfield mode only (retrofit is v0.3).

**Files:**
- Create: `.claude/skills/design-foundation/SKILL.md`
- Create: `.claude/skills/design-foundation/references/greenfield-flow.md`
- Create: `.claude/skills/design-foundation/references/persona-stack.yaml`

- [ ] **Step 1: Write a pressure scenario (the "test" for this skill)**

Before writing SKILL.md, write down the pressure scenario the skill must handle. This lives only as a mental/notes reference, not as a file in the repo.

Scenario: *User invokes this skill on a new project described as "a collaboration tool for product teams shipping weekly releases, B2B SaaS, professionals, serious-trustworthy + premium-refined." They want a design foundation they can build from.*

Expected behavior from a correct skill:
1. Confirms intent fields by brief interview
2. Offers brand voice/tone interview (or accepts provided)
3. Spawns 3–6 Sonnet subagents in parallel, each producing a genuinely distinct aesthetic direction (with a design-critic rejection pass if they converge)
4. Presents directions to the user for selection/hybridization
5. Synthesizes the chosen direction into a `design-system.json` v1 with tokens + base components
6. Writes all artifacts to `docs/design/00-foundation/`, `01-direction/`, `02-system/`
7. Returns control to orchestrator (does NOT call writing-plans)

- [ ] **Step 2: Write `SKILL.md`**

File contents:

````markdown
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
````

- [ ] **Step 3: Write `references/greenfield-flow.md`**

File contents:

````markdown
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
````

- [ ] **Step 4: Write `references/persona-stack.yaml`**

File contents:

```yaml
# Persona stack loaded by design-foundation skill.
# Paths are relative to .claude/knowledge/design/.

default:
  - personas/art-director.md
  - personas/visual-designer.md
  - personas/design-systems-architect.md
  - personas/design-critic.md
  - personas/ux-writer.md
  - personas/accessibility-specialist.md

# By-stage loads — use these if tighter context control is needed.
stages:
  intent_capture:
    - intent-taxonomy.md
  brand_import:
    - personas/ux-writer.md
  aesthetic_divergence:
    - personas/art-director.md
    - personas/design-critic.md
    - quality-bars.md
    # + one aesthetic-references/*.md per subagent based on assigned stake
  system_synthesis:
    - personas/design-systems-architect.md
    - personas/visual-designer.md
    - personas/accessibility-specialist.md
    - domains/typography.md
    - domains/color-and-contrast.md
    - domains/layout-and-composition.md
    - domains/accessibility-wcag.md
```

- [ ] **Step 5: Verify the skill pressure scenario**

Mental check (no command):
- Reading SKILL.md description, would an orchestrator invoke this skill for prompts like "start the UI design for my new app" or "establish a design foundation"? (Should be yes.)
- Does the SKILL.md clearly forbid invoking writing-plans? (Yes — explicit "Do not invoke writing-plans" in flow.)
- Does the flow enforce the forced-distinctiveness invariant? (Yes — Stage 3 convergence check.)
- Are all referenced files real paths that exist? (Check: personas, schemas, domains, aesthetic-references all created in earlier tasks.)

If any check fails, fix SKILL.md or flow doc inline before committing.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/design-foundation
git commit -m "add design-foundation skill (greenfield mode)"
```

---

## Task 16: `ui-surface-design` skill

**Files:**
- Create: `.claude/skills/ui-surface-design/SKILL.md`
- Create: `.claude/skills/ui-surface-design/references/surface-flow.md`
- Create: `.claude/skills/ui-surface-design/references/persona-stack.yaml`

- [ ] **Step 1: Pressure scenario**

Scenario: *A user has an approved brainstorming spec with `Design depth: full`, describing a pricing page. A design system v1 exists. The orchestrator invokes this skill with the surface name and intent.*

Expected:
1. Skill reads surface intent from the spec (or interviews if missing).
2. Loads persona stack for pricing (art-director + visual-designer + conversion-designer + ux-writer + accessibility-specialist).
3. Spawns 2–3 Sonnet subagents in parallel with distinct strategic angles.
4. Each subagent uses only tokens/components from the design system; flags gaps.
5. If gaps: pause, route to `design-component-creation`, resume.
6. Critic passes (design-critic cohesion, accessibility-specialist).
7. User picks / hybrids.
8. Writes `docs/design/03-surfaces/pricing/{intent.json,variations/*.md,selected.md}`.
9. Returns control — does NOT invoke writing-plans.

- [ ] **Step 2: Write `SKILL.md`**

File contents:

````markdown
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
````

- [ ] **Step 3: Write `references/surface-flow.md`**

File contents:

````markdown
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
````

- [ ] **Step 4: Write `references/persona-stack.yaml`**

File contents:

```yaml
# Persona stack for ui-surface-design skill.
# Paths relative to .claude/knowledge/design/.

by_surface_type:
  pricing:
    - personas/art-director.md
    - personas/visual-designer.md
    - personas/conversion-designer.md
    - personas/ux-writer.md
    - personas/accessibility-specialist.md
  landing:
    - personas/art-director.md
    - personas/visual-designer.md
    - personas/conversion-designer.md
    - personas/ux-writer.md
    - personas/accessibility-specialist.md
  checkout:
    - personas/visual-designer.md
    - personas/conversion-designer.md
    - personas/ux-writer.md
    - personas/accessibility-specialist.md
    # trust-designer added in v0.2
  signup:
    - personas/visual-designer.md
    - personas/onboarding-designer.md
    - personas/conversion-designer.md
    - personas/ux-writer.md
    - personas/accessibility-specialist.md
  onboarding:
    - personas/visual-designer.md
    - personas/onboarding-designer.md
    - personas/ux-writer.md
    - personas/accessibility-specialist.md
  dashboard-home:
    - personas/art-director.md
    - personas/visual-designer.md
    - personas/data-designer.md
    - personas/accessibility-specialist.md
  dashboard-detail:
    - personas/visual-designer.md
    - personas/data-designer.md
    - personas/accessibility-specialist.md
  empty-state:
    - personas/visual-designer.md
    - personas/onboarding-designer.md
    - personas/ux-writer.md
  error:
    - personas/visual-designer.md
    - personas/ux-writer.md

fallback:
  - personas/art-director.md
  - personas/visual-designer.md
  - personas/ux-writer.md
  - personas/accessibility-specialist.md

always_loaded:
  - intent-taxonomy.md
  - quality-bars.md
  - domains/accessibility-wcag.md

critic_pass_personas:
  - personas/design-critic.md
  - personas/accessibility-specialist.md
```

- [ ] **Step 5: Verify skill matches pressure scenario**

Mental check:
- Would the description trigger on "design the pricing page"? (Yes.)
- Does the flow handle the no-foundation case? (Yes, one-off mode.)
- Are gaps explicitly routed to design-component-creation, not invented? (Yes, Stage 4.)
- Does it refuse to invoke writing-plans? (Yes, explicit.)

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/ui-surface-design
git commit -m "add ui-surface-design skill"
```

---

## Task 17: `design-component-creation` skill

**Files:**
- Create: `.claude/skills/design-component-creation/SKILL.md`
- Create: `.claude/skills/design-component-creation/references/component-flow.md`
- Create: `.claude/skills/design-component-creation/references/persona-stack.yaml`

- [ ] **Step 1: Pressure scenario**

Scenario: *While `ui-surface-design` is building a pricing surface, a subagent flags that no `plan-card` component exists in `design-system.json`. This skill is invoked with the gap description.*

Expected:
1. Skill confirms the gap is real (could an existing component be extended instead?).
2. If extension: modify existing component, minor version bump.
3. If genuinely new: design the component within the system (uses existing tokens), define props/variants/states/semantic-HTML/accessibility.
4. Appends to `design-system.json`, bumps version (minor if tokens reused, major if tokens added).
5. Appends changelog entry with reason.
6. Writes per-component spec to `docs/design/02-system/components/<name>.md`.
7. Returns control to the paused calling skill.

- [ ] **Step 2: Write `SKILL.md`**

File contents:

````markdown
---
name: design-component-creation
description: |
  Use this skill when the UI design process has flagged a component gap — a surface or flow needs something the design system doesn't have yet. This skill is the ONLY skill authorized to modify docs/design/02-system/design-system.json. Designs the new component within the system (using existing tokens), appends it, bumps version, and writes a component spec.

  TRIGGER on: "add a new component to the system", "create a plan-card component", "fill this component gap", "route component creation for X", phrases explicitly requesting a new/extended component in the design system.

  TYPICALLY invoked by ui-surface-design or ux-flow-design when they hit a gap, not directly by the user — but users can invoke directly to pre-add a component.

  IMPORTANT — returns control to the caller. Does not invoke writing-plans.
---

# Design Component Creation

Fill a component gap in the design system: design, spec, version bump, changelog.

**Announce at start:** "Using design-component-creation for <component-name>. Will modify design-system.json."

## When this skill runs

- When a surface or flow design flagged a component that does not exist
- When the user explicitly asks to add a component to the system

## Invariants

- **Sole mutator.** This is the only skill that writes to `docs/design/02-system/design-system.json`. Violations are bugs.
- **Extension over creation.** Before creating new, check if an existing component can be extended by adding variants/slots.
- **Token discipline.** New components must use existing tokens. If a new token is genuinely required, pause and escalate to user (tokens are a foundation-level concern, not a component-level concern).
- **Version bump always.** Every run increments `design-system.json.version`. Minor bump if extending or adding components using existing tokens; major bump only if tokens were added.

## Flow

Follow `references/component-flow.md`. Stages:

1. **Gap validation.** Is this really new, or is it an existing component needing a variant?
2. **Design.** Role (primitive/pattern/template), job, props, variants, states, semantic HTML, accessibility.
3. **Token check.** Does it use only existing tokens? If no → pause, escalate.
4. **Spec write.** `docs/design/02-system/components/<name>.md`.
5. **System update.** Append to `design-system.json.components`, bump version, append changelog.
6. **Validate.** `design-system.json` passes schema. Component spec passes `component-spec.schema.json`.
7. **Return.** Report to caller with new version and component name.

## Persona stack

See `references/persona-stack.yaml`. Default: `design-systems-architect`, `interaction-designer` (v0.2 — falls back to `visual-designer` in v0.1), `accessibility-specialist`.

## Model policy

- Orchestrator: Opus (inherits)
- Design work: **Sonnet**
- Schema validation: **Haiku**

## Completion

- Commit the component spec + updated design-system.json + changelog together, in one commit
- Report to caller:
  ```
  design-component-creation complete.
  - Component: <name> (role: <role>)
  - System version: <previous> → <new>
  - Spec: docs/design/02-system/components/<name>.md
  ```
- Return control to caller. Do NOT invoke writing-plans.
````

- [ ] **Step 3: Write `references/component-flow.md`**

File contents:

````markdown
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
````

- [ ] **Step 4: Write `references/persona-stack.yaml`**

File contents:

```yaml
# Persona stack for design-component-creation skill.
# Paths relative to .claude/knowledge/design/.

default:
  - personas/design-systems-architect.md
  - personas/visual-designer.md    # v0.1 proxy for interaction-designer
  - personas/accessibility-specialist.md

always_loaded:
  - intent-taxonomy.md             # Level 3 component intent
  - quality-bars.md
  - domains/accessibility-wcag.md

# v0.2 will swap visual-designer for interaction-designer here.
```

- [ ] **Step 5: Verify skill matches pressure scenario**

Mental check:
- Is it clearly the only mutator of design-system.json? (Yes — explicit invariant.)
- Does it check for extension before creating new? (Yes — Stage 1.)
- Does it refuse to invent tokens? (Yes — Stage 3 escalates to user.)
- Does it bump version + append changelog every run? (Yes — Stage 5.)
- Does it refuse to invoke writing-plans? (Yes.)

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/design-component-creation
git commit -m "add design-component-creation skill"
```

---

## Task 18: CLAUDE.md integration

Add the Design Workflow section to CLAUDE.md. Target ≤25 lines added per spec requirement.

**Files:**
- Modify: `.claude/CLAUDE.md`

- [ ] **Step 1: Read current CLAUDE.md to find insertion point**

Run:
```bash
cat .claude/CLAUDE.md
```

Locate the "Skills Available" section. The Design Workflow section will go immediately before it (after "Model Policy" and before "Skills Available"), so the workflow context precedes the skill list.

- [ ] **Step 2: Add Design Workflow section**

Use the Edit tool to add the following block between the Model Policy section and the Skills Available section. The exact target is: find the line `## Skills Available` and insert this block immediately before it.

Content to insert (content between the marker lines; do not include the markers themselves):

```
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
```

- [ ] **Step 3: Verify line budget**

After the edit:
```bash
wc -l .claude/CLAUDE.md
```

Compare before and after. Added content should be ≤ 25 lines (inclusive of blank separators). If over, trim.

- [ ] **Step 4: Verify the gate rule reads correctly**

Read the updated section. Self-check:
- Can the orchestrator (reading only this section) know when to ask the gate question? (Yes: "when brainstorming produces a spec describing visual surfaces or user flows".)
- Can it route correctly for each `Design depth` value? (Yes: each value has explicit action.)
- Are the design skills listed and briefly described? (Yes.)

- [ ] **Step 5: Commit**

```bash
git add .claude/CLAUDE.md
git commit -m "wire design workflow into CLAUDE.md (gate + paths + skill pointers)"
```

---

## Task 19: Final integration validation

Verify the v0.1 system is internally consistent: all cross-references resolve, all schemas validate their samples, all persona files referenced by skills exist.

**Files:**
- Create: `.claude/knowledge/design/scripts/validate-all.sh`

- [ ] **Step 1: Write a validation helper script**

File contents:

```bash
#!/usr/bin/env bash
# .claude/knowledge/design/scripts/validate-all.sh
# Validates all schema/example pairs in the design knowledge base.
# Run from repo root.

set -euo pipefail

SCHEMAS_DIR=".claude/knowledge/design/schemas"
EXAMPLES_DIR="$SCHEMAS_DIR/examples"

echo "Validating design schemas..."

for schema in "$SCHEMAS_DIR"/*.schema.json; do
  base=$(basename "$schema" .schema.json)
  valid="$EXAMPLES_DIR/$base.valid.json"
  invalid="$EXAMPLES_DIR/$base.invalid.json"

  if [[ -f "$valid" ]]; then
    echo "  -> $base: valid example must pass"
    npx -y ajv-cli@5 validate -s "$schema" -d "$valid" --spec=draft2020 >/dev/null
    echo "     OK"
  else
    echo "  !! $base: missing valid example"
    exit 1
  fi

  if [[ -f "$invalid" ]]; then
    echo "  -> $base: invalid example must fail"
    if npx -y ajv-cli@5 validate -s "$schema" -d "$invalid" --spec=draft2020 >/dev/null 2>&1; then
      echo "     FAIL: invalid example passed validation (schema too permissive)"
      exit 1
    else
      echo "     OK (correctly rejected)"
    fi
  else
    echo "  !! $base: missing invalid example"
    exit 1
  fi
done

echo ""
echo "All schemas validated."
```

- [ ] **Step 2: Make executable and run**

```bash
chmod +x .claude/knowledge/design/scripts/validate-all.sh
bash .claude/knowledge/design/scripts/validate-all.sh
```

Expected output: one `-> <name>: valid example must pass` + `OK` per schema (5 schemas), one `-> <name>: invalid example must fail` + `OK (correctly rejected)` per schema, final `All schemas validated.`

If any schema fails, fix the schema or example inline and re-run.

- [ ] **Step 3: Verify all cross-references resolve**

Manually check each SKILL.md + references/*.md mentions only files that exist:

```bash
# For each persona file referenced in persona-stack.yaml, verify it exists:
for skill_dir in .claude/skills/design-foundation .claude/skills/ui-surface-design .claude/skills/design-component-creation; do
  echo "=== $skill_dir ==="
  grep -oE 'personas/[a-z-]+\.md|domains/[a-z-]+\.md|aesthetic-references/[a-z-]+\.md|schemas/[a-z-]+\.schema\.json|intent-taxonomy\.md|quality-bars\.md' "$skill_dir/references/persona-stack.yaml" | sort -u | while read ref; do
    full=".claude/knowledge/design/$ref"
    if [[ -f "$full" ]]; then
      echo "  OK  $ref"
    else
      echo "  MISSING: $ref"
    fi
  done
done
```

Expected: every referenced file is `OK`.

- [ ] **Step 4: Verify directory tree looks correct**

```bash
find .claude/knowledge/design -type f | sort
find .claude/skills -type f -path "*design*" | sort
find docs/design -type f -not -name ".gitkeep" -o -type d | sort
```

Expected files:
- `.claude/knowledge/design/intent-taxonomy.md`
- `.claude/knowledge/design/quality-bars.md`
- `.claude/knowledge/design/README.md`
- 10 personas, 4 domains, 6 aesthetic references
- 5 `.schema.json` files + their `examples/*.valid.json` and `*.invalid.json`
- 1 `scripts/validate-all.sh`
- 3 skills with SKILL.md + `references/surface-flow.md` or `greenfield-flow.md` or `component-flow.md` + `persona-stack.yaml`
- docs/design/ scaffold with README and placeholder subdirs

- [ ] **Step 5: Do a simulated orchestrator readthrough**

Sanity-check by reading the CLAUDE.md Design Workflow section out loud (in your head). Imagine being a fresh orchestrator on a new project:

- User says "I want to build a pricing-heavy marketing site."
- Did the brainstorming spec get a `Design depth` field? (Convention per CLAUDE.md, yes.)
- Value is `full`? (Hypothetical — yes.)
- `docs/design/02-system/design-system.json` doesn't exist, so offer `design-foundation` first? (CLAUDE.md says yes.)
- User agrees; invoke `design-foundation`. SKILL.md guides the full flow. Done.
- Now the user wants the pricing surface. Invoke `ui-surface-design`. SKILL.md guides the flow. Pricing is in `persona-stack.yaml`, stack loaded.
- A variation flags `plan-card` gap. `ui-surface-design` pauses, invokes `design-component-creation`. Returns. Variations continue.
- User picks. `ui-surface-design` writes the surface spec and returns.
- Orchestrator now invokes `writing-plans`.

If any step feels under-specified, fix the relevant skill/flow inline.

- [ ] **Step 6: Commit**

```bash
git add .claude/knowledge/design/scripts/validate-all.sh
git commit -m "add validate-all.sh integration check"
```

---

## Self-Review (run after writing the plan)

**1. Spec coverage:** Against spec Section 8 "v0.1 — foundation slice":

- [x] 5 JSON schemas → Tasks 2–6
- [x] 10 personas → Tasks 8–10 (3 + 4 + 3 = 10)
- [x] 4 domains → Task 11
- [x] 6 aesthetic references → Tasks 12–13 (3 + 3 = 6)
- [x] intent-taxonomy.md + quality-bars.md → Task 7
- [x] README.md → Task 14
- [x] design-foundation (greenfield) → Task 15
- [x] ui-surface-design → Task 16
- [x] design-component-creation → Task 17
- [x] CLAUDE.md updates → Task 18
- [x] docs/design/ template structure → Task 1

**2. Placeholder scan:** No TBDs, no "fill in later", every step has concrete content or a concrete command. Complete code shown in every step that produces code/content.

**3. Type consistency:**
- Schema `$id` strings consistent with draft 2020-12 in all 5 schemas.
- Token naming (`color.neutral-0`, `space.4`) consistent between design-system example, surface-spec example, and component-spec example.
- Persona file frontmatter fields (`name`, `purpose`, `role`, `loadedBy`) consistent across all 10 persona files.
- `design-system.json.version` bump rules consistent between Task 17 (minor for extension/new-using-existing-tokens; major for new tokens) and spec Section 7 invariants.

**4. No skill invokes writing-plans:** Verified in Tasks 15, 16, 17 — every SKILL.md and flow doc includes the "Do NOT invoke writing-plans" instruction.

All checks pass.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-17-uiux-design-workflow-v0.1.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh Sonnet subagent per task, two-stage review (spec compliance with Haiku + code quality with Sonnet) between tasks. Fast iteration, protects main context.

**2. Inline Execution** — Execute tasks in this session via executing-plans, batch execution with review checkpoints.

Which approach?
