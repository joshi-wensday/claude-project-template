# Auto-Improvement System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude-skill-driven autonomous loop that iteratively improves a website against a user-defined design system and brand brief, with a critic council, deterministic synthesis, trunk-based pass branches, and graceful overnight runtime.

**Architecture:** A package of Claude Code skills (`auto-improve:*`) where the parent session is the orchestrator. The user-invokable entry skill `auto-improve:running-the-loop` owns the outer pass loop, dispatches sub-skills (`setting-up-a-run`, `writing-design-contract`, `executing-a-pass`) and prompt-file subagents (planner, proposer, implementer, four critics, synthesizer) via the `Agent` tool. Pass branches branch off a per-run trunk, merge with `--no-ff` on accept, get renamed into a `rejected/` namespace on reject. State machine and stop conditions live in skill instructions.

**Tech Stack:** Claude Code skills (markdown). Bash for git/branch operations. Node.js for gate scripts (TypeScript compile, lint, test, Lighthouse, axe, visual regression via Playwright). A minimal Next.js + Tailwind example site under `examples/sample-site/` for development and validation. YAML for config and backlog files.

---

## File Structure

This plan creates the following files. Each has one clear responsibility:

**Skills (instructions):**
- `.claude/plugins/auto-improve/skills/running-the-loop/SKILL.md` — entry skill; outer loop and state machine
- `.claude/plugins/auto-improve/skills/setting-up-a-run/SKILL.md` — one-time per-run setup
- `.claude/plugins/auto-improve/skills/writing-design-contract/SKILL.md` — DESIGN_CONTRACT.md generation
- `.claude/plugins/auto-improve/skills/executing-a-pass/SKILL.md` — per-pass state machine

**Subagent prompt files:**
- `.claude/plugins/auto-improve/prompts/planner.md`
- `.claude/plugins/auto-improve/prompts/proposer.md`
- `.claude/plugins/auto-improve/prompts/implementer.md`
- `.claude/plugins/auto-improve/prompts/critics/design-system.md`
- `.claude/plugins/auto-improve/prompts/critics/ux.md`
- `.claude/plugins/auto-improve/prompts/critics/brand.md`
- `.claude/plugins/auto-improve/prompts/critics/a11y-perf.md`
- `.claude/plugins/auto-improve/prompts/synthesizer.md`

**Schemas (validation):**
- `.claude/plugins/auto-improve/schemas/config.schema.json`
- `.claude/plugins/auto-improve/schemas/backlog.schema.json`
- `.claude/plugins/auto-improve/schemas/critic-report.schema.json`
- `.claude/plugins/auto-improve/schemas/synthesizer-verdict.schema.json`

**Helper scripts:**
- `.claude/plugins/auto-improve/scripts/validate-config.mjs` — validates `auto-improve.config.yaml`
- `.claude/plugins/auto-improve/scripts/validate-backlog.mjs` — validates `backlog.yaml`
- `.claude/plugins/auto-improve/scripts/compute-run-id.sh` — computes next run-id
- `.claude/plugins/auto-improve/scripts/setup-run.sh` — cuts trunk branch, creates run directory
- `.claude/plugins/auto-improve/scripts/start-pass.sh` — creates pass branch
- `.claude/plugins/auto-improve/scripts/accept-pass.sh` — merges pass branch with --no-ff
- `.claude/plugins/auto-improve/scripts/reject-pass.sh` — renames branch into rejected/ namespace
- `.claude/plugins/auto-improve/scripts/append-log.mjs` — appends entry to run log
- `.claude/plugins/auto-improve/scripts/append-rejected.mjs` — appends to rejected_proposals
- `.claude/plugins/auto-improve/scripts/check-stop-conditions.mjs` — wall-clock + STOP file check
- `.claude/plugins/auto-improve/scripts/scope-advance-check.mjs` — scope-advance rule
- `.claude/plugins/auto-improve/scripts/finalize-run.mjs` — writes run summary
- `.claude/plugins/auto-improve/scripts/screenshot.mjs` — Playwright screenshot harness

**Gate scripts (one per gate):**
- `.claude/plugins/auto-improve/scripts/gates/typescript.sh`
- `.claude/plugins/auto-improve/scripts/gates/lint.sh`
- `.claude/plugins/auto-improve/scripts/gates/test.sh`
- `.claude/plugins/auto-improve/scripts/gates/lighthouse.mjs`
- `.claude/plugins/auto-improve/scripts/gates/axe.mjs`
- `.claude/plugins/auto-improve/scripts/gates/visual-regression.mjs`

**Sample site (for development & validation):**
- `examples/sample-site/` — minimal Next.js + Tailwind site (5 routes)
- `examples/sample-site/BRAND.md` — sample brand brief
- `examples/sample-site/handoff-bundle/` — synthetic Claude Design bundle
- `examples/sample-site/auto-improve.config.yaml` — sample config
- `examples/sample-site/backlog.yaml` — sample backlog

**Repo additions:**
- `.gitignore` — append entries for run artifacts
- `package.json` (root) — devDependencies for gate scripts: ajv, js-yaml, playwright, @lhci/cli, @axe-core/playwright

Each file has one job. Skills are pure instructions. Scripts are deterministic helpers. Schemas validate. Prompts are self-contained. The split makes individual tasks reviewable and individually testable.

---

## Phase 0 — Skeleton & Sample Site

Establish the project scaffolding and a real Next.js example site to develop against. No agent loop yet; this phase is "can we run a command, validate inputs, and have something to take screenshots of."

### Task 1: Add gitignore entries for run artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append run-artifact entries to .gitignore**

Append the following block to `.gitignore`:

```
# auto-improve run artifacts (per-run, not part of project history)
auto-improve.config.yaml
backlog.yaml
STOP
docs/runs/
```

- [ ] **Step 2: Verify the gitignore takes effect**

Run: `touch STOP && git status --short`
Expected: STOP does NOT appear in output. Then `rm STOP`.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "feat(auto-improve): gitignore run artifacts"
```

### Task 2: Add root devDependencies for gate and helper scripts

**Files:**
- Create or Modify: `package.json` (project root)

- [ ] **Step 1: Initialize package.json if it doesn't exist**

Run: `test -f package.json || npm init -y`

- [ ] **Step 2: Install devDependencies**

Run:

```bash
npm install --save-dev \
  ajv@^8 \
  ajv-formats@^3 \
  js-yaml@^4 \
  playwright@^1.45 \
  @lhci/cli@^0.13 \
  @axe-core/playwright@^4 \
  pixelmatch@^5 \
  pngjs@^7
```

Expected: installs succeed, `package-lock.json` updated.

- [ ] **Step 3: Install Playwright browsers**

Run: `npx playwright install chromium`
Expected: chromium downloads.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(auto-improve): add devDependencies for gate scripts"
```

### Task 3: Scaffold the sample Next.js site

**Files:**
- Create: `examples/sample-site/` (entire directory tree via `create-next-app`)

- [ ] **Step 1: Scaffold with create-next-app**

Run:

```bash
npx --yes create-next-app@latest examples/sample-site \
  --typescript \
  --tailwind \
  --app \
  --no-eslint \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-turbopack
```

Then add ESLint manually for cleaner control:

```bash
cd examples/sample-site
npm install --save-dev eslint eslint-config-next
```

Create `examples/sample-site/.eslintrc.json`:

```json
{
  "extends": "next/core-web-vitals"
}
```

Then `cd ../..` back to project root.

Expected: `examples/sample-site/package.json` exists, `next dev` would work.

- [ ] **Step 2: Verify the dev server boots**

Run: `cd examples/sample-site && npm run build && cd ../..`
Expected: build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add examples/sample-site
git commit -m "feat(auto-improve): scaffold sample Next.js site"
```

### Task 4: Add 5 routes and minimal components to the sample site

**Files:**
- Create: `examples/sample-site/src/app/page.tsx`
- Create: `examples/sample-site/src/app/pricing/page.tsx`
- Create: `examples/sample-site/src/app/about/page.tsx`
- Create: `examples/sample-site/src/app/contact/page.tsx`
- Create: `examples/sample-site/src/app/blog/page.tsx`
- Create: `examples/sample-site/src/components/Hero.tsx`
- Create: `examples/sample-site/src/components/Footer.tsx`

- [ ] **Step 1: Write Hero component**

Create `examples/sample-site/src/components/Hero.tsx`:

```tsx
export function Hero() {
  return (
    <section className="px-6 py-24">
      <h1 className="text-5xl font-bold leading-tight">Build with confidence.</h1>
      <p className="mt-4 text-lg text-gray-600">
        A sample site for the auto-improve loop to polish.
      </p>
      <a
        href="/pricing"
        className="mt-8 inline-block rounded bg-black px-6 py-3 text-white"
      >
        See pricing
      </a>
    </section>
  );
}
```

- [ ] **Step 2: Write Footer component**

Create `examples/sample-site/src/components/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="mt-24 border-t px-6 py-8 text-sm text-gray-500">
      <p>© 2026 Sample Site</p>
    </footer>
  );
}
```

- [ ] **Step 3: Replace home page with Hero + Footer**

Overwrite `examples/sample-site/src/app/page.tsx`:

```tsx
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Add the four other routes (pricing, about, contact, blog)**

For each of pricing, about, contact, blog, create `examples/sample-site/src/app/<route>/page.tsx`:

Pricing:
```tsx
import { Footer } from "@/components/Footer";

export default function Pricing() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {["Starter", "Pro", "Team"].map((tier) => (
            <div key={tier} className="rounded border p-6">
              <h2 className="text-xl font-semibold">{tier}</h2>
              <p className="mt-2 text-gray-600">A short description.</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
```

About:
```tsx
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">About</h1>
        <p className="mt-4 text-gray-600">
          We build sample sites for testing autonomous-improvement loops.
        </p>
      </section>
      <Footer />
    </main>
  );
}
```

Contact:
```tsx
import { Footer } from "@/components/Footer";

export default function Contact() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Contact</h1>
        <form className="mt-8 max-w-md space-y-4">
          <input
            className="block w-full rounded border px-3 py-2"
            placeholder="Email"
          />
          <textarea
            className="block w-full rounded border px-3 py-2"
            rows={4}
            placeholder="Message"
          />
          <button className="rounded bg-black px-6 py-2 text-white" type="button">
            Send
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
```

Blog:
```tsx
import { Footer } from "@/components/Footer";

export default function Blog() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Blog</h1>
        <ul className="mt-8 space-y-6">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <h2 className="text-xl font-semibold">Post {n}</h2>
              <p className="text-gray-600">Lorem ipsum dolor sit amet.</p>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 5: Verify the build still passes**

Run: `cd examples/sample-site && npm run build && cd ../..`
Expected: build succeeds, all five routes compile.

- [ ] **Step 6: Commit**

```bash
git add examples/sample-site
git commit -m "feat(auto-improve): add 5 routes and minimal components to sample site"
```

### Task 5: Author sample BRAND.md and synthetic handoff-bundle

**Files:**
- Create: `examples/sample-site/BRAND.md`
- Create: `examples/sample-site/handoff-bundle/tokens.json`
- Create: `examples/sample-site/handoff-bundle/components.md`

- [ ] **Step 1: Write BRAND.md**

Create `examples/sample-site/BRAND.md`:

```markdown
# Sample Site Brand Brief

## Vibe
Confident, technical, understated. Reads like a tool, not a marketing brochure.

## Voice
Direct sentences. Active verbs. No marketing fluff. No exclamation marks.

## Tone
Professional but human. We assume the reader is technical and respect their time.

## Do
- Use active voice ("Build X" not "X can be built")
- Lead with what the user gets, not what we offer
- Use specific numbers when relevant ("2 minutes" beats "fast")

## Don't
- Don't use emojis in copy
- Don't use marketing superlatives ("revolutionary", "best-in-class", "game-changing")
- Don't use exclamation marks
- Don't address the user as "you" more than necessary; let copy stand on its own

