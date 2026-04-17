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
