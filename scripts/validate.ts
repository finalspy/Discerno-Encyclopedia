import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseEntry, type EntryFrontMatter, type EntryLang, type EntryType, type OpenIssue } from './entry.ts';
import { isAllowedLink } from './link-hosts.ts';

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

// Signs and techniques: one section per pillar of the product (understand, detect, protect).
const PHENOMENON_HEADINGS: Record<EntryLang, readonly string[]> = {
  en: ['How it works', 'Why it is problematic', 'How to detect it', 'How to protect yourself'],
  fr: ['Comment ça marche', "Pourquoi c'est problématique", 'Comment le détecter', "Comment s'en protéger"]
};

// Indicators add how to respond.
const INDICATOR_HEADINGS: Record<EntryLang, readonly string[]> = {
  en: [...PHENOMENON_HEADINGS.en, 'How to respond'],
  fr: [...PHENOMENON_HEADINGS.fr, 'Comment réagir']
};

const CONCEPT_HEADINGS: Record<EntryLang, readonly string[]> = {
  en: ['Definition', 'Competing definitions and debates', 'Why it helps to discern'],
  fr: ['Définition', 'Définitions concurrentes et débats', 'Pourquoi cela aide à discerner']
};

/** Sections a non-draft entry must contain, in its language. */
export function requiredHeadings(type: EntryType, lang: EntryLang): readonly string[] {
  switch (type) {
    case 'concept':
      return CONCEPT_HEADINGS[lang];
    case 'indicator':
      return INDICATOR_HEADINGS[lang];
    case 'bias':
    case 'manipulation-technique':
    case 'fallacy':
    case 'rhetorical-device':
      return PHENOMENON_HEADINGS[lang];
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
