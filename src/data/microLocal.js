// ═══════════════════════════════════════════════════════════════
// MICRO-LOCAL ACTIVITIES — Oberhaching & south-of-Munich corridor
// Focus: walks, playgrounds, small cafes, quick indoor spots
// within ~15 km of Oberhaching (48.024, 11.596).
//
// Schema (extends BASE_ACTIVITIES):
//   area:  'south' — Oberhaching & surroundings (Pullach, Grünwald,
//                    Deisenhofen, Taufkirchen, Unterhaching, Sauerlach,
//                    Solln, Harlaching, Thalkirchen)
//   depth: 'micro' (≤45min) | 'short' (1–2h) | 'half' (3–5h)
//
// Entries with `// verify:` need the user to double-check address /
// opening hours / URL before relying on the suggestion.
// ═══════════════════════════════════════════════════════════════
export const MICRO_LOCAL = [

  // ── WALKS / OUTDOORS ─────────────────────────────────────────
  {
    id: 'ml_deininger_weiher', cat: 'outdoor', location: 'day-trip', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🦆', name: 'Deininger Weiher',
    desc: 'Small moor lake a short drive south of Oberhaching. Flat loop walk (~45 min), reeds and ducks, perfect for toddlers on balance bikes.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Great with toddlers',
    url: 'https://www.sauerlach.de/', tags: ['free', 'nature', 'kids', 'quick'],
    lat: 47.9836, lng: 11.6453,
  },
  {
    id: 'ml_perlacher_forst', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🌲', name: 'Perlacher Forst',
    desc: 'Vast, flat forest between Perlach and Oberhaching. Stroller-friendly gravel paths, rarely crowded, mushrooms in autumn.',
    weather: ['cloudy', 'sunny'], season: ['all'], duration: '1–3h', age: 'Any age',
    url: 'https://www.baysf.de/', tags: ['free', 'nature', 'stroller'],
    lat: 48.0600, lng: 11.6330,
  },
  {
    id: 'ml_hachinger_bach', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🏞️', name: 'Hachinger Bach Weg',
    desc: 'Hyperlocal stream walk connecting Taufkirchen – Unterhaching – Oberhaching – Deisenhofen. Bits of meadow, bridges kids love, kingfishers if you are lucky.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Great with kids',
    url: 'https://www.oberhaching.de/', tags: ['free', 'nature', 'quick', 'local'],
    lat: 48.0258, lng: 11.6080,
  },
  {
    id: 'ml_grunwalder_isar', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🏞️', name: 'Isarauen am Grünwalder Wehr',
    desc: 'Broad gravel beach and shaded Isar path below the Grünwald bridge. Swimming spots in summer, driftwood forts, BBQ tolerated.',
    weather: ['sunny'], season: ['spring', 'summer', 'fall'], duration: '2–3h', age: 'Great with kids',
    url: 'https://www.gruenwald.de/', tags: ['free', 'nature', 'swimming', 'local'],
    lat: 48.0414, lng: 11.5447,
  },
  {
    id: 'ml_forstenrieder_park', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'half',
    emoji: '🦌', name: 'Forstenrieder Park',
    desc: 'Huge wildlife reserve southwest of Munich. Spot red deer in the Hirschgehege, endless flat forest tracks, cycling-friendly.',
    weather: ['cloudy', 'sunny'], season: ['all'], duration: '2–4h', age: 'Any age',
    url: 'https://www.baysf.de/de/erlebnis/ausflugsziele/forstenrieder-park.html', // verify: URL may have changed
    tags: ['free', 'nature', 'wildlife', 'cycling'],
    lat: 48.0650, lng: 11.4700,
  },
  {
    id: 'ml_klosterschaeftlarn_walk', cat: 'outdoor', location: 'day-trip', eventType: 'venue',
    area: 'south', depth: 'half',
    emoji: '⛪', name: 'Kloster Schäftlarn Walk',
    desc: 'S7 to Hohenschäftlarn, walk down through the woods to the Benedictine monastery — brewery, ice cream, baroque church. Gentle climb on the way back.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '3–4h', age: 'Good for all ages',
    url: 'https://www.kloster-schaeftlarn.de/', tags: ['nature', 'culture', 'food', 'train'],
    lat: 47.9614, lng: 11.4639,
  },
  {
    id: 'ml_menterschwaige_walk', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🌳', name: 'Menterschwaige Isarhang',
    desc: 'Short wooded trail along the Isar high bank between Harlaching and Grünwald — ends at the Menterschwaige beer garden with a large playground.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Playground on site',
    url: 'https://www.menterschwaige.de/', tags: ['free', 'nature', 'food', 'playground'],
    lat: 48.0905, lng: 11.5612,
  },
  {
    id: 'ml_flaucher', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'half',
    emoji: '🔥', name: 'Flaucher — Isar BBQ',
    desc: 'South-Munich Isar beach strip just below the zoo. Sanctioned BBQ areas, shallow gravel banks for kids, summertime favourite.',
    weather: ['sunny'], season: ['summer'], duration: '3–4h', age: 'Great with kids',
    url: 'https://www.muenchen.de/sehenswuerdigkeiten/parks-und-seen/isar', tags: ['free', 'nature', 'summer', 'bbq'],
    lat: 48.1033, lng: 11.5520,
  },

  // ── PLAYGROUNDS / QUICK OUTDOOR ──────────────────────────────
  {
    id: 'ml_spielplatz_rathaus_oberhaching', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'micro',
    emoji: '🛝', name: 'Spielplatz am Rathausplatz Oberhaching', // verify: exact name
    desc: 'Central village playground right by the Rathaus. Bakery and ice cream steps away — classic quick "let the kids run 30 minutes" stop.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '30–60min', age: 'Toddlers to 8',
    url: 'https://www.oberhaching.de/', tags: ['free', 'quick', 'local', 'playground'],
    lat: 48.0239, lng: 11.5961,
  },
  {
    id: 'ml_spielplatz_grunwald', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'micro',
    emoji: '🛝', name: 'Spielplatz Grünwald Bavariafilmplatz', // verify: exact name
    desc: 'Well-equipped Grünwald playground near the Bavariafilmplatz bus stop. Good slide, climbing frame, bench cover if it rains briefly.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '30–60min', age: 'Toddlers to 10',
    url: 'https://www.gruenwald.de/', tags: ['free', 'quick', 'local', 'playground'],
    lat: 48.0430, lng: 11.5480,
  },
  {
    id: 'ml_hirschgarten_playground', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'core', depth: 'short',
    emoji: '🦌', name: 'Hirschgarten Spielplatz + Rotwild',
    desc: 'Large fenced playground adjacent to the biggest beer garden in the world. Watch live red deer in the enclosure, then a pretzel.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Toddlers to 10',
    url: 'https://www.hirschgarten.com/', tags: ['free', 'kids', 'food', 'playground'],
    lat: 48.1472, lng: 11.5111,
  },
  {
    id: 'ml_petuelpark', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'core', depth: 'short',
    emoji: '🌉', name: 'Petuelpark Playground',
    desc: 'Linear park over the Petueltunnel. Imaginative water playground in summer, skate ramps, gentle bike loop.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Toddlers to teens',
    url: 'https://www.muenchen.de/sehenswuerdigkeiten/parks-und-seen/petuelpark', tags: ['free', 'kids', 'playground', 'water'],
    lat: 48.1799, lng: 11.5727,
  },
  {
    id: 'ml_westpark', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'core', depth: 'short',
    emoji: '🏯', name: 'Westpark',
    desc: 'Underrated west-Munich park. Thai Sala, Japanese garden, rose garden, several playgrounds, open-air cinema in summer.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–3h', age: 'Great with kids',
    url: 'https://www.muenchen.de/sehenswuerdigkeiten/parks-und-seen/westpark', tags: ['free', 'kids', 'culture', 'playground'],
    lat: 48.1244, lng: 11.5141,
  },

  // ── CAFES / FAMILY FOOD (SOUTH) ──────────────────────────────
  {
    id: 'ml_kugler_alm', cat: 'food', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🍻', name: 'Kugler Alm (Oberhaching)',
    desc: 'Legendary Oberhaching beer garden — where the Radler was supposedly invented. Huge playground, shaded chestnuts, perfect "walked from home" destination.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Playground on site',
    url: 'https://www.kugler-alm.de/', tags: ['food', 'local', 'family', 'playground'],
    lat: 48.0184, lng: 11.5876,
  },
  {
    id: 'ml_menterschwaige_bg', cat: 'food', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🍺', name: 'Menterschwaige Biergarten',
    desc: 'Long-established Harlaching beer garden with a big sandy playground, pony riding on some weekends, weekly live music.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Playground on site',
    url: 'https://www.menterschwaige.de/', tags: ['food', 'local', 'family', 'playground'],
    lat: 48.0905, lng: 11.5612,
  },
  {
    id: 'ml_forsthaus_woernbrunn', cat: 'food', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🦌', name: 'Forsthaus Wörnbrunn', // verify: exact hours & URL
    desc: 'Rustic forest inn in the Grünwalder Forst. Good Bavarian kitchen, pony in the paddock, nice excuse to combine a short forest walk.',
    weather: ['any'], season: ['all'], duration: '1–2h', age: 'Family welcome',
    url: 'https://www.forsthaus-woernbrunn.de/', tags: ['food', 'local', 'family', 'nature'],
    lat: 48.0322, lng: 11.5661,
  },
  {
    id: 'ml_klosterbraeu_schaeftlarn', cat: 'food', location: 'day-trip', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🍺', name: 'Klosterbräustüberl Schäftlarn',
    desc: 'Shaded beer garden at the Benedictine monastery with house beer, very simple kids menu, swings and a lawn.',
    weather: ['sunny', 'cloudy'], season: ['spring', 'summer', 'fall'], duration: '1–2h', age: 'Family welcome',
    url: 'https://www.klosterbraeustueberl-schaeftlarn.de/', // verify
    tags: ['food', 'local', 'family'],
    lat: 47.9614, lng: 11.4639,
  },

  // ── INDOOR / RAINY-DAY (SOUTH) ───────────────────────────────
  {
    id: 'ml_bavaria_filmstadt', cat: 'indoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'half',
    emoji: '🎬', name: 'Bavaria Filmstadt (Grünwald)',
    desc: 'Studio tour with original sets (Das Boot, Unendliche Geschichte), 4D cinema, stunt show. Great rainy-day half-day.',
    weather: ['any'], season: ['all'], duration: '3–4h', age: 'Ages 5+',
    url: 'https://www.filmstadt.de/', tags: ['kids', 'culture', 'paid', 'indoor'],
    lat: 48.0820, lng: 11.5750,
  },
  {
    id: 'ml_burg_gruenwald', cat: 'indoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🏰', name: 'Burg Grünwald Museum',
    desc: 'Small castle-museum on Roman and medieval Bavaria with a climbable tower and lovely Isar-valley view. Rainy-day 1.5 h.',
    weather: ['any'], season: ['all'], duration: '1–2h', age: 'Ages 5+',
    url: 'https://www.archaeologie-bayern.de/museen/burg-gruenwald/', // verify
    tags: ['culture', 'indoor', 'quick'],
    lat: 48.0389, lng: 11.5475,
  },
  {
    id: 'ml_boulderwelt_sued', cat: 'indoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'short',
    emoji: '🧗', name: 'Boulderwelt München Süd',
    desc: 'Huge bouldering gym in Sendling with a dedicated kids area, family hours, and a café. No belaying needed — great entry climbing.',
    weather: ['any'], season: ['all'], duration: '1–2h', age: 'From age 4',
    url: 'https://www.boulderwelt-muenchen-sued.de/', tags: ['active', 'kids', 'indoor'],
    lat: 48.1097, lng: 11.5372,
  },
  {
    id: 'ml_maria_einsiedel', cat: 'outdoor', location: 'munich', eventType: 'venue',
    area: 'south', depth: 'half',
    emoji: '🏊', name: 'Naturbad Maria Einsiedel',
    desc: 'Natural outdoor pool fed by the Isar in Thalkirchen — cold, clear, shaded lawns, separate toddler pool. Open May–September.',
    weather: ['sunny'], season: ['summer'], duration: '2–4h', age: 'Kids love it',
    url: 'https://www.swm.de/baeder/freibaeder/maria-einsiedel', tags: ['swimming', 'summer', 'kids'],
    lat: 48.0975, lng: 11.5378,
  },
];
