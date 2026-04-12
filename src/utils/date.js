import { ANNUAL } from '../data/annual.js';

export function getWeekend() {
  const today = new Date();
  const day = today.getDay();
  // Sun(0)→ back 1 to show sat+sun of current weekend
  // Sat(6)→ stay today
  // Mon–Fri → forward to coming Saturday
  const daysToSat = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  return { sat, sun };
}

export function fmtLong(d) {
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function fmtShort(d) {
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
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
