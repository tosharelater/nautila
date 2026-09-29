export type Lang = 'fr' | 'en';

export const defaultLang: Lang = 'fr';

export const ui = {
  fr: {
    'meta.title': 'Nautila — Vos biens, parfaitement protégés',
    'meta.description':
      "Conciergerie premium de Casablanca à Rabat. Nautila protège vos biens et fait croître vos revenus, grâce à une machine opérationnelle pilotée par la technologie.",

    'nav.pillars': 'Piliers',
    'nav.metrics': 'Le standard',
    'nav.technology': 'Technologie',
    'nav.testimonials': 'Ton de voix',
    'nav.cta': 'Parler à Nautila',

    'hero.kicker': 'Confiance · Rendement · Technologie',
    'hero.title.a': 'La côte Atlantique,',
    'hero.title.b': 'gérée au millimètre',
    'hero.text':
      "Chaque appartement suit le même standard : check-in digital, ménage hôtelier, pricing dynamique. Nautila protège vos biens et fait croître vos revenus.",
    'hero.cta': 'Parler à Nautila',
    'hero.cta.secondary': 'Découvrir nos services',
    'hero.scroll': 'Faites défiler',
    'hero.stats.line': 'De Casablanca à Rabat, par Bouznika et Témara-Harhoura',

    'trust.title': 'Notre territoire : la côte atlantique marocaine',
    'trust.items': ['CASABLANCA', 'BOUZNIKA', 'RABAT', 'TÉMARA', 'HARHOURA', 'CASABLANCA', 'BOUZNIKA', 'RABAT'],

    'pillars.kicker': 'Le triangle de marque',
    'pillars.title': 'Un standard. Trois forces.',
    'pillars.hint': 'Continuez à défiler — le rail glisse latéralement',
    'pillars.01.title': 'Confiance',
    'pillars.01.text':
      "Calme, ordre, solidité. Le nautile bâtit une coquille pour protéger ce qu'elle abrite : notre métier est de protéger les biens que les propriétaires nous confient.",
    'pillars.01.points': ['Check-in digital', 'Ménage hôtelier', 'Rapport mensuel propriétaire'],
    'pillars.02.title': 'Rendement',
    'pillars.02.text':
      "Précision, chiffres soignés. Nous faisons croître vos revenus avec un pricing dynamique et un suivi chiffré de chaque logement.",
    'pillars.02.points': ['Pricing dynamique', 'Chiffres soignés, en MAD', 'Un rapport clair chaque mois'],
    'pillars.03.title': 'Technologie',
    'pillars.03.text':
      "Géométrie, modernité. Une machine opérationnelle pilotée par la technologie : la même spirale, répliquée à toutes les échelles.",
    'pillars.03.points': ['Serrure connectée', 'Un standard unique répliqué', 'De 60 à 100 biens'],

    'manifesto.kicker': 'Trois sens du nom',
    'manifesto.hint': 'Scrutez en scrollant',
    'manifesto.s1.label': '01 — Protection',
    'manifesto.s1.title': 'La coquille protège',
    'manifesto.s1.text': "Le nautile bâtit une coquille pour protéger ce qu'elle abrite. Notre métier : protéger les biens que les propriétaires nous confient.",
    'manifesto.s2.label': '02 — Standard',
    'manifesto.s2.title': 'La spirale se répète',
    'manifesto.s2.text': 'La même géométrie parfaite à toutes les échelles. Un standard unique, répliqué sur chaque logement, de 60 à 100 biens.',
    'manifesto.s3.label': '03 — Territoire',
    'manifesto.s3.title': "L'océan Atlantique",
    'manifesto.s3.text': 'Notre territoire : la côte atlantique marocaine, de Casablanca à Rabat, par Bouznika et Témara-Harhoura.',

    'metrics.kicker': 'Le standard Nautila',
    'metrics.title': 'Une machine simple à lire',
    'metrics.items': [
      { value: 4, prefix: '', suffix: '', label: 'zones de la côte atlantique : Casablanca, Bouznika, Rabat, Témara-Harhoura' },
      { value: 3, prefix: '', suffix: '', label: 'piliers : confiance, rendement, technologie' },
      { value: 60, prefix: '', suffix: ' – 100', label: 'biens par standard, répliqué à l’identique' },
      { value: 1, prefix: '', suffix: '', label: 'rapport mensuel par propriétaire' },
    ],

    'showcase.kicker': 'Sous le capot',
    'showcase.title': 'Une technologie qui se fait oublier',
    'showcase.text':
      "Check-in digital, pricing dynamique, rapport mensuel : la technologie fait tourner la machine, vous gardez la vue d'ensemble.",
    'showcase.panel.title': 'Aperçu — rapport mensuel · octobre 2026',
    'showcase.panel.revenue': 'Revenus du mois',
    'showcase.panel.revenue.value': '28 450 MAD',
    'showcase.panel.revenue.delta': '+12,4 %',
    'showcase.panel.trust': "Taux d'occupation",
    'showcase.panel.trust.value': '87 %',
    'showcase.panel.alert': 'Petite attention',
    'showcase.panel.alert.text': 'Mitigeur de la salle de bain remplacé hier (240 MAD, facture jointe).',
    'showcase.panel.series': 'Activité des 30 derniers jours',
    'showcase.panel.uptime': 'occupation',
    'showcase.panel.latency': 'nuits',

    'testimonials.kicker': 'Ton de voix',
    'testimonials.title': "L'ingénieur en costume de lin",
    'testimonials.items': [
      {
        quote: "Bonjour Karim, votre appartement d'Agdal est reloué : 6 nuits, arrivée vendredi 18 h. Check-in digital déjà envoyé au voyageur.",
        name: 'Précis',
        role: 'Des faits, des dates, des montants',
      },
      {
        quote: "Petite attention : le mitigeur de la salle de bain a été remplacé hier (240 MAD, facture jointe). Rien d'autre à signaler.",
        name: 'Calme',
        role: 'Phrases courtes, tout est sous contrôle',
      },
      {
        quote: "Welcome to your Nautila home, Sarah. Check-in takes under a minute, and the ocean is ten minutes away.",
        name: 'Chaleureux',
        role: 'Jamais familier',
      },
    ],

    'cta.title': 'Vos biens, parfaitement protégés',
    'cta.text':
      "Confiez-nous votre logement : même standard, de Casablanca à Rabat, et un rapport clair chaque mois.",
    'cta.button': 'Parler à Nautila',
    'cta.note': 'nautila.ma',

    'footer.tagline': 'Vos biens, parfaitement protégés.',
    'footer.rights': 'Tous droits réservés.',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.columns.product': 'Nautila',
    'footer.columns.company': 'Territoire',
    'footer.links.product': ['Confiance', 'Rendement', 'Technologie'],
    'footer.links.company': ['Casablanca', 'Bouznika', 'Rabat', 'Témara-Harhoura'],
  },

  en: {
    'meta.title': 'Nautila — Your home, perfectly kept',
    'meta.description':
      'Premium concierge service from Casablanca to Rabat. Nautila protects your property and grows your income through a technology-driven operating machine.',

    'nav.pillars': 'Pillars',
    'nav.metrics': 'The standard',
    'nav.technology': 'Technology',
    'nav.testimonials': 'Voice',
    'nav.cta': 'Talk to Nautila',

    'hero.kicker': 'Trust · Yield · Technology',
    'hero.title.a': 'The Atlantic coast,',
    'hero.title.b': 'managed to the millimetre',
    'hero.text':
      'Every home follows the same standard: digital check-in, hotel-grade cleaning, dynamic pricing. Nautila protects your property and grows your income.',
    'hero.cta': 'Talk to Nautila',
    'hero.cta.secondary': 'Explore our services',
    'hero.scroll': 'Scroll',
    'hero.stats.line': 'From Casablanca to Rabat, via Bouznika and Témara-Harhoura',

    'trust.title': 'Our territory: the Moroccan Atlantic coast',
    'trust.items': ['CASABLANCA', 'BOUZNIKA', 'RABAT', 'TÉMARA', 'HARHOURA', 'CASABLANCA', 'BOUZNIKA', 'RABAT'],

    'pillars.kicker': 'The brand triangle',
    'pillars.title': 'One standard. Three forces.',
    'pillars.hint': 'Keep scrolling — the rail slides sideways',
    'pillars.01.title': 'Trust',
    'pillars.01.text':
      'Calm, order, solidity. The nautilus builds a shell to protect what it shelters: our job is to protect the homes owners entrust to us.',
    'pillars.01.points': ['Digital check-in', 'Hotel-grade cleaning', 'Monthly owner report'],
    'pillars.02.title': 'Yield',
    'pillars.02.text':
      'Precision, carefully kept numbers. We grow your income with dynamic pricing and tracked figures for every home.',
    'pillars.02.points': ['Dynamic pricing', 'Careful figures, in MAD', 'A clear report every month'],
    'pillars.03.title': 'Technology',
    'pillars.03.text':
      'Geometry, modernity. A technology-driven operating machine: the same spiral, repeated at every scale.',
    'pillars.03.points': ['Connected lock', 'One standard, replicated', '60 to 100 homes'],

    'manifesto.kicker': 'Three meanings of the name',
    'manifesto.hint': 'Scroll to scrub the story',
    'manifesto.s1.label': '01 — Protection',
    'manifesto.s1.title': 'The shell protects',
    'manifesto.s1.text': 'The nautilus builds a shell to protect what it shelters. Our job: protect the homes owners entrust to us.',
    'manifesto.s2.label': '02 — Standard',
    'manifesto.s2.title': 'The spiral repeats',
    'manifesto.s2.text': 'The same perfect geometry at every scale. One standard, replicated across each home, from 60 to 100 properties.',
    'manifesto.s3.label': '03 — Territory',
    'manifesto.s3.title': 'The Atlantic Ocean',
    'manifesto.s3.text': 'Our territory: the Moroccan Atlantic coast, from Casablanca to Rabat, via Bouznika and Témara-Harhoura.',

    'metrics.kicker': 'The Nautila standard',
    'metrics.title': 'A machine that is easy to read',
    'metrics.items': [
      { value: 4, prefix: '', suffix: '', label: 'Atlantic coast areas: Casablanca, Bouznika, Rabat, Témara-Harhoura' },
      { value: 3, prefix: '', suffix: '', label: 'pillars: trust, yield, technology' },
      { value: 60, prefix: '', suffix: ' – 100', label: 'homes per standard, replicated identically' },
      { value: 1, prefix: '', suffix: '', label: 'monthly report per owner' },
    ],

    'showcase.kicker': 'Under the hood',
    'showcase.title': 'Technology that fades away',
    'showcase.text':
      'Digital check-in, dynamic pricing, monthly report: technology runs the machine while you keep the big picture.',
    'showcase.panel.title': 'Preview — monthly report · October 2026',
    'showcase.panel.revenue': 'Revenue this month',
    'showcase.panel.revenue.value': '28,450 MAD',
    'showcase.panel.revenue.delta': '+12.4%',
    'showcase.panel.trust': 'Occupancy rate',
    'showcase.panel.trust.value': '87%',
    'showcase.panel.alert': 'Small note',
    'showcase.panel.alert.text': 'Bathroom mixer tap replaced yesterday (240 MAD, invoice attached).',
    'showcase.panel.series': 'Activity over the last 30 days',
    'showcase.panel.uptime': 'occupancy',
    'showcase.panel.latency': 'nights',

    'testimonials.kicker': 'Tone of voice',
    'testimonials.title': 'The engineer in a linen suit',
    'testimonials.items': [
      {
        quote: 'Hello Karim, your Agdal apartment is booked again: 6 nights, arriving Friday at 6 pm. Digital check-in already sent to the guest.',
        name: 'Precise',
        role: 'Facts, dates, amounts',
      },
      {
        quote: 'Small note: the bathroom mixer tap was replaced yesterday (240 MAD, invoice attached). Nothing else to report.',
        name: 'Calm',
        role: 'Short sentences, everything under control',
      },
      {
        quote: 'Welcome to your Nautila home, Sarah. Check-in takes under a minute, and the ocean is ten minutes away.',
        name: 'Warm',
        role: 'Never familiar',
      },
    ],

    'cta.title': 'Your home, perfectly kept',
    'cta.text': 'Entrust us with your property: one standard from Casablanca to Rabat, and a clear report every month.',
    'cta.button': 'Talk to Nautila',
    'cta.note': 'nautila.ma',

    'footer.tagline': 'Your home, perfectly kept.',
    'footer.rights': 'All rights reserved.',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.columns.product': 'Nautila',
    'footer.columns.company': 'Territory',
    'footer.links.product': ['Trust', 'Yield', 'Technology'],
    'footer.links.company': ['Casablanca', 'Bouznika', 'Rabat', 'Témara-Harhoura'],
  },
} as const;

export type UIKey = keyof (typeof ui)['fr'];

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] as string;
}

/** Typed accessor that resolves arrays/objects too. */
export function tr<T = any>(lang: Lang, key: UIKey): T {
  return ui[lang][key] as unknown as T;
}

export function langPath(lang: Lang, path = ''): string {
  const base = lang === defaultLang ? '' : `/${lang}`;
  return `${base}${path}` || '/';
}
