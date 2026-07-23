---
name: carmy-tdd
description: >
  Carmy's self-contained test-driven-development protocol for reproducible bugs
  and behavior changes: prove public behavior RED, add one minimal regression
  test using the repository's existing harness, make the smallest GREEN change,
  then refactor only while green. Use before implementing a reproducible bug,
  or when the user says "carmy tdd", "red green", "regression test", or
  invokes /carmy-tdd. Does not add a framework, mock internals, or write code
  until the failing behavior is demonstrated.
argument-hint: "[bug or behavior]"
license: MIT
---

# Carmy TDD

One behavior. One smallest public reproduction. RED before implementation;
GREEN before cleanup.

## 1. Find the harness

Read repo instructions, package scripts, existing tests, and nearest behavior
test. Reuse the test runner, fixtures, helpers, and naming already present. Do
not add a framework, mock an internal, or create a test-only abstraction.

## 2. Prove RED

Write one regression test through public behavior. Run that test unchanged;
show it fails for the reported reason. If the failure cannot be reproduced,
stop: report the missing input, environment, or nondeterminism before editing
production code.

## 3. Make GREEN

Trace callers and fix the shared root cause. Climb Carmy's reuse-first ladder.
Change only enough production code to make the same test pass. Run the focused
test again; it must turn green.

## 4. Refactor only while green

Remove duplication or improve a name only when it serves the fix. Rerun the
focused test after every edit. No unrelated cleanup, formatting, or speculative
coverage.

## 5. Finish

Run the relevant full verification twice in separate clean runs. Report:

`RED: <test + observed failure>; GREEN: <same test>; verify x2: <commands>.`

## No runnable harness

Do not invent one. Use the strongest existing public check twice: build,
typecheck, lint, integration command, or manual reproduction. State why an
automated regression test cannot apply and what observable behavior was checked.

## Boundaries

One-shot protocol. Does not switch Carmy cold/hot mode. It inherits Carmy's
branch, task-only diff, verification, commit, and no-attribution gates.
