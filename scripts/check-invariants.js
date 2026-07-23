#!/usr/bin/env node
// Shared Carmy rules appear in AGENTS.md and the injected skill. Keep the
// load-bearing instructions aligned; host adapters must not weaken them.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SOURCES = ['AGENTS.md', 'skills/carmy/SKILL.md'];
const INVARIANTS = [
  'carmy-tdd',
  '`carmy:`',
  'Never name an AI, model, assistant, tool, brand, or generator',
  'commit message, PR title, PR description, branch name, or code comment',
  'task-only diff',
  'Verify twice',
  'committed HEAD',
  'top three',
];

let failed = false;
for (const source of SOURCES) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  const normalized = text.toLowerCase();
  for (const invariant of INVARIANTS) {
    if (!normalized.includes(invariant.toLowerCase())) {
      console.error(`${source} is missing invariant: ${JSON.stringify(invariant)}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Carmy instruction invariants present in ${SOURCES.length} surfaces.`);
