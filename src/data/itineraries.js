// ═══════════════════════════════════════════════════════════════
// ITINERARIES — curated 2–4 stop routes that chain existing
// activities (by id) into a half-day or short plan.
// Tapping "+Sa / +So" on an itinerary adds every stop to that day.
// ═══════════════════════════════════════════════════════════════
export const ITINERARIES = [

  // ── OBERHACHING / SOUTH (home-base half-days) ────────────────
  {
    id: 'itin_ober_short',
    name: 'Spielplatz + Kugler Alm',
    emoji: '🛝', area: 'south', duration: '2h',
    weather: ['sunny','cloudy'], season: ['spring','summer','fall'],
    stops: [
      { activityId: 'ml_spielplatz_rathaus_oberhaching', stay: '45min' },
      { activityId: 'ml_kugler_alm',                     stay: '1h' },
    ],
    desc: 'Kids burn energy at the Rathausplatz playground, then Radler + Brezn at Kugler Alm.',
  },
  {
    id: 'itin_deininger',
    name: 'Deininger Weiher Loop',
    emoji: '🦆', area: 'south', duration: '3h',
    weather: ['sunny','cloudy'], season: ['spring','summer','fall'],
    stops: [
      { activityId: 'ml_deininger_weiher', stay: '1.5h' },
      { activityId: 'ml_kugler_alm',       stay: '1h' },
    ],
    desc: 'Short drive to Deininger Weiher, loop the lake, back via Kugler Alm for cake.',
  },
  {
    id: 'itin_isar_grunwald',
    name: 'Isar am Wehr + Menterschwaige',
    emoji: '🏞️', area: 'south', duration: '4h',
    weather: ['sunny'], season: ['spring','summer','fall'],
    stops: [
      { activityId: 'ml_grunwalder_isar',   stay: '2h' },
      { activityId: 'ml_menterschwaige_bg', stay: '1.5h' },
    ],
    desc: 'Gravel-beach afternoon at the Grünwalder Wehr, walk up the Isarhang to Menterschwaige beer garden.',
  },
  {
    id: 'itin_schaeftlarn',
    name: 'Kloster Schäftlarn Walk',
    emoji: '⛪', area: 'south', duration: '4h',
    weather: ['sunny','cloudy'], season: ['spring','summer','fall'],
    stops: [
      { activityId: 'ml_klosterschaeftlarn_walk', stay: '2.5h' },
      { activityId: 'ml_klosterbraeu_schaeftlarn', stay: '1.5h' },
    ],
    desc: 'S7 to Hohenschäftlarn, downhill walk to the monastery, beer garden, gentle climb back.',
  },
  {
    id: 'itin_gruenwald_rainy',
    name: 'Grünwald Indoor Day',
    emoji: '☔', area: 'south', duration: '5h',
    weather: ['rainy','cloudy'], season: ['all'],
    stops: [
      { activityId: 'km_coco_loco',         stay: '2.5h' },
      { activityId: 'ml_forsthaus_woernbrunn', stay: '1.5h' },
    ],
    desc: 'Morning at Coco Loco jungle indoor playground, lunch at Forsthaus Wörnbrunn.',
  },
  {
    id: 'itin_perlacher',
    name: 'Perlacher Forst + Playground',
    emoji: '🌲', area: 'south', duration: '3h',
    weather: ['sunny','cloudy'], season: ['all'],
    stops: [
      { activityId: 'ml_perlacher_forst',                  stay: '2h' },
      { activityId: 'ml_spielplatz_rathaus_oberhaching',  stay: '45min' },
    ],
    desc: 'Long forest stroll through the Perlacher Forst, wind down at the village playground.',
  },

  // ── MUNICH CORE (half-day classics) ──────────────────────────
  {
    id: 'itin_marienplatz_classic',
    name: 'Marienplatz Classic',
    emoji: '🕰️', area: 'core', duration: '3h',
    weather: ['any'], season: ['all'],
    stops: [
      { activityId: 'km_marienplatz',      stay: '45min' },
      { activityId: 'km_alter_peter',      stay: '30min' },
      { activityId: 'km_spielzeugmuseum',  stay: '1h' },
      { activityId: 'viktual',             stay: '45min' },
    ],
    desc: 'Glockenspiel at 11:00, climb Alter Peter, old toys at the Spielzeugmuseum, Brezn at the Viktualienmarkt.',
  },
  {
    id: 'itin_englischer_garten',
    name: 'Englischer Garten Loop',
    emoji: '🌳', area: 'core', duration: '4h',
    weather: ['sunny','cloudy'], season: ['spring','summer','fall'],
    stops: [
      { activityId: 'km_eisbachwelle', stay: '20min' },
      { activityId: 'eng_garten',      stay: '1.5h' },
      { activityId: 'biergarten',      stay: '1.5h' },
      { activityId: 'km_seehaus',      stay: '45min' },
    ],
    desc: 'Surfers at the Eisbachwelle, stroll up to the Chinese Tower, finish with a rowing boat at the Seehaus.',
  },
  {
    id: 'itin_olympiapark',
    name: 'Olympiapark Half-Day',
    emoji: '🏟️', area: 'core', duration: '4h',
    weather: ['any'], season: ['all'],
    stops: [
      { activityId: 'olympia',           stay: '1.5h' },
      { activityId: 'km_parkeisenbahn',  stay: '30min' },
      { activityId: 'km_sea_life',       stay: '1.5h' },
    ],
    desc: 'Park walk, the Parkeisenbahn mini-train, then sharks and rays at Sea Life.',
  },
  {
    id: 'itin_nymphenburg_full',
    name: 'Nymphenburg + Dinosaurs',
    emoji: '🏰', area: 'core', duration: '4h',
    weather: ['any'], season: ['all'],
    stops: [
      { activityId: 'nymphenburg',    stay: '1.5h' },
      { activityId: 'km_mensch_natur', stay: '1.5h' },
      { activityId: 'km_marstall',    stay: '45min' },
    ],
    desc: 'Palace gardens, then the natural-history hall and royal carriages — all on one Nymphenburg ticket area.',
  },
  {
    id: 'itin_flaucher_summer',
    name: 'Isar BBQ Day (Flaucher)',
    emoji: '🔥', area: 'south', duration: '4h',
    weather: ['sunny'], season: ['summer'],
    stops: [
      { activityId: 'km_seidenspinner', stay: '1h' },
      { activityId: 'ml_flaucher',      stay: '3h' },
    ],
    desc: 'Playground warm-up at the Seidenspinner, then the full Flaucher BBQ / gravel-beach afternoon.',
  },
  {
    id: 'itin_rainy_core',
    name: 'Rainy Core Marathon',
    emoji: '☔', area: 'core', duration: '4h',
    weather: ['rainy','cloudy'], season: ['all'],
    stops: [
      { activityId: 'km_sea_life',         stay: '1.5h' },
      { activityId: 'deutsches_m',    stay: '2h' },
    ],
    desc: 'Two of Munich\'s most reliable rainy-day museums in one go — plan on extra time.',
  },
];
