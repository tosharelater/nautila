import type { Lang } from './ui';

export type PageKey = 'home' | 'services' | 'owners' | 'homes' | 'about' | 'contact';

const SLUGS: Record<PageKey, Record<Lang, string>> = {
  home: { fr: '', en: 'en/' },
  services: { fr: 'services/', en: 'en/services/' },
  owners: { fr: 'proprietaires/', en: 'en/owners/' },
  homes: { fr: 'biens/', en: 'en/homes/' },
  about: { fr: 'a-propos/', en: 'en/about/' },
  contact: { fr: 'contact/', en: 'en/contact/' },
};

export const LABELS: Record<PageKey, Record<Lang, string>> = {
  home: { fr: 'Accueil', en: 'Home' },
  services: { fr: 'Services', en: 'Services' },
  owners: { fr: 'Propriétaires', en: 'Owners' },
  homes: { fr: 'Nos biens', en: 'Our homes' },
  about: { fr: 'À propos', en: 'About' },
  contact: { fr: 'Contact', en: 'Contact' },
};

const base = () => import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const href = (lang: Lang, page: PageKey, hash = '') => `${base()}${SLUGS[page][lang]}${hash}`;

export const NAV_PAGES: PageKey[] = ['services', 'owners', 'homes', 'about'];
