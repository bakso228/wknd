import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Drop-in replacement for useLocalStorage that syncs to Supabase.
 * - Reads from localStorage instantly (no loading flash)
 * - Fetches authoritative value from Supabase on mount
 * - Writes to localStorage immediately + Supabase async
 * - Real-time subscription keeps all open tabs/devices in sync
 */
export function useSupabaseStorage(key, initialValue) {
  const lsKey = `wknd_sb_${key}`;

  const [value, setValue] = useState(() => {
    try {
      const cached = localStorage.getItem(lsKey);
      return cached ? JSON.parse(cached) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  // On mount: fetch from Supabase (authoritative source)
  useEffect(() => {
    supabase
      .from('family_data')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return;
        const remote = data.value;
        setValue(remote);
        try { localStorage.setItem(lsKey, JSON.stringify(remote)); } catch {}
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Real-time subscription — updates state when another device writes
  useEffect(() => {
    const channel = supabase
      .channel(`family_data:${key}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'family_data', filter: `key=eq.${key}` },
        (payload) => {
          const remote = payload.new.value;
          setValue(remote);
          try { localStorage.setItem(lsKey, JSON.stringify(remote)); } catch {}
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setStoredValue = (newValue) => {
    // Support functional updater pattern: setValue(prev => ...)
    const resolved = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;
    setValue(resolved);

    // Persist to localStorage immediately
    try { localStorage.setItem(lsKey, JSON.stringify(resolved)); } catch {}

    // Upsert to Supabase async (fire and forget)
    supabase
      .from('family_data')
      .upsert({ key, value: resolved, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn('Supabase sync error:', error.message);
      });
  };

  return [value, setStoredValue];
}
