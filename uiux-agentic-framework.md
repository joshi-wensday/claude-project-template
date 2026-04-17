# UI/UX Agentic Workflow Framework

A reference for designing an AI agentic system that produces high-quality UI/UX output — from initial design exploration through to production-ready components. Intended to plug into an existing agentic coding workflow as the "design brain" that feeds it.

---

## How to read this document

- **Part 1** maps the knowledge space — the personas, disciplines, and best-practice bodies your agents need to draw from. This is what gives sub-agents their *expertise*.
- **Part 2** specifies the workflow — the double-diamond process, the agents, their handoffs, the artifacts they produce, and how it all converges on a production handoff. This is *how* the system runs.
- **Part 3** covers integration concerns — edit vs. create paths, handoff contracts to your coding agents, brand-guideline import, and how strict/flexible to be.
- **Part 4** is an implementation checklist — concrete next steps to build this.

A guiding principle throughout: **intention drives persona selection.** The system should always be clarifying *what is this for, who is it for, and what behavior should it produce* — and then loading the right expertise for that specific job. A pricing page and a meditation app should not be designed by the same "designer."

---

# PART 1 — KNOWLEDGE MAP

## 1.1 The Persona Library

Personas are the "hats" your sub-agents wear. Each persona bundles a perspective, a vocabulary, a set of heuristics, and a list of things-it-cares-about. Don't think of these as separate agents — think of them as *role descriptions* that the orchestrator assigns to a worker agent based on the task.

### Strategic / Framing personas
*(used early, before any pixels)*

- **Product strategist** — Why does this product exist? What's the wedge? Who's the user and what's their job-to-be-done? Owns the problem statement.
- **Brand strategist** — What does this brand stand for? What's the personality, the voice, the emotional register? Owns brand attributes (e.g., "trusted but irreverent," "premium but accessible").
- **UX researcher** — What do we know about the users? What are their mental models, pain points, contexts of use? Owns user personas, journey maps, JTBD.
- **Information architect** — How is the content/functionality organized? What's the navigation model? Owns sitemaps, taxonomies, content hierarchies.

### Craft / Making personas
*(used during exploration and refinement)*

- **Art director** — Owns the overall visual direction. Picks the bold aesthetic stake-in-the-ground. Resists genericness.
- **Visual designer** — Executes within the art direction. Owns typography pairings, color systems, spacing scales, iconography.
- **Interaction designer** — Owns micro-interactions, state transitions, gestures, affordances. Concerned with how things *feel* to use.
- **Motion designer** — Owns animation, easing curves, choreography, page transitions. Concerned with rhythm and pacing.
- **Design systems architect** — Owns tokens, components, variants, composability rules. Concerned with consistency at scale.
- **Copywriter / UX writer** — Owns microcopy, button labels, empty states, error messages, voice and tone in the interface itself.

### Specialist personas
*(loaded conditionally based on intent)*

- **Conversion / sales designer** — When the goal is to *convert*. Knows landing-page anatomy, CTA hierarchy, social proof patterns, friction reduction, urgency/scarcity (used ethically).
- **Onboarding designer** — When the goal is to *activate*. Knows progressive disclosure, empty-state design, first-run experiences, time-to-value optimization.
- **Data/dashboard designer** — When the goal is *comprehension*. Knows information density, visualization grammar, scannability, decision-support patterns.
- **Editorial / content designer** — When the goal is *reading*. Knows long-form layout, measure, leading, pull quotes, narrative pacing.
- **Game / playful designer** — When the goal is *delight*. Knows juice, feedback loops, reward schedules, Easter eggs.
- **Accessibility specialist** — Always present in some capacity. Knows WCAG, ARIA, keyboard nav, screen reader patterns, color contrast.
- **Behavioral designer** — When the goal involves *changing behavior*. Knows habit loops, BJ Fogg model, COM-B, defaults, framing effects.
- **Trust / safety designer** — When the goal involves *high stakes*. Knows confirmation patterns, irreversibility warnings, recovery flows, transparency design.
- **Enterprise / B2B designer** — When users are *power users*. Knows density, keyboard shortcuts, bulk actions, configurability, workflow optimization.
- **Mobile / responsive designer** — When the form factor demands it. Knows touch targets, thumb zones, gesture vocabularies, platform conventions (iOS HIG, Material).
- **Internationalization designer** — When global. Knows text expansion, RTL, cultural color associations, localization-friendly layouts.

