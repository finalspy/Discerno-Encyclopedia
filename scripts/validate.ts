import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseEntry, type EntryFrontMatter, type EntryLang, type EntryType, type OpenIssue } from './entry.ts';
import { isLanguage, SECTION_TITLES } from './languages.ts';
import { isAllowedLink } from './link-hosts.ts';
import { parseTranslation, sourceHash } from './translation.ts';

export interface Issue {
  file: string;
  message: string;
}

export interface LocatedOpenIssue extends OpenIssue {
  file: string;
  slug: string;
}

interface LocatedEntry {
  file: string;
  front: EntryFrontMatter;
}

/** Sections a non-draft entry must contain, in its language (scripts/languages.ts). */
export function requiredHeadings(type: EntryType, lang: EntryLang): readonly string[] {
  const titles = SECTION_TITLES[lang];
  switch (type) {
    case 'concept':
      return titles.concept;
    case 'indicator':
      return [...titles.phenomenon, titles.respond];
    case 'bias':
    case 'manipulation-technique':
    case 'fallacy':
    case 'rhetorical-device':
      return titles.phenomenon;
  }
}

/** Open issues of every valid entry of a directory, in file order. Invalid entries are reported by validateDirectory. */
export function listOpenIssues(directory: string): LocatedOpenIssue[] {
  const located: LocatedOpenIssue[] = [];
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort();
  for (const name of files) {
    const file = join(directory, name);
    const result = parseEntry(readFileSync(file, 'utf8'));
    if (result.ok) {
      for (const openIssue of result.entry.front.open_issues ?? []) {
        located.push({ ...openIssue, file, slug: result.entry.front.slug });
      }
    }
  }
  return located;
}

export function validateDirectory(directory: string): Issue[] {
  const issues: Issue[] = [];
  const entries: LocatedEntry[] = [];

  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort();

  for (const name of files) {
    const file = join(directory, name);
    const entry = checkEntry(file, issues);
    if (entry !== null) {
      entries.push(entry);
    }
  }

  checkCrossReferences(entries, issues);
  return issues;
}

