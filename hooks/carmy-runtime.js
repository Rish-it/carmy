#!/usr/bin/env node
// carmy — shared runtime: mode flag state + host-aware hook output.
//
// Targets Claude Code (native) and Codex. Codex sets PLUGIN_DATA and reads a
// systemMessage badge plus hookSpecificOutput; native Claude takes raw stdout on
// SessionStart and hookSpecificOutput JSON on SubagentStart.

const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./carmy-config');

const STATE_FILE = '.carmy-active';
const isCodex = Boolean(process.env.PLUGIN_DATA);

const stateDir = isCodex ? process.env.PLUGIN_DATA : getClaudeDir();
const statePath = path.join(stateDir, STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try { fs.unlinkSync(statePath); } catch (e) {}
}

// Live mode written by activate/mode-tracker. Absent flag = carmy off.
function readMode() {
  try {
    return fs.readFileSync(statePath, 'utf8').trim() || null;
  } catch (e) {
    return null;
  }
}

function writeHookOutput(event, mode, context = '') {
  if (isCodex) {
    const output = { systemMessage: `CARMY:${mode.toUpperCase()}` };
    if (context) {
      output.hookSpecificOutput = { hookEventName: event, additionalContext: context };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  // Native Claude: SessionStart accepts raw stdout, but SubagentStart needs the
  // hookSpecificOutput JSON form or the context is dropped.
  if (event === 'SubagentStart') {
    process.stdout.write(JSON.stringify(
      { hookSpecificOutput: { hookEventName: event, additionalContext: context } }));
    return;
  }
  process.stdout.write(context);
}

module.exports = { isCodex, statePath, setMode, clearMode, readMode, writeHookOutput };