### Critique personas
*(used in evaluation loops)*

- **Design critic** — Holds the work to a standard. Looks for genericness, inconsistency, missed opportunities. Asks "is this actually good or just acceptable?"
- **User advocate** — Plays the user. Looks for confusion, frustration, dead-ends, dark patterns.
- **Engineering liaison** — Looks at feasibility, performance, complexity cost, edge cases (loading, error, empty, offline).

---

## 1.2 Knowledge Domains

These are the bodies of knowledge the personas draw from. Organize these as reference material your sub-agents can pull into context.

### Foundational design
- **Visual design fundamentals** — hierarchy, contrast, balance, repetition, alignment, proximity, white space
- **Typography** — type anatomy, pairing, scale, measure, leading, hierarchy, web font performance
- **Color theory** — color systems (HSL, OKLCH), accessibility contrast, semantic color, color in dark/light modes, cultural meaning
- **Layout & composition** — grid systems, modular scales, golden ratio, asymmetry, gestalt principles, F/Z patterns
- **Iconography** — pictogram vs. icon, consistency in stroke/corner/style, semantic clarity

### Interaction & behavior
- **Interaction design principles** — Nielsen's heuristics, Norman's design principles (affordance, signifier, feedback, mapping)
- **Behavioral psychology in UX** — Fitts's Law, Hick's Law, Miller's Law, Jakob's Law, Tesler's Law, Postel's Law, peak-end rule, serial position effect
- **Cognitive load theory** — intrinsic/extraneous/germane load, chunking, progressive disclosure
- **Persuasion & influence** — Cialdini's principles (reciprocity, commitment, social proof, authority, liking, scarcity), framing, anchoring, loss aversion
- **Habit & motivation design** — BJ Fogg behavior model (B=MAT), Hooked model (trigger-action-reward-investment), self-determination theory
- **Dark patterns awareness** — what they are, why to avoid them, ethical alternatives

### Systems & scale
- **Design systems** — tokens (primitive, semantic, component), components, variants, slots, composition patterns
- **Atomic design methodology** — atoms, molecules, organisms, templates, pages
- **Design tokens spec** — naming conventions, token categories, theming, modes (light/dark, density)
- **Component API design** — props, slots, controlled/uncontrolled, composition over configuration

### Content & language
- **UX writing** — voice & tone matrices, microcopy patterns, error message design, empty state writing, button label conventions
- **Content strategy** — message hierarchy, plain language, inverted pyramid, scannable structure
- **Inclusive language** — terminology, pronouns, cultural sensitivity

### Accessibility & inclusion
- **WCAG 2.2 / 3.0** — perceivable, operable, understandable, robust
- **ARIA patterns** — roles, states, properties; the ARIA Authoring Practices Guide patterns
- **Inclusive design principles** — Microsoft's inclusive design toolkit, situational/temporary/permanent disability framing
- **Assistive technology** — screen readers, keyboard nav, voice control, switch control, magnification

### Domain-specific knowledge
- **Conversion optimization** — landing page anatomy, above-the-fold rules, CTA design, form optimization, trust signals
- **SaaS UX patterns** — onboarding (product tours, empty states, sample data), settings architecture, billing UX, team/permissions UX
- **E-commerce UX** — PLP/PDP patterns, cart/checkout flows, trust badges, reviews, search & filtering
- **Dashboard / data UX** — Stephen Few's principles, Edward Tufte's data-ink ratio, chart selection, tabular vs. visual
- **Mobile UX** — iOS HIG, Material Design 3, gesture grammars, thumb zones, native vs. web feel
- **Gaming UI** — diegetic/non-diegetic UI, HUD design, juice (Jonasson/Purho), feedback density

### Aesthetic / style references
- A library of named aesthetic directions the system can draw on: brutalist, swiss/international, editorial, neo-brutalist, glassmorphism, claymorphism, neumorphism, retro-futurist, vaporwave, Y2K, Memphis, Bauhaus, art deco, cyberpunk, organic/natural, luxury/refined, playful/toy-like, industrial/utilitarian, magazine/editorial, tech-minimal, etc.
- Each named direction should come with: *what it's good for, what it's bad for, characteristic moves (typography, color, layout, motion), failure modes*.

---

## 1.3 The Intent Taxonomy

This is the most important conceptual piece. Every design decision in the workflow should be grounded in a clear answer to: **what is the intention here?** Intent operates at three levels:

