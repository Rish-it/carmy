#!/usr/bin/env node
// Integration tests for the carmy lifecycle hooks: activation, mode tracking,
// subagent injection, and the config resolver. Each hook is spawned as its own
// process with a controlled env, exactly as the host runs it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { makeTempDir, run: runScript } = require('./helpers');

// Keep the base env clean so native-Claude / Codex branches are deterministic.
delete process.env.CLAUDE_CONFIG_DIR;
delete process.env.PLUGIN_DATA;
delete process.env.CARMY_DEFAULT_MODE;
delete process.env.CARMY_SUBAGENT_MATCHER;
delete process.env.XDG_CONFIG_HOME;

// Every hook lives under hooks/; run() takes just the script name.
const run = (script, env, input = '') => runScript(path.join('hooks', script), env, input);

const temp = makeTempDir('carmy-hooks-');

const home = path.join(temp, 'home');
const pluginData = path.join(temp, 'plugin-data');
fs.mkdirSync(home, { recursive: true });
const codexEnv = { HOME: home, USERPROFILE: home, PLUGIN_DATA: pluginData, CARMY_DEFAULT_MODE: 'hot' };
const codexState = path.join(pluginData, '.carmy-active');

test('activate (Codex) writes flag and emits the mode badge', () => {
  const r = run('carmy-activate.js', codexEnv);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(codexState, 'utf8'), 'hot');
  const out = JSON.parse(r.stdout);
  assert.equal(out.systemMessage, 'CARMY:HOT');
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(out.hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE — mode: hot/);
});

