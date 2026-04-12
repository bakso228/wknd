import { useState, useMemo } from 'react';
import AddEventModal from '../AddEventModal.jsx';
import { MO, DOW } from '../../data/annual.js';
import { TYPE_DOT, TYPE_PILL } from '../../data/styles.js';
import { daysInMonth, firstDow, dayEvents, fmtLong, fmtShort } from '../../utils/date.js';

export default function CalendarTab({ userEvents, setUserEvents }) {
  const today = new Date();
  const [year,    setYear]    = useState(today.getFullYear());
  const [month,   setMonth]   = useState(today.getMonth());
  const [sel,     setSel]     = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const dim  = daysInMonth(year, month);
  const fdow = firstDow(year, month);

  const prevMo = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMo = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const selDate = sel ? new Date(year, month, sel) : null;
  const selEvs  = sel ? dayEvents(year, month, sel, userEvents) : [];

  const addEvent = ev => {
    setUserEvents([...userEvents, ev]);
    setShowAdd(false);
    setSel(null);
  };
  const delEvent = id => setUserEvents(userEvents.filter(e => e.id !== id));

  // Upcoming: next 180 days
  const upcoming = useMemo(() => {
    const list = [];
    for (let i = 0; i < 180; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const evs = dayEvents(d.getFullYear(), d.getMonth(), d.getDate(), userEvents);
      if (evs.length > 0) list.push({ date: new Date(d), evs });
    }
    return list;
  }, [userEvents]);

  // Deduplicate multi-day events — show only on start date
  const upcomingDeduped = useMemo(() =>
    upcoming
      .map(({ date, evs }) => ({
        date,
        evs: evs.filter(ev => {
          if (ev.source === 'annual') return true;
          const startStr = ev.startDate || ev.date;
          const thisStr  = date.toISOString().split('T')[0];
          if (startStr !== thisStr && ev.endDate && ev.endDate > ev.startDate) return false;
          return true;
        }),
      }))
      .filter(({ evs }) => evs.length > 0),
    [upcoming]
  );

  return (
    <div className="fade-in space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Familienkalender</h2>
        <p className="text-xs text-stone-400 mt-0.5">Munich events + your family dates</p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {/* month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
          <button onClick={prevMo} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-xl font-bold">‹</button>
          <div className="font-bold text-stone-800">{MO[month]} {year}</div>
          <button onClick={nextMo} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-xl font-bold">›</button>
        </div>

        {/* day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-stone-50">
          {DOW.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-stone-300 py-2">{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: fdow }).map((_, i) => (
            <div key={'e' + i} className="min-h-[44px] border-r border-b border-stone-50" />
          ))}
          {Array.from({ length: dim }).map((_, i) => {
            const day     = i + 1;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSel   = sel === day;
            const evs     = dayEvents(year, month, day, userEvents);
            const col     = (fdow + i) % 7;
            return (
              <div
                key={day}
                onClick={() => setSel(day === sel ? null : day)}
                className={`min-h-[44px] p-1 border-b cursor-pointer transition-colors select-none ${col < 6 ? 'border-r' : ''} border-stone-50 ${
                  isSel    ? 'bg-amber-50' :
                  col >= 5 ? 'bg-orange-50/30 active:bg-amber-50/50' :
                             'active:bg-stone-50'
                }`}
              >
                <div className={`text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full mx-auto ${
                  isToday ? 'bg-amber-400 text-white' :
                  isSel   ? 'text-amber-600' :
                  col >= 5 ? 'text-orange-500' :
                             'text-stone-600'
                }`}>
                  {day}
                </div>
                <div className="flex justify-center flex-wrap gap-0.5 mt-0.5">
                  {evs.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[ev.type] || 'bg-stone-300'}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* selected day panel */}
      {selDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-stone-800 text-sm">{fmtLong(selDate)}</div>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-full min-h-[36px]"
            >
              + Termin
            </button>
          </div>
          {selEvs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {selEvs.map((ev, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${TYPE_PILL[ev.type] || 'bg-white border border-stone-200 text-stone-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{ev.e || ev.emoji}</span>
                    <div>
                      <div className="font-semibold">{ev.name}</div>
                      {ev.notes && <div className="text-xs opacity-60">{ev.notes}</div>}
                    </div>
                  </div>
                  {ev.source === 'user' && (
                    <button onClick={() => delEvent(ev.id)} className="opacity-40 hover:opacity-80 ml-2 text-sm w-8 h-8 flex items-center justify-center">✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd && selDate && (
        <AddEventModal date={selDate} onSave={addEvent} onClose={() => setShowAdd(false)} />
      )}

      {/* upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wide">Demnächst</div>
          {!selDate && (
            <button
              onClick={() => { setSel(today.getDate()); }}
              className="text-xs text-amber-600 font-semibold min-h-[36px] px-2"
            >
              + Termin hinzufügen
            </button>
          )}
        </div>

        {upcomingDeduped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-sm font-medium">Noch keine Termine</div>
            <div className="text-xs mt-1">Klick auf einen Tag im Kalender, um einen Termin hinzuzufügen.</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
            {upcomingDeduped.map(({ date, evs }) => {
              const isToday    = date.toDateString() === today.toDateString();
              const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
              const label      = isToday ? 'Heute' : isTomorrow ? 'Morgen' :
                date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <div
                  key={date.toISOString()}
                  className="flex gap-3 px-4 py-3 active:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => { setYear(date.getFullYear()); setMonth(date.getMonth()); setSel(date.getDate()); }}
                >
                  <div className={`flex-shrink-0 w-16 pt-0.5 text-xs font-bold ${isToday ? 'text-amber-500' : 'text-stone-400'}`}>
                    {label}
                  </div>
                  <div className="flex-1 space-y-1">
                    {evs.map((ev, i) => {
                      const isMulti = ev.endDate && ev.endDate > (ev.startDate || ev.date);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[ev.type] || 'bg-stone-300'}`} />
                          <span className="text-sm font-semibold text-stone-700">{ev.e || ev.emoji} {ev.name}</span>
                          {isMulti && (
                            <span className="text-[10px] text-violet-500 font-medium">
                              bis {new Date(ev.endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {ev.source === 'annual' && <span className="text-[10px] text-stone-300">jährlich</span>}
                          {ev.notes && <span className="text-xs text-stone-400 truncate">{ev.notes}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* legend */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Legende</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPE_DOT).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-stone-600">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
