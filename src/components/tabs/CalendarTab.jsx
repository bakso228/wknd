import { useState, useMemo } from 'react';
import AddEventModal from '../AddEventModal.jsx';
import { useLang } from '../../contexts/LangContext.jsx';
import { TYPE_DOT, TYPE_PILL } from '../../data/styles.js';
import { daysInMonth, firstDow, dayEvents, fmtLong, fmtShort, planEventsForDate, toLocalDateStr } from '../../utils/date.js';

export default function CalendarTab({ userEvents, setUserEvents, weekendPlan }) {
  const { t, lang } = useLang();
  const today = new Date();
  const [year,            setYear]            = useState(today.getFullYear());
  const [month,           setMonth]           = useState(today.getMonth());
  const [sel,             setSel]             = useState(null);
  const [showAdd,         setShowAdd]         = useState(false);
  const [editEvent,       setEditEvent]       = useState(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const dim  = daysInMonth(year, month);
  const fdow = firstDow(year, month);

  const prevMo = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMo = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Month/day labels via Intl
  const locale   = lang === 'de' ? 'de-DE' : 'en-US';
  const MO_LABELS = useMemo(() => [...Array(12)].map((_, i) =>
    new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' })
  ), [locale]);
  const DOW_LABELS = useMemo(() => [...Array(7)].map((_, i) =>
    new Date(2000, 0, 3 + i).toLocaleDateString(locale, { weekday: 'short' })
  ), [locale]);

  // All events for a given day (annual + user + plan)
  const getAllDayEvents = (y, m, d) => {
    const base    = dayEvents(y, m, d, userEvents);
    const dateStr = toLocalDateStr(new Date(y, m, d));
    const plan    = planEventsForDate(dateStr, weekendPlan, dateStr);
    return [...base, ...plan];
  };

  const selDate = sel ? new Date(year, month, sel) : null;
  const selEvs  = sel ? getAllDayEvents(year, month, sel) : [];

  const addEvent = ev => {
    if (editEvent) {
      setUserEvents(userEvents.map(e => e.id === ev.id ? ev : e));
      setEditEvent(null);
    } else {
      setUserEvents([...userEvents, ev]);
    }
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
      const evs = getAllDayEvents(d.getFullYear(), d.getMonth(), d.getDate());
      if (evs.length > 0) list.push({ date: new Date(d), evs });
    }
    return list;
  }, [userEvents, weekendPlan]);

  // Deduplicate multi-day events
  const upcomingDeduped = useMemo(() =>
    upcoming
      .map(({ date, evs }) => ({
        date,
        evs: evs.filter(ev => {
          if (ev.source === 'annual' || ev.source === 'plan') return true;
          const startStr = ev.startDate || ev.date;
          const thisStr  = toLocalDateStr(date);
          if (startStr !== thisStr && ev.endDate && ev.endDate > ev.startDate) return false;
          return true;
        }),
      }))
      .filter(({ evs }) => evs.length > 0),
    [upcoming]
  );

  // Default: only user + plan events; toggle to include annual
  const upcomingFiltered = useMemo(() => {
    if (showAllUpcoming) return upcomingDeduped;
    return upcomingDeduped
      .map(({ date, evs }) => ({ date, evs: evs.filter(ev => ev.source === 'user' || ev.source === 'plan') }))
      .filter(({ evs }) => evs.length > 0);
  }, [upcomingDeduped, showAllUpcoming]);

  return (
    <div className="fade-in space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-800">{t('calendar.title')}</h2>
        <p className="text-xs text-stone-400 mt-0.5">{t('calendar.subtitle')}</p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
          <button onClick={prevMo} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-xl font-bold">‹</button>
          <div className="font-bold text-stone-800">{MO_LABELS[month]} {year}</div>
          <button onClick={nextMo} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 text-xl font-bold">›</button>
        </div>

        <div className="grid grid-cols-7 border-b border-stone-50">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-stone-300 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: fdow }).map((_, i) => (
            <div key={'e' + i} className="min-h-[44px] border-r border-b border-stone-50" />
          ))}
          {Array.from({ length: dim }).map((_, i) => {
            const day     = i + 1;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSel   = sel === day;
            const evs     = getAllDayEvents(year, month, day);
            const col     = (fdow + i) % 7;
            return (
              <div key={day} onClick={() => setSel(day === sel ? null : day)}
                className={`min-h-[44px] p-1 border-b cursor-pointer transition-colors select-none ${col < 6 ? 'border-r' : ''} border-stone-50 ${isSel ? 'bg-amber-50' : col >= 5 ? 'bg-orange-50/30 active:bg-amber-50/50' : 'active:bg-stone-50'}`}>
                <div className={`text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full mx-auto ${isToday ? 'bg-amber-400 text-white' : isSel ? 'text-amber-600' : col >= 5 ? 'text-orange-500' : 'text-stone-600'}`}>
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

      {/* Selected day panel */}
      {selDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-stone-800 text-sm">{fmtLong(selDate, lang)}</div>
            <button onClick={() => setShowAdd(true)} className="bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-full min-h-[36px]">
              {t('calendar.addShort')}
            </button>
          </div>
          {selEvs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {selEvs.map((ev, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${TYPE_PILL[ev.type] || 'bg-white border border-stone-200 text-stone-700'}`}>
                  <div className="flex items-center gap-2">
                    <span>{ev.e || ev.emoji}</span>
                    <div>
                      <div className="font-semibold">{ev.name}</div>
                      {ev.source === 'plan'   && <div className="text-xs opacity-60">🗓 {t('calendar.planItem')}</div>}
                      {ev.notes               && <div className="text-xs opacity-60">{ev.notes}</div>}
                    </div>
                  </div>
                  {ev.source === 'user' && (
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => { setEditEvent(ev); setShowAdd(true); }} className="opacity-40 hover:opacity-80 text-xs w-8 h-8 flex items-center justify-center">✏️</button>
                      <button onClick={() => delEvent(ev.id)} className="opacity-40 hover:opacity-80 text-sm w-8 h-8 flex items-center justify-center">✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd && selDate && (
        <AddEventModal
          date={selDate}
          onSave={addEvent}
          onClose={() => { setShowAdd(false); setEditEvent(null); }}
          initialEvent={editEvent}
        />
      )}

      {/* Upcoming list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('calendar.upcoming')}</div>
            <button
              onClick={() => setShowAllUpcoming(v => !v)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors ${showAllUpcoming ? 'bg-stone-700 text-white border-stone-700' : 'bg-white text-stone-500 border-stone-200'}`}
            >
              {showAllUpcoming ? t('calendar.all') : t('calendar.myEvents')}
            </button>
          </div>
          {!selDate && (
            <button onClick={() => setSel(today.getDate())} className="text-xs text-amber-600 font-semibold min-h-[36px] px-2">
              {t('calendar.addEvent')}
            </button>
          )}
        </div>

        {upcomingFiltered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-sm font-medium">{t('calendar.noEvents')}</div>
            <div className="text-xs mt-1">{t('calendar.noEventsHint')}</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
            {upcomingFiltered.map(({ date, evs }) => {
              const isToday    = date.toDateString() === today.toDateString();
              const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
              const label      = isToday ? t('calendar.today') : isTomorrow ? t('calendar.tomorrow') :
                date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <div key={date.toISOString()} className="flex gap-3 px-4 py-3 active:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => { setYear(date.getFullYear()); setMonth(date.getMonth()); setSel(date.getDate()); }}>
                  <div className={`flex-shrink-0 w-16 pt-0.5 text-xs font-bold ${isToday ? 'text-amber-500' : 'text-stone-400'}`}>{label}</div>
                  <div className="flex-1 space-y-1">
                    {evs.map((ev, i) => {
                      const isMulti = ev.endDate && ev.endDate > (ev.startDate || ev.date);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_DOT[ev.type] || 'bg-stone-300'}`} />
                          <span className="text-sm font-semibold text-stone-700 flex-1">{ev.e || ev.emoji} {ev.name}</span>
                          {isMulti && <span className="text-[10px] text-violet-500 font-medium">{t('calendar.until')} {new Date(ev.endDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>}
                          {ev.source === 'annual' && <span className="text-[10px] text-stone-300">{t('calendar.annually')}</span>}
                          {ev.source === 'plan'   && <span className="text-[10px] text-amber-400 font-medium">🗓</span>}
                          {ev.notes && <span className="text-xs text-stone-400 truncate">{ev.notes}</span>}
                          {ev.source === 'user' && (
                            <button onClick={e => { e.stopPropagation(); delEvent(ev.id); }}
                              className="flex-shrink-0 text-stone-300 hover:text-red-400 active:text-red-500 w-6 h-6 flex items-center justify-center transition-colors">✕</button>
                          )}
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

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4">
        <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">{t('calendar.legend')}</div>
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