test('mode-tracker (Codex): /carmy cold switches the session mode', () => {
  const r = run('carmy-mode-tracker.js', codexEnv, JSON.stringify({ prompt: '/carmy cold' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(codexState, 'utf8'), 'cold');
  assert.equal(JSON.parse(r.stdout).systemMessage, 'CARMY:COLD');
});

test('mode-tracker: bare :hot token switches the mode', () => {
  const r = run('carmy-mode-tracker.js', codexEnv, JSON.stringify({ prompt: ':hot' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(codexState, 'utf8'), 'hot');
});

test('mode-tracker: bare /carmy reports without resetting', () => {
  fs.writeFileSync(codexState, 'cold');
  const r = run('carmy-mode-tracker.js', codexEnv, JSON.stringify({ prompt: '/carmy' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(codexState, 'utf8'), 'cold', 'bare query must not reset to default');
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE — mode: cold/);
});

test('mode-tracker: standalone "normal mode" deactivates', () => {
  fs.writeFileSync(codexState, 'cold');
  const r = run('carmy-mode-tracker.js', codexEnv, JSON.stringify({ prompt: 'normal mode' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(codexState), false);
  assert.equal(JSON.parse(r.stdout).systemMessage, 'CARMY:OFF');
});

test('mode-tracker: incidental "normal mode" in a request must not deactivate', () => {
  fs.writeFileSync(codexState, 'cold');
  const r = run('carmy-mode-tracker.js', codexEnv, JSON.stringify({ prompt: 'add a normal mode toggle next to dark mode' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(codexState, 'utf8'), 'cold');
});

test('activate (native Claude) writes the flag under ~/.claude', () => {
  const r = run('carmy-activate.js', { HOME: home, USERPROFILE: home, CARMY_DEFAULT_MODE: 'cold' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(home, '.claude', '.carmy-active'), 'utf8'), 'cold');
  assert.match(r.stdout, /CARMY MODE ACTIVE — mode: cold/);
});

test('CLAUDE_CONFIG_DIR overrides ~/.claude and the nudge fires at most once', () => {
  const home2 = path.join(temp, 'home2');
  fs.mkdirSync(home2, { recursive: true });
  const customDir = path.join(temp, 'custom-claude');
  const env = { HOME: home2, USERPROFILE: home2, CLAUDE_CONFIG_DIR: customDir, CARMY_DEFAULT_MODE: 'cold' };

  const r = run('carmy-activate.js', env);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(customDir, '.carmy-active'), 'utf8'), 'cold');
  assert.equal(fs.existsSync(path.join(home2, '.claude', '.carmy-active')), false);
  assert.ok(r.stdout.includes(path.join(customDir, 'settings.json')), 'nudge must reference the configured settings.json');
  assert.ok(fs.existsSync(path.join(customDir, '.carmy-statusline-nudged')), 'first nudge writes the once-only flag');

  const r2 = run('carmy-activate.js', env);
  assert.equal(r2.status, 0, r2.stderr);
  assert.ok(!r2.stdout.includes('STATUSLINE SETUP NEEDED'), 'nudge must not repeat once the flag exists');
});

test('/carmy default persists the default; a plain switch stays session-scoped', () => {
  const defHome = path.join(temp, 'default-home');
  const env = { HOME: defHome, USERPROFILE: defHome, XDG_CONFIG_HOME: path.join(defHome, '.config') };
  const configPath = path.join(defHome, '.config', 'carmy', 'config.json');
  const flag = path.join(defHome, '.claude', '.carmy-active');

  let r = run('carmy-mode-tracker.js', env, JSON.stringify({ prompt: '/carmy default hot' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(fs.readFileSync(configPath, 'utf8')).defaultMode, 'hot');
  assert.equal(fs.existsSync(flag), false, '/carmy default must not touch the session mode');

  r = run('carmy-mode-tracker.js', env, JSON.stringify({ prompt: '/carmy cold' }));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(flag, 'utf8'), 'cold');
  assert.equal(JSON.parse(fs.readFileSync(configPath, 'utf8')).defaultMode, 'hot', 'plain switch must not persist');
});

test('subagent injects when active and stays silent when off', () => {
  const subHome = path.join(temp, 'sub-home');
  const flag = path.join(subHome, '.claude', '.carmy-active');
  fs.mkdirSync(path.dirname(flag), { recursive: true });
  const env = { HOME: subHome, USERPROFILE: subHome };

  fs.writeFileSync(flag, 'cold');
  let r = run('carmy-subagent.js', env);
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SubagentStart');
  assert.match(out.hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE — mode: cold/);

  fs.unlinkSync(flag);
  r = run('carmy-subagent.js', env);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, '', 'subagent must stay silent when carmy is off');
});

test('subagent matcher scopes injection to matching agent types', () => {
  const scopeHome = path.join(temp, 'scope-home');
  const flag = path.join(scopeHome, '.claude', '.carmy-active');
  fs.mkdirSync(path.dirname(flag), { recursive: true });
  fs.writeFileSync(flag, 'cold');
  const env = { HOME: scopeHome, USERPROFILE: scopeHome };

  let r = run('carmy-subagent.js', { ...env, CARMY_SUBAGENT_MATCHER: 'general|plan' }, JSON.stringify({ agent_type: 'General-purpose' }));
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE/);

  r = run('carmy-subagent.js', { ...env, CARMY_SUBAGENT_MATCHER: 'general|plan' }, JSON.stringify({ agent_type: 'Explore' }));
  assert.equal(r.stdout, '', 'a non-matching agent_type must skip injection');

  r = run('carmy-subagent.js', { ...env, CARMY_SUBAGENT_MATCHER: '^general$' }, JSON.stringify({ agent_type: 'general-purpose' }));
  assert.equal(r.stdout, '', 'an anchored matcher must not match a superset');

  r = run('carmy-subagent.js', { ...env, CARMY_SUBAGENT_MATCHER: 'general' }, JSON.stringify({}));
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE/, 'absent agent_type must fail open');

  r = run('carmy-subagent.js', { ...env, CARMY_SUBAGENT_MATCHER: '(' }, JSON.stringify({ agent_type: 'anything' }));
  assert.equal(r.status, 0, 'an invalid regex must not crash');
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /CARMY MODE ACTIVE/);
});

test('config: isShellSafe, writeDefaultMode merge, and off is not defaultable', () => {
  const { isShellSafe, writeDefaultMode, getDefaultMode, DEFAULT_MODE } = require('../hooks/carmy-config');
  assert.equal(isShellSafe('/home/u/.claude/plugins/carmy/hooks/carmy-statusline.sh'), true);
  assert.equal(isShellSafe('C:\\Users\\x\\.claude\\plugins\\carmy\\hooks\\carmy-statusline.ps1'), true);
  assert.equal(isShellSafe('/tmp/a;rm -rf/x.sh'), false);
  assert.equal(isShellSafe('/tmp/$(calc)/x.sh'), false);

  const mergeHome = path.join(temp, 'merge-home');
  const configDir = path.join(mergeHome, '.config', 'carmy');
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify({ defaultMode: 'cold', customSetting: 42 }, null, 2));

  const prevXdg = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = path.join(mergeHome, '.config');
  try {
    assert.equal(writeDefaultMode('hot'), 'hot');
    const merged = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    assert.equal(merged.defaultMode, 'hot');
    assert.equal(merged.customSetting, 42, 'writeDefaultMode must preserve other fields');
    assert.equal(writeDefaultMode('off'), null, 'off must be refused as a default');
    assert.equal(JSON.parse(fs.readFileSync(configPath, 'utf8')).defaultMode, 'hot', 'a refused write must leave config intact');

    fs.rmSync(configPath);
    const prevMode = process.env.CARMY_DEFAULT_MODE;
    process.env.CARMY_DEFAULT_MODE = 'off';
    try {
      assert.equal(getDefaultMode(), DEFAULT_MODE, 'CARMY_DEFAULT_MODE=off must fall back to the built-in default');
    } finally {
      if (prevMode === undefined) delete process.env.CARMY_DEFAULT_MODE; else process.env.CARMY_DEFAULT_MODE = prevMode;
    }
  } finally {
    if (prevXdg === undefined) delete process.env.XDG_CONFIG_HOME; else process.env.XDG_CONFIG_HOME = prevXdg;
  }
});
