# Carmy installed

Carmy loads automatically on session start (SessionStart hook) and can also
auto-trigger for code-changing tasks from the skill description.

Modes (same workflow and reuse-first ladder in both; only the explanation
changes):

- `cold` (default) — minimal, technical, optimal explanation and solution.
- `hot` — beginner-friendly: one short, funny analogy for the bug, then the same
  tight, reuse-first solution.

Commands:

- `/carmy [cold|hot] <task>` — Claude Code · `$carmy [cold|hot] <task>` — Codex
- `/carmy-review [target]` · `$carmy-review [target]`
- `/carmy-tdd [bug or behavior]` · `$carmy-tdd [bug or behavior]`
- `/carmy-help` · `$carmy-help`

Bundled skills: `carmy:carmy`, `carmy:carmy-review`, `carmy:carmy-tdd`,
`carmy:carmy-help`. Switch modes any time with `/carmy cold` or `/carmy hot`
(or the `:cold` / `:hot` tokens). Turn it off with `stop carmy` or `/carmy off`.
