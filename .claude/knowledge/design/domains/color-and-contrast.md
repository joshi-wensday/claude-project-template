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
