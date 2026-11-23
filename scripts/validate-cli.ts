import { readdirSync } from 'node:fs';
import { listOpenIssues, validateDirectory, validateTranslations } from './validate.ts';

const args = process.argv.slice(2);
const showIssues = args.includes('--issues');
const directory: string | undefined = args.find((arg) => !arg.startsWith('--'));
if (directory === undefined) {
  console.error('usage: node scripts/validate-cli.ts <entries-directory> [--issues]');
  process.exit(2);
}

const translations = validateTranslations(directory);
const issues = [...validateDirectory(directory), ...translations.issues];
const count = readdirSync(directory).filter((name) => name.endsWith('.md')).length;

for (const issue of issues) {
  console.error(`${issue.file}: ${issue.message}`);
}

if (issues.length > 0) {
  console.error(`${issues.length} issue(s) in ${count} entry file(s)`);
  process.exit(1);
}
console.log(`${count} entry file(s) valid`);
if (translations.counts.size > 0) {
  const perLanguage = [...translations.counts].map(([lang, total]) => `${lang}: ${total}`).join(', ');
  console.log(`translations: ${perLanguage}`);
}
// An outdated translation is not an error: it is shown with a notice until it is updated, and is listed here.
for (const item of translations.outdated) {
  console.warn(`WARNING: ${item.file}: outdated, its source changed since it was translated`);
}

const open = listOpenIssues(directory);
if (open.length > 0) {
  const perKind = new Map<string, number>();
  for (const item of open) {
    perKind.set(item.kind, (perKind.get(item.kind) ?? 0) + 1);
  }
  const summary = [...perKind].map(([kind, total]) => `${kind}: ${total}`).join(', ');
  console.log(`${open.length} open issue(s) in ${new Set(open.map((item) => item.slug)).size} entries (${summary})`);
  if (showIssues) {
    for (const item of open) {
      const tracker = item.issue === undefined ? '' : ` (#${item.issue})`;
      console.log(`  ${item.slug}: [${item.kind}] ${item.note}${tracker}`);
    }
  }
}
