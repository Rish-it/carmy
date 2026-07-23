#!/usr/bin/env bash
# CLAUDE_CONFIG_DIR overrides ~/.claude, matching where the hooks write the flag.
flag="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.carmy-active"
[ -f "$flag" ] || exit 0

mode=$(head -n1 "$flag" | tr -d '[:space:]')

# hot is the louder, beginner-facing mode; flag it amber so it stands out from
# the default cold green at a glance. The mode is still in the text, so color is
# a redundant cue, not the only one.
color=108
[ "$mode" = "hot" ] && color=173

if [ -z "$mode" ] || [ "$mode" = "cold" ]; then
    printf '\033[38;5;%sm[CARMY]\033[0m' "$color"
else
    printf '\033[38;5;%sm[CARMY:%s]\033[0m' "$color" "$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
fi
