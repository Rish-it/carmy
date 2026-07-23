#!/usr/bin/env node
// uninstall.js must remove the state carmy wrote outside its own files: the mode
// flag, the config file, and only its own statusLine segment in settings.json.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { makeTempDir, run } = require('./helpers');

const runUninstall = (env) => run('scripts/uninstall.js', env);

test('uninstall removes the flag and config, leaving other statuslines intact', () => {
  const temp = makeTempDir('carmy-uninstall-');
  const claudeDir = path.join(temp, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });
  fs.writeFileSync(path.join(claudeDir, '.carmy-active'), 'cold');
  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify({
    statusLine: { type: 'command', command: 'bash /x/other-statusline.sh && bash /x/carmy-statusline.sh' },
  }, null, 2));

  const env = { HOME: temp, USERPROFILE: temp, CLAUDE_CONFIG_DIR: claudeDir, XDG_CONFIG_HOME: path.join(temp, '.config') };
  const configDir = path.join(temp, '.config', 'carmy');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({ defaultMode: 'hot' }));

  const r = runUninstall(env);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(path.join(claudeDir, '.carmy-active')), false, 'flag must be removed');
  assert.equal(fs.existsSync(path.join(configDir, 'config.json')), false, 'config must be removed');

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  assert.ok(settings.statusLine, 'the other statusline must survive');
  assert.ok(!settings.statusLine.command.includes('carmy-statusline'), 'carmy segment must be removed');
  assert.ok(settings.statusLine.command.includes('other-statusline'), 'the other segment must remain');
});

test('uninstall removes the whole statusLine entry when carmy is the only one', () => {
  const temp = makeTempDir('carmy-uninstall-solo-');
  const claudeDir = path.join(temp, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });
  const settingsPath = path.join(claudeDir, 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify({
    statusLine: { type: 'command', command: 'bash /x/carmy-statusline.sh' }, other: 1,
  }, null, 2));

  const r = runUninstall({ HOME: temp, USERPROFILE: temp, CLAUDE_CONFIG_DIR: claudeDir, XDG_CONFIG_HOME: path.join(temp, '.config') });
  assert.equal(r.status, 0, r.stderr);
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  assert.equal(settings.statusLine, undefined, 'the carmy-only statusLine must be deleted');
  assert.equal(settings.other, 1, 'unrelated settings must be preserved');
});
