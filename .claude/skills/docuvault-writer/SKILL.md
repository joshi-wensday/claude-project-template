---
name: docuvault-writer
description: Write internal feature documentation for the Luminance web platform in the Docuvault repo (/Users/jacob.whyte/dev/docuvault). Use this skill whenever the user wants to document a feature, write up a feature for Support/Ops, create or update internal docs, add a page to Docuvault or Internal Hub, or says things like "document X", "write docs for X", "I need a writeup for X", or pastes a feature area and asks for a docuvault page. The feature itself lives in ~/dev/web; the resulting markdown lands in ~/dev/docuvault under the appropriate product/documentation subtree.
---

# Docuvault Writer

## What this skill is for

Luminance keeps internal feature documentation in a separate repo — **docuvault** (`~/dev/docuvault`) — rendered on Internal Hub. Support, Ops, and other engineers read these pages to understand how a feature works, what configs drive it, what failure modes look like, and how to triage a bug. The source feature lives in the web app repo (`~/dev/web`), but the documentation is authored in docuvault.

This skill turns a feature description (or a pointer to a file / PR / module in `~/dev/web`) into a docuvault page that Support can actually use.

## The single most important thing

**Understand the feature before you write a single line.** Don't skim the code, don't guess at failure modes. Real reviewer feedback on docs produced without this step was specifically about missing failure-handling detail — "what happens when import fails?", "can the user cancel?", "is there a timeout?". Those questions come up because the writer treated the happy path as the whole story.

The rest of this skill is organised around making sure you know enough, and then writing it down in the shape Support expects.

## Workflow

### 1. Read the feature

Before asking the user anything, read the relevant code in `~/dev/web`. Find:

- The view / component / module implementing the feature
- The events/handlers it wires up
- The API endpoints it calls (grep `routes/`, `lib/`)
- The DB tables/columns it reads or writes
- The feature flags / config keys that gate it (`config_templates/`, feature-flag checks in code)
- Log lines and telemetry events emitted on the happy and unhappy paths

You should be able to trace the flow end-to-end before you ask the user anything. The interview is for intent and UX — things the code doesn't tell you — not for things you could have read.

### 2. Interview the user

Ask about what the code can't tell you. Group questions so the user can answer in one go instead of ping-ponging:

**Purpose & scope**
- What problem does this feature solve for the end user?
- Is it GA, beta, behind a flag for a specific customer?
- Which product version(s) does it apply to? (e.g. v4.0, v4.1+)

**UX on the unhappy path** (this is what reviewers flag hardest)
- What does the user see if the backend call fails?
- What does the user see if something stalls — does progress visibly freeze, is there a timeout, retry, or nothing?
- Can the user cancel mid-flight? If so, how?
- Is any state persisted if the flow is abandoned mid-way?

**Known limitations & gotchas**
- What doesn't this feature do that users often expect?
- Any version-specific behaviour (only in 4.1+, only for certain divisions, only for live docs, etc.)?

**Destination**
- Propose a path based on the feature area and existing docuvault structure (e.g. Word-plugin Lumi features go under `product/documentation/word_plugin/checklists_plugin_ui/`). Confirm the path with the user before writing. Offer a sensible default — don't make the user navigate the tree for you.

Only start writing after the user has confirmed the purpose, the destination path, and filled in any failure-mode gaps.

### 3. Write the page

Use the structure below. It's lifted from existing docuvault pages (`v4_plugin.md`, `plugin_lumi_message_streaming.md`, `plugin_lumi_chat_file_upload.md`) — Support already knows how to read this shape, so deviating costs them time.

### 4. Update the parent index if there is one

If the new page slots under a parent index (e.g. `v4_plugin.md` lists child pages under "Internal Documentation"), add a line to that index. Don't do it silently — mention it to the user.

## Page structure

Every page follows this skeleton. Sections can be omitted if genuinely N/A, but say so (e.g. "N/A. Messages are stored in the same table...") — an empty section leaves the reader wondering if you forgot.

