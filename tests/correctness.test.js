#!/usr/bin/env node
// The injected ruleset must carry carmy's substance in every mode, and the
// fallback (used when the skill file can't be read) must too.

const test = require('node:test');
const assert = require('node:assert/strict');

const { getCarmyInstructions, getFallbackInstructions } = require('../hooks/carmy-instructions');

for (const mode of ['cold', 'hot']) {
  test(`instructions for ${mode} carry the header, ladder, and gates`, () => {
    const out = getCarmyInstructions(mode);
    assert.match(out, new RegExp(`CARMY MODE ACTIVE — mode: ${mode}`));
    assert.match(out, /YAGNI/);
    assert.match(out, /task branch|Branch\./i);
    assert.match(out, /verify twice/i);
    assert.match(out, /attribution/i);
  });
}

test('an unknown mode falls back to cold', () => {
  assert.match(getCarmyInstructions('bogus'), /CARMY MODE ACTIVE — mode: cold/);
});

test('the fallback ruleset keeps the ladder, gates, and no-attribution rule', () => {
  const fb = getFallbackInstructions('cold');
  assert.match(fb, /YAGNI/);
  assert.match(fb, /reuse/i);
  assert.match(fb, /verify twice/i);
  assert.match(fb, /Never put an AI, model/);
});
