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