function checkEntry(file: string, issues: Issue[]): LocatedEntry | null {
  const result = parseEntry(readFileSync(file, 'utf8'));
  if (!result.ok) {
    for (const message of result.errors) {
      issues.push({ file, message });
    }
    return null;
  }

  const { front, body } = result.entry;
  const expectedSlug = basename(file, '.md');
  let valid = true;
  if (front.slug !== expectedSlug) {
    issues.push({ file, message: `slug "${front.slug}" must equal the file name "${expectedSlug}"` });
    valid = false;
  }
  const openIssueCount = front.open_issues?.length ?? 0;
  if (front.status === 'published' && openIssueCount > 0) {
    issues.push({
      file,
      message: `a published entry must not have open issues (${openIssueCount}): close them, or set the status back to "in-review"`
    });
    valid = false;
  }
  const links = [
    ...(front.references ?? []).flatMap((reference, index) =>
      reference.url === undefined ? [] : [{ where: `references[${index}].url`, url: reference.url }]
    ),
    ...(front.adapted_from ?? []).map((source, index) => ({ where: `adapted_from[${index}].url`, url: source.url }))
  ];
  for (const { where, url } of links) {
    if (!isAllowedLink(url)) {
      issues.push({ file, message: `${where}: the host of "${url}" is not an accepted link host (see CHARTER.md)` });
      valid = false;
    }
  }
  if (front.status !== 'draft') {
    const headings = new Set([...body.matchAll(/^## (.+?)\s*$/gm)].map((heading) => heading[1]));
    for (const required of requiredHeadings(front.type, front.lang)) {
      if (!headings.has(required)) {
        issues.push({ file, message: `missing section "## ${required}"` });
        valid = false;
      }
    }
    const opening = SECTION_TITLES[front.lang].status;
    if ((front.themes ?? []).includes('laws-and-adages') && !new RegExp(`^${opening}`, 'm').test(body)) {
      issues.push({
        file,
        message: `a laws-and-adages entry must state what kind of statement it is in a paragraph starting with "${opening}"`
      });
      valid = false;
    }
  }
  return valid ? { file, front } : null;
}

function checkCrossReferences(entries: LocatedEntry[], issues: Issue[]): void {
  const slugs = new Set(entries.map((entry) => entry.front.slug));
  const aliasOwner = new Map<string, string>();

  for (const { file, front } of entries) {
    for (const alias of front.aliases ?? []) {
      const owner = aliasOwner.get(alias);
      if (slugs.has(alias)) {
        issues.push({ file, message: `alias "${alias}" is the slug of another entry` });
      } else if (owner !== undefined) {
        issues.push({ file, message: `alias "${alias}" is already claimed by "${owner}"` });
      } else {
        aliasOwner.set(alias, front.slug);
      }
    }
  }

  for (const { file, front } of entries) {
    for (const target of front.related ?? []) {
      const renamedTo = aliasOwner.get(target);
      if (target === front.slug) {
        issues.push({ file, message: 'related must not contain the entry itself' });
      } else if (renamedTo !== undefined) {
        issues.push({ file, message: `related "${target}" is a former slug: use "${renamedTo}"` });
      } else if (!slugs.has(target)) {
        issues.push({ file, message: `related "${target}" does not exist` });
      }
    }
  }
}

export interface TranslationReport {
  issues: Issue[];
  /** Translations whose source changed since they were written: shown with a notice until updated. */
  outdated: { file: string; slug: string; lang: string }[];
  /** Number of translation files per language. */
  counts: Map<string, number>;
}

/** Translated entries (`<directory>/<lang>/<slug>.md`): each one against its source entry in `<directory>`. */
export function validateTranslations(directory: string): TranslationReport {
  const report: TranslationReport = { issues: [], outdated: [], counts: new Map() };
  const sources = new Map<string, { front: EntryFrontMatter; body: string }>();
  for (const name of readdirSync(directory).filter((item) => item.endsWith('.md'))) {
    const result = parseEntry(readFileSync(join(directory, name), 'utf8'));
    if (result.ok) sources.set(result.entry.front.slug, result.entry);
  }

  const languages = readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort();
  for (const lang of languages) {
    const folder = join(directory, lang);
    if (!isLanguage(lang)) {
      report.issues.push({ file: folder, message: `"${lang}" is not a language of the encyclopedia (scripts/languages.ts)` });
      continue;
    }
    const files = readdirSync(folder)
      .filter((name) => name.endsWith('.md'))
      .sort();
    report.counts.set(lang, files.length);
    for (const name of files) {
      const file = join(folder, name);
      const issues = report.issues;
      const result = parseTranslation(readFileSync(file, 'utf8'));
      if (!result.ok) {
        for (const message of result.errors) issues.push({ file, message });
        continue;
      }
      const { front, body } = result.translation;
      if (front.slug !== basename(name, '.md')) {
        issues.push({ file, message: `slug "${front.slug}" must equal the file name "${basename(name, '.md')}"` });
      }
      if (front.lang !== lang) {
        issues.push({ file, message: `lang "${front.lang}" must equal its folder "${lang}"` });
      }
      const source = sources.get(front.slug);
      if (source === undefined) {
        issues.push({ file, message: `no source entry "${front.slug}.md"` });
        continue;
      }
      if (front.translated_from.lang !== source.front.lang || source.front.lang === lang) {
        issues.push({ file, message: `translated_from.lang must be "${source.front.lang}", the language of the source, and differ from "${lang}"` });
      }
      if (front.status === 'published' && source.front.status !== 'published') {
        issues.push({ file, message: 'a translation cannot be published before its source' });
      }
      if (front.status !== 'draft') {
        const headings = new Set([...body.matchAll(/^## (.+?)\s*$/gm)].map((heading) => heading[1]));
        for (const required of requiredHeadings(source.front.type, lang)) {
          if (!headings.has(required)) issues.push({ file, message: `missing section "## ${required}"` });
        }
        const opening = SECTION_TITLES[lang].status;
        if ((source.front.themes ?? []).includes('laws-and-adages') && !body.includes(opening)) {
          issues.push({ file, message: `a laws-and-adages entry must state its kind of statement in a paragraph starting with "${opening}"` });
        }
      }
      if (front.translated_from.hash !== sourceHash(source.front, source.body)) {
        report.outdated.push({ file, slug: front.slug, lang });
      }
    }
  }
  return report;
}