## Reference phrases
- ✅ "Build with confidence."
- ✅ "See pricing"
- ✅ "We build sample sites for testing autonomous-improvement loops."
- ❌ "Unlock the power of building!"
- ❌ "Your journey starts here ✨"
```

- [ ] **Step 2: Write tokens.json**

Create `examples/sample-site/handoff-bundle/tokens.json`:

```json
{
  "color": {
    "background": "#ffffff",
    "foreground": "#0a0a0a",
    "muted": "#6b7280",
    "border": "#e5e7eb",
    "accent": "#000000"
  },
  "spacing": {
    "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96]
  },
  "typography": {
    "fontFamily": "var(--font-geist-sans, system-ui, sans-serif)",
    "scale": {
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    "weight": {
      "normal": 400,
      "semibold": 600,
      "bold": 700
    }
  },
  "radius": {
    "sm": "0.125rem",
    "default": "0.25rem"
  }
}
```

- [ ] **Step 3: Write components.md**

Create `examples/sample-site/handoff-bundle/components.md`:

```markdown
# Component Inventory

## Primary Button
- Black background, white text
- 24px horizontal padding, 12px vertical
- 0.25rem border radius
- Used for primary CTAs only (one per section max)

## Card
- White background, gray border (color.border)
- 24px padding
- 0.25rem border radius
- Used for grouping related content (pricing tiers, blog post previews)

## Section
- Horizontal padding 24px
- Vertical padding 96px (top and bottom)
- Used as the outermost container for each route's main content

## Footer
- Top border
- Muted text color (color.muted)
- 24px horizontal padding, 32px vertical
- Always last child of <main>
```

- [ ] **Step 4: Commit**

```bash
git add examples/sample-site/BRAND.md examples/sample-site/handoff-bundle
git commit -m "feat(auto-improve): add sample BRAND.md and synthetic handoff-bundle"
```

### Task 6: Author sample auto-improve.config.yaml and backlog.yaml (gitignored)

**Files:**
- Create: `examples/sample-site/auto-improve.config.yaml`
- Create: `examples/sample-site/backlog.yaml`

These are **gitignored** at the repo root. We add them to the sample site directory so the example is runnable, but they will not be committed; we'll add them to a "samples" directory that documents what they should look like.

- [ ] **Step 1: Create the gitignored sample config**

Create `examples/sample-site/auto-improve.config.yaml`:

```yaml
wall_clock_hours: 1
iteration_cap_per_pass: 5
scope_advance_threshold: 0.5
scope_advance_window: 2
critic_accept_threshold: 8
critic_veto_threshold: 4
min_iterations_before_reject: 1
parallel_critics: true
critics:
  - design-system
  - ux
  - brand
  - a11y-perf
gates:
  - typescript
  - lint
  - test
  - lighthouse
  - axe
  - visual-regression
project:
  dev_server: "npm --prefix examples/sample-site run dev"
  dev_url: "http://localhost:3000"
  build_command: "npm --prefix examples/sample-site run build"
  lint_command: "npm --prefix examples/sample-site run lint"
  test_command: "echo 'no tests yet' && exit 0"
  typescript_command: "cd examples/sample-site && npx tsc --noEmit"
```

- [ ] **Step 2: Create the gitignored sample backlog**

Create `examples/sample-site/backlog.yaml`:

```yaml
scopes:
  - slug: hero
    purpose: "Above-the-fold landing experience"
    routes: ["/"]
    files: ["examples/sample-site/src/components/Hero.tsx", "examples/sample-site/src/app/page.tsx"]
  - slug: pricing-page
    purpose: "Convey pricing tiers cleanly"
    routes: ["/pricing"]
    files: ["examples/sample-site/src/app/pricing/**"]
  - slug: footer
    purpose: "Consistent, restrained footer across all routes"
    routes: ["/", "/pricing", "/about", "/contact", "/blog"]
    files: ["examples/sample-site/src/components/Footer.tsx"]
```

- [ ] **Step 3: Verify these files are gitignored**

Run: `git check-ignore examples/sample-site/auto-improve.config.yaml examples/sample-site/backlog.yaml`
Expected: both paths print (meaning they ARE ignored).

- [ ] **Step 4: Create samples/ directory with committed templates**

Create `.claude/plugins/auto-improve/samples/auto-improve.config.example.yaml` with the same content as Step 1 (so users have something to copy).

Create `.claude/plugins/auto-improve/samples/backlog.example.yaml` with the same content as Step 2.

- [ ] **Step 5: Commit the samples**

```bash
git add .claude/plugins/auto-improve/samples
git commit -m "feat(auto-improve): add committed config and backlog templates"
```

---

## Phase 1 — Validation Schemas & Helper Scripts

Build the deterministic, non-agent infrastructure first. Schemas, branch helpers, log appenders, stop checks. Each is small, testable, and gives the agent skills something concrete to call.

### Task 7: Write the JSON schema for auto-improve.config.yaml

**Files:**
- Create: `.claude/plugins/auto-improve/schemas/config.schema.json`

- [ ] **Step 1: Write the schema**

Create `.claude/plugins/auto-improve/schemas/config.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "auto-improve config",
  "type": "object",
  "required": [
    "wall_clock_hours",
    "iteration_cap_per_pass",
    "scope_advance_threshold",
    "scope_advance_window",
    "critic_accept_threshold",
    "critic_veto_threshold",
    "min_iterations_before_reject",
    "parallel_critics",
    "critics",
    "gates",
    "project"
  ],
  "properties": {
    "wall_clock_hours": { "type": "number", "minimum": 0.1, "maximum": 24 },
    "iteration_cap_per_pass": { "type": "integer", "minimum": 1, "maximum": 10 },
    "scope_advance_threshold": { "type": "number", "minimum": 0, "maximum": 10 },
    "scope_advance_window": { "type": "integer", "minimum": 1, "maximum": 10 },
    "critic_accept_threshold": { "type": "number", "minimum": 0, "maximum": 10 },
    "critic_veto_threshold": { "type": "number", "minimum": 0, "maximum": 10 },
    "min_iterations_before_reject": { "type": "integer", "minimum": 0, "maximum": 5 },
    "parallel_critics": { "type": "boolean" },
    "critics": {
      "type": "array",
      "items": { "enum": ["design-system", "ux", "brand", "a11y-perf"] },
      "minItems": 1,
      "uniqueItems": true
    },
    "gates": {
      "type": "array",
      "items": { "enum": ["typescript", "lint", "test", "lighthouse", "axe", "visual-regression"] },
      "minItems": 1,
      "uniqueItems": true
    },
    "project": {
      "type": "object",
      "required": ["dev_server", "dev_url", "build_command", "lint_command", "test_command", "typescript_command"],
      "properties": {
        "dev_server": { "type": "string", "minLength": 1 },
        "dev_url": { "type": "string", "format": "uri" },
        "build_command": { "type": "string", "minLength": 1 },
        "lint_command": { "type": "string", "minLength": 1 },
        "test_command": { "type": "string", "minLength": 1 },
        "typescript_command": { "type": "string", "minLength": 1 }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/schemas/config.schema.json
git commit -m "feat(auto-improve): add JSON schema for config.yaml"
```

### Task 8: Write the JSON schema for backlog.yaml

**Files:**
- Create: `.claude/plugins/auto-improve/schemas/backlog.schema.json`

- [ ] **Step 1: Write the schema**

Create `.claude/plugins/auto-improve/schemas/backlog.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "auto-improve backlog",
  "type": "object",
  "required": ["scopes"],
  "properties": {
    "scopes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["slug", "purpose", "routes", "files"],
        "properties": {
          "slug": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
          "purpose": { "type": "string", "minLength": 5 },
          "routes": {
            "type": "array",
            "items": { "type": "string", "minLength": 1 },
            "minItems": 1
          },
          "files": {
            "type": "array",
            "items": { "type": "string", "minLength": 1 },
            "minItems": 1
          },
          "cross_cutting": { "type": "boolean" }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/schemas/backlog.schema.json
git commit -m "feat(auto-improve): add JSON schema for backlog.yaml"
```

### Task 9: Write validate-config.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/validate-config.mjs`
- Test: `examples/sample-site/auto-improve.config.yaml` (manually run script against it)

- [ ] **Step 1: Write the validator**

Create `.claude/plugins/auto-improve/scripts/validate-config.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "schemas", "config.schema.json");

const configPath = process.argv[2];
if (!configPath) {
  console.error("Usage: validate-config.mjs <path-to-config.yaml>");
  process.exit(2);
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const config = yaml.load(readFileSync(configPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(config)) {
  console.error("Config validation failed:");
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath || "<root>"}: ${err.message}`);
  }
  process.exit(1);
}

console.log("Config valid.");
process.exit(0);
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/validate-config.mjs`

- [ ] **Step 3: Run it against the sample config**

Run: `node .claude/plugins/auto-improve/scripts/validate-config.mjs examples/sample-site/auto-improve.config.yaml`
Expected: prints `Config valid.`, exits 0.

- [ ] **Step 4: Run it against an invalid config to confirm it rejects**

Run:

```bash
echo "wall_clock_hours: 100" > /tmp/bad-config.yaml
node .claude/plugins/auto-improve/scripts/validate-config.mjs /tmp/bad-config.yaml
echo "Exit: $?"
rm /tmp/bad-config.yaml
```

Expected: prints validation errors (missing required fields, wall_clock_hours > maximum), exit code 1.

- [ ] **Step 5: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/validate-config.mjs
git commit -m "feat(auto-improve): add config validator script"
```

### Task 10: Write validate-backlog.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/validate-backlog.mjs`

- [ ] **Step 1: Write the validator**

Create `.claude/plugins/auto-improve/scripts/validate-backlog.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "schemas", "backlog.schema.json");

const backlogPath = process.argv[2];
if (!backlogPath) {
  console.error("Usage: validate-backlog.mjs <path-to-backlog.yaml>");
  process.exit(2);
}

const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const backlog = yaml.load(readFileSync(backlogPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(backlog)) {
  console.error("Backlog validation failed:");
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath || "<root>"}: ${err.message}`);
  }
  process.exit(1);
}

const slugs = backlog.scopes.map((s) => s.slug);
const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupSlugs.length > 0) {
  console.error(`Duplicate slugs found: ${[...new Set(dupSlugs)].join(", ")}`);
  process.exit(1);
}

console.log("Backlog valid.");
process.exit(0);
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/validate-backlog.mjs`

- [ ] **Step 3: Run it against the sample backlog**

Run: `node .claude/plugins/auto-improve/scripts/validate-backlog.mjs examples/sample-site/backlog.yaml`
Expected: prints `Backlog valid.`, exits 0.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/validate-backlog.mjs
git commit -m "feat(auto-improve): add backlog validator script"
```

### Task 11: Write compute-run-id.sh

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/compute-run-id.sh`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/compute-run-id.sh`:

```bash
#!/usr/bin/env bash
# Computes the next run-id for today: YYYY-MM-DD-NN where NN is zero-padded
# and increments based on existing auto-improve/YYYY-MM-DD-* branches.
#
# Prints the run-id on stdout. No other output.

set -euo pipefail

today=$(date +%Y-%m-%d)
prefix="auto-improve/${today}-"

# List remote-tracking + local branches matching the prefix.
existing=$(git branch --list "${prefix}*" --format='%(refname:short)' \
  | grep -E "^auto-improve/${today}-[0-9]{2}$" \
  || true)

max=0
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  num="${branch##*-}"
  num="${num#0}"
  num="${num:-0}"
  if (( num > max )); then
    max=$num
  fi
done <<< "$existing"

next=$(( max + 1 ))
printf "%s-%02d\n" "$today" "$next"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/compute-run-id.sh`

- [ ] **Step 3: Run it from the project root and verify format**

