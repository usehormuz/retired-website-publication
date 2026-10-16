import assert from 'node:assert/strict';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateSourcePin(value) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Expected a source-pin object');
  assert.deepEqual(Object.keys(value).sort(), ['repository', 'revision'], 'Unexpected source-pin fields');
  assert.equal(value.repository, 'Xpounder-com/hormuz', 'The source repository is fixed');
  assert.equal(typeof value.revision, 'string', 'Expected a commit revision');
  assert.equal(value.revision.length, 40, 'Expected exactly 40 commit characters');
  assert.match(value.revision, /^[a-f0-9]{40}$/, 'Pin a full, lowercase commit SHA, never a branch or tag');
  return value.revision;
}

// The immutable snapshot was authored under Xpounder. Its embedded links and
// published provenance keep that name; only the checkout location changes.
export function sourceCheckoutRepository(value) {
  validateSourcePin(value);
  return 'mehrdadxzaker/hormuz';
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const pin = JSON.parse(await readFile('site-source.json', 'utf8'));
  const revision = validateSourcePin(pin);
  const repository = sourceCheckoutRepository(pin);
  assert.ok(process.env.GITHUB_OUTPUT, 'This entrypoint runs inside GitHub Actions');
  await appendFile(process.env.GITHUB_OUTPUT, `repository=${repository}\nrevision=${revision}\n`);
  console.log(`Reviewed website source: ${repository}@${revision} (authored as ${pin.repository})`);
}
