export function getSeason(m) {
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

export function wxInfo(code) {
  if (code === 0)  return { emoji: '☀️',  label: 'Sonnig',         cat: 'sunny'  };
  if (code <= 2)   return { emoji: '🌤️',  label: 'Leicht bewölkt', cat: 'sunny'  };
  if (code === 3)  return { emoji: '☁️',  label: 'Bewölkt',        cat: 'cloudy' };
  if (code <= 48)  return { emoji: '🌫️',  label: 'Neblig',         cat: 'cloudy' };
  if (code <= 57)  return { emoji: '🌦️',  label: 'Nieselregen',    cat: 'rainy'  };
  if (code <= 67)  return { emoji: '🌧️',  label: 'Regen',          cat: 'rainy'  };
  if (code <= 77)  return { emoji: '❄️',  label: 'Schnee',         cat: 'rainy'  };
  if (code <= 82)  return { emoji: '🌦️',  label: 'Schauer',        cat: 'rainy'  };
  return                   { emoji: '⛈️',  label: 'Gewitter',       cat: 'rainy'  };
}

export function scoreActivity(act, wxCat, season) {
  if (act.cat === 'sticky') return 999;
  if (act.eventType === 'sourced') return 100;

  let s = 5;
  const wMatch = act.weather.includes('any') || act.weather.includes(wxCat);
  const sMatch = act.season.includes('all')  || act.season.includes(season);
  if (wMatch) s += 3; else s -= 3;
  if (sMatch) s += 3; else s -= 2;

  const m = new Date().getMonth() + 1;
  const d = new Date().getDate();
  if (act.special === 'oktoberfest'   && ((m === 9 && d >= 13) || (m === 10 && d <= 4)))          s += 5;
  if (act.special === 'christmas'     && ((m === 11 && d >= 25) || (m === 12 && d <= 24)))         s += 5;
  if (act.special === 'frühlingsfest' && ((m === 4 && d >= 17) || (m === 5 && d <= 10)))           s += 5;
  if (act.special === 'fasching'      && (m === 1 || m === 2 || (m === 3 && d < 10)))              s += 4;
  if (act.special === 'stadtfest'     && (m === 6 && d >= 18 && d <= 23))                          s += 4;
  if (act.special === 'dult'          && ((m === 7 && d >= 16) || (m === 8 && d <= 5) || (m === 10 && d >= 18 && d <= 28))) s += 3;

  return s;
}
