import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };
import { parseEntry } from './entry.ts';
import { readLegalFacts } from './legal.ts';
import { readAnalytics, readDonation, renderSite, type SiteEntry } from './site.ts';

const [entriesDirectory, outputDirectory] = process.argv.slice(2);
if (entriesDirectory === undefined || outputDirectory === undefined) {
  console.error('usage: node scripts/site-cli.ts <entries-directory> <output-directory>');
  process.exit(2);
}

/** A warning of the build; in GitHub Actions, an annotation shown on the page of the run. */
function warn(message: string): void {
  console.warn(process.env.GITHUB_ACTIONS === 'true' ? `::warning::${message}` : `WARNING: ${message}`);
}

const analytics = readAnalytics(process.env);
if (!analytics.ok) {
  console.error(analytics.error);
  process.exit(1);
}

const donation = readDonation(process.env);
if (!donation.ok) {
  console.error(donation.error);
  process.exit(1);
}

if (analytics.analytics === null) {
  warn('no visit statistics: PUBLIC_UMAMI_SRC and PUBLIC_UMAMI_WEBSITE_ID are unset');
}
if (donation.donationUrl === null) {
  warn('no donation button: PUBLIC_DONATION_URL is unset');
}

// A missing legal fact never fails the build: the page shows its marker, and the log lists it.
const legal = readLegalFacts(process.env);
if (legal.missing.length > 0) {
  warn(`legal notice incomplete, missing: ${legal.missing.join(' ')}`);
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
  analytics: analytics.analytics,
  donationUrl: donation.donationUrl,
  legal: legal.values
});

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
for (const [name, html] of pages) {
  writeFileSync(join(outputDirectory, name), html);
}
for (const asset of ['site.css', 'site.js']) {
  copyFileSync(join('site', asset), join(outputDirectory, asset));
}
mkdirSync(join(outputDirectory, 'brand'));
for (const asset of readdirSync(join('site', 'brand'))) {
  copyFileSync(join('site', 'brand', asset), join(outputDirectory, 'brand', asset));
}
// The pages are plain HTML: this file tells GitHub Pages not to process them with Jekyll.
writeFileSync(join(outputDirectory, '.nojekyll'), '');

console.log(
  `${pages.size - 2} of ${entries.length} entries written to ${outputDirectory}, ${analytics.analytics === null ? 'without' : 'with'} Umami`
);
