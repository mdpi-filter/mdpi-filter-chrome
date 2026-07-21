'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function fail(message) {
  console.error(`Security verification failed: ${message}`);
  process.exitCode = 1;
}

if (manifest.manifest_version !== 3) {
  fail('manifest_version must remain 3');
}

const referencedFiles = new Set();
if (manifest.background?.service_worker) {
  referencedFiles.add(manifest.background.service_worker);
}
if (manifest.action?.default_popup) {
  referencedFiles.add(manifest.action.default_popup);
}
if (manifest.options_page) {
  referencedFiles.add(manifest.options_page);
}
for (const contentScript of manifest.content_scripts || []) {
  for (const file of contentScript.js || []) referencedFiles.add(file);
  for (const file of contentScript.css || []) referencedFiles.add(file);
}

for (const relativePath of referencedFiles) {
  if (/^https?:\/\//i.test(relativePath)) {
    fail(`remote executable resource in manifest: ${relativePath}`);
    continue;
  }
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`manifest references missing file: ${relativePath}`);
  }
}

const manifestText = fs.readFileSync(manifestPath, 'utf8');
if (/dompurify/i.test(manifestText)) {
  fail('DOMPurify must not be reintroduced without a reviewed HTML sink and pinned upgrade policy');
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
  fail('runtime npm dependencies require an explicit security review');
}

const dangerousPatterns = [
  { pattern: /\beval\s*\(/, label: 'eval()' },
  { pattern: /\bnew\s+Function\s*\(/, label: 'new Function()' },
  { pattern: /document\.write\s*\(/, label: 'document.write()' }
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    if (!entry.name.endsWith('.js') || absolutePath === __filename) continue;
    const source = fs.readFileSync(absolutePath, 'utf8');
    for (const { pattern, label } of dangerousPatterns) {
      if (pattern.test(source)) {
        fail(`${label} found in ${path.relative(root, absolutePath)}`);
      }
    }
  }
}

walk(root);

if (!process.exitCode) {
  console.log('Extension security verification passed.');
}
