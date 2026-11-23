/**
 * A fejléc és a lábléc horgonyai. Csak létező szekcióra mutat link (nincs halott horgony).
 * A szekciók a mérföldkövekkel együtt kapcsolnak be (W2: munkák, W3: szolgáltatás, folyamat).
 */
import { approvedWorks } from './portfolio.ts';

export const SECTIONS = {
  works: true, // W2
  services: true, // W3
  process: true, // W3
} as const;

export interface Anchor {
  id: string;
  label: string;
}

export const hasWorks = SECTIONS.works && approvedWorks.length > 0;

export const navAnchors: Anchor[] = [
  ...(hasWorks ? [{ id: 'munkak', label: 'Munkák' }] : []),
  ...(SECTIONS.services ? [{ id: 'szolgaltatas', label: 'Szolgáltatás' }] : []),
  ...(SECTIONS.process ? [{ id: 'folyamat', label: 'Folyamat' }] : []),
];

export const CONTACT_ID = 'kapcsolat';

/** A főoldalon „#id”, aloldalon „/#id”. */
export const anchorHref = (id: string, onHome: boolean) => (onHome ? `#${id}` : `/#${id}`);
