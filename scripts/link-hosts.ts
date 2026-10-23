/**
 * Hosts an outbound link may point to (see CHARTER.md): stable, non-commercial sources. A host matches
 * itself and its subdomains. Adding a host takes a pull request that justifies it.
 */
export const ALLOWED_LINK_HOSTS: readonly string[] = [
  // Scholarly works and their registries.
  'doi.org',
  'openlibrary.org',
  'worldcat.org',
  'archive.org',
  'plato.stanford.edu',
  // Public domain texts and reference encyclopedias.
  'gutenberg.org',
  'wikisource.org',
  'wikipedia.org',
  // International institutions.
  'ohchr.org',
  'un.org',
  // Long-form journalism and research projects cited by title.
  'nybooks.com',
  'wired.com',
  'hiddentribes.us',
  'dangerousspeech.org'
];

export function isAllowedLink(value: string): boolean {
  let host: string;
  try {
    host = new URL(value).hostname.toLowerCase();
  } catch {
    return false;
  }
  return ALLOWED_LINK_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}
