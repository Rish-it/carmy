---
description: Apply Carmy or control mode (cold|hot|off|default)
argument-hint: "[cold|hot|off|default cold|hot] [task]"
---

Interpret arguments before applying the installed `carmy` skill:

- No argument: report the current mode; do not reset it.
- `cold [task]` or `hot [task]`: switch this session, then apply Carmy to task.
- `off`: disable Carmy for this session; do not apply the workflow.
- `default cold|hot`: persist the startup default; do not treat these words as a
  task.
- Otherwise: apply Carmy to `$ARGUMENTS` in the current mode.

Cold is minimal/technical. Hot gives one short funny analogy, then the same
tight solution. All workflow gates and the no-attribution rule apply when active.
