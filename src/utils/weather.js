import { distanceFromHome } from './distance.js';

export function getSeason(m) {
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

// Returns { emoji, cat, labelKey } — labelKey maps to translations.wx.*
export function wxInfo(code) {
  if (code === 0)  return { emoji: '☀️',  cat: 'sunny',  labelKey: 'clear'        };
  if (code <= 2)   return { emoji: '🌤️',  cat: 'sunny',  labelKey: 'partlyCloudy' };
  if (code === 3)  return { emoji: '☁️',  cat: 'cloudy', labelKey: 'cloudy'       };
  if (code <= 48)  return { emoji: '🌫️',  cat: 'cloudy', labelKey: 'foggy'        };
  if (code <= 57)  return { emoji: '🌦️',  cat: 'rainy',  labelKey: 'drizzle'      };
  if (code <= 67)  return { emoji: '🌧️',  cat: 'rainy',  labelKey: 'rain'         };
  if (code <= 77)  return { emoji: '❄️',  cat: 'rainy',  labelKey: 'snow'         };
  if (code <= 82)  return { emoji: '🌦️',  cat: 'rainy',  labelKey: 'showers'      };
  return                   { emoji: '⛈️',  cat: 'rainy',  labelKey: 'storm'        };
}

// Area/location proximity score relative to Oberhaching.
function areaBonus(act) {
  if (act.area === 'south')  return 4;
  if (act.area === 'core')   return 2;
  if (act.area === 'region') return 0;
  if (act.area === 'trip')   return -2;
  // Fallback: use lat/lng if present
  const d = distanceFromHome(act);
  if (d == null) return 0;
  if (d.km < 8)  return 4;
  if (d.km < 20) return 2;
  if (d.km < 40) return 0;
  return -2;
}

export function scoreActivity(act, wxCat, season) {
  if (act.cat === 'sticky') return 999;

  let s = 5;
  // Sourced events get a strong recency bonus (weekend-specific),
  // but still compete on weather/season/area.
  if (act.eventType === 'sourced') s += 20;

  const wMatch = act.weather.includes('any') || act.weather.includes(wxCat);
  const sMatch = act.season.includes('all')  || act.season.includes(season);
  if (wMatch) s += 3; else s -= 3;
  if (sMatch) s += 3; else s -= 2;

  // Proximity to Oberhaching.
  s += areaBonus(act);

  // Short/micro activities surface more when weather is poor.
  if ((act.depth === 'micro' || act.depth === 'short') && wxCat === 'rainy') s += 2;

  const m = new Date().getMonth() + 1;
  const d = new Date().getDate();
  if (act.special === 'oktoberfest'   && ((m === 9 && d >= 13) || (m === 10 && d <= 4)))          s += 5;
  if (act.special === 'christmas'     && m === 12)                                                   s += 5;
  if (act.special === 'frühlingsfest' && ((m === 4 && d >= 17) || (m === 5 && d <= 10)))           s += 5;
  if (act.special === 'fasching'      && (m === 1 || m === 2 || (m === 3 && d < 10)))              s += 4;
  if (act.special === 'stadtfest'     && (m === 6 && d >= 18 && d <= 23))                          s += 4;
  if (act.special === 'dult'          && ((m === 7 && d >= 16) || (m === 8 && d <= 5) || (m === 10 && d >= 18 && d <= 28))) s += 3;

  return s;
}
