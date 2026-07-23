#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('platform-native guide covers each supported platform layer', () => {
  const doc = fs.readFileSync(path.join(root, 'docs', 'platform-native.md'), 'utf8');
  for (const heading of [
    'HTML', 'CSS', 'JavaScript', 'Swift', 'Node.js', 'Python', 'Database', 'Pattern',
  ]) {
    assert.match(doc, new RegExp(`^## .*${heading}`, 'mi'), `missing ${heading} guidance`);
  }
});

test('examples index exposes eleven focused reuse-first walkthroughs', () => {
  const examples = [
    'cold-vs-hot.md', 'root-cause-vs-symptom.md', 'debounce.md', 'deep-clone.md',
    'email-validation.md', 'group-by.md', 'infinite-scroll.md', 'modal-dialog.md',
    'number-formatting.md', 'rate-limit.md', 'url-params.md',
  ];
  const index = fs.readFileSync(path.join(root, 'examples', 'README.md'), 'utf8');
  for (const file of examples) {
    assert.ok(fs.existsSync(path.join(root, 'examples', file)), `missing examples/${file}`);
    assert.match(index, new RegExp(file.replace('.', '\\.')), `index omits ${file}`);
  }
});
