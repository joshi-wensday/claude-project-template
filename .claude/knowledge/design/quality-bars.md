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
