import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateDirectory } from './validate.ts';

function fixture(name: string): string {
  return fileURLToPath(new URL(`../tests/fixtures/${name}`, import.meta.url));
}

function messages(name: string): string[] {
  return validateDirectory(fixture(name)).map((issue) => issue.message);
}

test('accepts valid entries', () => {
  assert.deepEqual(messages('valid'), []);
});

const rejected: ReadonlyArray<readonly [string, string]> = [
  ['slug-mismatch', 'must equal the file name "anchoring"'],
  ['missing-section', 'missing section "## How to detect it"'],
  ['published-without-references', "must have required property 'last_reviewed'"],
  ['published-without-references', "must have required property 'references'"],
  ['alias-collision', 'alias "framing" is the slug of another entry'],
  ['related-unknown', 'related "ghost" does not exist'],
  ['related-former-slug', 'related "framing-effect" is a former slug: use "framing"'],
  ['invalid-yaml', 'front matter is not valid YAML']
];

for (const [name, expected] of rejected) {
  test(`rejects ${name}: ${expected}`, () => {
    assert.ok(
      messages(name).some((message) => message.includes(expected)),
      `expected "${expected}" in ${JSON.stringify(messages(name))}`
    );
  });
}
