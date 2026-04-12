import { useState, useEffect } from 'react';
import { getWeekend } from '../utils/date.js';

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const { sat, sun } = getWeekend();
    fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.0262&longitude=11.5709' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode' +
      '&timezone=Europe%2FBerlin&forecast_days=16'
    )
      .then(r => r.json())
      .then(data => {
        const times = data.daily.time;
        const si = times.indexOf(sat.toISOString().split('T')[0]);
        const su = times.indexOf(sun.toISOString().split('T')[0]);
        if (si >= 0 && su >= 0) {
          setWeather({
            sat: {
              date:   sat,
              code:   data.daily.weathercode[si],
              maxT:   Math.round(data.daily.temperature_2m_max[si]),
              minT:   Math.round(data.daily.temperature_2m_min[si]),
              precip: data.daily.precipitation_sum[si],
            },
            sun: {
              date:   sun,
              code:   data.daily.weathercode[su],
              maxT:   Math.round(data.daily.temperature_2m_max[su]),
              minT:   Math.round(data.daily.temperature_2m_min[su]),
              precip: data.daily.precipitation_sum[su],
            },
          });
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return { weather, loading, error };
}
