// Shared test plumbing: a temp dir that cleans itself up, and a wrapper that
// runs one of our scripts/hooks as its own process with a controlled env — the
// same way the host invokes them.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

// Make a temp dir and register its removal on process exit, so callers never
// leak fixtures even when an assertion throws mid-test.
function makeTempDir(prefix = 'carmy-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// Run a repo script (path relative to the repo root) under a merged env, with
// optional extra CLI args.
function run(relScript, env = {}, input = '', args = []) {
  return spawnSync(process.execPath, [path.join(root, relScript), ...args], {
    env: { ...process.env, ...env },
    input,
    encoding: 'utf8',
  });
}

module.exports = { root, makeTempDir, run };
