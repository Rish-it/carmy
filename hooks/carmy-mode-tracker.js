#!/usr/bin/env node
// carmy — UserPromptSubmit hook. Tracks which mode is active by inspecting user
// input for /carmy, $carmy, :cold/:hot commands, and deactivation phrases.

const { getDefaultMode, isDeactivationCommand, writeDefaultMode } = require('./carmy-config');
const { clearMode, readMode, setMode, writeHookOutput } = require('./carmy-runtime');

let input = '';
let done = false;

function finish() {
  if (done) return;
  done = true;
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    let handled = false;

    // Bare :cold / :hot token switches the mode.
    if (prompt === ':cold' || prompt === ':hot') {
      const mode = prompt.slice(1);
      setMode(mode);
      writeHookOutput('UserPromptSubmit', mode, 'CARMY MODE CHANGED — mode: ' + mode);
      handled = true;
    } else if (/^[/@$]carmy\b/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      // Only the base command switches modes; /carmy-review, /carmy-help route to
      // their own skills and never change the runtime mode.
      if (cmd === '/carmy' || cmd === '/carmy:carmy') {
        if (arg === 'default') {
          const dmode = parts[2];
          if (dmode === 'cold' || dmode === 'hot') {
            writeDefaultMode(dmode);
            writeHookOutput('UserPromptSubmit', dmode,
              'CARMY DEFAULT SET — new sessions start in ' + dmode + '.');
          }
          handled = true;
        } else if (arg === 'cold' || arg === 'hot') {
          setMode(arg);
          writeHookOutput('UserPromptSubmit', arg, 'CARMY MODE CHANGED — mode: ' + arg);
          handled = true;
        } else if (arg === 'off') {
          clearMode();
          writeHookOutput('UserPromptSubmit', 'off', 'CARMY MODE OFF');
          handled = true;
        } else if (arg === '') {
          const mode = readMode() || getDefaultMode();
          writeHookOutput('UserPromptSubmit', mode, 'CARMY MODE ACTIVE — mode: ' + mode);
          handled = true;
        }
      }
    }

    // Standalone deactivation phrase.
    if (!handled && isDeactivationCommand(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'CARMY MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
}

process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', finish);
// Never hang the session (#443-style): recover on stdin error or a short
// fallback. unref() keeps the timer off the normal 'end'-fires-first path.
process.stdin.on('error', () => { finish(); process.exit(0); });
setTimeout(() => { finish(); process.exit(0); }, 1000).unref();
