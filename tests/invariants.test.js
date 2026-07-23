#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { run } = require('./helpers');

test('instruction invariant guard passes for the repository sources', () => {
  const result = run('scripts/check-invariants.js');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /invariants present/i);
});
