---
name: design-prompt
description: >
  Build a paste-ready infographic prompt for a fresh Claude.ai chat (the "design Claude")
  from a source file or inline content. Asks for thesis, content shape, format, audience,
  and optional reference; bakes in house visual style; renders source content verbatim;
  forbids vague visual jargon, decorative icons, paraphrasing, and hedging. Produces a
  single self-contained brief the user pastes into Claude.ai. ALWAYS use this skill when
  the user says "design prompt", "infographic prompt", "prompt for Claude Design", "make
  this visual", "visualise this", "design brief for X", "turn this into an infographic",
  or any variation of wanting a structured visual brief built from existing content.
  Trigger even when the user doesn't explicitly say "skill" — if there's structured
  content on the table and they want a visual of it, this is the skill.
---

# Design Prompt Skill

Build a single paste-ready prompt that a separate Claude session (Claude.ai with no shared context — the "design Claude") can render into a clear, opinionated infographic. The output is consumed by **a fresh Claude with zero context** — write for that reader.

The design Claude's own stated preferences shape this skill. Treat these as non-negotiable:

- The **thesis** (one-sentence point the visual is making) is the single biggest quality lever
- Real **verbatim content** beats vague descriptions every time
- One **visual reference** anchors better than three adjectives
- **Format and dimensions** must be specified or the visual defaults to "tall scroll" guesswork
- **Audience and channel** affect density and jargon level

## Step 1 — Identify the source

The user invokes this skill in one of two contexts:

- **Existing file**: a path to a markdown file (usually in `03 Resources/` or `01 Projects/`). Read it in full. The whole document is the source.
- **Inline content**: a block of structured content already in the conversation. Treat that block as the source.

If neither is obvious, ask one focused question: *"What's the source content — a file in the vault, or something already in this chat?"*

## Step 2 — Batched intake

Use a single `AskUserQuestion` call (or close to it) to gather the brief. Required fields:

1. **Thesis** — the single-sentence *point* the visual is making (not the topic). Examples of good vs bad:
   - Bad: "AI coding tools"
   - Good: "Claude Code shifts engineers from typing to reviewing"

   If the user gives a topic instead of a point, push back once: *"That's the topic — what's the actual claim?"*

2. **Content shape** — pick one:
   - Flow / pipeline
   - Tier / hierarchy
   - Comparison / matrix
   - Process / steps
   - Single overview poster
   - Taxonomy
   - Timeline

3. **Format** — pick one:
   - Tall scroll (~1200×4000, web/Obsidian/Notion) — *default if unsure*
   - Square (1080×1080, social)
   - 4:5 portrait (social)
   - Landscape poster (1920×1080 or print)
   - Slide-shaped (16:9 deck)

4. **Audience + channel** — short text. If empty, default to *"Solo founder, personal reference, Obsidian vault."*

Then one optional follow-up: **reference link or screenshot** (*"paste a link, or 'none, go bold'"*). Don't block on this — accept "none" as a valid answer.

**The thesis is load-bearing — do not proceed without one.** Every other field has a sensible default; thesis does not.

## Step 3 — Build the prompt

Assemble using the template below. Render the source content **verbatim** under CONTENT — do not paraphrase, summarise, or invent. Preserve tables, lists, hierarchies, specific numbers, named tools, and quotes character-for-character.

If the source is long, do not trim it. Design Claude can handle a large brief; what it can't handle is a paraphrased one.

### Template

Use this exact skeleton. Fields in `[brackets]` get filled in; the rest is literal.

```
I need you to design an infographic. This is a paste-in prompt — you have no prior context. Treat everything below as the complete brief.

THESIS
[one sentence — the point the visual is making]

AUDIENCE
[who reads this and where they see it]

FORMAT
[dimensions + orientation, e.g. "tall scroll, ~1200×4000, web/Obsidian embed"]

CONTENT
[verbatim source content, structured into a hero block + numbered sections. Do not paraphrase. Render tables as tables, lists as lists, headings as headings.]

STRUCTURE
[narrative shape: flow / tier / comparison / process / overview / taxonomy / timeline — names the visual metaphor]

DENSITY
[scan in 10 seconds | rewards a 2-minute read — pick one based on content volume]

REFERENCES
[link or screenshot, or "none — go bold and commit to an aesthetic"]

BRAND / HOUSE STYLE
- Tier-based colour scale: most important tier = strongest accent, lower tiers = muted/grey
- Hero section gets the most space and visual weight
- Code, skill names, identifiers in monospace with subtle background
- Manual / human-driven steps marked with a visually distinct shape or treatment from automated ones
- Portrait single-page unless FORMAT specifies otherwise
- Confident, designer-grade typography — not a markdown render

MUST INCLUDE
- Every item from CONTENT, rendered verbatim
- Visual hierarchy that makes the THESIS legible in the first 3 seconds

MUST AVOID
- Vague visual jargon: "modern", "sleek", "clean and professional", "vibrant", "eye-catching"
- Filler preambles: "I'd love your help creating a beautiful infographic that..."
- Decorative icons — every visual element must carry information
- Paraphrasing or summarising the source content
- Inventing sections, items, or categories not present in CONTENT
- Hedging language: "maybe try", "feel free to", "you could consider"
- Generic stock illustration

If anything in CONTENT is ambiguous, render it literally rather than guessing. Do not add a caption, call-to-action, or footer unless one is explicitly in CONTENT.
```

## Step 4 — Deliver

Output in this exact pattern:

1. One short preface line — e.g. *"Drop the whole thing below into a fresh Claude.ai chat."*
2. A horizontal rule (`---`)
3. The assembled prompt **as plain markdown** — NOT inside a fenced code block. Code blocks force horizontal scrolling on claude.ai and make copying awkward. Plain markdown selects cleanly.
4. A closing horizontal rule (`---`)

No follow-up commentary unless the user asks. The prompt is the last substantial thing in the response.

## Quality bar

Before delivering, check each:

- Is the THESIS a *point*, not a topic?
- Is CONTENT verbatim, with all numbers / quotes / tables / named items preserved exactly as in the source?
- Does FORMAT specify dimensions, not just "infographic"?
- Are the MUST AVOID rules concrete enough that a fresh Claude would actually obey them? (If you find vague language sneaking in, rewrite.)
- Would you, with zero context, be able to design from this brief alone?

If no on any of these, fix it before delivering.

## What this skill is NOT

- It does not render the infographic. That's design Claude's job in a separate chat.
- It does not edit `03 Resources/Design Prompts/` or save the prompt anywhere — the prompt lives in the chat. If the user later asks for it to be filed, that's a separate request.
- It does not invent content. If the source is thin, the prompt will be thin — say so rather than padding.
