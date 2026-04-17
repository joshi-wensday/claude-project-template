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
