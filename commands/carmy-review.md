---
description: Review changes against the carmy workflow gates
argument-hint: "[target]"
---

Load and apply the installed `carmy-review` skill to review: $ARGUMENTS

Review the current changes (or the given target) against the carmy workflow
only, not correctness. One line per finding — `L<line>: <tag> <what>. <fix>.` —
using the tags reuse, root, scope, test, yagni, attribution. End with the gate
summary, or `Gates pass. Ship.` if nothing breaks a gate. List the fixes; do not
apply them.
