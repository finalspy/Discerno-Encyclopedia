import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { listOpenIssues, validateDirectory } from './validate.ts';

function fixture(name: string): string {
  return fileURLToPath(new URL(`../tests/fixtures/${name}`, import.meta.url));
}

function messages(name: string): string[] {
  return validateDirectory(fixture(name)).map((issue) => issue.message);
}

test('accepts valid entries', () => {
  assert.deepEqual(messages('valid'), []);
});

test('accepts a concept entry with the concept sections', () => {
  assert.deepEqual(messages('concept-valid'), []);
});

test('accepts a published authoritarian-drift entry once it records its reviewer', () => {
  assert.deepEqual(messages('drift-published-reviewed'), []);
});

test('accepts a laws-and-adages entry that states its kind of statement', () => {
  assert.deepEqual(messages('law-valid'), []);
});

test('accepts an in-review entry that lists its open issues', () => {
  assert.deepEqual(messages('open-issues-valid'), []);
});

test('lists the open issues of an entry with their slug', () => {
  const listed = listOpenIssues(fixture('open-issues-valid'));
  assert.deepEqual(
    listed.map(({ slug, kind, issue }) => ({ slug, kind, issue })),
    [
      { slug: 'anchoring', kind: 'source-missing', issue: undefined },
      { slug: 'anchoring', kind: 'uncertain', issue: 12 }
    ]
  );
});

test('lists no open issue for an entry that has none', () => {
  assert.deepEqual(listOpenIssues(fixture('valid')), []);
});

const rejected: ReadonlyArray<readonly [string, string]> = [
  ['slug-mismatch', 'must equal the file name "anchoring"'],
  ['missing-section', 'missing section "## How to detect it"'],
  ['published-without-references', "must have required property 'last_reviewed'"],
  ['published-without-references', "must have required property 'references'"],
  ['alias-collision', 'alias "framing" is the slug of another entry'],
  ['related-unknown', 'related "ghost" does not exist'],
  ['related-former-slug', 'related "framing-effect" is a former slug: use "framing"'],
  ['invalid-yaml', 'front matter is not valid YAML'],
  ['link-host-rejected', 'is not an accepted link host'],
  ['doi-invalid', 'must match pattern'],
  ['indicator-missing-response', 'missing section "## How to respond"'],
  ['drift-published-unreviewed', "must have required property 'reviewed_by'"],
  ['open-issues-invalid-kind', 'must be equal to one of the allowed values'],
  ['open-issues-published', 'a published entry must not have open issues (1)'],
  ['law-missing-status', 'a laws-and-adages entry must state what kind of statement it is in a paragraph starting with "Status:"']
];

for (const [name, expected] of rejected) {
  test(`rejects ${name}: ${expected}`, () => {
    assert.ok(
      messages(name).some((message) => message.includes(expected)),
      `expected "${expected}" in ${JSON.stringify(messages(name))}`
    );
  });
}
