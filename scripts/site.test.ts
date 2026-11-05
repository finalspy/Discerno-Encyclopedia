import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EntryFrontMatter } from './entry.ts';
import { isVisibleOnSite, renderSite, type SiteEntry } from './site.ts';

const CONTEXT = { version: '1.0.0', buildDate: '2026-11-05', repositoryUrl: 'https://example.org/repo' };

function front(slug: string, extra: Partial<EntryFrontMatter> = {}): EntryFrontMatter {
  return { slug, type: 'bias', lang: 'fr', title: `Titre ${slug}`, summary: 'Résumé.', status: 'in-review', ...extra };
}

function entry(slug: string, extra: Partial<EntryFrontMatter> = {}, body = 'Texte.'): SiteEntry {
  return { front: front(slug, extra), body };
}

describe('isVisibleOnSite', () => {
  it('shows published entries, whatever their theme', () => {
    assert.equal(isVisibleOnSite(front('a', { status: 'published', themes: ['authoritarian-drift'] })), true);
  });

  it('shows entries in review, except the themes that require a review', () => {
    assert.equal(isVisibleOnSite(front('a', { themes: ['cognitive-biases'] })), true);
    assert.equal(isVisibleOnSite(front('a', { themes: ['authoritarian-drift'] })), false);
    assert.equal(isVisibleOnSite(front('a', { themes: ['cognitive-biases', 'obscurantism-and-pseudoscience'] })), false);
  });

  it('never shows drafts', () => {
    assert.equal(isVisibleOnSite(front('a', { status: 'draft' })), false);
  });
});

describe('renderSite', () => {
  it('writes an index and one page per visible entry', () => {
    const pages = renderSite([entry('a'), entry('b', { status: 'draft' })], CONTEXT);
    assert.deepEqual([...pages.keys()], ['index.html', 'a.html']);
  });

  it('marks an entry in review with a notice', () => {
    const pages = renderSite([entry('a')], CONTEXT);
    assert.match(pages.get('a.html') ?? '', /Fiche en cours de relecture/);
  });

  it('does not link to a hidden entry', () => {
    const pages = renderSite([entry('a', { related: ['b'] }), entry('b', { themes: ['authoritarian-drift'] })], CONTEXT);
    assert.doesNotMatch(pages.get('a.html') ?? '', /b\.html/);
  });

  it('escapes raw HTML and drops unsafe links', () => {
    const pages = renderSite([entry('a', {}, '<script>alert(1)</script>\n\n[bad](javascript:alert(1)) [ok](https://example.org)')], CONTEXT);
    const html = pages.get('a.html') ?? '';
    assert.doesNotMatch(html, /<script>alert/);
    assert.doesNotMatch(html, /javascript:/);
    assert.match(html, /<a href="https:\/\/example\.org">ok<\/a>/);
  });

  it('links a reference through its DOI', () => {
    const pages = renderSite([entry('a', { references: [{ title: 'Un titre', author: 'A', year: 2000, doi: '10.1000/x' }] })], CONTEXT);
    assert.match(pages.get('a.html') ?? '', /https:\/\/doi\.org\/10\.1000\/x/);
  });
});
