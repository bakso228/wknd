// ═══════════════════════════════════════════════════════════════
// THIS WEEKEND'S SOURCED EVENTS  (refreshed: Apr 11–12 2026)
// These are sourced via web search from Munich event sites.
// Ask Claude to "refresh weekend events" each Friday to update.
// eventType:'sourced'  location:'munich'|'day-trip'
// ═══════════════════════════════════════════════════════════════
export const SOURCED_EVENTS = [
  {
    id: 'src_rotkäppchen', cat: 'theater', location: 'munich', eventType: 'sourced',
    emoji: '🐺', name: 'Rotkäppchen',
    desc: 'Little Red Riding Hood puppet show at the Marionettentheater Bille — a magical afternoon for the little ones.',
    dateLabel: 'So 12. Apr · 15:00', dateShort: 'Today Sun 15:00',
    highlights: 'So 12. April at 15:00 · Book in advance, sells out! · Marionettentheater Bille',
    venue: 'Marionettentheater Bille', weather: ['any'], season: ['spring'], duration: '~1h', age: 'Ages 3+',
    url: 'https://www.muenchenticket.de/tickets/familie/', tags: ['theater', 'kids'],
    source: 'München Ticket',
  },
  {
    id: 'src_werkstatt', cat: 'indoor', location: 'munich', eventType: 'sourced',
    emoji: '🎨', name: 'Familien-Werkstatt Kunterbunt',
    desc: 'Easter crafts workshop for families at the Dschungelpalast — building, painting, creating. Free entry, small materials fee.',
    dateLabel: 'So 12. Apr · 14–18 Uhr', dateShort: 'Today 14:00–18:00',
    highlights: 'So 12. April · 14:00–18:00 · Free entry · Materials ~€10 · Ages 3+',
    venue: 'Dschungelpalast, Hansastraße 41', weather: ['any'], season: ['spring'], duration: '~2h', age: 'Ages 3+',
    url: 'https://muenchenmitkind.de/veranstaltungskalender/', tags: ['workshop', 'kids', 'free', 'easter'],
    source: 'muenchenmitkind.de',
  },
  {
    id: 'src_circus', cat: 'outdoor', location: 'day-trip', eventType: 'sourced',
    emoji: '🎪', name: 'Remo Maskottchencircus',
    desc: 'Circus with giant troll mascots performing in München-Haar — last day today! Fun for young children.',
    dateLabel: 'Sa–So 11.–12. Apr (letzter Tag!)', dateShort: 'Last day today!',
    highlights: 'Last day today (So 12. April) · Festwiese München-Haar · All ages',
    venue: 'Festwiese München-Haar', weather: ['any'], season: ['spring'], duration: '~1.5h', age: 'Great for young kids',
    url: 'https://muenchenmitkind.de/veranstaltungskalender/', tags: ['circus', 'kids', 'family'],
    source: 'muenchenmitkind.de',
  },
  {
    id: 'src_bmwopen', cat: 'outdoor', location: 'munich', eventType: 'sourced',
    emoji: '🎾', name: 'BMW Open Tennis (spectator)',
    desc: 'Top-ranked ATP tennis tournament at MTTC Iphitos — running all week. Great Sunday outing for tennis fans.',
    dateLabel: 'Apr 11–19 (week 1)', dateShort: 'Sat & Sun',
    highlights: 'MTTC Iphitos, Aumeisterweg · Qualifier & early rounds this weekend',
    venue: 'MTTC Iphitos, München', weather: ['sunny', 'cloudy'], season: ['spring'], duration: '3–4h', age: 'Good for older kids',
    url: 'https://www.bmw-open.com/', tags: ['sport', 'spectator'],
    source: 'muenchen.de',
  },
  {
    id: 'src_kindaling_easter', cat: 'indoor', location: 'munich', eventType: 'sourced',
    emoji: '🐣', name: 'Osterferienprogramm München',
    desc: "Easter holiday programme across Munich's museums and cultural spaces — special kids activities running all school holidays.",
    dateLabel: 'Easter holidays (Apr 6–26)', dateShort: 'This weekend ✓',
    highlights: 'Various venues across Munich · Check kindaling.de for your nearest spot',
    venue: 'Various München venues', weather: ['any'], season: ['spring'], duration: '1–3h', age: 'Ages 4+',
    url: 'https://www.kindaling.de/veranstaltungen/muenchen', tags: ['easter', 'kids', 'holiday'],
    source: 'kindaling.de',
  },
  {
    id: 'src_museum_sonntag', cat: 'indoor', location: 'munich', eventType: 'sourced',
    emoji: '🏛️', name: 'Museum Familienführungen',
    desc: 'Munich museums offer free or reduced family guided tours every second and fourth Sunday. Today (Apr 12) is the second Sunday — check your favourite museum.',
    dateLabel: '2. & 4. Sonntag im Monat', dateShort: 'Today qualifies ✓',
    highlights: 'Deutsches Museum · Stadtmuseum · Museum Mensch und Natur · Many free on Sundays',
    venue: 'Various München museums', weather: ['any'], season: ['all'], duration: '1–2h', age: 'All ages',
    url: 'https://www.muenchen.de/veranstaltungen/event/kinder', tags: ['museum', 'family', 'free'],
    source: 'muenchen.de',
  },
];
