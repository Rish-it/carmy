#!/usr/bin/env node
// The README tells users to run `node scripts/uninstall.js`, so the npm package
// must ship it, and the version files must stay consistent.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('npm package uses the public release scope', () => {
  assert.equal(pkg.name, '@rishitxathrean/carmy');
  assert.equal(pkg.publishConfig.access, 'public');
});

test('npm package ships the advertised cleanup script', () => {
  assert.ok(pkg.files.includes('scripts/uninstall.js'), 'package.json "files" must include scripts/uninstall.js');
  assert.ok(fs.existsSync(path.join(root, 'scripts', 'uninstall.js')), 'scripts/uninstall.js is listed but missing on disk');
});

test('npm package ships every script and document it advertises', () => {
  for (const file of ['scripts/uninstall.js', 'scripts/version.js', 'scripts/check-invariants.js', 'scripts/check-lineage.js', 'docs/', 'examples/', 'assets/']) {
    assert.ok(pkg.files.includes(file), `package.json "files" must include ${file}`);
  }
  for (const command of Object.values(pkg.scripts)) {
    const localScript = command.match(/node (scripts\/[\w.-]+\.js)/)?.[1];
    if (localScript) assert.ok(pkg.files.includes(localScript), `package script references unshipped ${localScript}`);
  }
  assert.match(pkg.engines.node, /^>=18\.18\.0$/, 'hooks require a documented Node runtime');
});

test('npm pack contains every runnable package script', () => {
  const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(packed.status, 0, packed.stderr);
  const paths = new Set(JSON.parse(packed.stdout)[0].files.map((file) => file.path));
  for (const file of ['scripts/uninstall.js', 'scripts/version.js', 'scripts/check-invariants.js', 'scripts/check-lineage.js', 'docs/platform-native.md', 'examples/README.md', 'assets/koala-icon.png', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
    assert.ok(paths.has(file), `packed tarball omits ${file}`);
  }
});

test('plugin manifests use the bundled koala icon', () => {
  const codex = JSON.parse(fs.readFileSync(path.join(root, '.codex-plugin', 'plugin.json'), 'utf8'));
  const icon = path.join(root, 'assets', 'koala-icon.png');
  assert.ok(fs.existsSync(icon), 'assets/koala-icon.png is missing');
  assert.equal(codex.interface.composerIcon, './assets/koala-icon.png');
  assert.equal(codex.interface.logo, './assets/koala-icon.png');
});

test('plugin manifests and package.json share one version', () => {
  const files = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', 'package.json'];
  const versions = files.map((f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')).version);
  assert.equal(new Set(versions).size, 1, `version drift across manifests: ${versions.join(', ')}`);
});
