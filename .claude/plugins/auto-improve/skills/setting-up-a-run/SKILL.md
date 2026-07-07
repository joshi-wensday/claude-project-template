---
name: setting-up-a-run
description: Use when starting a new auto-improve run. Validates inputs, cuts trunk branch, creates run directory, generates DESIGN_CONTRACT.md. Returns the run-id for subsequent steps.
---

# Setting Up An Auto-Improve Run

This skill is invoked once at the start of each auto-improve run, by the `auto-improve:running-the-loop` skill. It is not user-invokable.

## Inputs (preconditions)

The skill expects the following files at the project root:
- `auto-improve.config.yaml`
- `backlog.yaml`
- `BRAND.md`
- `handoff-bundle/` directory

Working tree must be clean. `main` branch must exist.

## Steps

1. **Validate config.** Run:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-config.mjs auto-improve.config.yaml
   ```

   If exit code != 0, fail with the validator's error output. Do not proceed.

2. **Validate backlog.** Run:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-backlog.mjs backlog.yaml
   ```

   If exit code != 0, fail.

3. **Verify required files exist.** Run:

   ```bash
   test -f BRAND.md && test -d handoff-bundle/
   ```

   If exit code != 0, fail with a message naming what's missing.

4. **Set up the run.** Run:

   ```bash
   ${CLAUDE_PLUGIN_ROOT}/scripts/setup-run.sh
   ```

   Capture stdout — that's the run-id (e.g., `2026-05-15-01`).

5. **Generate DESIGN_CONTRACT.md.** Invoke `auto-improve:writing-design-contract` skill, passing the run-id. The output is committed to trunk.

6. **Return the run-id and the trunk branch name** to the caller.

## Failure modes

- Working tree not clean → instruct user to commit/stash.
- Validation errors → print them, do not cut a branch.
- Missing BRAND.md or handoff-bundle/ → tell user what's missing.

## Output

On success, return:
- `run_id`: the computed run-id
- `trunk_branch`: `auto-improve/<run-id>/trunk`
- The session is now on the trunk branch with DESIGN_CONTRACT.md committed.
