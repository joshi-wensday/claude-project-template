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
