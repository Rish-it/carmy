#!/usr/bin/env node
// Every carmy command must ship both adapter files — commands/*.toml for Codex
// and commands/*.md for Claude Code — and every bundled skill must have a
// SKILL.md. A command advertised in the help card with a missing file fails here.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const COMMANDS = ['carmy', 'carmy-review', 'carmy-help', 'carmy-tdd'];
const SKILLS = ['carmy', 'carmy-review', 'carmy-help', 'carmy-tdd'];

test('every command ships a Codex commands/*.toml', () => {
  for (const name of COMMANDS) {
    assert.ok(fs.existsSync(path.join(root, 'commands', `${name}.toml`)), `missing commands/${name}.toml`);
  }
});

test('every command ships a Claude commands/*.md', () => {
  for (const name of COMMANDS) {
    assert.ok(fs.existsSync(path.join(root, 'commands', `${name}.md`)), `missing commands/${name}.md`);
  }
});

test('every bundled skill has a SKILL.md with a matching name', () => {
  for (const name of SKILLS) {
    const p = path.join(root, 'skills', name, 'SKILL.md');
    assert.ok(fs.existsSync(p), `missing skills/${name}/SKILL.md`);
    assert.match(fs.readFileSync(p, 'utf8'), new RegExp(`name:\\s*${name}\\b`), `skills/${name}/SKILL.md name mismatch`);
  }
});

test('command toml files declare description and prompt', () => {
  for (const name of COMMANDS) {
    const toml = fs.readFileSync(path.join(root, 'commands', `${name}.toml`), 'utf8');
    assert.match(toml, /^description\s*=/m, `${name}.toml missing description`);
    assert.match(toml, /^prompt\s*=/m, `${name}.toml missing prompt`);
  }
});
