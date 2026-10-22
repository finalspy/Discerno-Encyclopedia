import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import { parse } from 'yaml';
import schema from '../schema/entry.schema.json' with { type: 'json' };

export interface Issue {
  file: string;
  message: string;
}

type Lang = 'en' | 'fr';
type Status = 'draft' | 'in-review' | 'published';

interface FrontMatter {
  slug: string;
  aliases?: string[];
  related?: string[];
  lang: Lang;
  status: Status;
}

interface ParsedEntry {
  file: string;
  front: FrontMatter;
}

// One section per pillar of the product: understand, detect, protect.
export const REQUIRED_HEADINGS: Record<Lang, readonly string[]> = {
  en: ['How it works', 'Why it is problematic', 'How to detect it', 'How to protect yourself'],
  fr: ['Comment ça marche', "Pourquoi c'est problématique", 'Comment le détecter', "Comment s'en protéger"]
};

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// ajv-formats is CommonJS: its default import is the plugin function, which its typings describe as a namespace.
type FormatsPlugin = (instance: Ajv2020) => Ajv2020;
const addFormats = addFormatsModule as unknown as FormatsPlugin;

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateFrontMatter = ajv.compile<FrontMatter>(schema);

export function validateDirectory(directory: string): Issue[] {
  const issues: Issue[] = [];
  const entries: ParsedEntry[] = [];

  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort();

  for (const name of files) {
    const file = join(directory, name);
    const entry = parseEntry(file, issues);
    if (entry !== null) {
      entries.push(entry);
    }
  }

  checkCrossReferences(entries, issues);
  return issues;
}

function parseEntry(file: string, issues: Issue[]): ParsedEntry | null {
  const match = FRONT_MATTER.exec(readFileSync(file, 'utf8'));
  if (match === null) {
    issues.push({ file, message: 'missing front matter (expected a YAML block between two "---" lines)' });
    return null;
  }

  let data: unknown;
  try {
    data = parse(match[1] ?? '');
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    issues.push({ file, message: `front matter is not valid YAML: ${reason}` });
    return null;
  }

  if (!validateFrontMatter(data)) {
    for (const error of validateFrontMatter.errors ?? []) {
      const where = error.instancePath === '' ? 'front matter' : error.instancePath;
      issues.push({ file, message: `${where}: ${error.message ?? 'invalid'}` });
    }
    return null;
  }

  const body = match[2] ?? '';
  const expectedSlug = basename(file, '.md');
  let valid = true;
  if (data.slug !== expectedSlug) {
    issues.push({ file, message: `slug "${data.slug}" must equal the file name "${expectedSlug}"` });
    valid = false;
  }
  if (data.status !== 'draft') {
    const headings = new Set([...body.matchAll(/^## (.+?)\s*$/gm)].map((heading) => heading[1]));
    for (const required of REQUIRED_HEADINGS[data.lang]) {
      if (!headings.has(required)) {
        issues.push({ file, message: `missing section "## ${required}"` });
        valid = false;
      }
    }
  }
  return valid ? { file, front: data } : null;
}

function checkCrossReferences(entries: ParsedEntry[], issues: Issue[]): void {
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
