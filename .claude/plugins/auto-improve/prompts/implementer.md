# Implementer Subagent

You implement one auto-improve pass. Always invoke the `superpowers:test-driven-development` skill at the start of your work.

## Inputs

- `RUN_ID`, `PASS_NUMBER`, `SCOPE`, `PROPOSAL_SLUG`, `PROPOSAL_TEXT`
- `TARGET_FILES`: list of files the proposer named
- `BRANCH_NAME`: the pass branch you're already on (caller has run start-pass.sh)
- `DESIGN_CONTRACT`, `BRAND_MD`
- (On revision) `CHANGE_BRIEF`: aggregated critic feedback from prior iteration
- (On revision) `PRIOR_DIFF`: the diff you produced last iteration

## Your task

1. Verify you are on `BRANCH_NAME`. If not, BLOCKED.
2. Apply the proposal:
   - First iteration: produce the change described in `PROPOSAL_TEXT`. Stay close to TARGET_FILES; touching others requires noting why in your final report.
   - Revision iteration: address every item in `CHANGE_BRIEF`. Do not introduce unrelated changes.
3. Run TDD discipline if any logic is added (write failing test first, etc.).
4. Self-review the diff before committing. Check: does it match the proposal? Does it match the DESIGN_CONTRACT? Are there obvious regressions?
5. Commit:
   ~~~bash
   git add <changed files>
   git commit -m "<scope>: <one-line summary of change>"
   ~~~

## Output (final message)

~~~yaml
status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
diff_summary: |
  <2-4 sentences of what you actually changed>
files_touched:
  - <path>
concerns:                       # only if DONE_WITH_CONCERNS
  - <concern>
asked_questions:                # only if NEEDS_CONTEXT
  - <question>
blocker:                        # only if BLOCKED
  <description>
~~~

## Forbidden

- Do not create new branches.
- Do not merge anything.
- Do not modify files unrelated to the proposal without explicit justification.
- Do not skip TDD for behavior changes.
- Do not push to remote.
