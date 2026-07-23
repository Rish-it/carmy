#!/usr/bin/env node
// version.js guards that every manifest shares one pinned version, and bumps
// them together. Both paths run against a temp fixture via --root.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { makeTempDir, run } = require('./helpers');

const MANIFESTS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', 'package.json'];

function fixture(versions) {
  const dir = makeTempDir('carmy-version-');
  MANIFESTS.forEach((file, i) => {
    fs.mkdirSync(path.join(dir, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), JSON.stringify({ version: versions[i] }, null, 2));
  });
  return dir;
}

const runVersion = (dir, ...args) => run('scripts/version.js', {}, '', [...args, '--root', dir]);

test('check passes when all manifests share one pinned version', () => {
  const r = runVersion(fixture(['0.1.0', '0.1.0', '0.1.0']), '--check');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /pinned at 0\.1\.0/);
});

test('check fails on a version mismatch', () => {
  const r = runVersion(fixture(['0.1.0', '0.2.0', '0.1.0']), '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /mismatch/i);
});

test('bump writes the new version into every manifest', () => {
  const dir = fixture(['0.1.0', '0.1.0', '0.1.0']);
  const r = runVersion(dir, '0.2.0');
  assert.equal(r.status, 0, r.stderr);
  for (const file of MANIFESTS) {
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')).version, '0.2.0');
  }
});
