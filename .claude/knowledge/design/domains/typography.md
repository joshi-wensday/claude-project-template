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