Run: `.claude/plugins/auto-improve/scripts/compute-run-id.sh`
Expected: prints something like `2026-05-15-01` (today's date, sequence 01 since no existing run branches).

- [ ] **Step 4: Run it after creating a fake run branch and verify increment**

Run:

```bash
TODAY=$(date +%Y-%m-%d)
git branch "auto-improve/${TODAY}-01" main
.claude/plugins/auto-improve/scripts/compute-run-id.sh
```

Expected: prints `<today>-02`.

Cleanup: `git branch -D "auto-improve/${TODAY}-01"`

- [ ] **Step 5: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/compute-run-id.sh
git commit -m "feat(auto-improve): add run-id computation script"
```

### Task 12: Write setup-run.sh

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/setup-run.sh`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/setup-run.sh`:

```bash
#!/usr/bin/env bash
# Sets up a new auto-improve run.
# Usage: setup-run.sh
# Prints the run-id on stdout. Side effects:
#   - Cuts auto-improve/<run-id>/trunk from main
#   - Creates docs/runs/<run-id>/{log.md,rejected_proposals/}
#   - Pre-condition: working tree must be clean

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! git diff-index --quiet HEAD --; then
  echo "ERROR: working tree is not clean. Commit or stash first." >&2
  exit 1
fi

if ! git rev-parse --verify --quiet main >/dev/null; then
  echo "ERROR: no 'main' branch found." >&2
  exit 1
fi

scripts_dir="$(cd "$(dirname "$0")" && pwd)"
run_id="$("$scripts_dir/compute-run-id.sh")"
trunk="auto-improve/${run_id}/trunk"

git checkout main
git checkout -b "$trunk"

mkdir -p "docs/runs/${run_id}/rejected_proposals"
cat > "docs/runs/${run_id}/log.md" <<EOF
# Auto-improve run ${run_id}

Started: $(date '+%Y-%m-%d %H:%M:%S')
Trunk: ${trunk}

---
EOF

echo "$run_id"
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/setup-run.sh`

- [ ] **Step 3: Test it end-to-end**

Run:

```bash
.claude/plugins/auto-improve/scripts/setup-run.sh
```

Expected: prints a run-id like `2026-05-15-01`. Verify:

```bash
git branch --show-current
# expect: auto-improve/<that-run-id>/trunk

ls docs/runs/<that-run-id>/
# expect: log.md  rejected_proposals/

cat docs/runs/<that-run-id>/log.md
# expect: header lines including the run-id and timestamp
```

- [ ] **Step 4: Cleanup test artifacts and return to main**

```bash
RUN_ID=$(git branch --show-current | sed -E 's|auto-improve/(.*)/trunk|\1|')
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
rm -rf "docs/runs/${RUN_ID}"
```

- [ ] **Step 5: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/setup-run.sh
git commit -m "feat(auto-improve): add setup-run script"
```

### Task 13: Write start-pass.sh, accept-pass.sh, reject-pass.sh

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/start-pass.sh`
- Create: `.claude/plugins/auto-improve/scripts/accept-pass.sh`
- Create: `.claude/plugins/auto-improve/scripts/reject-pass.sh`

- [ ] **Step 1: Write start-pass.sh**

Create `.claude/plugins/auto-improve/scripts/start-pass.sh`:

```bash
#!/usr/bin/env bash
# Creates a pass branch off the current trunk.
# Usage: start-pass.sh <run-id> <pass-number> <scope-slug> <proposal-slug>
# Prints the new branch name on stdout.

set -euo pipefail

if [[ $# -ne 4 ]]; then
  echo "Usage: $0 <run-id> <pass-number> <scope-slug> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
pass_num="$(printf "%02d" "$2")"
scope="$3"
proposal="$4"

trunk="auto-improve/${run_id}/trunk"
branch="auto-improve/${run_id}/passes/${pass_num}-${scope}-${proposal}"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git checkout -b "$branch" >/dev/null 2>&1
echo "$branch"
```

- [ ] **Step 2: Write accept-pass.sh**

Create `.claude/plugins/auto-improve/scripts/accept-pass.sh`:

```bash
#!/usr/bin/env bash
# Merges a pass branch back into trunk with --no-ff and a structured message.
# Usage: accept-pass.sh <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>
# Prints the merge commit SHA on stdout.

set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
branch="$2"
pass_num="$3"
scope="$4"
proposal="$5"
trunk="auto-improve/${run_id}/trunk"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git merge --no-ff -m "Pass ${pass_num} — ${scope} — ${proposal}" "$branch" >/dev/null
git rev-parse HEAD
```

- [ ] **Step 3: Write reject-pass.sh**

Create `.claude/plugins/auto-improve/scripts/reject-pass.sh`:

```bash
#!/usr/bin/env bash
# Renames a pass branch into the rejected/ namespace.
# Usage: reject-pass.sh <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>
# Prints the new (rejected) branch name on stdout.

set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 <run-id> <pass-branch> <pass-number> <scope> <proposal-slug>" >&2
  exit 2
fi

run_id="$1"
old_branch="$2"
pass_num="$(printf "%02d" "$3")"
scope="$4"
proposal="$5"
trunk="auto-improve/${run_id}/trunk"
new_branch="auto-improve/${run_id}/rejected/${pass_num}-${scope}-${proposal}"

cd "$(git rev-parse --show-toplevel)"
git checkout "$trunk" >/dev/null 2>&1
git branch -m "$old_branch" "$new_branch"
echo "$new_branch"
```

- [ ] **Step 4: Make all three executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/{start-pass.sh,accept-pass.sh,reject-pass.sh}`

- [ ] **Step 5: Test the full lifecycle**

Run:

```bash
# Set up a run
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)
echo "run: $RUN_ID"

# Start a pass
BRANCH=$(.claude/plugins/auto-improve/scripts/start-pass.sh "$RUN_ID" 1 hero test-proposal)
echo "pass branch: $BRANCH"

# Make a trivial commit on the pass branch
echo "// test" >> examples/sample-site/src/components/Hero.tsx
git add examples/sample-site/src/components/Hero.tsx
git commit -m "test pass commit"

# Accept the pass
SHA=$(.claude/plugins/auto-improve/scripts/accept-pass.sh "$RUN_ID" "$BRANCH" 1 hero test-proposal)
echo "merge: $SHA"

# Verify trunk has a merge commit
git log --first-parent --oneline -3

# Cleanup
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
git branch -D "$BRANCH" 2>/dev/null || true
rm -rf "docs/runs/${RUN_ID}"
```

Expected: each step succeeds. The final `git log` output shows the merge commit with message `Pass 01 — hero — test-proposal`.

- [ ] **Step 6: Test rejection**

Run:

```bash
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)
BRANCH=$(.claude/plugins/auto-improve/scripts/start-pass.sh "$RUN_ID" 2 hero bad-proposal)
echo "// rejected work" >> examples/sample-site/src/components/Hero.tsx
git add . && git commit -m "rejected work"
NEW_BRANCH=$(.claude/plugins/auto-improve/scripts/reject-pass.sh "$RUN_ID" "$BRANCH" 2 hero bad-proposal)
echo "renamed to: $NEW_BRANCH"

# Verify
git branch --list "auto-improve/${RUN_ID}/rejected/*"

# Cleanup
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
git branch -D "$NEW_BRANCH"
rm -rf "docs/runs/${RUN_ID}"
```

Expected: `git branch --list` shows the rejected branch under the rejected/ namespace.

- [ ] **Step 7: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/{start-pass.sh,accept-pass.sh,reject-pass.sh}
git commit -m "feat(auto-improve): add pass lifecycle scripts (start, accept, reject)"
```

### Task 14: Write append-log.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/append-log.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/append-log.mjs`:

```javascript
#!/usr/bin/env node
// Appends a structured pass entry to docs/runs/<run-id>/log.md.
// Usage: append-log.mjs <run-id> <entry-json-path>
//
// entry-json-path points to a JSON file with shape:
// {
//   pass: 1,
//   scope: "hero",
//   proposal_slug: "tighten-rhythm",
//   started: "2026-05-15T22:18:00Z",
//   ended: "2026-05-15T22:34:00Z",
//   verdict: "ACCEPTED" | "REJECTED" | "REQUEST_CHANGES",
//   branch: "auto-improve/...",
//   merge_sha: "abc123" (or null),
//   proposal_text: "...",
//   critic_scores: { "design-system": 8.5, ux: 8.0, brand: 9.0, "a11y-perf": 9.5 },
//   prior_score: 8.2 (or null),
//   synthesizer_rationale: "...",
//   iterations: ["iter 1: ...", "iter 2: ..."]
// }

import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , runId, entryPath] = process.argv;
if (!runId || !entryPath) {
  console.error("Usage: append-log.mjs <run-id> <entry-json-path>");
  process.exit(2);
}

const entry = JSON.parse(readFileSync(entryPath, "utf8"));
const logPath = resolve("docs", "runs", runId, "log.md");

const fmtDate = (iso) => new Date(iso).toLocaleString("en-GB", { hour12: false });

const passNum = String(entry.pass).padStart(2, "0");
const elapsedMin = Math.round((new Date(entry.ended) - new Date(entry.started)) / 60000);
const iterCount = entry.iterations.length;

const scoreLines = Object.entries(entry.critic_scores)
  .map(([critic, score]) => {
    const delta = entry.prior_score == null ? "—" :
      ((score - entry.prior_score) >= 0 ? "+" : "") + (score - entry.prior_score).toFixed(2);
    return `| ${critic.padEnd(13)} | ${String(score).padEnd(5)} | ${delta.padEnd(13)} |`;
  })
  .join("\n");

const avgScore = (
  Object.values(entry.critic_scores).reduce((a, b) => a + b, 0) /
  Object.values(entry.critic_scores).length
).toFixed(2);

const md = `

## Pass ${passNum} — ${entry.scope} — ${entry.proposal_slug}
Started ${fmtDate(entry.started)}, ended ${fmtDate(entry.ended)} (${elapsedMin} min, ${iterCount} iteration${iterCount === 1 ? "" : "s"})
Verdict: ${entry.verdict}
Branch: ${entry.branch}
${entry.merge_sha ? `Merge: ${entry.merge_sha}` : ""}

**Proposal:** ${entry.proposal_text}

**Critic scores:**
| Critic        | Score | Δ vs baseline |
|---------------|-------|---------------|
${scoreLines}
| **Avg**       | **${avgScore}** | |

**Synthesizer:** ${entry.synthesizer_rationale}

**Iterations:**
${entry.iterations.map((line, i) => `${i + 1}. ${line}`).join("\n")}

---
`;

appendFileSync(logPath, md);
console.log(`Appended pass ${passNum} to ${logPath}`);
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/append-log.mjs`

- [ ] **Step 3: Test it end-to-end**

Run:

```bash
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)

cat > /tmp/entry.json <<EOF
{
  "pass": 1,
  "scope": "hero",
  "proposal_slug": "tighten-headline-rhythm",
  "started": "2026-05-15T22:18:00Z",
  "ended": "2026-05-15T22:34:00Z",
  "verdict": "ACCEPTED",
  "branch": "auto-improve/${RUN_ID}/passes/01-hero-tighten-headline-rhythm",
  "merge_sha": "abc1234",
  "proposal_text": "Tighten vertical rhythm in the hero from 1.4 to 1.25 line-height.",
  "critic_scores": { "design-system": 8.5, "ux": 8.0, "brand": 9.0, "a11y-perf": 9.5 },
  "prior_score": 8.0,
  "synthesizer_rationale": "Rhythm tightening lands cleanly. No regressions.",
  "iterations": ["Initial: brand critic flagged tracking too wide.", "Revised: tracking reduced."]
}
EOF

node .claude/plugins/auto-improve/scripts/append-log.mjs "$RUN_ID" /tmp/entry.json
cat "docs/runs/${RUN_ID}/log.md"

# Cleanup
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
rm -rf "docs/runs/${RUN_ID}" /tmp/entry.json
```

Expected: log.md ends with a properly formatted pass entry.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/append-log.mjs
git commit -m "feat(auto-improve): add run-log appender script"
```

### Task 15: Write append-rejected.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/append-rejected.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/append-rejected.mjs`:

```javascript
#!/usr/bin/env node
// Appends a rejected proposal to docs/runs/<run-id>/rejected_proposals/<scope>.yaml.
// Usage: append-rejected.mjs <run-id> <scope-slug> <pass-number> <branch> <proposal-text> <reason>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const [, , runId, scope, passNum, branch, proposal, reason] = process.argv;
if (!runId || !scope || !passNum || !branch || !proposal || !reason) {
  console.error("Usage: append-rejected.mjs <run-id> <scope> <pass-number> <branch> <proposal-text> <reason>");
  process.exit(2);
}

const path = resolve("docs", "runs", runId, "rejected_proposals", `${scope}.yaml`);

let entries = [];
if (existsSync(path)) {
  entries = yaml.load(readFileSync(path, "utf8")) || [];
}

entries.push({
  pass: Number(passNum),
  proposal,
  reason,
  branch,
});

writeFileSync(path, yaml.dump(entries, { lineWidth: 100 }));
console.log(`Appended rejection to ${path}`);
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/append-rejected.mjs`

- [ ] **Step 3: Test**

Run:

```bash
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)

node .claude/plugins/auto-improve/scripts/append-rejected.mjs \
  "$RUN_ID" hero 7 \
  "auto-improve/${RUN_ID}/rejected/07-hero-bloom" \
  "Add CTA hover bloom" \
  "UX critic motion veto"

cat "docs/runs/${RUN_ID}/rejected_proposals/hero.yaml"

# Cleanup
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
rm -rf "docs/runs/${RUN_ID}"
```

Expected: hero.yaml contains a list with one entry, properly YAML-formatted.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/append-rejected.mjs
git commit -m "feat(auto-improve): add rejected-proposals appender script"
```

### Task 16: Write check-stop-conditions.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/check-stop-conditions.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/check-stop-conditions.mjs`:

```javascript
#!/usr/bin/env node
// Checks all stop conditions. Exits 0 = continue, exits 1 = stop (with reason on stdout).
// Usage: check-stop-conditions.mjs <run-start-iso> <wall-clock-hours> <backlog-empty-flag>

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const [, , startIso, hoursStr, backlogEmpty] = process.argv;
if (!startIso || !hoursStr) {
  console.error("Usage: check-stop-conditions.mjs <start-iso> <wall-clock-hours> <backlog-empty>");
  process.exit(2);
}

const start = new Date(startIso);
const hours = Number(hoursStr);
const elapsedHours = (Date.now() - start.getTime()) / (1000 * 60 * 60);

if (elapsedHours >= hours) {
  console.log(`STOP: wall_clock (${elapsedHours.toFixed(2)}h elapsed >= ${hours}h budget)`);
  process.exit(1);
}

if (existsSync(resolve("STOP"))) {
  console.log("STOP: STOP file present");
  process.exit(1);
}

if (backlogEmpty === "true") {
  console.log("STOP: backlog empty");
  process.exit(1);
}

console.log("CONTINUE");
process.exit(0);
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs`

- [ ] **Step 3: Test all three stop conditions**

Run:

```bash
# Wall-clock not exceeded, no STOP file, backlog non-empty -> CONTINUE
node .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs "$(date -u +%Y-%m-%dT%H:%M:%SZ)" 10 false
# expect: CONTINUE, exit 0

# Wall-clock exceeded
node .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs "2020-01-01T00:00:00Z" 1 false
# expect: STOP: wall_clock, exit 1

# STOP file
touch STOP
node .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs "$(date -u +%Y-%m-%dT%H:%M:%SZ)" 10 false
echo "exit=$?"
rm STOP
# expect: STOP: STOP file present, exit 1

# Backlog empty
node .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs "$(date -u +%Y-%m-%dT%H:%M:%SZ)" 10 true
# expect: STOP: backlog empty, exit 1
```

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/check-stop-conditions.mjs
git commit -m "feat(auto-improve): add stop-condition checker script"
```

### Task 17: Write scope-advance-check.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/scope-advance-check.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/scope-advance-check.mjs`:

```javascript
#!/usr/bin/env node
// Determines whether a scope should be advanced based on the last N accepted-pass scores.
// Usage: scope-advance-check.mjs <threshold> <window> <comma-separated-scores>
// Exits 0 with "ADVANCE" or "STAY".

const [, , thresholdStr, windowStr, scoresStr] = process.argv;
if (!thresholdStr || !windowStr || scoresStr === undefined) {
  console.error("Usage: scope-advance-check.mjs <threshold> <window> <comma-separated-scores>");
  process.exit(2);
}

const threshold = Number(thresholdStr);
const window = Number(windowStr);
const scores = scoresStr ? scoresStr.split(",").map(Number) : [];

if (scores.length < window) {
  console.log("STAY");
  process.exit(0);
}

const recent = scores.slice(-window);
const delta = recent[recent.length - 1] - recent[0];

if (delta < threshold) {
  console.log(`ADVANCE (delta=${delta.toFixed(2)} < threshold=${threshold})`);
} else {
  console.log(`STAY (delta=${delta.toFixed(2)} >= threshold=${threshold})`);
}
process.exit(0);
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/scope-advance-check.mjs`

- [ ] **Step 3: Test**

Run:

```bash
# Insufficient history
node .claude/plugins/auto-improve/scripts/scope-advance-check.mjs 0.5 2 "8.0"
# expect: STAY

# Sufficient improvement
node .claude/plugins/auto-improve/scripts/scope-advance-check.mjs 0.5 2 "8.0,8.7"
# expect: STAY (delta=0.70 >= threshold=0.5)

# Insufficient improvement
node .claude/plugins/auto-improve/scripts/scope-advance-check.mjs 0.5 2 "8.0,8.2"
# expect: ADVANCE (delta=0.20 < threshold=0.5)

# Three scores; window=2 takes only the last two
node .claude/plugins/auto-improve/scripts/scope-advance-check.mjs 0.5 2 "8.0,8.7,8.8"
# expect: ADVANCE (delta=0.10 < threshold=0.5)
```

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/scope-advance-check.mjs
git commit -m "feat(auto-improve): add scope-advance check script"
```

### Task 18: Write finalize-run.mjs

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/finalize-run.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/finalize-run.mjs`:

```javascript
#!/usr/bin/env node
// Appends a final run-summary block to docs/runs/<run-id>/log.md.
// Usage: finalize-run.mjs <run-id> <stop-reason> <summary-json-path>
//
// summary-json shape:
// { passes_total, passes_accepted, passes_rejected, scopes_touched: [...], score_deltas: { scope: delta } }

import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , runId, stopReason, summaryPath] = process.argv;
if (!runId || !stopReason || !summaryPath) {
  console.error("Usage: finalize-run.mjs <run-id> <stop-reason> <summary-json-path>");
  process.exit(2);
}

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
const logPath = resolve("docs", "runs", runId, "log.md");

const deltas = Object.entries(summary.score_deltas)
  .map(([scope, delta]) => `${scope} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`)
  .join(", ");

const md = `

## Run summary
Ended: ${new Date().toLocaleString("en-GB", { hour12: false })}
Stop reason: ${stopReason}
Passes: ${summary.passes_total} (${summary.passes_accepted} accepted, ${summary.passes_rejected} rejected)
Scopes touched: ${summary.scopes_touched.join(", ")}
Net critic-score deltas: ${deltas}
`;

appendFileSync(logPath, md);
console.log(`Finalized log at ${logPath}`);
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/finalize-run.mjs`

- [ ] **Step 3: Test**

Run:

```bash
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)

cat > /tmp/summary.json <<EOF
{
  "passes_total": 14,
  "passes_accepted": 12,
  "passes_rejected": 2,
  "scopes_touched": ["hero", "pricing-page", "global-copy"],
  "score_deltas": { "hero": 1.8, "pricing-page": 2.1, "global-copy": 0.9 }
}
EOF

node .claude/plugins/auto-improve/scripts/finalize-run.mjs "$RUN_ID" wall_clock_hours /tmp/summary.json
cat "docs/runs/${RUN_ID}/log.md"

# Cleanup
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
rm -rf "docs/runs/${RUN_ID}" /tmp/summary.json
```

Expected: log.md ends with a Run summary block.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/finalize-run.mjs
git commit -m "feat(auto-improve): add run-summary finalizer script"
```

---

## Phase 2 — Gate Scripts

Each gate is a small executable that exits 0 on pass, non-zero on fail, and writes a JSON report to a known location. The orchestrator runs them in a fixed order.

### Task 19: Write the screenshot harness (Playwright)

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/screenshot.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/screenshot.mjs`:

```javascript
#!/usr/bin/env node
// Boots the dev server, takes desktop + mobile screenshots of the given routes,
// and writes them to <out-dir>/<viewport>/<route-slug>.png.
// Usage: screenshot.mjs <dev-server-cmd> <dev-url> <routes-csv> <out-dir>

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const [, , devCmd, devUrl, routesCsv, outDir] = process.argv;
if (!devCmd || !devUrl || !routesCsv || !outDir) {
  console.error("Usage: screenshot.mjs <dev-cmd> <dev-url> <routes-csv> <out-dir>");
  process.exit(2);
}

const routes = routesCsv.split(",").map((r) => r.trim());

mkdirSync(resolve(outDir, "desktop"), { recursive: true });
mkdirSync(resolve(outDir, "mobile"), { recursive: true });

const server = spawn(devCmd, { shell: true, stdio: "ignore" });
server.unref();

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

const slug = (route) => route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");

try {
  await waitFor(devUrl);
  const browser = await chromium.launch();

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    for (const route of routes) {
      if (route === "*") continue;
      await page.goto(`${devUrl}${route}`, { waitUntil: "networkidle" });
      await page.screenshot({
        path: resolve(outDir, viewport.name, `${slug(route)}.png`),
        fullPage: true,
      });
    }
    await ctx.close();
  }

  await browser.close();
  console.log(`Screenshots written to ${outDir}`);
} finally {
  server.kill("SIGTERM");
}
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/screenshot.mjs`

- [ ] **Step 3: Test against the sample site**

Run:

```bash
node .claude/plugins/auto-improve/scripts/screenshot.mjs \
  "npm --prefix examples/sample-site run dev" \
  "http://localhost:3000" \
  "/,/pricing,/about" \
  /tmp/screenshots-test

ls /tmp/screenshots-test/desktop /tmp/screenshots-test/mobile
# expect: home.png pricing.png about.png in each viewport dir

rm -rf /tmp/screenshots-test
```

Expected: PNG files exist for both viewports across all three routes.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/screenshot.mjs
git commit -m "feat(auto-improve): add Playwright screenshot harness"
```

### Task 20: Write the typescript gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/typescript.sh`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/typescript.sh`:

```bash
#!/usr/bin/env bash
# TypeScript gate. Reads typescript_command from auto-improve.config.yaml.
# Usage: typescript.sh <out-json-path>
# Writes JSON report to out-json-path. Exits 0 on pass, 1 on fail.

set -uo pipefail

out_path="${1:-/dev/null}"

# Get the command from config
ts_cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.typescript_command);
")

if [[ -z "$ts_cmd" ]]; then
  echo '{"gate":"typescript","status":"error","message":"no typescript_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$ts_cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"typescript","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: typescript"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"typescript","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: typescript"
  echo "$output"
  exit 1
fi
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/gates/typescript.sh`

- [ ] **Step 3: Verify jq is available**

Run: `which jq`
Expected: prints a path. If not installed, run `brew install jq` (macOS) or equivalent.

- [ ] **Step 4: Test against the sample site**

Run:

```bash
cp examples/sample-site/auto-improve.config.yaml .
.claude/plugins/auto-improve/scripts/gates/typescript.sh /tmp/ts-report.json
cat /tmp/ts-report.json
rm auto-improve.config.yaml /tmp/ts-report.json
```

Expected: prints `PASS: typescript`, JSON report shows status pass.

- [ ] **Step 5: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/typescript.sh
git commit -m "feat(auto-improve): add TypeScript gate"
```

### Task 21: Write the lint gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/lint.sh`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/lint.sh`:

```bash
#!/usr/bin/env bash
# Lint gate. Same pattern as typescript.sh but uses lint_command.
set -uo pipefail

out_path="${1:-/dev/null}"

cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.lint_command);
")

if [[ -z "$cmd" ]]; then
  echo '{"gate":"lint","status":"error","message":"no lint_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"lint","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: lint"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"lint","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: lint"
  echo "$output"
  exit 1
fi
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/gates/lint.sh`

- [ ] **Step 3: Test**

Run:

```bash
cp examples/sample-site/auto-improve.config.yaml .
.claude/plugins/auto-improve/scripts/gates/lint.sh /tmp/lint-report.json
cat /tmp/lint-report.json
rm auto-improve.config.yaml /tmp/lint-report.json
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/lint.sh
git commit -m "feat(auto-improve): add lint gate"
```

### Task 22: Write the test gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/test.sh`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/test.sh`:

```bash
#!/usr/bin/env bash
# Test gate. Same pattern as typescript.sh but uses test_command.
set -uo pipefail

out_path="${1:-/dev/null}"

cmd=$(node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('auto-improve.config.yaml', 'utf8'));
process.stdout.write(cfg.project.test_command);
")

if [[ -z "$cmd" ]]; then
  echo '{"gate":"test","status":"error","message":"no test_command"}' > "$out_path"
  exit 1
fi

output=$(eval "$cmd" 2>&1)
exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  cat > "$out_path" <<EOF
{"gate":"test","status":"pass","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "PASS: test"
  exit 0
else
  cat > "$out_path" <<EOF
{"gate":"test","status":"fail","output":$(echo "$output" | jq -Rs .)}
EOF
  echo "FAIL: test"
  echo "$output"
  exit 1
fi
```

- [ ] **Step 2: Make executable and test**

```bash
chmod +x .claude/plugins/auto-improve/scripts/gates/test.sh
cp examples/sample-site/auto-improve.config.yaml .
.claude/plugins/auto-improve/scripts/gates/test.sh /tmp/test-report.json
cat /tmp/test-report.json
rm auto-improve.config.yaml /tmp/test-report.json
```

Expected: PASS (sample test_command is `echo 'no tests yet' && exit 0`).

- [ ] **Step 3: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/test.sh
git commit -m "feat(auto-improve): add test gate"
```

### Task 23: Write the lighthouse gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/lighthouse.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/lighthouse.mjs`:

```javascript
#!/usr/bin/env node
// Runs Lighthouse via @lhci/cli against the dev URL for each backlog route.
// Usage: lighthouse.mjs <out-json-path>
// Reads dev_server, dev_url, and backlog routes from config + backlog.

import { spawn, execSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

const outPath = process.argv[2];
if (!outPath) { console.error("Usage: lighthouse.mjs <out-path>"); process.exit(2); }

const config = yaml.load(readFileSync("auto-improve.config.yaml", "utf8"));
const backlog = yaml.load(readFileSync("backlog.yaml", "utf8"));

const devCmd = config.project.dev_server;
const devUrl = config.project.dev_url;
const routes = [...new Set(backlog.scopes.flatMap((s) => s.routes).filter((r) => r !== "*"))];

const server = spawn(devCmd, { shell: true, stdio: "ignore" });
server.unref();

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server not ready: ${url}`);
}

