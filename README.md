# Antimanip Encyclopedia

Entries on cognitive biases, manipulation techniques, fallacies and rhetorical devices, with the schema and the validator that every entry must pass. The entries explain how each phenomenon works, why it is problematic, how to detect it and how to protect oneself. They are factual and nonpartisan: they describe techniques, never conclusions or political sides.

This repository is a content repository: applications read the entries and the schema from it, for example as a git submodule.

The rules every entry follows are in [CHARTER.md](CHARTER.md). To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Layout

```
entries/                  one Markdown file per entry: entries/<slug>.md
schema/entry.schema.json  JSON Schema (draft 2020-12) of the front matter
scripts/                  validator and static site builder (TypeScript, run natively by Node 24), with their tests
site/                     style sheet and script of the static site
.github/workflows/        site build and deployment to GitHub Pages
tests/fixtures/           valid and invalid sample entries used by the tests
LICENSE                   copyright notice, licenses by kind of file, attribution
LICENSES/                 license texts
CONTRIBUTING.md           how to contribute
CHARTER.md                editorial rules of every entry
```

## Entry format

A YAML front matter block followed by Markdown. Required fields: `slug`, `type`, `lang`, `title`, `summary`, `status`. See the schema for the others (`aliases`, `synonyms`, `themes`, `related`, `classifications`, `references`, `adapted_from`, `last_reviewed`, `reviewed_by`, `open_issues`).

- The `slug` equals the file name and is a stable identifier: other entries and applications link to it. When an entry is renamed, the old slug moves to `aliases`; a slug is never reused.
- `status` is `draft`, `in-review` or `published`. A published entry needs `last_reviewed` and at least one reference.
- `type` is `bias`, `manipulation-technique`, `fallacy`, `rhetorical-device`, `indicator` (an observable sign) or `concept` (a definition with its debates). `themes` places the entry in one or more thematic sections.
- Unless the entry is a draft, the body has the sections of its type, in the entry's language, as `## ` headings (the exact titles, English and French, are in `scripts/validate.ts`). Biases, techniques, fallacies and devices: how it works, why it is problematic, how to detect it, how to protect yourself. Indicators add how to respond. Concepts: definition, competing definitions and debates, why it helps to discern.
- An entry of the `authoritarian-drift` theme needs `reviewed_by` to be published (see [CHARTER.md](CHARTER.md)).
- An entry of the `laws-and-adages` theme (laws, razors, principles and adages known by a name) says in its first section, in a paragraph starting with `Statut :` (`Status:` in English), what kind of statement it is: a mathematical result, an empirical regularity, a principle of method, or a humorous or satirical adage. A famous name is not evidence.
- `open_issues` lists what is still to fix or to settle on an entry, whatever its `status`. Each item has a `kind` (`source-missing`, `unverified`, `link-missing`, `contested`, `neutrality`, `uncertain` or `other`), a short `note` and, optionally, the number of the tracker issue where the point is discussed (`issue`). A `published` entry has none: the validator rejects it. Keep notes short and factual; discussions belong in the issue.
- References carry a stable outbound link when one exists: `doi` for articles and many books, otherwise `url`, limited to the hosts of `scripts/link-hosts.ts`. Wikipedia links come from `classifications.wikipedia`.
- Sources are cited. Ideas and facts are reused, text is not, unless the source license allows it and `adapted_from` says so. Sources under a non-commercial license (CC BY-NC) are cited only.

## Website

Each push to `main` checks the entries, builds a static site with `pnpm run site:build` and deploys it to GitHub Pages. Published entries are shown. Entries in review are shown with a notice, except those of the themes listed in `REVIEW_REQUIRED_THEMES` (`scripts/site.ts`), which wait for their review. Drafts are never shown.

In the repository settings, Pages must use "GitHub Actions" as its source.

## Commands

Requirements: Node 24 and pnpm.

```sh
pnpm install
pnpm run validate   # validate entries/
pnpm run check      # typecheck the validator, then validate entries/
pnpm run issues     # validate, then list the open issues of the entries
pnpm run test       # validator tests
```

## Licenses

- Entries (`entries/`) and the other texts: [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt).
- The validator, the schema and the tests (`scripts/`, `schema/`, `tests/`): [AGPL-3.0-only](LICENSES/AGPL-3.0-only.txt).

Copyright (c) 2026 YPETIT. Details are in [LICENSE](LICENSE).

## Attribution

Reusing an entry requires credit, a link to the license and a note of any change. Suggested credit:

> "Entry title", Antimanip Encyclopedia, YPETIT, CC BY-SA 4.0, https://github.com/finalspy/Discerno-Encyclopedia

What you build from an entry is shared under the same license.