### Level 1 — Project intent (the whole product)
Captured once at the start, referenced throughout.
- **Product type** — marketing site / SaaS app / e-commerce / content/editorial / utility tool / game / creative tool / community/social / dashboard / internal tool
- **Primary goal** — convert / activate / retain / inform / entertain / enable productivity / build trust / facilitate transaction
- **Audience sophistication** — general public / professionals / experts / power users / mixed
- **Emotional register** — serious/trustworthy / playful/fun / premium/refined / raw/honest / warm/personal / clinical/precise
- **Stakes** — low (browsing) / medium (signup) / high (financial, health, irreversible)

### Level 2 — Surface intent (per page/screen/flow)
Captured per major surface.
- **Surface type** — landing / pricing / signup / onboarding / dashboard home / detail view / settings / checkout / empty state / error
- **Primary action** — what's the one thing the user should do here?
- **Success metric** — how do we know this surface worked?
- **Emotional moment** — what should the user feel when they arrive / when they complete?

### Level 3 — Component intent (per component)
Captured per non-trivial component.
- **Component role** — primitive / pattern / template
- **Job** — what does this do for the user, in one sentence?
- **States** — default / hover / focus / active / disabled / loading / error / empty / success
- **Variants** — by size, by emphasis, by context

The orchestrator uses the intent specification to **pick which personas to load** for any given sub-task. A pricing page sub-agent gets art director + visual designer + conversion designer + copywriter. A dashboard sub-agent gets art director + visual designer + data designer + accessibility specialist.

---

## 1.4 Quality Bars & Anti-Patterns

What "good" looks like, and what to avoid. Sub-agents check their work against these.

### Quality bars
- **Intentionality** — every choice (font, color, spacing, motion) has a *reason* tied back to brand/intent
- **Cohesion** — the system feels like one designer made it; tokens are used; nothing is one-off
- **Hierarchy** — the eye knows where to go; importance is encoded visually
- **Restraint** — no element fights for attention without earning it; whitespace is used
- **Distinctiveness** — the work has a point of view; it's not interchangeable with a hundred other apps
- **Feel** — micro-interactions, motion, and feedback make it feel *alive*, not static
- **Robustness** — empty/loading/error/long-content states are designed, not afterthoughts
- **Accessibility** — meets WCAG AA at minimum; keyboard nav works; semantic HTML

### Anti-patterns to actively avoid
- **AI-generic aesthetic** — purple gradients on white, generic SaaS, Inter everywhere, identical card grids
- **Default everything** — system fonts, browser-default form controls, no considered spacing
- **Decoration without purpose** — animation for animation's sake, gradients that don't serve hierarchy
- **Solved-by-Tailwind syndrome** — applying utility classes without a coherent system underneath
- **Token-less** — hardcoded colors and spacings scattered everywhere
- **Missing states** — only the happy-path designed; loading is a spinner, error is "Something went wrong"
- **Dark patterns** — confusing opt-outs, hidden costs, manipulative urgency, roach motels
- **Inconsistent components** — three button styles, four card styles, no clear system

---

# PART 2 — THE WORKFLOW

## 2.1 The Double-Diamond Shape

The overall flow is two diamonds (diverge → converge → diverge → converge), with an explicit *brand foundation* phase before the first diamond and a *production handoff* after the second.

```
  [FOUNDATION]      [DIAMOND 1: DIRECTION]      [DIAMOND 2: EXECUTION]      [HANDOFF]
                                                                            
  Intent capture    Diverge: aesthetic          Diverge: components,        Production-ready
  Brand import      explorations (3-6 bold,     pages, flows               components,
  Constraints       distinct directions)        (multiple per surface)     tokens, docs
                    Converge: user picks 1      Converge: user picks,      Hand off to
                    + refinement → design       refines → final design     coding agents
                    system v1                   system v2 + page set
```

**Why this shape:**
- The first diamond is about **direction** — committing to a coherent aesthetic and brand foundation. Without this, everything downstream is incoherent.
- The second diamond is about **execution** — applying the direction across components and pages. Variations explore *application*, not *direction*.
- The transitions are explicit user-in-the-loop moments. The AI does the divergent generation; the user does the convergent selection. *Always.*

## 2.2 Phase-by-Phase Spec

### Phase 0 — Foundation (intent + brand)

**Goal:** Establish what we're building, for whom, and within what brand constraints.

