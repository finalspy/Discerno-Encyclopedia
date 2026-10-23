# Discerno Encyclopedia

Entries on cognitive biases, manipulation techniques, fallacies and rhetorical devices, with the schema and the validator that every entry must pass. The entries explain how each phenomenon works, why it is problematic, how to detect it and how to protect oneself. They are factual and nonpartisan: they describe techniques, never conclusions or political sides.

This repository is a content repository. It is used as a git submodule by the Discerno application.

The rules every entry follows are in [CHARTER.md](CHARTER.md).

## Layout

```
entries/                  one Markdown file per entry: entries/<slug>.md
schema/entry.schema.json  JSON Schema (draft 2020-12) of the front matter
scripts/                  validator (TypeScript, run natively by Node 24) and its tests
tests/fixtures/           valid and invalid sample entries used by the tests
LICENSES/                 license texts
```

## Entry format

A YAML front matter block followed by Markdown. Required fields: `slug`, `type`, `lang`, `title`, `summary`, `status`. See the schema for the others (`aliases`, `synonyms`, `related`, `classifications`, `references`, `adapted_from`, `last_reviewed`).

- The `slug` equals the file name and is a stable identifier: other entries and the analyzer link to it. When an entry is renamed, the old slug moves to `aliases`; a slug is never reused.
- `status` is `draft`, `in-review` or `published`. A published entry needs `last_reviewed` and at least one reference.
- Unless the entry is a draft, the body has four sections, in the entry's language: *How it works*, *Why it is problematic*, *How to detect it*, *How to protect yourself* (`## ` headings; the French titles are listed in `scripts/validate.ts`).
- Sources are cited. Ideas and facts are reused, text is not, unless the source license allows it and `adapted_from` says so. Sources under a non-commercial license (CC BY-NC) are cited only.

## Commands

Requirements: Node 24 and pnpm.

```sh
pnpm install
pnpm run validate   # validate entries/
pnpm run check      # typecheck the validator, then validate entries/
pnpm run test       # validator tests
```

## Licenses

- Entries (`entries/`) and the other texts: [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt).
- The validator and its tests (`scripts/`, `schema/`, `tests/`): [AGPL-3.0-only](LICENSES/AGPL-3.0-only.txt).