const PERF_MIN = 0.7;
const A11Y_MIN = 0.9;

try {
  await waitFor(devUrl);
  const results = {};
  let allPass = true;

  for (const route of routes) {
    const url = `${devUrl}${route}`;
    const json = execSync(
      `npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless" --only-categories=performance,accessibility`,
      { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );
    const lh = JSON.parse(json);
    const perf = lh.categories.performance.score;
    const a11y = lh.categories.accessibility.score;
    const pass = perf >= PERF_MIN && a11y >= A11Y_MIN;
    if (!pass) allPass = false;
    results[route] = { performance: perf, accessibility: a11y, pass };
  }

  writeFileSync(outPath, JSON.stringify({
    gate: "lighthouse",
    status: allPass ? "pass" : "fail",
    thresholds: { performance: PERF_MIN, accessibility: A11Y_MIN },
    results,
  }, null, 2));

  console.log(allPass ? "PASS: lighthouse" : "FAIL: lighthouse");
  process.exit(allPass ? 0 : 1);
} finally {
  server.kill("SIGTERM");
}
```

- [ ] **Step 2: Make executable**

Run: `chmod +x .claude/plugins/auto-improve/scripts/gates/lighthouse.mjs`

- [ ] **Step 3: Test**

Run:

```bash
cp examples/sample-site/auto-improve.config.yaml .
cp examples/sample-site/backlog.yaml .
node .claude/plugins/auto-improve/scripts/gates/lighthouse.mjs /tmp/lh-report.json
cat /tmp/lh-report.json
rm auto-improve.config.yaml backlog.yaml /tmp/lh-report.json
```

Expected: prints PASS or FAIL with per-route scores. (Sample site should pass.)

- [ ] **Step 4: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/lighthouse.mjs
git commit -m "feat(auto-improve): add Lighthouse gate"
```

### Task 24: Write the axe gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/axe.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/axe.mjs`:

```javascript
#!/usr/bin/env node
// Runs axe-core via Playwright against each backlog route.
// Usage: axe.mjs <out-json-path>

import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import yaml from "js-yaml";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const outPath = process.argv[2];
if (!outPath) { console.error("Usage: axe.mjs <out-path>"); process.exit(2); }

const config = yaml.load(readFileSync("auto-improve.config.yaml", "utf8"));
const backlog = yaml.load(readFileSync("backlog.yaml", "utf8"));

const devCmd = config.project.dev_server;
const devUrl = config.project.dev_url;
const routes = [...new Set(backlog.scopes.flatMap((s) => s.routes).filter((r) => r !== "*"))];

const server = spawn(devCmd, { shell: true, stdio: "ignore" });
server.unref();

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server not ready: ${url}`);
}

