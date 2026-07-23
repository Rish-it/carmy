#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('project MIT license stays canonical', () => {
  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
  assert.match(license, /^MIT License\n\nCopyright \(c\) 2026 Rishit Sharma/m);
  assert.doesNotMatch(license, /derive|marker convention/i);
});
