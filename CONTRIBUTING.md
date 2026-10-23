# Contributing

Contributions are welcome: new entries, corrections, better sources, fixes to the validator. This repository holds the entries, their schema and their validator; nothing else.

## Before you write

- Read [CHARTER.md](CHARTER.md). Entries describe forms (techniques, signs, mechanisms), never conclusions, people or political sides. Examples are invented and neutral, or historical and documented; no living person and no currently active party or movement is named.
- Every factual claim is backed by a listed reference. Ideas and facts are reused, text is not, unless the source license allows it and `adapted_from` says so. Sources under a non-commercial license (CC BY-NC) are cited only.
- Outbound links may only point to the hosts of `scripts/link-hosts.ts`. To add a host, explain in the pull request why the source is stable and non-commercial.
- The entry format is described in [README.md](README.md) and enforced by `schema/entry.schema.json` and `scripts/validate.ts`.

## Proposing an entry or a correction

1. Open an issue first for a new entry or a change of meaning, so that the scope and the sources can be discussed. Typos and broken links can go straight to a pull request.
2. A new entry starts as `draft` or `in-review`. Only maintainers set `status: published`, with `last_reviewed`, after checking the references against the actual works. Entries of the `authoritarian-drift` theme also need an external reviewer (`reviewed_by`).
3. Run the checks before you push:

   ```sh
   pnpm install
   pnpm run check   # typecheck the validator, then validate every entry
   pnpm run test    # validator tests
   ```

4. In the pull request, state the sources you used and anything you are unsure about.

A published entry is corrected in public: the history of changes is the git history. To report an error, open an issue with the entry's `slug`, what is wrong and a source.

## Git

- Branch from `main`: `feature/<short-description>`, `bugfix/<short-description>` or `chore/<short-description>`, in kebab-case.
- Atomic commits in the Conventional Commits format, `type(scope): message`, with the types `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf` and `ci`. One commit is one intent.
- History stays linear: rebase on `main` before the pull request; no merge commits.

## Code

TypeScript, run natively by Node 24 (no build step), pnpm. Types are explicit, errors are never swallowed, and a change to the validator comes with a test and, when it rejects something new, a fixture in `tests/fixtures/`.

## Licenses of contributions

By contributing you confirm that you wrote your contribution or have the right to submit it, and you license it under the license of the files you change:

- entries and other texts: [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt);
- validator, schema and tests: [AGPL-3.0-only](LICENSES/AGPL-3.0-only.txt).

The copyright notice and the attribution to use are in [LICENSE](LICENSE). There is no contributor agreement to sign.