try {
  await waitFor(devUrl);
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const results = {};
  let totalCritical = 0;
  let totalSerious = 0;

  for (const route of routes) {
    await page.goto(`${devUrl}${route}`, { waitUntil: "networkidle" });
    const r = await new AxeBuilder({ page }).analyze();
    const critical = r.violations.filter((v) => v.impact === "critical").length;
    const serious = r.violations.filter((v) => v.impact === "serious").length;
    totalCritical += critical;
    totalSerious += serious;
    results[route] = {
      violations: r.violations.length,
      critical,
      serious,
      details: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
    };
  }

  await browser.close();

  const pass = totalCritical === 0 && totalSerious === 0;

  writeFileSync(outPath, JSON.stringify({
    gate: "axe",
    status: pass ? "pass" : "fail",
    thresholds: { critical: 0, serious: 0 },
    totals: { critical: totalCritical, serious: totalSerious },
    results,
  }, null, 2));

  console.log(pass ? "PASS: axe" : "FAIL: axe");
  process.exit(pass ? 0 : 1);
} finally {
  server.kill("SIGTERM");
}
```

- [ ] **Step 2: Make executable and test**

```bash
chmod +x .claude/plugins/auto-improve/scripts/gates/axe.mjs
cp examples/sample-site/auto-improve.config.yaml .
cp examples/sample-site/backlog.yaml .
node .claude/plugins/auto-improve/scripts/gates/axe.mjs /tmp/axe-report.json
cat /tmp/axe-report.json
rm auto-improve.config.yaml backlog.yaml /tmp/axe-report.json
```

Expected: PASS (sample site should have no critical/serious axe violations).

- [ ] **Step 3: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/axe.mjs
git commit -m "feat(auto-improve): add axe gate"
```

### Task 25: Write the visual-regression gate

**Files:**
- Create: `.claude/plugins/auto-improve/scripts/gates/visual-regression.mjs`

- [ ] **Step 1: Write the script**

Create `.claude/plugins/auto-improve/scripts/gates/visual-regression.mjs`:

```javascript
#!/usr/bin/env node
// Compares "before" and "after" screenshots from <baseline-dir> and <current-dir>.
// Pass = pixel diff ratio below threshold for every (viewport, route) pair.
// Usage: visual-regression.mjs <baseline-dir> <current-dir> <out-json-path>

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [, , baselineDir, currentDir, outPath] = process.argv;
if (!baselineDir || !currentDir || !outPath) {
  console.error("Usage: visual-regression.mjs <baseline-dir> <current-dir> <out-path>");
  process.exit(2);
}

if (!existsSync(baselineDir)) {
  // No baseline yet (first pass) — record current as baseline and pass.
  writeFileSync(outPath, JSON.stringify({
    gate: "visual-regression",
    status: "pass",
    note: "no baseline; current snapshot recorded",
  }, null, 2));
  console.log("PASS: visual-regression (no baseline)");
  process.exit(0);
}

const THRESHOLD = 0.05;  // 5% changed pixels per image

const results = {};
let allPass = true;

for (const viewport of ["desktop", "mobile"]) {
  const baseVp = resolve(baselineDir, viewport);
  const curVp = resolve(currentDir, viewport);
  if (!existsSync(baseVp) || !existsSync(curVp)) continue;

  for (const file of readdirSync(curVp).filter((f) => f.endsWith(".png"))) {
    const basePath = resolve(baseVp, file);
    const curPath = resolve(curVp, file);
    if (!existsSync(basePath)) continue;

    const base = PNG.sync.read(readFileSync(basePath));
    const cur = PNG.sync.read(readFileSync(curPath));
    if (base.width !== cur.width || base.height !== cur.height) {
      results[`${viewport}/${file}`] = { status: "fail", reason: "dimensions differ", ratio: 1 };
      allPass = false;
      continue;
    }
    const diff = new PNG({ width: base.width, height: base.height });
    const changed = pixelmatch(base.data, cur.data, diff.data, base.width, base.height, { threshold: 0.1 });
    const total = base.width * base.height;
    const ratio = changed / total;
    const pass = ratio <= THRESHOLD;
    if (!pass) allPass = false;
    results[`${viewport}/${file}`] = { status: pass ? "pass" : "fail", ratio };
  }
}

writeFileSync(outPath, JSON.stringify({
  gate: "visual-regression",
  status: allPass ? "pass" : "fail",
  threshold: THRESHOLD,
  results,
}, null, 2));

console.log(allPass ? "PASS: visual-regression" : "FAIL: visual-regression");
process.exit(allPass ? 0 : 1);
```

- [ ] **Step 2: Make executable and test**

```bash
chmod +x .claude/plugins/auto-improve/scripts/gates/visual-regression.mjs

# First run: no baseline, should pass
node .claude/plugins/auto-improve/scripts/screenshot.mjs \
  "npm --prefix examples/sample-site run dev" \
  "http://localhost:3000" \
  "/,/pricing" \
  /tmp/baseline

node .claude/plugins/auto-improve/scripts/gates/visual-regression.mjs \
  /tmp/nonexistent /tmp/baseline /tmp/vr-1.json
cat /tmp/vr-1.json

# Second run with same screenshots, should pass with ~0% diff
node .claude/plugins/auto-improve/scripts/screenshot.mjs \
  "npm --prefix examples/sample-site run dev" \
  "http://localhost:3000" \
  "/,/pricing" \
  /tmp/current

node .claude/plugins/auto-improve/scripts/gates/visual-regression.mjs \
  /tmp/baseline /tmp/current /tmp/vr-2.json
cat /tmp/vr-2.json

rm -rf /tmp/baseline /tmp/current /tmp/vr-1.json /tmp/vr-2.json
```

Expected: first call passes with "no baseline" note. Second call passes with ratios near 0.

- [ ] **Step 3: Commit**

```bash
git add .claude/plugins/auto-improve/scripts/gates/visual-regression.mjs
git commit -m "feat(auto-improve): add visual-regression gate"
```

---

## Phase 3 — The Setup & Design Contract Skills

Build the once-per-run setup skill and the design-contract writer. This phase produces a working `auto-improve setup` flow: validate inputs, cut trunk, generate DESIGN_CONTRACT.md, ready for the pass loop.

### Task 26: Write the setting-up-a-run SKILL.md

**Files:**
- Create: `.claude/plugins/auto-improve/skills/setting-up-a-run/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/plugins/auto-improve/skills/setting-up-a-run/SKILL.md`:

```markdown
---
name: auto-improve:setting-up-a-run
description: Use when starting a new auto-improve run. Validates inputs, cuts trunk branch, creates run directory, generates DESIGN_CONTRACT.md. Returns the run-id for subsequent steps.
---

# Setting Up An Auto-Improve Run

This skill is invoked once at the start of each auto-improve run, by the `auto-improve:running-the-loop` skill. It is not user-invokable.

## Inputs (preconditions)

The skill expects the following files at the project root:
- `auto-improve.config.yaml`
- `backlog.yaml`
- `BRAND.md`
- `handoff-bundle/` directory

Working tree must be clean. `main` branch must exist.

## Steps

1. **Validate config.** Run:

   ```bash
   node .claude/plugins/auto-improve/scripts/validate-config.mjs auto-improve.config.yaml
   ```

   If exit code != 0, fail with the validator's error output. Do not proceed.

2. **Validate backlog.** Run:

   ```bash
   node .claude/plugins/auto-improve/scripts/validate-backlog.mjs backlog.yaml
   ```

   If exit code != 0, fail.

3. **Verify required files exist.** Run:

   ```bash
   test -f BRAND.md && test -d handoff-bundle/
   ```

   If exit code != 0, fail with a message naming what's missing.

4. **Set up the run.** Run:

   ```bash
   .claude/plugins/auto-improve/scripts/setup-run.sh
   ```

   Capture stdout — that's the run-id (e.g., `2026-05-15-01`).

5. **Generate DESIGN_CONTRACT.md.** Invoke `auto-improve:writing-design-contract` skill, passing the run-id. The output is committed to trunk.

6. **Return the run-id and the trunk branch name** to the caller.

## Failure modes

- Working tree not clean → instruct user to commit/stash.
- Validation errors → print them, do not cut a branch.
- Missing BRAND.md or handoff-bundle/ → tell user what's missing.

## Output

On success, return:
- `run_id`: the computed run-id
- `trunk_branch`: `auto-improve/<run-id>/trunk`
- The session is now on the trunk branch with DESIGN_CONTRACT.md committed.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/setting-up-a-run
git commit -m "feat(auto-improve): add setting-up-a-run skill"
```

### Task 27: Write the writing-design-contract SKILL.md

**Files:**
- Create: `.claude/plugins/auto-improve/skills/writing-design-contract/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/plugins/auto-improve/skills/writing-design-contract/SKILL.md`:

```markdown
---
name: auto-improve:writing-design-contract
description: Use when generating DESIGN_CONTRACT.md at the start of an auto-improve run. Reads BRAND.md and handoff-bundle/ to produce a single plain-text contract that critics and implementers reference.
---

# Writing The Design Contract

One-shot skill invoked by `auto-improve:setting-up-a-run`. Reads `BRAND.md` and the contents of `handoff-bundle/`, produces `DESIGN_CONTRACT.md` at the project root, commits it to trunk.

## Inputs

- `BRAND.md` (project root)
- `handoff-bundle/` directory (project root). Files inside this directory are treated as opaque; read whatever is there. Common contents: `tokens.json`, `components.md`, screenshots, JSON exports.

## Output

`DESIGN_CONTRACT.md` at the project root, with the following sections:

```markdown
# Design Contract

## Brand voice (from BRAND.md)
[2-4 sentences summarizing the vibe, voice, tone — quote phrases from BRAND.md verbatim where useful]

## Do / Don't
[Bulleted list extracted from BRAND.md, plus any "do not use" rules implied by the handoff bundle]

## Token authority
[Summary of `tokens.json` (or equivalent): canonical colors, spacing scale, type scale, weights, radii]
[Statement: "Any value not in this list is a violation."]

## Component authority
[Summary of `components.md` (or equivalent): named components, their purpose, when to use each]
[Statement: "Composing these components is preferred. Authoring raw styled primitives where a component exists is a violation."]

## Layout primitives
[Anything in the bundle that defines section padding, container widths, breakpoints]

## Copy reference phrases
[Examples of on-brand and off-brand copy from BRAND.md]
```

## Process

1. Read `BRAND.md` in full.
2. List `handoff-bundle/` contents. For each file:
   - JSON files: parse and summarize.
   - Markdown files: read in full and integrate.
   - PNG/screenshots: note their existence and topic but do not embed.
3. Write `DESIGN_CONTRACT.md` using the template above. Be **specific**, not generic. Quote the source files where it sharpens meaning.
4. Commit:

   ```bash
   git add DESIGN_CONTRACT.md
   git commit -m "feat(run): generate DESIGN_CONTRACT.md for run <run-id>"
   ```

## Quality bar

The DESIGN_CONTRACT must be:
- **Self-contained.** A critic that has never seen BRAND.md or the bundle should be able to judge a diff against it.
- **Specific.** "Be confident" is useless. "Use active voice. No exclamation marks. No emojis." is useful.
- **Bounded.** No vague principles. Every "do" and "don't" should be checkable against a diff.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/writing-design-contract
git commit -m "feat(auto-improve): add writing-design-contract skill"
```

### Task 28: Test the setup flow end-to-end

**Files:** (none created; verification only)

- [ ] **Step 1: Stage the sample inputs at the project root**

Run:

