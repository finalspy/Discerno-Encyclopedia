/**
 * Facts of the legal notice of the website, read from the build environment (repository variables of the Pages
 * workflow), never written in the code: a change of publisher or host is a variable change. An unset value is not an
 * error: the page shows a visible marker in its place and the build lists the missing names, so that a deployment
 * never hides an incomplete notice.
 */
export const LEGAL_VARIABLES = [
  'LEGAL_CONTACT_EMAIL',
  'LEGAL_PUBLISHER_NAME',
  'LEGAL_PUBLISHER_FORM',
  'LEGAL_PUBLISHER_CAPITAL',
  'LEGAL_PUBLISHER_REGISTRATION',
  'LEGAL_PUBLISHER_VAT',
  'LEGAL_PUBLISHER_ADDRESS',
  'LEGAL_PUBLICATION_DIRECTOR',
  'LEGAL_HOST_NAME',
  'LEGAL_HOST_ADDRESS',
  'LEGAL_HOST_PHONE'
] as const;

export type LegalVariable = (typeof LEGAL_VARIABLES)[number];

export interface LegalFacts {
  /** Each value, or the marker shown in its place when it is not configured. */
  values: Record<LegalVariable, string>;
  missing: LegalVariable[];
}

export function notConfigured(name: LegalVariable): string {
  return `[NON CONFIGURÉ : ${name}]`;
}

export function readLegalFacts(source: Readonly<Record<string, string | undefined>>): LegalFacts {
  const values = {} as Record<LegalVariable, string>;
  const missing: LegalVariable[] = [];
  for (const name of LEGAL_VARIABLES) {
    const value = source[name]?.trim();
    if (value === undefined || value === '') {
      missing.push(name);
      values[name] = notConfigured(name);
    } else {
      values[name] = value;
    }
  }
  return { values, missing };
}
