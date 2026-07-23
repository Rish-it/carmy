#!/usr/bin/env node
// carmy — Claude Code / Codex SubagentStart hook.
//
// SessionStart context is parent-thread only and never reaches subagents, so
// without this every Task-spawned agent runs carmy-unaware. When carmy is
// active, inject the same ruleset into each subagent.
//
// Scoping (opt-in): set CARMY_SUBAGENT_MATCHER to a regex and the ruleset is
// injected only into subagents whose agent_type matches. Unanchored and
// case-insensitive — "explore|general" matches either, "^general$" is exact.

const { getCarmyInstructions } = require('./carmy-instructions');
const { readMode, writeHookOutput } = require('./carmy-runtime');

const mode = readMode();

// Absent flag or off → carmy isn't active; inject nothing.
if (!mode || mode === 'off') {
  process.exit(0);
}

function inject() {
  try {
    writeHookOutput('SubagentStart', mode, getCarmyInstructions(mode));
  } catch (e) {}
}

// A bad regex must never crash the hook; treat it as "no matcher" and inject.
let matcherRe = null;
try {
  if (process.env.CARMY_SUBAGENT_MATCHER) {
    matcherRe = new RegExp(process.env.CARMY_SUBAGENT_MATCHER, 'i');
  }
} catch (e) {
  matcherRe = null;
}

// No matcher → keep the synchronous, stdin-independent path so a swallowed
// stdin (Windows PowerShell wrapper) can't stall the subagent spawn.
if (!matcherRe) {
  inject();
  process.exit(0);
}

// Matcher set → read agent_type from stdin and skip only on a definite mismatch.
// Missing/unparseable agent_type, a stdin error, or the timeout all fail open.
let input = '';
let done = false;

function finish() {
  if (done) return;
  done = true;
  let agentType = '';
  try {
    agentType = String(JSON.parse(input.replace(/^﻿/, '')).agent_type || '').trim();
  } catch (e) {}
  if (agentType && !matcherRe.test(agentType)) {
    process.exit(0);
  }
  inject();
}

process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', finish);
process.stdin.on('error', () => { finish(); process.exit(0); });
setTimeout(() => { finish(); process.exit(0); }, 1000).unref();
