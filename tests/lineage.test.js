#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('lineage check accepts the current working tree', () => {
  const root = path.join(__dirname, '..');
  const result = spawnSync(process.execPath, ['scripts/check-lineage.js'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});
