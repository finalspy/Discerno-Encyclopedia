import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEntry } from './entry.ts';
import { isLanguage, LANGUAGES } from './languages.ts';
import { sourceHash } from './translation.ts';

// Helpers for translators (README.md, "Translations"):
//   hash <entries-directory> [slug...]   the value of translated_from.hash of each source entry
//   missing <entries-directory> <lang>   the source entries that have no translation in that language
const [command, directory, ...rest] = process.argv.slice(2);
if ((command !== 'hash' && command !== 'missing') || directory === undefined) {
  console.error('usage: node scripts/translation-cli.ts hash <entries-directory> [slug...]');
  console.error('       node scripts/translation-cli.ts missing <entries-directory> <lang>');
  process.exit(2);
}

const sources = readdirSync(directory)
  .filter((name) => name.endsWith('.md'))
  .sort()
  .map((name) => {
    const result = parseEntry(readFileSync(join(directory, name), 'utf8'));
    if (!result.ok) throw new Error(`Invalid entry ${name}: ${result.errors.join('; ')}`);
    return result.entry;
  });

if (command === 'hash') {
  const wanted = new Set(rest);
  for (const { front, body } of sources) {
    if (wanted.size === 0 || wanted.has(front.slug)) console.log(`${front.slug} ${sourceHash(front, body)}`);
  }
} else {
  const lang = rest[0] ?? '';
  if (!isLanguage(lang)) {
    console.error(`unknown language "${lang}": one of ${LANGUAGES.join(', ')}`);
    process.exit(2);
  }
  const missing = sources.filter(
    ({ front }) => front.lang !== lang && front.status !== 'draft' && !existsSync(join(directory, lang, `${front.slug}.md`))
  );
  for (const { front } of missing) console.log(front.slug);
  console.error(`${missing.length} entries without a ${lang} translation`);
}
