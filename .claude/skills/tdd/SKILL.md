---
name: tdd
description: "Implement a feature from a PRD using test-driven development. Use this skill when the user wants to implement a PRD, build a feature from a task file, or says things like 'implement the X PRD', 'build X from the PRD', 'TDD the X feature', 'implement tasks/prd-X.md'. Always use this skill when the user references implementing or building something that has a PRD in the tasks/ directory, even if they don't explicitly say 'TDD'."
---

# TDD: Test-Driven Development from a PRD

Implement a feature defined in a PRD file using a strict test-driven development workflow. The idea is simple: if a feature is well-defined in a PRD, you have everything you need to write tests first, then build until those tests pass.

---

## The Workflow

There are five phases, executed in order. Do not skip phases or jump ahead.

```
Phase 1: Understand    →  Read PRD + project context
Phase 2: Test          →  Write failing tests from requirements
Phase 3: Implement     →  Code until all tests pass
Phase 4: Human Review  →  Present work, get approval
Phase 5: Refactor      →  Clean up while keeping tests green
```

---

## Phase 1: Understand

### Read the PRD

The user will point you to a PRD file, typically in `tasks/`. Read it thoroughly. Pay attention to:

- **User stories and acceptance criteria** — these become your tests
- **Functional requirements** — each numbered requirement maps to one or more test cases
- **Technical considerations** — constraints that affect implementation
- **Files likely to change** — your starting points

### Read the project context

Check `CLAUDE.md` for the tech stack, test framework, project structure, and commands. You need to know:

- **Test command** — how to run tests (e.g., `npm test`, `pytest`, `go test ./...`)
- **Test directory** — where test files live
- **Framework/language** — determines test patterns and conventions
- **Lint command** — you'll need this in the refactor phase

If `CLAUDE.md` has placeholder values (like `[TEST_COMMAND]`), auto-detect by scanning the project for test configuration files (`jest.config.*`, `pytest.ini`, `pyproject.toml`, `Cargo.toml`, etc.) and existing test files. If you still can't determine the stack, ask the user.

### Assess scope

Before writing any code, assess the size of the PRD:

- **Small** (1-3 user stories, single component): proceed normally
- **Medium** (4-6 user stories, a few components): proceed, but work through stories sequentially
- **Large** (7+ user stories, multiple independent components): pause and recommend splitting

For large PRDs, tell the user something like:

> "This PRD has N independent features/components. I'd recommend splitting it into smaller PRDs and implementing them separately — possibly in parallel using worktrees. Here's how I'd split it: [list]. Want me to proceed with all of it sequentially, or would you prefer to split first?"

Let the user decide. If they say proceed, work through it sequentially. If they want to split, help them create separate PRD files and they can run this skill on each one.

---

## Phase 2: Test (Red)

This is the most important phase. Good tests are the foundation of the entire workflow.

### Deriving tests from the PRD

Map PRD elements to test cases:

| PRD Element | Test Type |
|---|---|
| Acceptance criteria | Unit or integration tests — one test per criterion |
| Functional requirements (FR-N) | Unit tests for logic, integration tests for system behavior |
| Edge cases mentioned in the PRD | Explicit edge case tests |
| Error handling requirements | Tests that verify correct failure behavior |
| API contracts | Request/response validation tests |
| Data model changes | Schema/model validation tests |

Use your judgment on test granularity. Not everything needs a unit test — sometimes an integration test that exercises multiple requirements together is more valuable than five isolated unit tests. But every acceptance criterion in the PRD should be covered by at least one test.

### Writing the tests

1. Create test files following the project's existing conventions (file naming, directory structure, imports)
2. Write tests that clearly map back to PRD requirements — use descriptive test names like `test_user_can_search_by_email` not `test_search_1`
3. Add a comment at the top of the test file noting which PRD it validates (e.g., `// Tests for tasks/prd-user-search.md`)
4. Group tests logically — by user story or by component

### Verify the tests fail

Run the test command. Every test should fail at this point (since there's no implementation yet). If any test passes, it's either testing something that already exists or the test itself is wrong — investigate before moving on.

If tests can't even compile/parse because the modules they import don't exist yet, that's fine — create minimal stubs (empty functions, placeholder classes) just enough to make the tests runnable. The tests should then fail on assertions, not on import errors.

---

## Phase 3: Implement (Green)

Now build the feature until the tests pass.

### Approach

- Work through one user story or functional requirement at a time
- After implementing each piece, run the tests to check progress
- Don't try to make the code perfect — just make it work. Clean code comes in Phase 5
- If you find a gap in the tests (something the PRD requires but you missed), add a test for it first, then implement

### The iteration loop

```
1. Pick the next failing test (or group of related tests)
2. Write the minimum code to make it pass
3. Run the test suite
4. If new tests pass → continue to the next group
5. If tests still fail → read the error, fix the implementation, run again
```

Keep going until all tests pass. If you get stuck in a loop on a particular test, step back and reconsider the approach rather than making increasingly desperate changes.

### When the PRD is ambiguous

If you hit a point where the PRD doesn't specify the expected behavior clearly enough to write or pass a test, make a reasonable choice, note it, and move on. You'll surface these decisions to the user in Phase 4.

---

## Phase 4: Human Review

All tests pass. Now a human needs to verify the implementation because some things can't be captured in automated tests — UX feel, code readability, architectural fit, naming choices, and whether the feature actually solves the original problem.

### Present the work

Show the user:

1. **A diff of all changes** — run `git diff` (or `git diff --staged` if staged) and present it
2. **A summary of what was implemented**, organized by user story or functional requirement
3. **What the tests cover** — a brief list of what each test validates
4. **Any decisions you made** where the PRD was ambiguous
5. **Any concerns** — things that work but feel fragile, or areas where you think the approach could be better

### Ask for approval

Ask the user to review and either:
- **Approve** — move to Phase 5
- **Request changes** — provide specific feedback

### Handle feedback

If the user requests changes:
1. Understand the feedback
2. Update tests if the feedback changes expected behavior
3. Update the implementation
4. Run all tests to confirm nothing broke
5. Present the updated diff and summary
6. Ask for approval again

Repeat until the user approves. Do not move to Phase 5 without explicit approval.

---

## Phase 5: Refactor

The user has approved the functionality. Now clean up the code to make it production-ready — without changing what it does.

### What to look for

- **Dead code** — remove anything unused
- **Naming** — variables, functions, and files should have clear, descriptive names
- **Duplication** — extract shared logic if the same pattern appears more than twice
- **Complexity** — simplify nested conditionals, long functions, or unclear control flow
- **Project conventions** — match the existing code style (check CLAUDE.md and surrounding code)
- **Lint** — run the project's lint command and fix any issues

### The rule

After every refactoring change, run the tests. If any test fails, undo the change. Refactoring means changing structure without changing behavior — if tests fail, you changed behavior.

### Wrap up

Once cleanup is done:
1. Run the full test suite one final time
2. Run lint if available
3. Present a final summary of what was built and any remaining notes

Do not commit unless the user asks you to.

---

## Quick Reference

| Phase | Goal | Done when |
|---|---|---|
| 1. Understand | Know what to build | PRD and project context are clear |
| 2. Test | Define "done" in code | All tests written and failing |
| 3. Implement | Make it work | All tests passing |
| 4. Review | Human validates | User says "approved" |
| 5. Refactor | Make it clean | Tests still pass, code is polished |
