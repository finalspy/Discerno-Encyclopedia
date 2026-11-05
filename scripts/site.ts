import { Marked } from 'marked';
import type { EntryFrontMatter, EntryTheme, EntryType, Reference } from './entry.ts';

/** Themes whose entries stay hidden until they are published (see CHARTER.md, article 14). */
export const REVIEW_REQUIRED_THEMES: readonly EntryTheme[] = ['authoritarian-drift', 'obscurantism-and-pseudoscience'];

const TYPE_LABELS: Readonly<Record<EntryType, string>> = {
  bias: 'Biais cognitif',
  'manipulation-technique': 'Technique de manipulation',
  fallacy: 'Sophisme',
  'rhetorical-device': 'Procédé rhétorique',
  indicator: 'Signal',
  concept: 'Concept'
};

const TYPE_ORDER: readonly EntryType[] = ['bias', 'manipulation-technique', 'fallacy', 'rhetorical-device', 'indicator', 'concept'];

const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

export interface SiteEntry {
  front: EntryFrontMatter;
  body: string;
}

export interface SiteContext {
  version: string;
  buildDate: string;
  repositoryUrl: string;
}

export function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// Entries are open to contributions: raw HTML is shown as text and unsafe links are dropped.
const markdown = new Marked({
  renderer: {
    html({ text }): string {
      return escapeHtml(text);
    },
    link({ href, title, tokens }): string {
      const text = this.parser.parseInline(tokens);
      if (!SAFE_URL.test(href)) {
        return text;
      }
      const titleAttribute = title === null || title === undefined ? '' : ` title="${escapeHtml(title)}"`;
      return `<a href="${escapeHtml(href)}"${titleAttribute}>${text}</a>`;
    }
  }
});

/** Published entries are always shown. Entries in review are shown with a notice, except the themes that require a review. */
export function isVisibleOnSite(front: EntryFrontMatter): boolean {
  if (front.status === 'published') {
    return true;
  }
  if (front.status === 'draft') {
    return false;
  }
  return !(front.themes ?? []).some((theme) => REVIEW_REQUIRED_THEMES.includes(theme));
}

function statusLabel(front: EntryFrontMatter): string {
  return front.status === 'published' ? 'Relue' : 'En relecture';
}

function page(title: string, description: string, assetPrefix: string, content: string, context: SiteContext): string {
  return `<!doctype html>
<html lang="fr" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="stylesheet" href="${assetPrefix}site.css">
<script src="${assetPrefix}site.js" defer></script>
</head>
<body>
<header class="site-header">
<a class="site-header__brand" href="${assetPrefix}index.html">Encyclopédie Antimanip</a>
<button class="theme-toggle" type="button" data-theme-toggle aria-label="Changer de thème">Thème</button>
</header>
<main class="site-main">
${content}
</main>
<footer class="site-footer">
<p>Version ${escapeHtml(context.version)}, ${escapeHtml(context.buildDate)} · ©@finalspy · Contenu sous licence <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr">CC BY-SA 4.0</a> · <a href="${escapeHtml(context.repositoryUrl)}">Source et contributions</a></p>
</footer>
</body>
</html>
`;
}

function referenceHtml(reference: Reference): string {
  const details = [reference.author, reference.year?.toString()].filter((part) => part !== undefined).join(', ');
  const href = reference.doi !== undefined ? `https://doi.org/${reference.doi}` : reference.url;
  const title = escapeHtml(reference.title);
  const linked = href === undefined ? title : `<a href="${escapeHtml(href)}">${title}</a>`;
  return `<li>${linked}${details === '' ? '' : ` (${escapeHtml(details)})`}</li>`;
}

function pointerHtml(title: string): string {
  const href = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  return `<li><a href="${escapeHtml(href)}">Wikipédia : ${escapeHtml(title.replaceAll('_', ' '))}</a></li>`;
}

