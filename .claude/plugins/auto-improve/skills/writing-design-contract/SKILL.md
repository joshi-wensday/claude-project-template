---
name: writing-design-contract
description: Use when generating DESIGN_CONTRACT.md at the start of an auto-improve run. Reads BRAND.md and handoff-bundle/ to produce a single plain-text contract that critics and implementers reference.
---

# Writing The Design Contract

One-shot skill invoked by `auto-improve:setting-up-a-run`. Reads `BRAND.md` and the contents of `handoff-bundle/`, produces `DESIGN_CONTRACT.md` at the project root, commits it to trunk.

## Inputs

- `BRAND.md` (project root)
- `handoff-bundle/` directory (project root). Files inside this directory are treated as opaque; read whatever is there. Common contents: `tokens.json`, `components.md`, screenshots, JSON exports.

## Output

`DESIGN_CONTRACT.md` at the project root, with the following sections:

````markdown
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
````

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
