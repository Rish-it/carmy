#!/usr/bin/env node
// Product contracts span instructions, commands, docs, and release CI. These
// checks stop an adapter or fallback surface from silently weakening Carmy.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('every instruction surface preserves the no-attribution rule', () => {
  for (const file of ['AGENTS.md', 'skills/carmy/SKILL.md']) {
    const text = read(file);
    assert.match(text, /Never name an AI, model, assistant, tool, brand, or generator/i, `${file} omits no-attribution`);
    assert.match(text, /commit message, PR title, PR description, branch name, or code comment/i, `${file} weakens no-attribution scope`);
  }
});

test('Carmy uses its bundled TDD protocol and debt marker', () => {
  const legacyMarker = `p${'onytail'}:`;
  for (const file of ['AGENTS.md', 'skills/carmy/SKILL.md']) {
    const text = read(file);
    assert.match(text, /carmy-tdd/, `${file} must name the bundled TDD skill`);
    assert.match(text, /`carmy:`/, `${file} must use Carmy's debt marker`);
    assert.ok(!text.toLowerCase().includes(legacyMarker), `${file} leaks the upstream debt marker`);
  }
});

test('base command documents every runtime control state', () => {
  const markdown = read('commands/carmy.md');
  const toml = read('commands/carmy.toml');
  for (const text of [markdown, toml]) {
    assert.match(text, /cold\|hot\|off/i);
    assert.match(text, /default cold\|hot/i);
    assert.match(text, /no argument.*current mode|current mode.*no argument/i);
  }
});

test('README documents native plugin installation and lifecycle requirements', () => {
  const readme = read('README.md');
  assert.match(readme, /codex plugin marketplace add/i);
  assert.match(readme, /codex plugin add/i);
  assert.match(readme, /\/plugin marketplace add/i);
  assert.match(readme, /\/plugin install/i);
  assert.match(readme, /Node\.js/i);
  assert.match(readme, /Uninstall/i);
  assert.match(readme, /Update/i);
});

test('README gives skills.sh users a direct installation path', () => {
  const readme = read('README.md');
  assert.match(readme, /skills\.sh/i);
  assert.match(readme, /npx skills add https:\/\/github\.com\/Rish-it\/carmy --skill carmy/i);
});

test('release job verifies the exact artifact before publishing', () => {
  const workflow = read('.github/workflows/publish.yml');
  assert.match(workflow, /node scripts\/version\.js --check/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm pack --dry-run/);
  assert.ok(workflow.indexOf('npm test') < workflow.indexOf('npm publish'), 'tests must run before publish');
});
