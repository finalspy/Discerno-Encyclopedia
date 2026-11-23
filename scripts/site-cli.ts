import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };
import { parseEntry } from './entry.ts';
import { readAnalytics, renderSite, type SiteEntry } from './site.ts';

const [entriesDirectory, outputDirectory] = process.argv.slice(2);
if (entriesDirectory === undefined || outputDirectory === undefined) {
  console.error('usage: node scripts/site-cli.ts <entries-directory> <output-directory>');
  process.exit(2);
}

const analytics = readAnalytics(process.env);
if (!analytics.ok) {
  console.error(analytics.error);
  process.exit(1);
}

const entries: SiteEntry[] = readdirSync(entriesDirectory)
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const result = parseEntry(readFileSync(join(entriesDirectory, name), 'utf8'));
    if (!result.ok) {
      throw new Error(`Invalid entry ${name}: ${result.errors.join('; ')}`);
    }
    return result.entry;
  });

const pages = renderSite(entries, {
  version: packageJson.version,
  buildDate: new Date().toISOString().slice(0, 10),
  repositoryUrl: packageJson.repository.url.replace(/\.git$/, ''),
  analytics: analytics.analytics
});

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
for (const [name, html] of pages) {
  writeFileSync(join(outputDirectory, name), html);
}
for (const asset of ['site.css', 'site.js']) {
  copyFileSync(join('site', asset), join(outputDirectory, asset));
}
// The pages are plain HTML: this file tells GitHub Pages not to process them with Jekyll.
writeFileSync(join(outputDirectory, '.nojekyll'), '');

console.log(
  `${pages.size - 1} of ${entries.length} entries written to ${outputDirectory}, ${analytics.analytics === null ? 'without' : 'with'} Umami`
);
