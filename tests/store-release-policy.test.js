'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const workflowPath = path.resolve(__dirname, '..', '.github', 'workflows', 'publish-store.yml');

test('store publication rejects prerelease tags', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /Store publication requires a stable numeric tag/);
  assert.match(workflow, /\^v\[0-9\]\+\(\\\.\[0-9\]\+\)\{0,3\}\$/);
  assert.doesNotMatch(workflow, /\(-\[0-9A-Za-z\.\-\]\+\)\?/);
});
