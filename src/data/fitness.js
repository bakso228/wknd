// ============================================================
// Fitness tab — people, colors, seed data and metric config.
// Persisted via useSupabaseStorage under keys 'workouts' and 'body'
// (generic family_data table — no schema migration needed).
// ============================================================

export const PEOPLE = ['Navid', 'Diandra'];

// Person colors are consistent across the whole Fitness tab.
export const PERSON = {
  Navid:   { color: 'var(--primary)', deep: 'var(--primary-deep)', soft: 'var(--primary-soft)' },
  Diandra: { color: 'var(--coral)',   deep: 'var(--coral-deep)',   soft: 'var(--coral-soft)' },
};

// Workout log — dates each person worked out (ISO YYYY-MM-DD).
export const SEED_WORKOUTS = {
  Navid:   ['2026-06-02', '2026-06-04', '2026-06-06', '2026-06-09', '2026-06-11', '2026-06-13', '2026-06-16', '2026-06-18', '2026-06-20'],
  Diandra: ['2026-06-01', '2026-06-03', '2026-06-05', '2026-06-08', '2026-06-10', '2026-06-15', '2026-06-17', '2026-06-19'],
};

// Body measurements — { d (date), w (weight kg), bmi, fat %, mus % muscle, kal (RM Kal), vis (visceral) }.
// Navid's series is transcribed from the user's reference spreadsheet.
export const SEED_BODY = {
  Navid: [
    { d: '2023-07-03', w: 76.6, bmi: 26,   fat: 25.8, mus: 35.9, kal: 1713, vis: 9 },
    { d: '2023-07-31', w: 74.3, bmi: 25.3, fat: 22.9, mus: 37.7, kal: 1687, vis: 8 },
    { d: '2023-11-05', w: 71.9, bmi: 24.4, fat: 22.6, mus: 37.7, kal: 1650, vis: 8 },
    { d: '2024-02-01', w: 73.3, bmi: 24.9, fat: 23.1, mus: 37.5, kal: 1671, vis: 8 },
    { d: '2024-03-01', w: 70.7, bmi: 24,   fat: 19.8, mus: 39.4, kal: 1642, vis: 7 },
    { d: '2024-04-21', w: 71.7, bmi: 24.2, fat: 20,   mus: 39.3, kal: 1647, vis: 7 },
    { d: '2024-07-15', w: 73,   bmi: 24.7, fat: 21.5, mus: 38,   kal: 1665, vis: 8 },
    { d: '2024-10-10', w: 74,   bmi: 25,   fat: 22,   mus: 37.8, kal: 1672, vis: 8 },
    { d: '2025-01-15', w: 74.5, bmi: 25.2, fat: 23,   mus: 37.5, kal: 1680, vis: 8 },
    { d: '2025-06-20', w: 75.6, bmi: 25.6, fat: 24,   mus: 37,   kal: 1695, vis: 9 },
    { d: '2025-11-10', w: 74,   bmi: 25,   fat: 24.2, mus: 36.7, kal: 1685, vis: 8 },
    { d: '2026-03-15', w: 76,   bmi: 25.8, fat: 24.3, mus: 36.8, kal: 1705, vis: 9 },
    { d: '2026-06-10', w: 76.2, bmi: 26,   fat: 24.4, mus: 36.9, kal: 1709, vis: 9 },
  ],
  Diandra: [
    { d: '2023-07-05', w: 60.5, bmi: 22,   fat: 28,   mus: 33,   kal: 1320, vis: 5 },
    { d: '2023-12-01', w: 59,   bmi: 21.4, fat: 27,   mus: 33.5, kal: 1305, vis: 4 },
    { d: '2024-03-01', w: 58.2, bmi: 21.1, fat: 26.5, mus: 33.8, kal: 1298, vis: 4 },
    { d: '2024-06-15', w: 58.5, bmi: 21.2, fat: 26.2, mus: 34,   kal: 1300, vis: 4 },
    { d: '2024-10-01', w: 59,   bmi: 21.4, fat: 26.8, mus: 33.6, kal: 1306, vis: 4 },
    { d: '2025-02-10', w: 59.5, bmi: 21.6, fat: 27,   mus: 33.4, kal: 1310, vis: 5 },
    { d: '2025-07-01', w: 58.8, bmi: 21.3, fat: 26.4, mus: 33.9, kal: 1302, vis: 4 },
    { d: '2025-12-15', w: 59.2, bmi: 21.5, fat: 26.6, mus: 33.7, kal: 1308, vis: 5 },
    { d: '2026-03-20', w: 58.6, bmi: 21.2, fat: 26,   mus: 34.1, kal: 1299, vis: 4 },
    { d: '2026-06-12', w: 58.9, bmi: 21.4, fat: 26.3, mus: 33.9, kal: 1303, vis: 4 },
  ],
};

// Metric model: key, chart/dot color, which direction is "good", unit, and
// whether it appears in the trend chart (RM Kal is tiles/history only).
// `labelKey` maps to translations.fitness.metrics.*
export const BODY_METRICS = [
  { key: 'w',   labelKey: 'weight',   color: '#3B82F6', better: 'none', unit: 'kg', chart: true  },
  { key: 'bmi', labelKey: 'bmi',      color: '#EF4444', better: 'down', unit: '',   chart: true  },
  { key: 'fat', labelKey: 'fat',      color: '#F5B301', better: 'down', unit: '%',  chart: true  },
  { key: 'mus', labelKey: 'muscle',   color: '#22A559', better: 'up',   unit: '%',  chart: true  },
  { key: 'vis', labelKey: 'visceral', color: '#F97316', better: 'down', unit: '',   chart: true  },
  { key: 'kal', labelKey: 'kal',      color: 'var(--text-faint)', better: 'none', unit: '', chart: false },
];
