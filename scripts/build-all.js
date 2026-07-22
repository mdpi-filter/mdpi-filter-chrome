'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildTarget } = require('./build-target');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = ['chrome', 'edge', 'firefox', 'safari'];

function readVersionArgument(argv) {
  const index = argv.indexOf('--version');
  if (index === -1) return null;
  if (!argv[index + 1]) throw new Error('Missing value for --version');
  return argv[index + 1];
}

const releaseVersion = readVersionArgument(process.argv.slice(2));
fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
for (const target of TARGETS) buildTarget(target, releaseVersion);
console.log(`Built ${TARGETS.length} browser targets.`);