export function renderEntryPage(entry: SiteEntry, visible: ReadonlyMap<string, SiteEntry>, context: SiteContext): string {
  const { front, body } = entry;
  const related = (front.related ?? []).flatMap((slug) => {
    const target = visible.get(slug);
    return target === undefined ? [] : [`<li><a href="${escapeHtml(slug)}.html">${escapeHtml(target.front.title)}</a></li>`];
  });
  const references = (front.references ?? []).map(referenceHtml);
  const pointers = (front.classifications?.wikipedia ?? []).map(pointerHtml);
  const notice =
    front.status === 'published'
      ? ''
      : '<p class="notice">Fiche en cours de relecture : ses sources sont citées, mais elle n\'a pas encore été validée par un relecteur humain.</p>';
  const content = `<article class="entry">
<p class="entry__meta"><span class="badge">${escapeHtml(TYPE_LABELS[front.type])}</span> <span class="badge badge--status">${statusLabel(front)}</span></p>
<h1>${escapeHtml(front.title)}</h1>
<p class="entry__summary">${escapeHtml(front.summary)}</p>
${notice}
${markdown.parse(body, { async: false })}
${references.length === 0 ? '' : `<h2>Références</h2>\n<ul>\n${references.join('\n')}\n</ul>`}
${pointers.length === 0 ? '' : `<h2>Pour aller plus loin</h2>\n<ul>\n${pointers.join('\n')}\n</ul>`}
${related.length === 0 ? '' : `<h2>Voir aussi</h2>\n<ul>\n${related.join('\n')}\n</ul>`}
</article>`;
  return page(`${front.title} · Encyclopédie Antimanip`, front.summary, '', content, context);
}

export function renderIndexPage(entries: readonly SiteEntry[], context: SiteContext): string {
  const present = TYPE_ORDER.filter((type) => entries.some((entry) => entry.front.type === type));
  const options = present.map((type) => `<option value="${type}">${escapeHtml(TYPE_LABELS[type])}</option>`).join('');
  const items = [...entries]
    .sort((a, b) => a.front.title.localeCompare(b.front.title, 'fr'))
    .map(({ front }) => {
      const haystack = [front.title, front.summary, ...(front.synonyms ?? [])].join(' ').toLocaleLowerCase('fr');
      return `<li class="entry-card" data-type="${front.type}" data-status="${front.status}" data-title="${escapeHtml(front.title)}" data-search="${escapeHtml(haystack)}">
<a href="${escapeHtml(front.slug)}.html"><strong>${escapeHtml(front.title)}</strong></a>
<p>${escapeHtml(front.summary)}</p>
<p class="entry__meta"><span class="badge">${escapeHtml(TYPE_LABELS[front.type])}</span> <span class="badge badge--status">${statusLabel(front)}</span></p>
</li>`;
    })
    .join('\n');
  const content = `<h1>Comprendre les biais et les techniques de manipulation</h1>
<p class="lead">Comment ils fonctionnent, pourquoi ils posent problème, comment les détecter et comment s'en protéger. Ces fiches décrivent des formes de raisonnement, jamais des camps ni des personnes.</p>
<details class="legend">
<summary>Légende</summary>
<p><strong>Relue</strong> : fiche validée par un relecteur humain. <strong>En relecture</strong> : ses sources sont citées, mais elle n'a pas encore été validée.</p>
</details>
<div class="toolbar">
<label>Rechercher <input type="search" data-filter-search></label>
<label>Type <select data-filter-type><option value="">Tous</option>${options}</select></label>
<label>Tri <select data-sort><option value="title">Titre</option><option value="type">Type</option></select></label>
</div>
<p class="meta-text" aria-live="polite"><span data-count>${entries.length}</span> fiche(s)</p>
<ul class="entry-list" data-entries>
${items}
</ul>`;
  return page('Encyclopédie Antimanip', 'Biais cognitifs et techniques de manipulation : comprendre, détecter, se protéger.', '', content, context);
}

/** Renders the whole site as a map from file name to HTML. Slugs are restricted by the schema, so they are safe file names. */
export function renderSite(entries: readonly SiteEntry[], context: SiteContext): Map<string, string> {
  const visibleEntries = entries.filter(({ front }) => isVisibleOnSite(front));
  const visible = new Map(visibleEntries.map((entry) => [entry.front.slug, entry]));
  const pages = new Map<string, string>([['index.html', renderIndexPage(visibleEntries, context)]]);
  for (const entry of visibleEntries) {
    pages.set(`${entry.front.slug}.html`, renderEntryPage(entry, visible, context));
  }
  return pages;
}
