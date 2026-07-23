#!/usr/bin/env node
// Keep cross-platform hook launchers valid. Hosts may run `command` through
// PowerShell even when commandWindows exists, and open stdin must not freeze a
// lifecycle event.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const hooksPath = path.join(root, 'hooks', 'claude-codex-hooks.json');
const cmdVariable = /%[A-Za-z_][A-Za-z0-9_]*%/;
const posixGuard = /\bcommand\s+-v\b|&&|\|\||>\/dev\/null|2>&1/;
const hookScript = /hooks[\\/]([\w.-]+\.(?:js|mjs|cjs|ps1|sh))/;

function commandHooks() {
  return Object.values(JSON.parse(fs.readFileSync(hooksPath, 'utf8')).hooks)
    .flat()
    .flatMap((entry) => entry.hooks);
}

test('Windows launchers use PowerShell environment syntax', () => {
  const commands = commandHooks().map((hook) => hook.commandWindows).filter(Boolean);
  assert.ok(commands.length > 0);
  for (const command of commands) assert.doesNotMatch(command, cmdVariable, command);
});

test('shared launchers are shell-neutral direct Node commands', () => {
  const commands = commandHooks().map((hook) => hook.command).filter(Boolean);
  assert.ok(commands.length > 0);
  for (const command of commands) {
    assert.match(command, /^node\s+/, command);
    assert.doesNotMatch(command, /(^|\s)exec\s/, command);
    assert.doesNotMatch(command, posixGuard, command);
  }
});

test('every lifecycle launcher names a shipped hook script', () => {
  for (const hook of commandHooks()) {
    for (const command of [hook.command, hook.commandWindows].filter(Boolean)) {
      const match = command.match(hookScript);
      assert.ok(match, `no hook path in ${command}`);
      assert.ok(fs.existsSync(path.join(root, 'hooks', match[1])), `missing ${match[1]}`);
    }
  }
});

test('mode tracker exits when hook stdin remains open', async () => {
  const child = spawn(process.execPath, [path.join(root, 'hooks', 'carmy-mode-tracker.js')], {
    stdio: ['pipe', 'ignore', 'ignore'],
  });
  const exitCode = await new Promise((resolve, reject) => {
    const guard = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('mode tracker hung on open stdin'));
    }, 3000);
    child.on('exit', (code) => { clearTimeout(guard); resolve(code); });
    child.on('error', reject);
  });
  assert.equal(exitCode, 0);
});
