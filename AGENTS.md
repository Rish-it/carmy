# Carmy — coding workflow

Apply these rules only when a task will modify code. Read-only research,
scouting, explanation, diagnosis, and review do not require a branch, tests, or
commits. Once implementation begins, the rules are non-negotiable.

## Understand first

Read repository instructions and trace the affected behavior end to end. Search
every caller and nearby implementation pattern. Fix the shared root cause, not
only the reported symptom.

## Minimal solution ladder

Stop at the first rung that holds:

1. Skip speculative work (YAGNI).
2. Reuse existing helpers, types, test patterns, and conventions.
3. Use the standard library.
4. Use the native platform.
5. Reuse an installed dependency; do not add another.
6. Use one clear line when it remains readable; do not code-golf.
7. Only then write the minimum maintainable code that works.

Do not add unrequested abstractions, scaffolding, dependencies, or
future-proofing. Prefer deletion and boring code. Never remove validation,
data-loss protection, security, accessibility, error handling, or explicit
requirements. Follow the repository's existing debt marker; if none exists,
use `carmy:` only for a deliberate shortcut with a concrete ceiling and
upgrade trigger.

## Workflow

1. **Protect the worktree and branch.** In Git, inspect status and preserve user
   changes. Create a new task branch before editing; never work on
   `main`/`master`/`develop`. Continue only a branch for the same task.
2. **Task-only diff.** No incidental renaming, comment rewriting,
   formatting, reordering, cleanup, generated files, or lockfile churn. Treat
   comments as code: add, remove, or rewrite one only when the change would make
   it false or a non-obvious correctness/safety constraint requires explanation.
   Never change comments for wording or polish; explain every required comment
   change at handoff.
3. **Use TDD for reproducible bugs.** Load the bundled `carmy-tdd` skill, prove public behavior
   RED, add one regression test with existing test infrastructure, then make the
   minimum GREEN change. Do not mock internals or add a test framework.
4. **Verify twice before committing.** Run two separate clean verification runs;
   both pass. No trivial exemption. If tests cannot apply, run the strongest
   relevant build/typecheck/lint/manual reproduction twice and explain why.
5. **Make atomic commits.** Commit only when asked. Use the maximum sensible
   atomicity: 1–2 changed files require at least one commit, 3–4 require two,
   5–6 require three, and 7+ require at least `ceil(changed_files / 2)`. Every
   commit must remain coherent and green; keep behavior with its regression
   test. If that conflicts with the floor, ask before committing. Stage
   selectively, never `git add -A`.
6. **Reproduce committed HEAD before a PR.** After committing, rerun the original
   user-visible reproduction against `HEAD` and confirm the failure is gone.
   This is separate from the two pre-commit runs. If faithful reproduction is
   impossible, get approval before opening a PR.
7. **Match PR-description patterns.** Before opening a PR, identify the top three
   human contributors, exclude bots, and inspect their recent non-empty PR
   descriptions. Follow their shared structure, vocabulary, and detail plus any
   repository template. Include the issue, root cause, minimal fix, verification,
   committed-HEAD reproduction, and commit breakdown when applicable.

## No attribution

Never name an AI, model, assistant, tool, brand, or generator anywhere in a
commit message, PR title, PR description, branch name, or code comment. No
"generated with", co-author trailer, or banner.

Before handoff, inspect the final diff and report the outcome, both verification
runs, required comment changes, commit structure, post-commit reproduction, and
deliberately skipped work.
