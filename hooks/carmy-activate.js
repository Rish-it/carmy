#!/usr/bin/env node
// carmy — Claude Code / Codex SessionStart activation hook.
//
// Runs on every session start:
//   1. Writes flag file at <state dir>/.carmy-active (statusline reads this)
//   2. Emits the carmy workflow ruleset as SessionStart context
//   3. On native Claude, nudges once to wire up the statusline badge

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, isShellSafe } = require('./carmy-config');
const { getCarmyInstructions } = require('./carmy-instructions');
const { isCodex, setMode, clearMode, writeHookOutput } = require('./carmy-runtime');

const mode = getDefaultMode();

// "off" — skip activation entirely (no flag, no rules).
if (mode === 'off') {
  clearMode();
  writeHookOutput('SessionStart', 'off', isCodex ? '' : 'OK');
  process.exit(0);
}

// 1. Write flag file (best-effort; never block the hook).
try { setMode(mode); } catch (e) {}

// 2. Emit the ruleset.
let output = getCarmyInstructions(mode);

// 3. Statusline nudge — native Claude only, at most once.
if (!isCodex) try {
  const claudeDir = getClaudeDir();
  const settingsPath = path.join(claudeDir, 'settings.json');
  let hasStatusline = false;
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, ''));
    if (settings.statusLine) hasStatusline = true;
  }

  const nudgeFlagPath = path.join(claudeDir, '.carmy-statusline-nudged');
  if (!hasStatusline && !fs.existsSync(nudgeFlagPath)) {
    fs.mkdirSync(claudeDir, { recursive: true });
    try { fs.writeFileSync(nudgeFlagPath, ''); } catch (e) {}
    const isWindows = process.platform === 'win32';
    const scriptName = isWindows ? 'carmy-statusline.ps1' : 'carmy-statusline.sh';
    const scriptPath = path.join(__dirname, scriptName);
    if (isShellSafe(scriptPath)) {
      const command = isWindows
        ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash "${scriptPath}"`;
      const snippet =
        '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
      output += '\n\n' +
        'STATUSLINE SETUP NEEDED: The carmy plugin includes a statusline badge ' +
        'showing the active mode (e.g. [CARMY], [CARMY:HOT]). It is not configured ' +
        'yet. To enable, add this to ' + settingsPath + ': ' + snippet + ' ' +
        'Proactively offer to set this up for the user on first interaction.';
    } else {
      output += '\n\n' +
        'STATUSLINE SETUP NEEDED: The carmy plugin includes a statusline badge ' +
        'showing the active mode. Its install path contains characters unsafe to ' +
        'embed in a shell command, so configure it manually: add a statusLine ' +
        'command of type "command" that runs ' + scriptName + ' from the plugin\'s ' +
        'hooks directory to ' + settingsPath + ', quoting the path for your shell. ' +
        'Proactively offer to set this up for the user on first interaction.';
    }
  }
} catch (e) {
  // Silent fail — don't block session start over statusline detection.
}

try {
  writeHookOutput('SessionStart', mode, output);
} catch (e) {
  // Silent fail — a closed stdout/EPIPE at hook exit must not fail the hook.
}
