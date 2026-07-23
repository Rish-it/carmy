#!/usr/bin/env node
// carmy — shared configuration resolver
//
// Resolution order for default mode:
//   1. CARMY_DEFAULT_MODE environment variable
//   2. Config file defaultMode field:
//      - $XDG_CONFIG_HOME/carmy/config.json (any platform, if set)
//      - ~/.config/carmy/config.json (macOS / Linux fallback)
//      - %APPDATA%\carmy\config.json (Windows fallback)
//   3. 'cold'

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_MODE = 'cold';
// off clears the flag; cold/hot are the two explanation modes. A default must be
// one of the two runtime explanation modes — off is a session action, never a
// stored default.
const RUNTIME_MODES = ['off', 'cold', 'hot'];
const DEFAULTABLE_MODES = ['cold', 'hot'];

function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

// "stop carmy" / "normal mode" turn carmy off, but only as a standalone command.
// Matching the phrase anywhere in the message would turn it off mid-task for an
// ordinary request like "add a normal mode toggle", so require the whole message
// to be the command, ignoring case and trailing punctuation.
function isDeactivationCommand(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[.!?\s]+$/, '');
  return t === 'stop carmy' || t === 'normal mode';
}

// carmy: only embed the plugin install path in a statusline shell command when
// it's made of ordinary path characters. An allowlist beats escaping every
// shell's metacharacters; a hostile clone path (quotes, &, $, backtick, ;, etc.)
// falls back to manual setup. Allows : \ / for normal Windows and POSIX paths.
function isShellSafe(p) {
  return typeof p === 'string' && /^[A-Za-z0-9 _.\-:/\\~]+$/.test(p);
}

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'carmy');
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'carmy'
    );
  }
  return path.join(os.homedir(), '.config', 'carmy');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function getClaudeDir() {
  // carmy: CLAUDE_CONFIG_DIR overrides ~/.claude, matching Claude Code.
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function getDefaultMode() {
  // 1. Environment variable (highest priority). Only a defaultable explanation
  // mode is valid — off is a session action, never a stored default.
  const envMode = process.env.CARMY_DEFAULT_MODE;
  if (envMode && DEFAULTABLE_MODES.includes(envMode.toLowerCase())) {
    return envMode.toLowerCase();
  }

  // 2. Config file
  try {
    const config = JSON.parse(
      fs.readFileSync(getConfigPath(), 'utf8').replace(/^﻿/, '')
    );
    if (config.defaultMode && DEFAULTABLE_MODES.includes(config.defaultMode.toLowerCase())) {
      return config.defaultMode.toLowerCase();
    }
  } catch (e) {
    // Config file doesn't exist or is invalid — fall through
  }

  // 3. Default
  return DEFAULT_MODE;
}

function writeDefaultMode(mode) {
  // Only a defaultable explanation mode can be a stored default.
  const normalized = typeof mode === 'string' && DEFAULTABLE_MODES.includes(mode.trim().toLowerCase())
    ? mode.trim().toLowerCase()
    : null;
  if (!normalized) return null;

  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^﻿/, ''));
    if (!config || typeof config !== 'object' || Array.isArray(config)) config = {};
  } catch (_) {}
  config.defaultMode = normalized;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return normalized;
}

module.exports = {
  DEFAULT_MODE,
  RUNTIME_MODES,
  DEFAULTABLE_MODES,
  normalizeMode,
  isDeactivationCommand,
  isShellSafe,
  getConfigDir,
  getConfigPath,
  getClaudeDir,
  getDefaultMode,
  writeDefaultMode,
};