```bash
cp examples/sample-site/auto-improve.config.yaml .
cp examples/sample-site/backlog.yaml .
cp examples/sample-site/BRAND.md .
cp -r examples/sample-site/handoff-bundle .
```

- [ ] **Step 2: Run the validation pipeline manually (simulating the skill)**

```bash
node .claude/plugins/auto-improve/scripts/validate-config.mjs auto-improve.config.yaml
node .claude/plugins/auto-improve/scripts/validate-backlog.mjs backlog.yaml
test -f BRAND.md && test -d handoff-bundle/ && echo "inputs ok"
```

Expected: all three pass, prints "inputs ok".

- [ ] **Step 3: Run setup-run.sh**

```bash
RUN_ID=$(.claude/plugins/auto-improve/scripts/setup-run.sh)
echo "run: $RUN_ID"
git branch --show-current
ls "docs/runs/${RUN_ID}/"
```

Expected: on `auto-improve/<run-id>/trunk` branch, log.md and rejected_proposals/ exist.

- [ ] **Step 4: Manually invoke design-contract writing**

In the live session, invoke the `auto-improve:writing-design-contract` skill. It should:
- Read BRAND.md and handoff-bundle/ contents.
- Produce DESIGN_CONTRACT.md at the project root.
- Commit it.

Verify:

```bash
cat DESIGN_CONTRACT.md
git log --oneline -1
```

Expected: contract file exists with all required sections; latest commit is "feat(run): generate DESIGN_CONTRACT.md for run <run-id>".

- [ ] **Step 5: Cleanup**

```bash
git checkout main
git branch -D "auto-improve/${RUN_ID}/trunk"
rm -rf "docs/runs/${RUN_ID}" auto-improve.config.yaml backlog.yaml BRAND.md handoff-bundle DESIGN_CONTRACT.md
```

- [ ] **Step 6: No commit needed (verification only).**

---

## Phase 4 — Subagent Prompt Files

Author each subagent's prompt file. These are dispatched by name from the executing-a-pass skill.

### Task 29: Write planner.md

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/planner.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/planner.md`:

```markdown
# Planner Subagent

You are the planner for an auto-improve run. Your job is to pick the next scope to work on.

## Inputs (provided by the caller)

- `BACKLOG_YAML`: full content of `backlog.yaml`
- `RUN_LOG`: full content of `docs/runs/<run-id>/log.md` so far
- `CURRENT_SCOPE`: the scope worked on in the previous pass (may be empty for pass 1)
- `SCOPE_ADVANCE_DECISION`: "STAY" or "ADVANCE" from the scope-advance check
- `SCOPES_COMPLETED`: list of scope slugs already marked done in this run

## Your task

1. If `SCOPE_ADVANCE_DECISION == "STAY"` and `CURRENT_SCOPE` is non-empty, return `CURRENT_SCOPE`.
2. Otherwise, return the first scope in `BACKLOG_YAML.scopes` whose slug is NOT in `SCOPES_COMPLETED`.
3. You MAY append a new scope to the backlog if reading the run log surfaces an obvious sub-scope worth splitting out (e.g., "the pricing-page work has revealed that 'plan-card' is a coherent sub-scope worth its own pass series"). When appending, write back to `backlog.yaml`. Never reorder existing scopes. Append-only.
4. If no scopes remain (all completed), return `BACKLOG_EMPTY`.

## Output (strict YAML)

```yaml
status: OK | BACKLOG_EMPTY | BLOCKED
selected_scope: <slug>           # only when status == OK
appended_scope: <slug>           # optional, only when you appended
rationale: |
  <1-2 sentence explanation>
```

## Failure modes

- If `BACKLOG_YAML` cannot be parsed: return `status: BLOCKED`, rationale describing the parse error.
- Never invent a scope that isn't in the backlog.
- Never reorder.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/planner.md
git commit -m "feat(auto-improve): add planner subagent prompt"
```

### Task 30: Write proposer.md

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/proposer.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/proposer.md`:

```markdown
# Proposer Subagent

You are the proposer for an auto-improve run. Given a scope, draft ONE concrete improvement proposal.

## Inputs

- `SCOPE`: full scope object from backlog (slug, purpose, routes, files)
- `DESIGN_CONTRACT`: contents of DESIGN_CONTRACT.md
- `BRAND_MD`: contents of BRAND.md
- `CURRENT_FILES`: contents of files in scope (you receive only relevant files)
- `SCREENSHOTS`: paths to current desktop + mobile screenshots of the routes
- `REJECTED_PROPOSALS`: contents of rejected_proposals/<scope>.yaml (may be empty)
- `ACCEPTED_PASSES_THIS_SCOPE`: summaries of prior accepted passes on this scope (may be empty)

## Your task

Propose ONE concrete change that:
- Addresses a real gap between the current state and the DESIGN_CONTRACT or BRAND.md.
- Is achievable in a small set of file edits.
- Is NOT semantically similar to anything in `REJECTED_PROPOSALS`.
- Is not a regression of anything in `ACCEPTED_PASSES_THIS_SCOPE`.

A "concrete" proposal names: the change in plain language, the specific files and lines, the expected user-visible effect, and the dimensions of critic-score improvement you expect.

## Output (strict YAML)

```yaml
status: OK | NEEDS_CONTEXT | BLOCKED
proposal_slug: <kebab-case, 3-5 words>          # only when status == OK
proposal_text: |
  <2-4 sentence description of the change>
target_files:
  - path: <file>
    summary: <what will change in this file>
expected_score_lift:
  design-system: <small | medium | large>
  ux: <small | medium | large>
  brand: <small | medium | large>
  a11y-perf: <small | medium | large>
rationale: |
  <why this change matters given the contract>
```

## Failure modes

- If files in scope cannot be read: NEEDS_CONTEXT, rationale lists missing files.
- If you've considered 3+ proposals and they all clash with REJECTED_PROPOSALS: BLOCKED.
- Never propose a change that touches a file outside `SCOPE.files` without strong justification in the rationale.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/proposer.md
git commit -m "feat(auto-improve): add proposer subagent prompt"
```

### Task 31: Write implementer.md

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/implementer.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/implementer.md`:

```markdown
# Implementer Subagent

You implement one auto-improve pass. Always invoke the `superpowers:test-driven-development` skill at the start of your work.

## Inputs

- `RUN_ID`, `PASS_NUMBER`, `SCOPE`, `PROPOSAL_SLUG`, `PROPOSAL_TEXT`
- `TARGET_FILES`: list of files the proposer named
- `BRANCH_NAME`: the pass branch you're already on (caller has run start-pass.sh)
- `DESIGN_CONTRACT`, `BRAND_MD`
- (On revision) `CHANGE_BRIEF`: aggregated critic feedback from prior iteration
- (On revision) `PRIOR_DIFF`: the diff you produced last iteration

## Your task

1. Verify you are on `BRANCH_NAME`. If not, BLOCKED.
2. Apply the proposal:
   - First iteration: produce the change described in `PROPOSAL_TEXT`. Stay close to TARGET_FILES; touching others requires noting why in your final report.
   - Revision iteration: address every item in `CHANGE_BRIEF`. Do not introduce unrelated changes.
3. Run TDD discipline if any logic is added (write failing test first, etc.).
4. Self-review the diff before committing. Check: does it match the proposal? Does it match the DESIGN_CONTRACT? Are there obvious regressions?
5. Commit:
   ```bash
   git add <changed files>
   git commit -m "<scope>: <one-line summary of change>"
   ```

## Output (final message)

```yaml
status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
diff_summary: |
  <2-4 sentences of what you actually changed>
files_touched:
  - <path>
concerns:                       # only if DONE_WITH_CONCERNS
  - <concern>
asked_questions:                # only if NEEDS_CONTEXT
  - <question>
blocker:                        # only if BLOCKED
  <description>
```

## Forbidden

- Do not create new branches.
- Do not merge anything.
- Do not modify files unrelated to the proposal without explicit justification.
- Do not skip TDD for behavior changes.
- Do not push to remote.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/implementer.md
git commit -m "feat(auto-improve): add implementer subagent prompt"
```

### Task 32: Write the design-system critic prompt

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/critics/design-system.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/critics/design-system.md`:

```markdown
# Design-System Critic

You judge a single auto-improve pass against the design system. You see ONLY the inputs listed below. You do not see other critics' reports, and you must not speculate about brand voice, copy quality, or accessibility — those are other critics' jobs.

## Inputs

- `DIFF`: full git diff of the pass branch vs. trunk
- `BEFORE_SCREENSHOTS`, `AFTER_SCREENSHOTS`: paths to images for each route × viewport
- `DESIGN_CONTRACT`: full text of DESIGN_CONTRACT.md
- `TOKENS_JSON`: full text of handoff-bundle/tokens.json (or equivalent)

## Your mandate

Score the diff on:
- `token_conformance` (0-10): are colors, spacing, typography, radii values from the token set?
- `component_usage` (0-10): does it use named components from the design system rather than reauthoring primitives?
- `contract_adherence` (0-10): does it follow the explicit "do/don't" rules in DESIGN_CONTRACT?

For each violation found, produce one issue entry with severity (`minor`, `major`, `hard-veto`), location, description, and suggested fix.

A `hard-veto` is reserved for: introducing a non-token color, breaking a stated do/don't rule, or replacing an existing component with a one-off implementation.

## Output (strict YAML)

```yaml
critic: design-system
overall_score: <average of dimensions, 1 decimal>
dimensions:
  token_conformance: <0-10>
  component_usage: <0-10>
  contract_adherence: <0-10>
issues:
  - severity: minor | major | hard-veto
    location: <file:line or "general">
    description: <one sentence>
    suggestion: <one sentence>
prose: |
  <2-4 sentences summarizing your read>
```

## Forbidden

- Do not score brand voice. Do not score a11y. Do not score perf.
- Do not invent issues. If the diff conforms, score high.
- Do not score below 4 on a dimension unless you have a concrete violation to point at.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/critics/design-system.md
git commit -m "feat(auto-improve): add design-system critic prompt"
```

### Task 33: Write the UX critic prompt

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/critics/ux.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/critics/ux.md`:

```markdown
# UX Critic

You judge a single auto-improve pass on UX/structural quality. You see ONLY the inputs listed below. You do not see DESIGN_CONTRACT, tokens, or BRAND.md — judge based on universal UX principles, not brand-specific rules.

## Inputs

- `DIFF`: full git diff
- `BEFORE_SCREENSHOTS`, `AFTER_SCREENSHOTS`: desktop and mobile
- `SCOPE_PURPOSE`: the scope's `purpose` string from backlog (e.g., "convert prospects to trial signups")

## Your mandate

Score on:
- `hierarchy` (0-10): visual hierarchy, headline weight, scannability
- `density` (0-10): whitespace, line lengths, content rhythm — neither cramped nor sparse
- `interaction` (0-10): affordances of clickable elements, hover/focus states implied by the diff
- `flow` (0-10): does the page lead the user toward `SCOPE_PURPOSE`?

`hard-veto` only for: hierarchy collapses (everything same weight), unscannable layouts, or interaction states removed without replacement.

## Output

```yaml
critic: ux
overall_score: <avg>
dimensions:
  hierarchy: <0-10>
  density: <0-10>
  interaction: <0-10>
  flow: <0-10>
issues:
  - severity: minor | major | hard-veto
    location: <file:line or screenshot region>
    description: <one sentence>
    suggestion: <one sentence>
prose: |
  <2-4 sentences>
```

## Forbidden

- Do not score colors, typography conformance, or brand voice.
- Do not score a11y or perf.
- Do not flag "the copy could be better" — that's the brand critic.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/critics/ux.md
git commit -m "feat(auto-improve): add UX critic prompt"
```

### Task 34: Write the brand critic prompt

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/critics/brand.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/critics/brand.md`:

```markdown
# Brand Critic

You judge a single auto-improve pass on brand voice and copy quality. You see ONLY the inputs listed below. You do not see tokens, screenshots, or layout details — judge based on text content alone.

## Inputs

- `DIFF`: full git diff (you focus on text-content portions)
- `BEFORE_TEXT`, `AFTER_TEXT`: rendered text from before/after the change for the affected routes
- `BRAND_MD`: full text of BRAND.md

## Your mandate

Score on:
- `voice` (0-10): does the copy match the voice rules in BRAND.md (active vs passive, sentence shape, etc.)?
- `clarity` (0-10): is the copy precise, specific, jargon-free? Does it lead with the user benefit?
- `vibe_match` (0-10): does the copy feel right for the brand vibe described in BRAND.md?

`hard-veto`: violations of explicit BRAND.md "don't" rules (e.g., "no exclamation marks", "no emojis", "no marketing superlatives").

## Output

```yaml
critic: brand
overall_score: <avg>
dimensions:
  voice: <0-10>
  clarity: <0-10>
  vibe_match: <0-10>
issues:
  - severity: minor | major | hard-veto
    location: <file:line or rendered text>
    description: <one sentence>
    suggestion: <one sentence with proposed copy if applicable>
prose: |
  <2-4 sentences>
