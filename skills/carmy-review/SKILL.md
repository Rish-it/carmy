---
name: carmy-review
description: >
  Code review focused exclusively on carmy workflow compliance. Checks a diff or
  branch for missed reuse, out-of-scope churn, symptom-only fixes, missing
  regression tests, speculative building, and AI/model/brand attribution in
  commits or PRs. One line per finding: location, the violation, the fix. Use
  when the user says "review against carmy", "carmy review", "check the diff",
  or invokes /carmy-review. Complements a correctness review; this one only
  audits the workflow.
---

# Carmy Review

Review a diff or branch against the carmy workflow gates. One line per finding:
location, the violation, the fix. Report only what breaks a gate — no praise, no
style nits, no scope creep.

## Format

`L<line>: <tag> <what>. <fix>.`, or `<file>:L<line>: ...` for multi-file diffs.

Tags:

- `reuse:` reinvents a helper, type, or pattern already in the repo, the stdlib,
  the platform, or an installed dependency. Name what to reuse.
- `root:` patches the symptom or one caller while a sibling caller stays broken.
  Name the shared function to fix once.
- `scope:` touches code the task did not require — rename, reformat, reorder,
  unrelated cleanup, or comment churn. Revert it.
- `test:` a reproducible-bug fix with no RED→GREEN regression test on existing
  infrastructure. Name the behavior to cover.
- `yagni:` unrequested abstraction, scaffolding, dependency, or future-proofing.
  Delete it until a real caller exists.
- `attribution:` an AI, model, tool, or brand name in a commit message, PR,
  branch name, or comment. Strip it.

## Examples

✅ `auth.py:L42: reuse: hand-rolled retry loop. tenacity is already a dependency.`

✅ `L88: root: guard added in this one caller; parse_date has three others still crashing. Guard parse_date.`

✅ `L4-9: scope: unrelated import reorder in a bugfix diff. Revert.`

✅ `cart.js:L30: test: off-by-one fix with no regression test. Add one covering the empty-cart path.`

✅ `L52-71: yagni: StrategyFactory with one strategy. Inline it until a second exists.`

✅ `git log: attribution: commit body names a model. Rewrite the message in the repo's voice.`

## Verdict

End with the gate summary: `gates: <N> findings — branch/scope/root/test/attribution.`
If nothing breaks a gate, say `Gates pass. Ship.` and stop.

## Boundaries

Scope: carmy workflow compliance only. Correctness bugs, security holes, and
performance belong in a normal review pass, not this one. Does not apply the
fixes, only lists them. "stop carmy-review" or "normal mode": revert to a
standard review style.
