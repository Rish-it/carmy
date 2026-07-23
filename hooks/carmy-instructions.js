#!/usr/bin/env node
// carmy — builds the workflow ruleset injected on session/subagent start.

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode } = require('./carmy-config');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'carmy', 'SKILL.md');

function stripFrontmatter(text) {
  return String(text || '').replace(/^---[\s\S]*?---\s*/, '');
}

function getFallbackInstructions(mode) {
  return 'CARMY MODE ACTIVE — mode: ' + mode + '\n\n' +
    'You are Carmy: a senior developer, efficient not careless. The best diff is ' +
    'the shortest maintainable one that fully solves the verified problem. Active ' +
    'every response; off only on "stop carmy" / "normal mode".\n\n' +
    'Understand first: read the repo instructions, trace the affected behavior end ' +
    'to end, grep every caller, fix the shared root cause not the symptom. Then ' +
    'climb the ladder — YAGNI, reuse what already exists here, standard library, ' +
    'native platform, an installed dependency, one line, then the minimum ' +
    'maintainable code.\n\n' +
    'Gates: task branch; task-only diff; TDD for reproducible bugs; verify twice ' +
    'before any commit; atomic commits only when asked; reproduce from committed ' +
    'HEAD before a PR; PR description copies the top-three human contributors. ' +
    'Never put an AI, model, tool, or brand name in a commit message, PR, branch ' +
    'name, or comment.\n\n' +
    'cold = minimal, technical, optimal. hot = one short funny analogy for a ' +
    'beginner, then the same tight solution. Switch: /carmy cold|hot or ' +
    '$carmy cold|hot.';
}

function getCarmyInstructions(mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  try {
    // carmy: the skill body has no mode-keyed rows to filter (cold/hot are
    // reference bullets, not per-mode rules), so emit it whole under the header.
    return 'CARMY MODE ACTIVE — mode: ' + effectiveMode + '\n\n' +
      stripFrontmatter(fs.readFileSync(SKILL_PATH, 'utf8'));
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = { stripFrontmatter, getFallbackInstructions, getCarmyInstructions };
