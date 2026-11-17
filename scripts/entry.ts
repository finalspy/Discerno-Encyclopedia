import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import { parse } from 'yaml';
import schema from '../schema/entry.schema.json' with { type: 'json' };

export type EntryType =
  | 'bias'
  | 'manipulation-technique'
  | 'fallacy'
  | 'rhetorical-device'
  | 'indicator'
  | 'concept';
export type EntryTheme =
  | 'cognitive-biases'
  | 'argumentation'
  | 'influence-and-persuasion'
  | 'obscurantism-and-pseudoscience'
  | 'authoritarian-drift'
  | 'statistics-and-data'
  | 'laws-and-adages';
export type EntryLang = 'en' | 'fr';
export type EntryStatus = 'draft' | 'in-review' | 'published';
export type Taxonomy = 'disarm' | 'semeval2023' | 'semeval2020' | 'logic' | 'wikipedia';

export type OpenIssueKind =
  | 'source-missing'
  | 'unverified'
  | 'link-missing'
  | 'contested'
  | 'neutrality'
  | 'uncertain'
  | 'other';

export interface OpenIssue {
  kind: OpenIssueKind;
  note: string;
  issue?: number;
}

export interface Reference {
  title: string;
  author?: string;
  year?: number;
  doi?: string;
  url?: string;
  accessed?: string;
}

export interface EntryFrontMatter {
  slug: string;
  aliases?: string[];
  type: EntryType;
  lang: EntryLang;
  title: string;
  synonyms?: string[];
  summary: string;
  status: EntryStatus;
  last_reviewed?: string;
  reviewed_by?: string;
  open_issues?: OpenIssue[];
  themes?: EntryTheme[];
  related?: string[];
  classifications?: Partial<Record<Taxonomy, string[]>>;
  references?: Reference[];
  adapted_from?: { title: string; url: string; license: string }[];
}

export interface ParsedEntry {
  front: EntryFrontMatter;
  body: string;
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// ajv-formats is CommonJS: its default import is the plugin function, which its typings describe as a namespace.
type FormatsPlugin = (instance: Ajv2020) => Ajv2020;
const addFormats = addFormatsModule as unknown as FormatsPlugin;

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateFrontMatter = ajv.compile<EntryFrontMatter>(schema);

export type ParseResult = { ok: true; entry: ParsedEntry } | { ok: false; errors: string[] };

/** Splits an entry file into its front matter and body, and checks the front matter against the schema. */
export function parseEntry(raw: string): ParseResult {
  const match = FRONT_MATTER.exec(raw);
  if (match === null) {
    return { ok: false, errors: ['missing front matter (expected a YAML block between two "---" lines)'] };
  }

  let data: unknown;
  try {
    data = parse(match[1] ?? '');
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [`front matter is not valid YAML: ${reason}`] };
  }

  if (!validateFrontMatter(data)) {
    const errors = (validateFrontMatter.errors ?? []).map((error) => {
      const where = error.instancePath === '' ? 'front matter' : error.instancePath;
      return `${where}: ${error.message ?? 'invalid'}`;
    });
    return { ok: false, errors };
  }

  return { ok: true, entry: { front: data, body: match[2] ?? '' } };
}
