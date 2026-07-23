#!/usr/bin/env node
// Guards that the carmy skill keeps its non-negotiable content: the reuse-first
// ladder, every workflow gate, the two modes, and the no-attribution rule. If a
// future edit drops one of these, this test fails.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skill = fs.readFileSync(path.join(root, 'skills', 'carmy', 'SKILL.md'), 'utf8');

test('skill declares both modes with cold as default', () => {
  assert.match(skill, /\*\*cold\*\*/);
  assert.match(skill, /\*\*hot\*\*/);
  assert.match(skill, /Default:\s*\*\*cold\*\*/);
});

test('skill keeps the reuse-first ladder', () => {
  for (const rung of [/YAGNI/i, /Stdlib|standard library/i, /native platform/i, /installed dependency/i]) {
    assert.match(skill, rung);
  }
});

test('skill keeps every workflow gate', () => {
  for (const gate of [
    /task branch|Branch\./i,
    /task-only diff/i,
    /TDD/i,
    /[Vv]erify twice/,
    /[Aa]tomic commits/,
    /committed HEAD/i,
    /top.three/i,
  ]) {
    assert.match(skill, gate);
  }
});

test('skill forbids AI/model/brand attribution', () => {
  assert.match(skill, /No attribution/);
  assert.match(skill, /co-author trailer/);
});

test('skill has no leaked AI/model/brand name', () => {
  assert.doesNotMatch(skill, /\b(anthropic|openai|gpt|opus|sonnet|copilot|gemini)\b/i);
});