**Inputs the system asks for / infers:**
- Project intent (using the Level 1 intent taxonomy above) — answered via a structured elicitation, not an open prompt
- Existing brand assets, if any — logo, brand guidelines doc, existing site, design tokens, Figma file
- Strictness setting — *strict* (must obey existing brand exactly), *flexible* (existing brand as starting point, can evolve), *fresh* (ignore or no existing brand)
- Technical constraints — framework (React/Vue/HTML), component library if any, CSS approach (Tailwind, CSS-in-JS, vanilla), browser/device targets
- Inspiration — references the user likes (URLs, screenshots, named aesthetics)

**Sub-agents:**
- **Intent interviewer** — runs structured elicitation, fills out the intent spec
- **Brand importer** — if brand assets exist, parses them into a structured `brand-foundation.json` (tokens, voice, principles, do/don't)
- **Reference analyzer** — if references provided, characterizes *why* the user might like them (don't copy — extract principles)

**Artifact produced:** `brand-foundation.md` + `brand-foundation.json`
Contains: brand attributes, voice & tone, primitive tokens (if any locked in), aesthetic direction guardrails, strictness level, and the full intent spec.

**Exit criterion:** User confirms the foundation doc captures their intent.

---

### Phase 1 — Diamond 1: Aesthetic Direction

#### 1A — Diverge: aesthetic explorations

**Goal:** Generate 3–6 *distinct, bold, committed* aesthetic directions. Each one should be a real point of view, not a variation on a theme.

**How:**
- Spawn N parallel sub-agents (one per direction), each with the **art director** persona
- Each is given the foundation doc + a *different* aesthetic stake (e.g., "editorial brutalist," "warm organic," "swiss precision," "playful maximalist")
- Each produces: a one-page *style tile* — typography pairing, color palette with semantic roles, a "hero moment" mock (one signature component or section), a one-paragraph manifesto explaining the direction, and a list of 3 reference vibes (named aesthetics, not URLs)
- Critically: each direction should be **genuinely different** — not three variations of "modern SaaS." The orchestrator should sanity-check this and re-spawn if directions converge.

**Anti-pattern to actively guard against:** AI tendency to converge on safe/generic. The orchestrator should explicitly instruct: "make at least one direction that feels risky."

#### 1B — Converge: user selects + refines

**Goal:** Pick a direction and lock in the foundation.

**How:**
- Present the N directions side-by-side
- User picks one (or asks for a hybrid, or rejects all and asks for a new round)
- Refinement sub-loop: user gives feedback ("love the type, hate the orange"), agent revises, repeat until locked
- **Design system architect** persona then formalizes the chosen direction into a `design-system-v1.json` — primitive tokens (color, type, space, radius, shadow, motion), semantic tokens (background, surface, foreground, border, action), and the first set of *foundational* component definitions (button, input, card, link, heading scale)

**Artifact produced:** `design-system-v1.json` + `design-system-v1.md` (human-readable rationale)

**Exit criterion:** User confirms the design system v1 feels right.

---

### Phase 2 — Diamond 2: Execution

#### 2A — Diverge: surfaces and components

**Goal:** Apply the design system across the actual surfaces of the product, generating multiple variations per surface.

**How:**
- Orchestrator reads the project spec to identify surfaces needed (e.g., "landing page, pricing, dashboard, settings, signup flow")
- For each surface, the orchestrator:
  1. Identifies the **surface intent** (Level 2 of the intent taxonomy)
  2. Selects the appropriate persona stack (e.g., for pricing: art director + visual designer + conversion designer + copywriter)
  3. Spawns 2–3 parallel sub-agents to generate variations (e.g., "pricing as comparison table," "pricing as guided choice," "pricing as outcome-led")
  4. Each variation must use the design system — no new tokens invented unless flagged
- **Component gap detection:** if a surface needs a component not in the system, sub-agent flags it (does NOT invent ad-hoc). The orchestrator routes the gap to a **component creation** sub-loop with the design systems architect persona, who designs the new component *within* the system, updates `design-system-v1.json` → `v1.1`, and the surface generation resumes.

This is the answer to your "what if a page needs a new component" question: **yes, you go back, but it's a structured detour, not a free-for-all.** The system protects against the most common AI failure mode here, which is *silently inventing one-off components per page*.

#### 2B — Converge: select + finalize

**Goal:** Pick the variations and produce the final design set.

**How:**
- For each surface, present variations to user, user picks (or hybrid)
- Refinement loop per surface
- **Design critic** persona does a pass at the end: checks cohesion across surfaces, flags inconsistencies, suggests system-level fixes
- **Accessibility specialist** does a pass: checks contrast, focus states, semantic structure, keyboard flow
- **User advocate** does a walkthrough: traces each key user flow end-to-end, flags friction, dead-ends, missing states (loading/empty/error/success per surface)

**Artifact produced:** `design-system-v2.json` (final tokens + components), `surfaces/` (one spec per surface), `flows/` (one spec per multi-step flow), `design-rationale.md` (why this design, for downstream agents)

**Exit criterion:** User confirms the full design set is ready for build.

---

### Phase 3 — Production Handoff

**Goal:** Hand off to the coding agents in a form they can build from cleanly.

**How:**
- **Design systems architect** generates the production token files (CSS variables / Tailwind config / theme object — whatever the target stack uses)
- For each component: produces a component spec (props/variants/states), an HTML/JSX skeleton, and usage examples
- For each surface: produces a layout spec referencing only system components
- **Engineering liaison** persona does a final pass: flags anything ambiguous, anything that will be expensive to build, anything that needs a decision before code starts
- The coding agents then receive this as a *contract*. They're not asked to make design decisions — they're asked to implement a defined spec.

**Artifacts produced (the handoff package):**
- `tokens/` — raw token files in the target format
- `components/` — one folder per component, each with spec.md + skeleton + states
- `surfaces/` — one folder per surface, each with layout spec + references to components used
- `design-rationale.md` — the *why* behind the decisions (so coding agents don't accidentally undo intent)
- `do-not.md` — explicit list of "do not change X without re-running design phase" guardrails

---

## 2.3 The Sub-Agent Pattern

Sub-agents in this system are **not** "the visual designer agent" or "the UX agent." They are **task-scoped workers loaded with a persona stack and a knowledge slice**. This matters because:

- A "do everything" designer agent dilutes expertise
- A persona-per-agent setup is rigid and creates handoff overhead
- A task-scoped worker with the *right combination* of personas for *that specific task* is sharp and focused

### The orchestration pattern

```
Orchestrator
  ├── reads: intent spec, current phase, current artifact
  ├── decides: what's the next task, what personas does it need, what knowledge does it need
  ├── spawns: worker agent with [task brief + persona stack + knowledge refs + relevant artifacts]
  ├── receives: worker's output
  ├── routes: to user (if convergence point), to critic (if quality check), to next task
  └── updates: shared artifacts (design system, surfaces, flows)
```

### Persona stack examples by task

| Task | Persona stack |
|------|---------------|
| Generate aesthetic direction explorations | Art director + brand strategist |
| Design a pricing page | Art director + visual designer + conversion designer + copywriter |
| Design a dashboard home | Art director + visual designer + data designer + IA |
| Design an onboarding flow | Visual designer + onboarding designer + behavioral designer + copywriter |
| Design a checkout flow | Visual designer + conversion designer + trust designer + copywriter |
| Design a settings page | Visual designer + IA + enterprise designer |
| Audit cohesion across surfaces | Design critic + design systems architect |
| Audit accessibility | Accessibility specialist |
| Audit user flows | User advocate + UX researcher |
| Define a new component | Design systems architect + interaction designer |
| Write microcopy pass | Copywriter + brand strategist |
| Production handoff | Design systems architect + engineering liaison |

### Knowledge slicing

Each persona has an associated **knowledge reference set** — the docs/principles it should pull into context. Don't load everything every time. The conversion designer needs landing-page anatomy and Cialdini, not WCAG patterns. The accessibility specialist needs WCAG and ARIA patterns, not conversion psychology. Match the load to the task.

---

## 2.4 The Shared State Model

The whole workflow operates on a small set of shared, versioned artifacts. Sub-agents read from and write to these. Think of it as the system's working memory.

```
project/
├── 00-foundation/
│   ├── intent.json              # Level 1 intent spec
│   ├── brand-foundation.md      # human-readable
│   ├── brand-foundation.json    # machine-readable
│   └── references.md            # user-provided inspiration
├── 01-direction/
│   ├── explorations/            # Diamond 1A outputs
│   │   ├── direction-a.md
│   │   ├── direction-b.md
│   │   └── ...
│   └── selected-direction.md    # Diamond 1B output
├── 02-system/
│   ├── design-system.json       # versioned, current
│   ├── design-system.md         # human rationale
│   └── changelog.md             # every system change w/ reason
├── 03-surfaces/
│   ├── <surface-name>/
│   │   ├── intent.json          # Level 2 intent
│   │   ├── variations/          # Diamond 2A outputs
│   │   └── selected.md          # Diamond 2B output
│   └── ...
├── 04-flows/
│   └── <flow-name>.md
└── 05-handoff/
    ├── tokens/
    ├── components/
    ├── surfaces/
    ├── design-rationale.md
    └── do-not.md
```

**Versioning rule:** the design system is the only thing that's *truly* mutable across phases. Surfaces and flows reference a design system version; if the system changes after surfaces are designed, the orchestrator flags affected surfaces for re-review. This prevents silent drift.

---

# PART 3 — INTEGRATION CONCERNS

## 3.1 Edit-existing vs. create-new

You asked whether this is one workflow or two. The answer: **one workflow with two entry points**, sharing all the same machinery downstream.

### Entry point A — Greenfield (no existing UI)
Start at Phase 0 (foundation) and proceed normally.

### Entry point B — Existing UI (edit/improve mode)
Start with a **reverse-engineering phase** that reconstructs the foundation, system, and surface artifacts *from* the existing code, then enters the regular workflow at the appropriate point.

**Reverse-engineering sub-phase:**
1. **Code analyzer** parses the existing UI to extract: tokens (or token-like values), component inventory, surface inventory, what's consistent vs. one-off
2. **Brand reverse-engineer** infers brand attributes from the existing visual language
3. **Design critic** does a teardown: what's working, what's not, what's incoherent
4. Produces the same `00-foundation/` and `02-system/` artifacts as greenfield, but marked `derived-from-existing`
5. User confirms / corrects the reconstruction
6. Workflow then enters at the appropriate diamond:
   - "Refresh the whole look" → re-enter at Diamond 1A
   - "Add a new feature consistent with current design" → enter at Diamond 2A for that surface
   - "Fix the design system" → enter at the system architect sub-loop
   - "Just polish this one page" → spawn a single surface variation pass

**Why one workflow:** the artifact model (foundation → system → surfaces → handoff) is the same either way. Reverse-engineering just builds the upstream artifacts from existing code instead of from interview. This means the same sub-agents and personas work in both modes.

## 3.2 Brand strictness as a first-class setting

The user's foundation declares a **strictness level** that gates downstream behavior:

- **Strict** — Existing brand tokens are locked. No new tokens may be added without explicit user approval. New components must compose from existing primitives. The art director persona is *not* spawned (no aesthetic divergence) — straight to execution.
- **Flexible** — Existing brand is the starting point but can evolve. New tokens may be proposed (with rationale and user approval). Aesthetic divergence is constrained to "evolutions of current direction" rather than entirely new directions.
- **Fresh** — No constraints. Full Diamond 1 divergence.

The orchestrator checks strictness at every divergence point and shapes the prompt accordingly.

## 3.3 Handoff contract to coding agents

This is where your existing system picks up. The handoff should look like a **specification a competent engineer could implement without making design decisions**. Specifically:

- **Tokens are the source of truth.** Coding agents must use tokens, never hardcoded values. The token file is canonical.
- **Components are specified, not described.** Each has: name, props/variants/states, layout/structure, semantic HTML, accessibility requirements, behavior, and a reference implementation skeleton.
- **Surfaces compose components.** Surface specs reference components by name; coding agents implement by composition. If a coding agent finds itself needing a non-existent component or token, it must *flag* (route back to design phase), not invent.
- **The `do-not.md` exists.** This file lists things the coding agent must not unilaterally change (e.g., "do not change the type scale," "do not add new color tokens," "do not change the button corner radius"). It's a guardrail against entropy.

The coding agents you already have can be told: "you operate on the handoff package; if you need something that isn't there, raise it back to the design system." This is the same pattern as good engineer/designer collaboration in human teams.

## 3.4 Convergence with backend / data shape

Real UI design has to honor real data. The system handles this via:

- A **data contract** input (alongside intent) — what data exists, what shape, what's expensive to fetch, what's real-time vs. cached
- Surface specs include **data dependencies** — which API/endpoint/state slice each surface needs
- The design critic persona checks: "does this design assume data we don't have? does it ignore data we do have?"

If your backend/data layer changes mid-flight, surfaces depending on the changed contract are flagged for re-review (same mechanism as design system versioning).

---

# PART 4 — IMPLEMENTATION CHECKLIST

A practical sequence for actually building this on top of your existing agentic system.

### Build order

1. **Define the artifact schemas first.** Intent spec, brand foundation, design system, surface spec, component spec, handoff package. JSON schemas are good here. *Until these are concrete, nothing else can be.*

2. **Build the foundation phase.** This is the highest-leverage piece — most "meh" AI-generated UI comes from skipping intent and brand. A solid `brand-foundation.json` and intent spec, even with a basic generator downstream, will already lift quality dramatically.

3. **Build the design system v1 generator.** Given a foundation doc, output a coherent token set and base components. This alone, fed to your existing coding agents, will be a step change.

4. **Build the divergent direction phase.** This is what stops AI-generic output. Forcing 3–6 *distinct* aesthetic stakes with a user-pick step is the single biggest lever for distinctiveness.

5. **Build the surface generator with the persona-stack pattern.** Start with 2–3 personas (art director, visual designer, copywriter) and the conversion designer. Add specialists as needed.

6. **Build the gap-detection / component-creation sub-loop.** This is what protects system coherence — without it, you get drift back to one-off components per page.

7. **Build the critic passes.** Design critic, accessibility specialist, user advocate. Even simple checklist-based critics catch a huge amount.

8. **Build the handoff packager.** Format the artifacts for your existing coding agents to consume.

9. **Build the reverse-engineering entry point.** Once greenfield works, add the edit-existing path.

### What to skip initially

- Don't build all 25+ personas on day one. Start with the 6–8 most common (art director, visual designer, conversion designer, accessibility specialist, copywriter, design systems architect, design critic, user advocate) and add others as you hit cases that need them.
- Don't build full brand-asset parsing. Start with a structured form/interview and add file parsing later.
- Don't build perfect design-system versioning. Start with "system is overwritten each phase" and add versioning when you hit the drift problem.

### Key risks to watch for

- **Convergence to safe.** The diverge phases are pointless if all variations look similar. Hard-instruct distinctiveness, and have a critic that rejects sets that converged.
- **Token bypass.** Sub-agents will be tempted to use raw values instead of tokens. The handoff packager should reject any non-token values.
- **State sprawl.** As surfaces multiply, the artifact tree grows. Keep it organized; consider an index/manifest.
- **Persona overload.** Loading too many personas dilutes the output. 3–5 is usually right; more is usually wrong.
- **Skipping the user-in-the-loop.** The convergence steps must be real human gates. If the system auto-converges, you're back to "AI picks for itself" which is where mediocrity comes from.
- **Critic toothlessness.** Critics need teeth. A "looks fine" critic is worse than no critic. Give them explicit reject criteria.

### How this slots into your existing agentic system

Your existing system handles the coding side well, per your message. So this UI/UX system should be designed as **a producer of high-quality design specs that your coding system consumes**:

- Your existing system invokes the UI/UX system when a project starts (or when a UI change is requested)
- The UI/UX system runs Phases 0–3 (with user in the loop at convergence points)
- The handoff package is delivered to your coding system in a format it already knows how to build from
- For ongoing work, your coding system can route UI questions back to the UI/UX system (e.g., "I need a new component that doesn't exist" → triggers the component creation sub-loop)

The UI/UX system can be implemented as a **skill** (or set of skills) in your existing setup — one for the orchestration, with referenced sub-skills for each persona's knowledge base. This maps cleanly onto the skill-creator pattern: progressive disclosure (load only the personas needed), bundled references (the knowledge domains), and a clear top-level workflow.

---

## Closing thought

The reason most AI-generated UI is "meh" comes down to three failures, in order of severity:

1. **No intent.** The system designs without knowing what it's designing for, so everything defaults to generic.
2. **No commitment.** Even when intent is clear, the system hedges aesthetically — picks safe defaults, avoids strong choices.
3. **No system.** Even when individual screens are good, they don't add up to a coherent product.

The framework above attacks all three: the intent taxonomy fixes #1, the diverge-converge with forced distinctiveness fixes #2, the design system as canonical artifact fixes #3.

Build the foundation phase and the design system generator first. Even those two pieces alone, fed to your existing coding agents, will produce a noticeable jump in quality.
