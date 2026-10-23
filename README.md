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

A YAML front matter block followed by Markdown. Required fields: `slug`, `type`, `lang`, `title`, `summary`, `status`. See the schema for the others (`aliases`, `synonyms`, `themes`, `related`, `classifications`, `references`, `adapted_from`, `last_reviewed`, `reviewed_by`).

- The `slug` equals the file name and is a stable identifier: other entries and the analyzer link to it. When an entry is renamed, the old slug moves to `aliases`; a slug is never reused.
- `status` is `draft`, `in-review` or `published`. A published entry needs `last_reviewed` and at least one reference.
- `type` is `bias`, `manipulation-technique`, `fallacy`, `rhetorical-device`, `indicator` (an observable sign) or `concept` (a definition with its debates). `themes` places the entry in one or more thematic sections.
- Unless the entry is a draft, the body has the sections of its type, in the entry's language, as `## ` headings (the exact titles, English and French, are in `scripts/validate.ts`). Biases, techniques, fallacies and devices: how it works, why it is problematic, how to detect it, how to protect yourself. Indicators add how to respond. Concepts: definition, competing definitions and debates, why it helps to discern.
- An entry of the `authoritarian-drift` theme needs `reviewed_by` to be published (see [CHARTER.md](CHARTER.md)).
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
