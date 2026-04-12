import { useState, useEffect } from 'react';
import { toLocalDateStr } from '../utils/date.js';

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.0262&longitude=11.5709' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode' +
      '&timezone=Europe%2FBerlin&forecast_days=16'
    )
      .then(r => r.json())
      .then(data => {
        const times = data.daily.time;

        // Build 14-day array starting from today (covers 2 full weekends)
        const days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dStr = toLocalDateStr(d);
          const idx  = times.indexOf(dStr);
          if (idx < 0) return null;
          return {
            date:   d,
            dateStr: dStr,
            code:   data.daily.weathercode[idx],
            maxT:   Math.round(data.daily.temperature_2m_max[idx]),
            minT:   Math.round(data.daily.temperature_2m_min[idx]),
            precip: data.daily.precipitation_sum[idx],
          };
        }).filter(Boolean);

        if (days.length > 0) {
          // sat/sun always found within a 7-day window — backward compat for Header/Explorer
          const sat = days.find(d => d.date.getDay() === 6) || null;
          const sun = days.find(d => d.date.getDay() === 0) || null;
          setWeather({ days, sat, sun });
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return { weather, loading, error };
}
