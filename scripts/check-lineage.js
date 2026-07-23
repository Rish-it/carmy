#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const blocked = [
  ['pony', 'tail'].join(''),
  ['codex', 'plugin', 'cc', 'main'].join('-'),
  ['Dietrich', 'Gebert'].join(''),
].map((entry) => entry.toLowerCase());

function hasBlockedText(text) {
  const value = text.toLowerCase();
  return blocked.some((entry) => value.includes(entry));
}

function run(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  } catch (error) {
    if (error.status === 1) return '';
    throw error;
  }
}

function checkWorkingTree() {
  const files = run(['ls-files', '-co', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  return files.filter((file) => {
    const body = fs.readFileSync(path.join(root, file));
    return !body.includes(0) && hasBlockedText(body.toString('utf8'));
  });
}

function checkHistory() {
  const revisions = run(['rev-list', '--all']).trim().split('\n').filter(Boolean);
  const badRevisions = revisions.filter((revision) => hasBlockedText(run(['show', '-s', '--format=%B', revision])));
  const badTrees = revisions.filter((revision) => blocked.some((entry) => run(['grep', '-I', '-i', '-l', '-e', entry, revision]).trim()));
  return { badRevisions, badTrees };
}

const violations = checkWorkingTree();
if (process.argv.includes('--history')) {
  const { badRevisions, badTrees } = checkHistory();
  violations.push(...badRevisions.map((revision) => `commit ${revision}`));
  violations.push(...badTrees.map((revision) => `tree ${revision}`));
}

if (violations.length) {
  console.error(`Blocked lineage text found in: ${violations.join(', ')}`);
  process.exit(1);
}

console.log('Lineage check passed.');