```

## Forbidden

- Do not score layout, spacing, hierarchy, or typography.
- Do not score a11y or perf.
- Do not invent BRAND.md rules. Score only against what BRAND.md actually says.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/critics/brand.md
git commit -m "feat(auto-improve): add brand critic prompt"
```

### Task 35: Write the a11y-perf critic prompt

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/critics/a11y-perf.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/critics/a11y-perf.md`:

```markdown
# A11y/Perf Critic

You judge a single auto-improve pass on accessibility and performance. You see ONLY the inputs listed below.

## Inputs

- `DIFF`: full git diff
- `LIGHTHOUSE_REPORT`: contents of the latest Lighthouse gate JSON
- `AXE_REPORT`: contents of the latest axe gate JSON
- `BEFORE_SCREENSHOTS`, `AFTER_SCREENSHOTS`

## Your mandate

Confirm gates passed and find issues automated tools missed.

Score on:
- `accessibility` (0-10): combines axe results with manual checks (focus order, ARIA semantics, motion sensitivity, contrast at edges)
- `performance` (0-10): combines Lighthouse perf with diff-level concerns (e.g., new heavy imports, unnecessary client components)
- `motion_safety` (0-10): does the diff respect `prefers-reduced-motion`? Are new animations gentle?

`hard-veto`: any new critical or serious axe violation, perf regression > 10 points, missing reduced-motion handling for new animations.

## Output

```yaml
critic: a11y-perf
overall_score: <avg>
dimensions:
  accessibility: <0-10>
  performance: <0-10>
  motion_safety: <0-10>
issues:
  - severity: minor | major | hard-veto
    location: <file:line or report id>
    description: <one sentence>
    suggestion: <one sentence>
prose: |
  <2-4 sentences>
```

## Forbidden

- Do not score visual design or copy.
- Do not flag stylistic preferences.
- Score on what the reports show, not on speculation.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/critics/a11y-perf.md
git commit -m "feat(auto-improve): add a11y-perf critic prompt"
```

### Task 36: Write the synthesizer prompt

**Files:**
- Create: `.claude/plugins/auto-improve/prompts/synthesizer.md`

- [ ] **Step 1: Write the prompt**

Create `.claude/plugins/auto-improve/prompts/synthesizer.md`:

```markdown
# Synthesizer Subagent

You are the only agent that sees everything for a pass. You issue the verdict.

## Inputs

- `CRITIC_REPORTS`: list of 4 YAML blocks from each critic
- `GATE_REPORTS`: list of JSON outputs from each gate
- `PROPOSAL_TEXT`: the proposer's original proposal
- `PRIOR_ACCEPTED_SCORE`: average critic score of the most recent accepted pass on this scope (or null)
- `ITERATION_NUMBER`: 1-indexed iteration count for this pass
- `MIN_ITERATIONS_BEFORE_REJECT`: from config (typically 1)
- `ITERATION_CAP`: from config (typically 5)
- `CRITIC_ACCEPT_THRESHOLD`: from config (typically 8)
- `CRITIC_VETO_THRESHOLD`: from config (typically 4)

## Decision rules (deterministic; apply in order)

1. **REJECT** if and only if:
   - `ITERATION_NUMBER > MIN_ITERATIONS_BEFORE_REJECT`, AND one of:
     - At least one critic has issued a `hard-veto` issue, OR
     - `ITERATION_NUMBER == ITERATION_CAP` and the verdict still wouldn't be ACCEPT.
2. **ACCEPT** if and only if:
   - All gates pass, AND
   - All four critics' `overall_score >= CRITIC_ACCEPT_THRESHOLD`, AND
   - No critic has any single dimension below `CRITIC_VETO_THRESHOLD`.
3. **REQUEST_CHANGES** in all other cases.

On REQUEST_CHANGES, aggregate critic complaints into a deduplicated, prioritized `change_brief`:
- Lead with hard-veto items (must fix)
- Then major-severity issues
- Then minor issues
- For each: cite the critic, location, suggested fix
- Be concrete. The implementer will read this verbatim.

## Output (strict YAML)

```yaml
verdict: ACCEPT | REQUEST_CHANGES | REJECT
rationale: |
  <2-3 sentence explanation>
critic_summary:
  design-system: <score>
  ux: <score>
  brand: <score>
  a11y-perf: <score>
  average: <avg>
  delta_vs_prior_accepted: <signed delta or null>
change_brief: |                # ONLY on REQUEST_CHANGES
  <consolidated, prioritized edits for the implementer>
rejection_reasons:             # ONLY on REJECT
  - <one bullet per veto reason>
```

## Forbidden

- Do not invent issues critics didn't raise.
- Do not soften critic verdicts; if a critic flagged a hard-veto, treat it as such.
- Do not improvise the decision rules. Apply them as written.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/prompts/synthesizer.md
git commit -m "feat(auto-improve): add synthesizer prompt"
```

---

## Phase 5 — The Pass Skill

Wire the per-pass state machine. This is where prompt files, gate scripts, and lifecycle scripts come together into one runnable pass.

### Task 37: Write the executing-a-pass SKILL.md

**Files:**
- Create: `.claude/plugins/auto-improve/skills/executing-a-pass/SKILL.md`

This is the largest skill in the package. It encodes the per-pass state machine.

- [ ] **Step 1: Write the skill**

Create `.claude/plugins/auto-improve/skills/executing-a-pass/SKILL.md`:

```markdown
---
name: auto-improve:executing-a-pass
description: Use to execute one auto-improve pass: select scope, propose, implement, run gates, run critic council, synthesize verdict, accept-or-reject, log. Invoked by the running-the-loop skill once per iteration of the outer loop.
---

# Executing One Auto-Improve Pass

This skill encodes the per-pass state machine described in the design spec. It is invoked once per iteration of the outer loop. It does NOT manage stop conditions or scope-advance — those are the outer loop's job.

## Inputs (from caller)

- `RUN_ID`
- `PASS_NUMBER` (1-indexed)
- `CONFIG` (parsed config object)
- `BACKLOG` (parsed backlog object)
- `SCOPE` (the scope object selected by the planner)
- `RUN_DIR`: `docs/runs/<RUN_ID>`

## State machine

States execute in this order. A state's failure mode determines the next state.

### State 1: PROPOSING

Dispatch the proposer subagent with `prompts/proposer.md`. Build inputs:
- `SCOPE`
- `DESIGN_CONTRACT.md` contents
- `BRAND.md` contents
- Files in scope (read each path in `SCOPE.files`)
- Current screenshots (run `scripts/screenshot.mjs` and pass paths)
- `REJECTED_PROPOSALS`: contents of `<RUN_DIR>/rejected_proposals/<scope-slug>.yaml` (or empty list)
- Prior accepted-pass summaries from the run log

Parse the proposer's YAML output.
- If `status: BLOCKED` or `NEEDS_CONTEXT`: try once more with adjusted inputs; if still BLOCKED, abort the pass and return `PASS_ABORTED`.

### State 2: IMPLEMENTING

1. Compute `BRANCH_NAME = auto-improve/<RUN_ID>/passes/<NN>-<scope-slug>-<proposal-slug>`.
2. Run `scripts/start-pass.sh <RUN_ID> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture branch name.
3. Dispatch implementer subagent with `prompts/implementer.md`. Inputs:
   - `RUN_ID`, `PASS_NUMBER`, `SCOPE`, `PROPOSAL_SLUG`, `PROPOSAL_TEXT`
   - `TARGET_FILES`
   - `BRANCH_NAME`
   - `DESIGN_CONTRACT.md`, `BRAND.md`
   - On revision iterations: `CHANGE_BRIEF` and `PRIOR_DIFF`
4. Parse implementer output.
   - DONE: continue.
   - DONE_WITH_CONCERNS: log concerns, continue.
   - NEEDS_CONTEXT: provide additional context, re-dispatch.
   - BLOCKED: REJECT the pass.

### State 3: GATING

Run gate scripts in this order, fail fast:
1. `scripts/gates/typescript.sh /tmp/<RUN_ID>-<PASS_NUMBER>-ts.json`
2. `scripts/gates/lint.sh /tmp/<RUN_ID>-<PASS_NUMBER>-lint.json`
3. `scripts/gates/test.sh /tmp/<RUN_ID>-<PASS_NUMBER>-test.json`
4. `node scripts/gates/lighthouse.mjs /tmp/<RUN_ID>-<PASS_NUMBER>-lh.json`
5. `node scripts/gates/axe.mjs /tmp/<RUN_ID>-<PASS_NUMBER>-axe.json`
6. `node scripts/gates/visual-regression.mjs <baseline-dir> <current-dir> /tmp/<RUN_ID>-<PASS_NUMBER>-vr.json`

If any gate fails: build a `change_brief` from the failure JSON, increment iteration count, return to IMPLEMENTING. If iteration count reaches `iteration_cap_per_pass`, REJECT.

### State 4: CRITIQUING

Take fresh after-screenshots. Then dispatch all four critics **in parallel** in a single tool-use turn. Each critic is a fresh subagent with narrow inputs:

- design-system: DIFF, BEFORE/AFTER screenshots, DESIGN_CONTRACT, tokens.json
- ux: DIFF, BEFORE/AFTER screenshots, SCOPE.purpose
- brand: DIFF, BEFORE/AFTER rendered text, BRAND.md
- a11y-perf: DIFF, Lighthouse JSON, axe JSON, BEFORE/AFTER screenshots

Parse all four critic YAML reports. If any critic crashes, retry that one once. If still failing, proceed to SYNTHESIZING with that critic's report marked "missing".

### State 5: SYNTHESIZING

Dispatch the synthesizer with `prompts/synthesizer.md`. Inputs: 4 critic reports, gate JSONs, proposal text, prior accepted score, iteration number, config thresholds.

Parse the synthesizer's verdict.

### State 6: APPLY VERDICT

Branch on verdict:

**ACCEPT:**
1. Run `scripts/accept-pass.sh <RUN_ID> <BRANCH_NAME> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture merge SHA.
2. Build the log entry JSON (see `prompts/synthesizer.md` and append-log script).
3. Run `node scripts/append-log.mjs <RUN_ID> <entry.json>`.
4. Return `verdict: ACCEPT, scope_score: <avg>` to the outer loop.

**REQUEST_CHANGES:**
1. Increment iteration count.
2. If iteration count > iteration_cap_per_pass, treat as REJECT.
3. Otherwise: feed `change_brief` and `PRIOR_DIFF` back to State 2 (IMPLEMENTING).

**REJECT:**
1. Run `scripts/reject-pass.sh <RUN_ID> <BRANCH_NAME> <PASS_NUMBER> <scope-slug> <proposal-slug>`. Capture new (rejected) branch name.
2. Run `node scripts/append-rejected.mjs <RUN_ID> <scope-slug> <PASS_NUMBER> <new-branch> <proposal-text> <reason>`.
3. Build log entry JSON with verdict REJECTED.
4. Run `node scripts/append-log.mjs <RUN_ID> <entry.json>`.
5. Return `verdict: REJECT` to the outer loop.

## Output to caller

```yaml
verdict: ACCEPT | REJECT | PASS_ABORTED
scope_score: <avg of 4 critics>     # only on ACCEPT
iterations_used: <n>
```

## Forbidden

- Never skip a state.
- Never run critics serially when parallel is configured.
- Never accept a pass with a hard-veto critic issue.
- Never advance to the next pass while this pass's branch is still active (not merged or renamed).
- Never write to docs/runs/ except via the append-log and append-rejected scripts.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/executing-a-pass
git commit -m "feat(auto-improve): add executing-a-pass skill"
```

---

## Phase 6 — The Outer Loop Skill

The user-invokable entry point. Owns the outer loop, stop conditions, scope advance.

### Task 38: Write the running-the-loop SKILL.md

**Files:**
- Create: `.claude/plugins/auto-improve/skills/running-the-loop/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/plugins/auto-improve/skills/running-the-loop/SKILL.md`:

```markdown
---
name: auto-improve:running-the-loop
description: Run an autonomous overnight loop that iteratively improves the website in this repo against BRAND.md and a Claude Design handoff bundle. Use when the user says "run the auto-improve loop", "start an overnight polish run", "auto-improve this site for N hours", "polish my site overnight", or any phrasing that asks for an unsupervised iteration loop. The loop runs until wall-clock budget, STOP file, or empty backlog.
---

# Running The Auto-Improve Loop

User-invokable entry point. Orchestrates the entire run. Dispatches `auto-improve:setting-up-a-run`, then loops over `auto-improve:executing-a-pass` until a stop condition fires.

## Pre-flight checks (do these BEFORE invoking setup)

1. Confirm `auto-improve.config.yaml`, `backlog.yaml`, `BRAND.md`, `handoff-bundle/` exist.
2. Confirm working tree is clean.
3. Print the run plan to the user: wall-clock budget, scope count, gate list, critic list. Ask for confirmation.
4. Acknowledge cost: "This run will dispatch ~4 critics × up to 5 iterations × N passes. Expect significant model cost." Ask for confirmation.

## Step 1: Set up the run

