# Carmy

<p align="center">
  <img src="assets/koala-icon.png" alt="Carmy koala coding icon" width="180">
</p>

[![skills.sh](https://skills.sh/b/Rish-it/carmy)](https://skills.sh/Rish-it/carmy)

Strict, reuse-first workflow for Claude Code and Codex. Understand the real
flow, fix the shared root cause, reuse before adding, then ship the shortest
maintainable diff with TDD, two clean verification runs, atomic commits, and a
committed-HEAD reproduction.

## What ships

| Command | Purpose |
|---------|---------|
| `/carmy [cold\|hot] [task]` · `$carmy …` | Apply Carmy. `cold` is terse/technical; `hot` gives one funny analogy, then the same fix. |
| `/carmy off` | Disable Carmy for this session. |
| `/carmy default cold\|hot` | Persist the startup mode. |
| `/carmy` | Report current mode without resetting it. |
| `/carmy-review [target]` | Check a diff or branch against Carmy gates. |
| `/carmy-tdd [bug or behavior]` | Run bundled public-behavior RED→GREEN protocol. |
| `/carmy-help` | Show quick reference. |

The plugin activates on session start, tracks mode changes, injects rules into
subagents, and can offer a statusline badge. The skill-only fallback does not
provide those lifecycle features.

## Requirements

- Node.js 18.18.0 or newer on the non-interactive `PATH` used by the host.
- Current Claude Code or Codex with plugin support.

## Install

### Claude Code

Send these as separate prompts:

```text
/plugin marketplace add Rish-it/carmy
/plugin install carmy@carmy
```

Reload plugins if prompted. Carmy then activates in new sessions.

### Codex

```bash
codex plugin marketplace add Rish-it/carmy
codex plugin add carmy@carmy
```

Start a new Codex thread. Open `/hooks`, inspect Carmy's lifecycle hooks, and
trust them before activation. Restart the desktop app after installation.

### Skill-only fallback

Copying only `skills/carmy/SKILL.md` is supported for instruction-only use. It
does not install commands, mode state, automatic activation, subagent context,
or the statusline. Use the plugin install above when those features matter.

### skills.sh

Install Carmy's core workflow from its public GitHub source:

```bash
npx skills add https://github.com/Rish-it/carmy --skill carmy
```

This is instruction-only, like the fallback above. It is listed automatically
after real installs through the CLI; no separate submission is required.

## Modes

Both modes enforce identical workflow and reuse rules.

- **cold** — default; minimal, technical diagnosis and tight solution.
- **hot** — one short funny analogy for the real bug, then cold's exact fix.

Set one session with `/carmy cold` or `/carmy hot` (`$carmy` in Codex). Use
`:cold` or `:hot` as compact switches. `/carmy off`, `stop carmy`, and `normal
mode` disable Carmy for the current session.

Set new-session default:

```bash
export CARMY_DEFAULT_MODE=hot
```

Or write `~/.config/carmy/config.json` (`%APPDATA%\carmy\config.json` on
Windows):

```json
{ "defaultMode": "hot" }
```

Resolution: environment variable → config → `cold`.

## Update

Update the marketplace, then reload or restart the host:

```bash
codex plugin marketplace upgrade carmy
```

In Claude Code, open `/plugin`, update the Carmy marketplace, then reload
plugins when prompted. Enable marketplace auto-update if you want startup
updates.

## Uninstall

Run cleanup **before** removing the plugin; it deletes only Carmy's mode flag,
default config, and Carmy-owned statusline segment:

```bash
node scripts/uninstall.js
```

Then remove the plugin:

```text
/plugin remove carmy
```

```bash
codex plugin remove carmy
```

## Layout

```text
carmy/
├── skills/                 # workflow, review, TDD, help
├── commands/               # Claude Code .md + Codex .toml adapters
├── hooks/                  # lifecycle runtime + statusline
├── scripts/                # invariants, version, uninstall
├── tests/                  # node --test suite
├── docs/, examples/        # native catalog + worked changes
├── .claude-plugin/, .codex-plugin/
├── LICENSE
└── AGENTS.md               # repository-local Carmy rules
```

## Development and release

```bash
npm test
npm run check-invariants
npm run check-lineage -- --history
npm run check-versions
npm run bump-version 0.2.0
npm pack --dry-run
```

Tag `v<package-version>` only after those pass. Publishing uses GitHub Actions
OIDC; configure this repository as an npm trusted publisher before first tag.

## License

MIT. See [LICENSE](LICENSE).