```markdown
---
title: "Human-readable feature name"
status: "Current"
---

# Overview

<2–4 sentences: what the feature does, who it's for, when it runs.
Written for someone who has never seen the feature before.>

## What it does  (or  # User Story for user-facing flows)

<Step-by-step of the happy path. Numbered list works well.
If the feature has a visible UI, mention what the user sees at each step.
Embed screenshots if available: ![caption](_images/<name>.png)>

## Failure handling and recovery

<This is NOT optional. Cover:
- What the user sees when each failure happens
- Whether the UI recovers automatically or the user has to act
- Whether there's a timeout/retry (and explicitly say "no" if there isn't)
- How to cancel an in-progress operation
- What data, if any, is left behind after an abandoned flow

Pick ONE home for failure-mode content — either this upfront section OR
the "Failure Scenarios" block inside Troubleshooting below, not both.
Use the upfront section when the failure UX is intricate and central to
the feature (e.g. upload with cancel/retry). Use the Troubleshooting
block when failures are simpler and the Support reader is the primary
audience. Don't duplicate.>

## Known limitations

<Bulleted list. Things users or Support routinely ask about that the
feature doesn't handle. Be blunt — "no polling timeout", "does not work
on executed documents", etc.

Put intentional constraints here, not in Failure Scenarios. If the
behaviour is a deliberate design choice (e.g. "only raw_text messages
stream", "no cancel button") it belongs here. Failure Scenarios is for
things that can actually go wrong.>

# Operational Information

## Technical Dependencies

<Bulleted: versions, external services, libraries that matter to triage.>

## Configuration

| Config Key | Default | Effect |
|---|---|---|
| `web_ui_something` | `true` | What it gates. |

<If a config exists but isn't actually wired up for this feature, SAY SO.
Previous pages have caught bugs by noting "config X exists but is not used
here — hardcoded to Y in file Z".>

## Data & API

### Database Schema
<Tables, relevant columns, FK relationships. N/A is fine if the feature
writes nothing new — say so explicitly.>

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/...` | ... |

### Quick lookup queries (optional but valued)
<SQL snippets Support can paste into a DB console to answer common
questions: "show me all X for conversation Y", "what's the state of Z".>

### Payload shapes (if non-obvious)
```json
{ "example": "payload" }
```

## Troubleshooting

### Common Issues

| Issue | What to Check | Resolution |
|---|---|---|
| ... | ... | ... |

### Failure Scenarios

**<Named failure, e.g. "SSE connection drops mid-stream">**

- **What triggers it**: ...
- **User experience**: ...
- **Recovery path**: automatic / requires user action / requires Ops action
- **Data impact**: none / partial / persisted

### Relevant Logging

| Component/Logger | Log Message | Meaning |
|---|---|---|
| `PluginChatView` | `"No streaming answer item found"` | ... |

### Telemetry

| Event | Properties | When Fired |
|---|---|---|
| `ask_lumi_question_asked` | `questionLength`, `location` | ... |

### Information Needed on a Bug Ticket

<Bulleted list: the exact things someone should paste into a ticket to
make triage possible. Transaction UUIDs, conversation IDs, config
values, browser console snippets, etc.>
```

## Style notes

- **Write for Support, not engineers.** Assume the reader is confident with the platform but not with this feature's code. Explain acronyms the first time they appear.
- **Prefer tables over prose** for configs, endpoints, failure modes, logs, telemetry. Tables scan well; prose doesn't.
- **Be explicit about what doesn't exist.** "There is no timeout" and "no automatic retry" are high-signal facts — they tell Support the user is stuck until they act. Missing this kind of statement is the single most common reviewer complaint.
- **Don't invent config keys or log lines.** If you reference a config or a log message, it must exist in the codebase. Grep to confirm before writing it.
- **Cite file paths sparingly.** Support doesn't read code — link to hub pages when they exist, drop a `file.js:line` only when a developer would actually need to open it.
- **Match existing terminology.** If other pages call it a "matter", call it a "matter" — not a "workspace" or "case".

## Examples

Three pages to model your output on, in decreasing order of relevance:

1. `~/dev/docuvault/product/documentation/word_plugin/checklists_plugin_ui/plugin_lumi_message_streaming.md` — tight, table-heavy, full failure-scenario section with structured entries
2. `~/dev/docuvault/product/documentation/word_plugin/checklists_plugin_ui/plugin_lumi_chat_file_upload.md` — longer, has a dedicated "Failure handling and recovery" section (added after reviewer feedback); good model when failure UX is intricate
3. `~/dev/docuvault/product/documentation/word_plugin/checklists_plugin_ui/v4_plugin.md` — structural template for a larger feature that has sub-pages

Read at least one of these before writing. The shape they share is not coincidence — it's what Support expects.

## When NOT to use this skill

- The user wants code comments, a README for a repo, or a PR description — those have their own conventions.
- The user wants customer-facing documentation — docuvault is internal.
- The user just wants a quick summary of what a feature does, not a persistent document.
