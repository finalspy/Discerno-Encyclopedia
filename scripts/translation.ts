import { createHash } from 'node:crypto';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { parse } from 'yaml';
import type { EntryFrontMatter, EntryStatus } from './entry.ts';
import { LANGUAGES, type Language } from './languages.ts';

/**
 * A translated entry (`entries/<lang>/<slug>.md`): only what is written in a language (title, synonyms, summary,
 * body). Everything else (type, themes, related entries, classifications, references) comes from the source entry,
 * so it is kept in one place.
 */
export interface TranslationFrontMatter {
  slug: string;
  lang: Language;
  title: string;
  synonyms?: string[];
  summary: string;
  /** Own review status: a translation is reviewed by a reader of its language. */
  status: EntryStatus;
  translated_from: {
    lang: Language;
    /**
     * Fingerprint of the translated text of the source (see sourceHash): a change of the source makes it outdated.
     * Written in quotes: YAML would read some hexadecimal strings as numbers.
     */
    hash: string;
  };
}

export interface ParsedTranslation {
  front: TranslationFrontMatter;
  body: string;
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'lang', 'title', 'summary', 'status', 'translated_from'],
  properties: {
    slug: { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' },
    lang: { type: 'string', enum: LANGUAGES },
    title: { type: 'string', minLength: 1 },
    synonyms: { type: 'array', uniqueItems: true, items: { type: 'string', minLength: 1 } },
    summary: { type: 'string', minLength: 1, maxLength: 280 },
    status: { type: 'string', enum: ['draft', 'in-review', 'published'] },
    translated_from: {
      type: 'object',
      additionalProperties: false,
      required: ['lang', 'hash'],
      properties: {
        lang: { type: 'string', enum: LANGUAGES },
        hash: { type: 'string', pattern: '^[0-9a-f]{16}$' }
      }
    }
  }
} as const;

const validateFrontMatter = new Ajv2020({ allErrors: true, strict: true }).compile<TranslationFrontMatter>(schema);

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export type TranslationParseResult = { ok: true; translation: ParsedTranslation } | { ok: false; errors: string[] };

export function parseTranslation(raw: string): TranslationParseResult {
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
  return { ok: true, translation: { front: data, body: match[2] ?? '' } };
}

/**
 * Fingerprint of what a translation translates: the title, synonyms, summary and body of the source entry. A change
 * of its references or review fields does not make its translations outdated.
 */
export function sourceHash(front: Pick<EntryFrontMatter, 'title' | 'synonyms' | 'summary'>, body: string): string {
  const text = JSON.stringify([front.title, front.synonyms ?? [], front.summary, body.trim()]);
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}
