import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EntryFrontMatter } from './entry.ts';
import { readLegalFacts } from './legal.ts';
import { isVisibleOnSite, readAnalytics, readDonation, renderSite, type SiteEntry } from './site.ts';

const CONTEXT = { version: '1.0.0', buildDate: '2026-11-05', repositoryUrl: 'https://example.org/repo', analytics: null, donationUrl: null, legal: readLegalFacts({}).values };

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

describe('donation button', () => {
  it('reads an https donation URL, none when unset, and rejects another scheme', () => {
    assert.deepEqual(readDonation({}), { ok: true, donationUrl: null });
    assert.deepEqual(readDonation({ PUBLIC_DONATION_URL: '' }), { ok: true, donationUrl: null });
    assert.deepEqual(readDonation({ PUBLIC_DONATION_URL: 'https://en.tipeee.com/antimanip/' }), {
      ok: true,
      donationUrl: 'https://en.tipeee.com/antimanip/'
    });
    assert.equal(readDonation({ PUBLIC_DONATION_URL: 'http://en.tipeee.com/antimanip/' }).ok, false);
  });

  it('shows the heart button in the header and the footer of every page only when configured', () => {
    const entries: SiteEntry[] = [{ front: front('a'), body: 'Texte.' }];
    for (const html of renderSite(entries, CONTEXT).values()) {
      assert.doesNotMatch(html, /support-link/);
    }
    const withDonation = renderSite(entries, { ...CONTEXT, donationUrl: 'https://en.tipeee.com/antimanip/' });
    for (const html of withDonation.values()) {
      assert.match(html, /<a class="support-link" href="https:\/\/en\.tipeee\.com\/antimanip\/" target="_blank" rel="noopener noreferrer"[^>]*data-umami-event-place="header"/);
      assert.match(html, /<a class="support-link support-link--small" href="https:\/\/en\.tipeee\.com\/antimanip\/"[^>]*data-umami-event-place="footer"/);
    }
  });
});

describe('readAnalytics', () => {
  it('disables the tracker when neither setting is given', () => {
    assert.deepEqual(readAnalytics({}), { ok: true, analytics: null });
    assert.deepEqual(readAnalytics({ PUBLIC_UMAMI_SRC: '', PUBLIC_UMAMI_WEBSITE_ID: '' }), { ok: true, analytics: null });
  });

  it('reads both settings', () => {
    assert.deepEqual(readAnalytics({ PUBLIC_UMAMI_SRC: 'https://stats.example.org/script.js', PUBLIC_UMAMI_WEBSITE_ID: 'id-1' }), {
      ok: true,
      analytics: { src: 'https://stats.example.org/script.js', websiteId: 'id-1' }
    });
  });

  it('rejects a half configuration and a non-https URL', () => {
    assert.equal(readAnalytics({ PUBLIC_UMAMI_SRC: 'https://stats.example.org/script.js' }).ok, false);
    assert.equal(readAnalytics({ PUBLIC_UMAMI_WEBSITE_ID: 'id-1' }).ok, false);
    assert.equal(readAnalytics({ PUBLIC_UMAMI_SRC: 'http://stats.example.org/script.js', PUBLIC_UMAMI_WEBSITE_ID: 'id-1' }).ok, false);
  });
});

describe('readLegalFacts', () => {
  it('keeps the configured values and marks the missing ones', () => {
    const facts = readLegalFacts({ LEGAL_PUBLISHER_NAME: ' Éditeur SAS ', LEGAL_HOST_NAME: '' });
    assert.equal(facts.values.LEGAL_PUBLISHER_NAME, 'Éditeur SAS');
    assert.equal(facts.values.LEGAL_HOST_NAME, '[NON CONFIGURÉ : LEGAL_HOST_NAME]');
    assert.equal(facts.missing.includes('LEGAL_HOST_NAME'), true);
    assert.equal(facts.missing.includes('LEGAL_PUBLISHER_NAME'), false);
  });
});

describe('legal notice page', () => {
  it('shows the facts, escaped, and the markers of the missing ones', () => {
    const legal = readLegalFacts({ LEGAL_PUBLISHER_NAME: 'A & B <SAS>' }).values;
    const html = renderSite([], { ...CONTEXT, legal }).get('mentions-legales.html') ?? '';
    assert.match(html, /A &amp; B &lt;SAS&gt;/);
    assert.match(html, /\[NON CONFIGURÉ : LEGAL_HOST_NAME\]/);
  });

  it('describes the audience measurement only when it is enabled', () => {
    assert.doesNotMatch(renderSite([], CONTEXT).get('mentions-legales.html') ?? '', /Umami/);
    const analytics = { src: 'https://stats.example.org/script.js', websiteId: 'id-1' };
    assert.match(renderSite([], { ...CONTEXT, analytics }).get('mentions-legales.html') ?? '', /mesurée avec Umami/);
  });

  it('is linked from the footer of every page', () => {
    for (const html of renderSite([entry('a')], CONTEXT).values()) {
      assert.match(html, /<a href="mentions-legales\.html">Mentions légales<\/a>/);
    }
  });
});

describe('renderSite', () => {
  it('adds the Umami script to every page when it is configured', () => {
    const analytics = { src: 'https://stats.example.org/script.js', websiteId: 'id-1' };
    const pages = renderSite([entry('a')], { ...CONTEXT, analytics });
    for (const html of pages.values()) {
      assert.match(html, /<script defer src="https:\/\/stats\.example\.org\/script\.js" data-website-id="id-1" data-do-not-track="true"><\/script>/);
    }
  });

  it('adds no tracker when it is not configured', () => {
    for (const html of renderSite([entry('a')], CONTEXT).values()) {
      assert.doesNotMatch(html, /data-website-id/);
    }
  });

  it('writes an index and one page per visible entry', () => {
    const pages = renderSite([entry('a'), entry('b', { status: 'draft' })], CONTEXT);
    assert.deepEqual([...pages.keys()], ['index.html', 'mentions-legales.html', 'a.html']);
  });

  it('filters the index with one chip per present type, all on at first', () => {
    const html = renderSite([entry('a'), entry('b', { type: 'fallacy' })], CONTEXT).get('index.html') ?? '';
    assert.match(html, /data-type-all aria-pressed="true"/);
    assert.equal((html.match(/data-type-chip aria-pressed="true"/g) ?? []).length, 2);
    assert.doesNotMatch(html, /data-type="concept" data-type-chip/);
    assert.doesNotMatch(html, /<select data-filter-type/);
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

  it('links every page to the discussions, and each entry to the discussions that mention it', () => {
    const pages = renderSite([entry('a')], CONTEXT);
    for (const html of pages.values()) {
      assert.match(html, /<a href="https:\/\/example\.org\/repo\/discussions">Discussions<\/a>/);
    }
    assert.match(pages.get('a.html') ?? '', /<a href="https:\/\/example\.org\/repo\/discussions\?discussions_q=a">Discuter de cette fiche<\/a>/);
  });

  it('links a reference through its DOI', () => {
    const pages = renderSite([entry('a', { references: [{ title: 'Un titre', author: 'A', year: 2000, doi: '10.1000/x' }] })], CONTEXT);
    assert.match(pages.get('a.html') ?? '', /https:\/\/doi\.org\/10\.1000\/x/);
  });
});
