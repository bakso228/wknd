import { ANNUAL } from '../data/annual.js';

// Returns "YYYY-MM-DD" in local time (avoids UTC-shift from toISOString)
export function toLocalDateStr(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getWeekend() {
  const today = new Date();
  const day = today.getDay();
  // On Sunday show the current weekend (sat = yesterday), not next week
  const daysToSat = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return { sat, sun };
}

export function fmtLong(d, lang = 'de') {
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function fmtShort(d, lang = 'de') {
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    day: 'numeric', month: 'short',
  });
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export function firstDow(y, m) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

export function dayEvents(y, m, d, uEv) {
  const annual = ANNUAL
    .filter(e => e.m === m + 1 && e.d === d)
    .map(e => ({ ...e, source: 'annual' }));

  const check = new Date(y, m, d);
  check.setHours(12, 0, 0, 0);

  const personal = uEv
    .filter(e => {
      const start = new Date(e.startDate || e.date);
      start.setHours(0, 0, 0, 0);
      const end = e.endDate ? new Date(e.endDate) : new Date(start);
      end.setHours(23, 59, 59, 0);
      return check >= start && check <= end;
    })
    .map(e => ({ ...e, source: 'user' }));

  return [...annual, ...personal];
}

// Returns an array of {sat, sun, satStr, sunStr, key, index} for the next n weekends
export function getUpcomingWeekends(n = 5) {
  const { sat } = getWeekend();
  return Array.from({ length: n }, (_, i) => {
    const s = new Date(sat); s.setDate(sat.getDate() + i * 7);
    const u = new Date(s);   u.setDate(s.getDate() + 1);
    return { sat: s, sun: u, satStr: toLocalDateStr(s), sunStr: toLocalDateStr(u), key: `wknd_${i}`, index: i };
  });
}

// Synthesise plan items for a specific date from weekendPlan
export function planEventsForDate(dateStr, weekendPlan, dayKey) {
  return (weekendPlan[dayKey] || []).map(act => ({
    id:        'plan_' + act._key,
    name:      act.name,
    emoji:     act.emoji,
    type:      'plan',
    source:    'plan',
    date:      dateStr,
    startDate: dateStr,
    endDate:   dateStr,
    _actKey:   act._key,
  }));
}
