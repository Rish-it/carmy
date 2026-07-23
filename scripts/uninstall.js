#!/usr/bin/env node
// carmy — removes state carmy wrote outside the plugin's own files: the mode
// flag, the config file, and the statusLine entry it added to settings.json.
// Plugin files themselves are removed by each host's own uninstall command;
// this only cleans up what those commands can't see.

const fs = require('fs');
const path = require('path');
const { getConfigPath, getClaudeDir } = require('../hooks/carmy-config');

const STATUSLINE_SCRIPT = 'carmy-statusline';

function removeIfExists(filePath, label) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Removed ${label}: ${filePath}`);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

removeIfExists(path.join(getClaudeDir(), '.carmy-active'), 'mode flag');
removeIfExists(path.join(getClaudeDir(), '.carmy-statusline-nudged'), 'statusline nudge flag');
removeIfExists(getConfigPath(), 'config file');

const settingsPath = path.join(getClaudeDir(), 'settings.json');
try {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, ''));
  const cmd = settings.statusLine && settings.statusLine.command;
  // Only remove the parts carmy owns. If the user combined statuslines
  // (e.g. carmy && something-else), keep the other plugin's command intact.
  if (typeof cmd === 'string' && cmd.includes(STATUSLINE_SCRIPT)) {
    const parts = cmd.split(/&&|;/).map((s) => s.trim()).filter(Boolean);
    const others = parts.filter((s) => !s.includes(STATUSLINE_SCRIPT));
    if (others.length === 0) {
      delete settings.statusLine;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      console.log(`Removed carmy statusLine entry from ${settingsPath}`);
    } else {
      settings.statusLine.command = others.join(' && ');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      console.log(`Removed carmy statusLine segment from ${settingsPath}`);
    }
  }
} catch (e) {
  if (e.code === 'ENOENT') {
    // no settings.json — nothing to clean
  } else if (e instanceof SyntaxError) {
    console.warn(`settings.json is malformed — could not remove the carmy statusLine entry. Remove it manually from: ${settingsPath} (${e.message})`);
  } else {
    throw e;
  }
}
