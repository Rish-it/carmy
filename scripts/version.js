#!/usr/bin/env node
// Version tool. carmy declares its version in three manifests; every release
// bumps all of them. No args (or --check) verifies they share one pinned X.Y.Z,
// and on a release-tag CI run that the shared version equals the tag. A version
// argument writes that version into every manifest in one shot.
//
//   node scripts/version.js                 # check (what CI runs)
//   node scripts/version.js --check         # same, explicit
//   node scripts/version.js 0.2.0           # bump every manifest to 0.2.0
//   node scripts/version.js --check --root <dir>   # run against another root

const fs = require('fs');
const path = require('path');

const PINNED_SEMVER = /^\d+\.\d+\.\d+$/;

// Every place a version lives. Each entry declares how to read and write it, so
// check and bump share one source of truth for which fields must stay in sync.
const TARGETS = [
  { file: '.claude-plugin/plugin.json', get: (j) => j.version, set: (j, v) => { j.version = v; } }, // Claude Code plugin — what users install
  { file: '.codex-plugin/plugin.json', get: (j) => j.version, set: (j, v) => { j.version = v; } }, // Codex plugin
  { file: 'package.json', get: (j) => j.version, set: (j, v) => { j.version = v; } }, // npm package / repo root
];

function readJson(root, file) {
  const raw = fs.readFileSync(path.join(root, file), 'utf8').replace(/^﻿/, '');
  return JSON.parse(raw);
}

function writeJson(root, file, json) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(json, null, 2)}\n`);
}

function check(root) {
  let failed = false;
  const versions = TARGETS.map(({ file, get }) => {
    let version;
    try {
      version = get(readJson(root, file));
    } catch (e) {
      console.error(`${file}: ${e.message}`);
      failed = true;
      return [file, undefined];
    }
    if (typeof version !== 'string' || !PINNED_SEMVER.test(version)) {
      console.error(`${file}: version must be a pinned X.Y.Z semver, got ${JSON.stringify(version)}`);
      failed = true;
    }
    return [file, version];
  });

  const distinct = [...new Set(versions.map(([, v]) => v))];
  if (distinct.length > 1) {
    console.error('Version mismatch — every manifest must share one version:');
    for (const [file, version] of versions) console.error(`  ${version}\t${file}`);
    failed = true;
  }
  const shared = distinct.length === 1 ? distinct[0] : null;

  // On a release-tag push, CI sets GITHUB_REF_TYPE=tag and GITHUB_REF_NAME=vX.Y.Z.
  if (shared && process.env.GITHUB_REF_TYPE === 'tag') {
    const tagVersion = (process.env.GITHUB_REF_NAME || '').replace(/^v/, '');
    if (PINNED_SEMVER.test(tagVersion) && tagVersion !== shared) {
      console.error(`release tag ${process.env.GITHUB_REF_NAME} does not match version ${shared}; bump the version files before tagging`);
      failed = true;
    }
  }

  if (failed) {
    console.error('Align the version fields so every manifest shares one version.');
    return 1;
  }
  console.log(`All ${TARGETS.length} version files pinned at ${shared}.`);
  return 0;
}

function bump(root, version) {
  if (!PINNED_SEMVER.test(version)) {
    console.error(`Expected a pinned X.Y.Z semver, got: ${version}`);
    return 1;
  }
  const changed = [];
  for (const { file, get, set } of TARGETS) {
    const json = readJson(root, file);
    if (get(json) !== version) {
      set(json, version);
      writeJson(root, file, json);
      changed.push(file);
    }
  }
  console.log(`Set version to ${version}: ${changed.length ? changed.join(', ') : 'no files changed'}.`);
  return 0;
}

function main(argv) {
  let root = path.join(__dirname, '..');
  let version = null;
  let checkOnly = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--check') checkOnly = true;
    else if (arg === '--root') root = path.resolve(argv[++i] || '.');
    else if (arg.startsWith('-')) { console.error(`Unknown option: ${arg}`); return 1; }
    else if (version) { console.error(`Unexpected extra argument: ${arg}`); return 1; }
    else version = arg;
  }
  return version && !checkOnly ? bump(root, version) : check(root);
}

process.exitCode = main(process.argv.slice(2));
