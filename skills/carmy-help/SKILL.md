---
name: carmy-help
description: >
  Quick-reference card for carmy modes, skills, and commands. One-shot display,
  not a persistent mode. Trigger: /carmy-help, "carmy help", "what carmy
  commands", "how do I use carmy".
---

# Carmy Help

Display this reference card when invoked. One-shot: do NOT change mode, write
flag files, or persist anything.

## Modes

Same workflow and reuse-first ladder in both; only the explanation changes.

| Mode | Trigger | What change |
|------|---------|-------------|
| **cold** | `/carmy cold` or `:cold` | Minimal, technical, optimal. One-line diagnosis, tightest correct fix, no teaching. Default. |
| **hot** | `/carmy hot` or `:hot` | Beginner-facing: one short, funny analogy for the bug, then the same tight fix. |

Mode sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **carmy** | `/carmy` | The workflow itself: reuse-first ladder plus the branch/diff/TDD/verify/commit/PR gates. |
| **carmy-review** | `/carmy-review` | Reviews a diff/branch against the gates: `L42: reuse: hand-rolled retry. tenacity is installed.` |
| **carmy-tdd** | `/carmy-tdd` | One public behavior RED, smallest root-cause fix GREEN, then verification twice. |
| **carmy-help** | `/carmy-help` | This card. |

Codex uses `$carmy`, `$carmy-review`, `$carmy-tdd`, `$carmy-help`; Claude Code uses the
slash-command forms above.

## Deactivate

Say "stop carmy" or "normal mode". `/carmy off` does the same. `/carmy` with
no argument reports the current mode.

## Configure default mode

Default mode = `cold`, auto-active every session. Change it:

**Environment variable** (highest priority):
```bash
export CARMY_DEFAULT_MODE=hot
```

**Config file** (`~/.config/carmy/config.json`, Windows: `%APPDATA%\carmy\config.json`):
```json
{ "defaultMode": "hot" }
```

Resolution: env var > config file > `cold`. Persist a default from inside a
session with `/carmy default cold|hot`.

## More

Full docs, install, and the workflow gates: see the project README.