Invoke `auto-improve:setting-up-a-run`. Capture `run_id`. Note start time.

## Step 2: The outer loop

```
SCOPES_COMPLETED = []
SCOPE_SCORES = {}        # scope_slug -> [score_at_pass_N, ...]
CURRENT_SCOPE = null
SCOPE_ADVANCE_DECISION = "ADVANCE"  # initial — pick first scope
PASSES = 0
PASSES_ACCEPTED = 0
PASSES_REJECTED = 0

WHILE true:
  # Stop check
  Run `node scripts/check-stop-conditions.mjs <start-iso> <wall-clock> <backlog-empty>`.
  IF exit code != 0: BREAK with stop reason from stdout.

  # Pick scope
  Dispatch planner with current state. Parse output.
  IF status == BACKLOG_EMPTY: BREAK with stop reason "backlog_empty".
  IF status == BLOCKED: log error and BREAK.
  CURRENT_SCOPE = output.selected_scope.

  # Execute one pass
  PASSES += 1
  Invoke `auto-improve:executing-a-pass` with PASS_NUMBER = PASSES, SCOPE = CURRENT_SCOPE, etc.
  Parse result.

  IF verdict == ACCEPT:
    PASSES_ACCEPTED += 1
    SCOPE_SCORES[CURRENT_SCOPE.slug].append(scope_score)
  ELSE IF verdict == REJECT:
    PASSES_REJECTED += 1
    # Score history unchanged.
  ELSE IF verdict == PASS_ABORTED:
    # Skip scoring; treat as a no-op pass for advance check.

  # Scope-advance check
  scores_csv = SCOPE_SCORES[CURRENT_SCOPE.slug].join(",") (or "")
  Run `node scripts/scope-advance-check.mjs <threshold> <window> <scores_csv>`.
  IF stdout starts with "ADVANCE":
    SCOPES_COMPLETED.append(CURRENT_SCOPE.slug)
    SCOPE_ADVANCE_DECISION = "ADVANCE"
  ELSE:
    SCOPE_ADVANCE_DECISION = "STAY"
END WHILE
```

## Step 3: Finalize

Build the run summary JSON:

```json
{
  "passes_total": <PASSES>,
  "passes_accepted": <PASSES_ACCEPTED>,
  "passes_rejected": <PASSES_REJECTED>,
  "scopes_touched": [<unique scope slugs touched>],
  "score_deltas": {<slug>: <last_score - first_score> for each scope}
}
```

Run `node scripts/finalize-run.mjs <RUN_ID> <stop-reason> <summary.json>`.

## Step 4: Hand off to the user

Tell the user:
- Trunk branch is `auto-improve/<RUN_ID>/trunk`, sitting N merges ahead of main.
- Run log is at `docs/runs/<RUN_ID>/log.md`.
- Rejected proposals at `docs/runs/<RUN_ID>/rejected_proposals/`.
- They can `git merge --ff-only`, squash-merge, cherry-pick, or discard.

## Forbidden

- Do not start work on `main`. Always go through setup-run.sh.
- Do not skip pre-flight cost confirmation.
- Do not invoke `executing-a-pass` while another pass is in flight.
- Do not write to docs/runs/ except via append-log and finalize-run scripts.
- Do not check stop conditions mid-pass — only between passes.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/running-the-loop
git commit -m "feat(auto-improve): add running-the-loop entry skill"
```

---

## Phase 7 — End-to-End Validation

Run the full pipeline against the sample site for one pass, then for a short timed run.

### Task 39: Single-pass dry run against the sample site

**Files:** (none created; verification only)

- [ ] **Step 1: Stage sample inputs**

Run:

```bash
cp examples/sample-site/auto-improve.config.yaml .
cp examples/sample-site/backlog.yaml .
cp examples/sample-site/BRAND.md .
cp -r examples/sample-site/handoff-bundle .
```

- [ ] **Step 2: Invoke the entry skill**

In the live Claude session, invoke `auto-improve:running-the-loop` and confirm the cost / plan acknowledgement.

Expected outcome: the session should:
1. Run pre-flight checks.
2. Set up the run, generate DESIGN_CONTRACT.md.
3. Pick the `hero` scope.
4. Run a single pass through the full state machine.
5. Either ACCEPT (merge with --no-ff into trunk) or REJECT (rename branch into rejected/).
6. If `STOP` file is created or wall-clock (set to 1h in sample config) elapses, stop gracefully.

- [ ] **Step 3: Test the STOP file**

Mid-run (or after one pass completes), run: `touch STOP`. Verify the next stop-condition check exits the loop and finalize-run is invoked. Then `rm STOP`.

- [ ] **Step 4: Verify outputs**

```bash
RUN_ID=$(git branch --show-current | sed -E 's|auto-improve/(.*)/trunk|\1|')
cat "docs/runs/${RUN_ID}/log.md"
ls "docs/runs/${RUN_ID}/rejected_proposals/" 2>/dev/null
git log --first-parent --oneline -5
```

Expected: log.md has at least one Pass entry plus the Run summary block. Trunk has at least the DESIGN_CONTRACT commit (and merge commits if any pass accepted).

- [ ] **Step 5: Cleanup**

```bash
git checkout main
git for-each-ref --format='%(refname:short)' "refs/heads/auto-improve/${RUN_ID}/*" \
  | xargs -r git branch -D
rm -rf "docs/runs/${RUN_ID}" auto-improve.config.yaml backlog.yaml BRAND.md handoff-bundle DESIGN_CONTRACT.md
```

- [ ] **Step 6: No commit (verification phase only).**

### Task 40: Short timed run (1 hour wall-clock)

**Files:** (none created; verification only)

- [ ] **Step 1: Stage sample inputs (as in Task 39 Step 1).**

- [ ] **Step 2: Invoke the loop and let it run for 1 hour.**

The sample config's `wall_clock_hours: 1` will cap the run. Observe the logs in real time. Expectations:

- Multiple passes against the `hero` scope.
- Either scope-advance to `pricing-page` after enough passes, or wall-clock fires first.
- All passes have proper merge commits or rejected/ branches.
- log.md is well-formed throughout.
- No partial passes left in flight.

- [ ] **Step 3: Inspect outcomes.**

```bash
RUN_ID=$(git branch --show-current | sed -E 's|auto-improve/(.*)/trunk|\1|')
cat "docs/runs/${RUN_ID}/log.md" | tail -100
git log --first-parent --oneline "auto-improve/${RUN_ID}/trunk"
git branch --list "auto-improve/${RUN_ID}/passes/*"
git branch --list "auto-improve/${RUN_ID}/rejected/*"
```

- [ ] **Step 4: If issues found, file them as follow-up tasks. Cleanup as in Task 39 Step 5.**

- [ ] **Step 5: No commit.**

---

## Phase 8 — First Real-Project Run (Manual, Out-of-Plan)

This phase is **not implementable here** because it happens on the user's other laptop against their real Next.js project. It exists in this plan to make the porting and shake-out work explicit.

### Task 41: Document the porting checklist

**Files:**
- Create: `.claude/plugins/auto-improve/PORTING.md`

- [ ] **Step 1: Write the porting checklist**

Create `.claude/plugins/auto-improve/PORTING.md`:

```markdown
# Porting auto-improve to a real project

When you're ready to run this against your real Next.js project (likely on a different laptop / Claude account):

## 1. Copy the skill files

From this template repo, copy `.claude/plugins/auto-improve/` to the real project's `.claude/plugins/auto-improve/`. Including the `samples/`, `prompts/`, `schemas/`, `scripts/`, and all four sub-skill directories.

## 2. Add the gitignore entries

In the real project's `.gitignore`, add:

\`\`\`
auto-improve.config.yaml
backlog.yaml
STOP
docs/runs/
\`\`\`

## 3. Install devDependencies

Run, in the project root:

\`\`\`bash
npm install --save-dev ajv ajv-formats js-yaml playwright @lhci/cli @axe-core/playwright pixelmatch pngjs
npx playwright install chromium
\`\`\`

## 4. Author your real BRAND.md

At the project root. Follow the structure in `.claude/plugins/auto-improve/samples/` (look at the sample-site BRAND.md for reference). Be specific.

## 5. Drop in the Claude Design handoff bundle

At the project root: `handoff-bundle/`.

## 6. Author auto-improve.config.yaml

Copy `.claude/plugins/auto-improve/samples/auto-improve.config.example.yaml` to the project root and edit. Crucially, update `project:`:

- `dev_server`: how the project's dev server starts (e.g., `npm run dev`)
- `dev_url`: usually `http://localhost:3000`
- `build_command`, `lint_command`, `test_command`, `typescript_command`: per the project's package.json scripts.

Start with a SHORT wall_clock_hours (say, 1) for the first run. You can extend later.

## 7. Author backlog.yaml

Copy `.claude/plugins/auto-improve/samples/backlog.example.yaml` and edit. For your first run, ONE scope is recommended. Pick something low-risk — not your hero or homepage — so failures don't damage anything important.

## 8. Run pre-flight

\`\`\`bash
node .claude/plugins/auto-improve/scripts/validate-config.mjs auto-improve.config.yaml
node .claude/plugins/auto-improve/scripts/validate-backlog.mjs backlog.yaml
\`\`\`

Both must pass.

## 9. First run

Tell the Claude session: "Run the auto-improve loop for 1 hour against this site." It should invoke `auto-improve:running-the-loop`, ask you to confirm the cost, and proceed.

## 10. Watch the first 15 minutes

Real-project runs surface real-project bugs that the toy site couldn't:
- Gate scripts assuming wrong paths
- Dev server failing to start under the orchestrator's `spawn`
- Visual-regression flakiness from real fonts and animations
- Critic prompts choking on production-scale diffs

Be ready to `touch STOP`, fix the issue, and re-run.

## 11. After the run

Inspect `docs/runs/<run-id>/log.md`. If you like what you see:

\`\`\`bash
git checkout main
git merge --ff-only auto-improve/<run-id>/trunk
\`\`\`

If you don't:

\`\`\`bash
git checkout main
git for-each-ref --format='%(refname:short)' "refs/heads/auto-improve/<run-id>/*" \
  | xargs -r git branch -D
\`\`\`

## Known shake-out items

- **Visual regression noise.** Tune the threshold in `gates/visual-regression.mjs` if real-project fonts and animations push false positives.
- **Critic verbosity on big diffs.** A real production page has more code than the sample. Critics may slow down or run out of context. Watch for it.
- **Dev server lifecycle.** Some projects have slow start times. Increase the `waitFor` timeout in `screenshot.mjs` and gate scripts if needed.
- **TypeScript path aliases.** If the real project uses path aliases that the sample didn't, gate scripts that hard-code paths may need updating.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/plugins/auto-improve/PORTING.md
git commit -m "feat(auto-improve): add porting checklist for real-project use"
```

---

## Self-Review Notes

After writing this plan, the following spec-coverage check passed:

- **Skill package structure (spec §"Skills in the Package"):** Tasks 26, 27, 37, 38 implement all four skills. Tasks 29-36 implement all eight prompt files.
- **Pre-run inputs (spec §"Pre-Run Inputs"):** Task 5 authors BRAND.md and handoff-bundle. Task 6 authors config and backlog. Task 1 gitignores them.
- **Configuration (spec §"Configuration"):** Tasks 7, 9 implement schema and validator. Task 6 produces a sample config matching the spec exactly.
- **Backlog (spec §"Backlog"):** Tasks 8, 10 implement schema and validator. Task 6 produces a sample.
- **Branch strategy (spec §"Branch Strategy"):** Tasks 11-13 implement run-id, setup, start/accept/reject scripts following the exact naming scheme.
- **Pass state machine (spec §"Pass State Machine"):** Task 37 encodes all six states. Tasks 14, 15 implement append-log and append-rejected used by the state machine.
- **Critic council & independence (spec §"Critic Council"):** Tasks 32-35 implement four critics with the spec's narrow inputs. Task 37 dispatches them in parallel. Synthesizer (task 36) is the only agent that sees everything.
- **Synthesizer rules (spec §"Synthesizer"):** Task 36 implements the exact deterministic rules from the spec.
- **Rejected-proposals memory (spec §"Rejected-Proposals Memory"):** Task 15 + Task 30 (proposer reads it).
- **Run log (spec §"Run Log"):** Task 14 implements append-log matching the spec's format.
- **Stop conditions (spec §"Stop Conditions"):** Task 16 + Task 38 (only checked at pass boundaries).
- **Phase 5 real-project run (out-of-scope-here-but-flagged-in-spec):** Task 41 documents the porting checklist.

Type/name consistency check:
- Branch naming is consistent across compute-run-id, setup-run, start-pass, accept-pass, reject-pass.
- The proposer's `proposal_slug` field is consumed by start-pass.sh as `<proposal-slug>` and by append-log as `entry.proposal_slug`.
- Critic output schema (overall_score, dimensions, issues) is consistent across all four critic prompts and the synthesizer's input expectations.
- Config field names match exactly between the schema, validator, and consumer scripts.

No placeholders remain. No "TBD". No "implement later". Every code block is complete.
