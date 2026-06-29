import { useState, useMemo } from 'react';
import AddEventModal from '../AddEventModal.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Icon from '../ui/Icon.jsx';
import { useLang } from '../../contexts/LangContext.jsx';
import { dotColor } from '../../data/styles.js';
import { daysInMonth, firstDow, dayEvents, fmtLong, planEventsForDate, toLocalDateStr } from '../../utils/date.js';

export default function CalendarTab({ userEvents, setUserEvents, weekendPlan, todos = [] }) {
  const { t, lang } = useLang();
  const today = new Date();
  const [year,            setYear]            = useState(today.getFullYear());
  const [month,           setMonth]           = useState(today.getMonth());
  const [sel,             setSel]             = useState(null);
  const [showAdd,         setShowAdd]         = useState(false);
  const [editEvent,       setEditEvent]       = useState(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [gridOpen,        setGridOpen]        = useState(false);
  const [addDate,         setAddDate]         = useState(null);

  const dim  = daysInMonth(year, month);
  const fdow = firstDow(year, month);

  const prevMo = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMo = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const locale   = lang === 'de' ? 'de-DE' : 'en-US';
  const MO_LABELS = useMemo(() => [...Array(12)].map((_, i) =>
    new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' })
  ), [locale]);
  const DOW_LABELS = useMemo(() => [...Array(7)].map((_, i) =>
    new Date(2000, 0, 3 + i).toLocaleDateString(locale, { weekday: 'short' })
  ), [locale]);

  const getAllDayEvents = (y, m, d) => {
    const base    = dayEvents(y, m, d, userEvents);
    const dateStr = toLocalDateStr(new Date(y, m, d));
    const plan    = planEventsForDate(dateStr, weekendPlan, dateStr);
    const dueTodos = todos
      .filter(td => td.dueDate === dateStr)
      .map(td => ({
        id: td.id, name: td.text, emoji: td.completed ? '✅' : '☐',
        type: 'todo', source: 'todo', startDate: td.dueDate, owner: td.owner, completed: td.completed,
      }));
    return [...base, ...plan, ...dueTodos];
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

  const toggleGrid = () => setGridOpen(o => { if (o) setSel(null); return !o; });

  const upcoming = useMemo(() => {
    const list = [];
    for (let i = 0; i < 180; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const evs = getAllDayEvents(d.getFullYear(), d.getMonth(), d.getDate());
      if (evs.length > 0) list.push({ date: new Date(d), evs });
    }
    return list;
  }, [userEvents, weekendPlan, todos]);

  const upcomingDeduped = useMemo(() =>
    upcoming
      .map(({ date, evs }) => ({
        date,
        evs: evs.filter(ev => {
          if (ev.source === 'annual' || ev.source === 'plan' || ev.source === 'todo') return true;
          const startStr = ev.startDate || ev.date;
          const thisStr  = toLocalDateStr(date);
          if (startStr !== thisStr && ev.endDate && ev.endDate > ev.startDate) return false;
          return true;
        }),
      }))
      .filter(({ evs }) => evs.length > 0),
    [upcoming]
  );

  const upcomingFiltered = useMemo(() => {
    if (showAllUpcoming) return upcomingDeduped;
    return upcomingDeduped
      .map(({ date, evs }) => ({ date, evs: evs.filter(ev => ev.source === 'user' || ev.source === 'plan' || ev.source === 'todo') }))
      .filter(({ evs }) => evs.length > 0);
  }, [upcomingDeduped, showAllUpcoming]);

  const LEGEND = [
    { type: 'plan',     label: t('calendar.typeLabels.plan') },
    { type: 'personal', label: t('calendar.typeLabels.personal') },
    { type: 'festival', label: t('calendar.typeLabels.festival') },
    { type: 'holiday',  label: t('calendar.typeLabels.holiday') },
    { type: 'seasonal', label: t('calendar.typeLabels.seasonal') },
    { type: 'food',     label: t('calendar.typeLabels.food') },
    { type: 'culture',  label: t('calendar.typeLabels.culture') },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <div style={{ padding: '2px 2px 0' }}>
        <div className="font-brand" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{t('calendar.title')}</div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 2 }}>{t('calendar.subtitle')}</div>
      </div>

      {/* quick add event (any day) */}
      <button onClick={() => { setEditEvent(null); setSel(null); setAddDate(today); setShowAdd(true); }} className="press w-full flex items-center justify-center gap-[7px]" style={{ background: 'var(--primary)', border: 'none', borderRadius: 'var(--r-md)', padding: 13, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: 'var(--shadow-btn)' }}>
        <Icon name="plus" size={16} sw={2.4} />{t('calendar.addEvent')}
      </button>

      {/* upcoming agenda (primary surface) */}
      <div>
        <div className="flex items-center justify-between gap-2.5" style={{ margin: '0 2px 10px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)' }}>{t('calendar.upcoming')}</div>
          <SegmentedControl
            options={[{ value: false, label: t('calendar.myEvents') }, { value: true, label: t('calendar.all') }]}
            value={showAllUpcoming}
            onChange={setShowAllUpcoming}
            style={{ width: 160 }}
          />
        </div>

        {upcomingFiltered.length === 0 ? (
          <div className="text-center" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: '36px 12px', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t('calendar.noEvents')}</div>
            <div style={{ fontSize: 11.5, marginTop: 4 }}>{t('calendar.noEventsHint')}</div>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {upcomingFiltered.map(({ date, evs }) => {
              const isToday    = date.toDateString() === today.toDateString();
              const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
              const label      = isToday ? t('calendar.today') : isTomorrow ? t('calendar.tomorrow') :
                date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <div key={date.toISOString()} className="press flex gap-[11px]" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => { setGridOpen(true); setYear(date.getFullYear()); setMonth(date.getMonth()); setSel(date.getDate()); }}>
                  <div className="flex-none" style={{ width: 62, fontSize: 11.5, fontWeight: 700, paddingTop: 1, color: isToday ? 'var(--primary)' : 'var(--text-faint)' }}>{label}</div>
                  <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 6 }}>
                    {evs.map((ev, i) => {
                      const isMulti = ev.endDate && ev.endDate > (ev.startDate || ev.date);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-none" style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor(ev.type) }} />
                          <span className="flex-1 min-w-0 truncate" style={{ fontSize: 13, fontWeight: 600, color: ev.source === 'todo' && ev.completed ? 'var(--text-faint)' : 'var(--text)', textDecoration: ev.source === 'todo' && ev.completed ? 'line-through' : 'none' }}>{ev.e || ev.emoji} {ev.name}</span>
                          {isMulti && <span className="flex-none" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{t('calendar.until')} {new Date(ev.endDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>}
                          {ev.source === 'annual' && <span className="flex-none" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{t('calendar.annually')}</span>}
                          {ev.source === 'todo' && ev.owner && <span className="flex-none" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{ev.owner}</span>}
                          {ev.source === 'user' && (
                            <button onClick={e => { e.stopPropagation(); delEvent(ev.id); }} className="press flex-none flex items-center justify-center" style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}>
                              <Icon name="close" size={13} sw={2.2} />
                            </button>
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

      {/* month view toggle */}
      <button onClick={toggleGrid} className="press w-full flex items-center justify-center gap-[7px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12, cursor: 'pointer', color: 'var(--text-soft)', fontSize: 12.5, fontWeight: 700, boxShadow: 'var(--shadow-card)' }}>
        <Icon name="calendar" size={16} />
        {gridOpen ? t('calendar.hideMonth') : t('calendar.showMonth')}
      </button>

      {/* collapsible month grid + selected day */}
      {gridOpen && (
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div className="flex items-center justify-between" style={{ padding: '13px 14px 10px' }}>
              <button onClick={prevMo} className="press flex items-center justify-center flex-none" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--soft-ice)', color: 'var(--text-soft)', cursor: 'pointer' }}>
                <Icon name="chevronLeft" size={17} sw={2.2} />
              </button>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{MO_LABELS[month]} {year}</div>
              <button onClick={nextMo} className="press flex items-center justify-center flex-none" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--soft-ice)', color: 'var(--text-soft)', cursor: 'pointer' }}>
                <Icon name="chevronRight" size={17} sw={2.2} />
              </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(7,1fr)', padding: '0 6px' }}>
              {DOW_LABELS.map(d => (
                <div key={d} className="text-center" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-faint)', padding: '4px 0 6px' }}>{d}</div>
              ))}
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(7,1fr)', padding: '0 6px 10px' }}>
              {Array.from({ length: fdow }).map((_, i) => <div key={'e' + i} style={{ height: 44 }} />)}
              {Array.from({ length: dim }).map((_, i) => {
                const day     = i + 1;
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSel   = sel === day;
                const evs     = getAllDayEvents(year, month, day);
                const col     = (fdow + i) % 7;
                const isWknd  = col >= 5;
                const numBg   = isToday ? 'var(--primary)' : isSel ? 'var(--primary-soft)' : 'transparent';
                const numColor = isToday ? '#fff' : isSel ? 'var(--primary-deep)' : isWknd ? 'var(--coral-deep)' : 'var(--text)';
                return (
                  <div key={day} onClick={() => setSel(day === sel ? null : day)} className="flex flex-col items-center justify-center select-none" style={{ height: 44, gap: 2, cursor: 'pointer' }}>
                    <div className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: '50%', fontSize: 13, fontWeight: 700, background: numBg, color: numColor }}>{day}</div>
                    <div className="flex" style={{ gap: 2, height: 5 }}>
                      {evs.slice(0, 3).map((ev, j) => (
                        <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor(ev.type) }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selDate && (
            <div style={{ background: 'var(--primary-soft)', borderRadius: 'var(--r-lg)', padding: 14 }}>
              <div className="flex items-center justify-between gap-2">
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--primary-deep)' }}>{fmtLong(selDate, lang)}</div>
                <button onClick={() => setShowAdd(true)} className="press inline-flex items-center gap-[5px]" style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', background: 'var(--primary)', border: 'none', borderRadius: 'var(--r-pill)', padding: '7px 13px', cursor: 'pointer' }}>
                  <Icon name="plus" size={13} sw={2.4} /> {t('calendar.addShort')}
                </button>
              </div>
              {selEvs.length > 0 && (
                <div className="flex flex-col" style={{ gap: 7, marginTop: 11 }}>
                  {selEvs.map((ev, i) => (
                    <div key={i} className="flex items-center gap-[10px]" style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
                      <span className="flex-none" style={{ fontSize: 18 }}>{ev.e || ev.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.25, color: 'var(--text)', textDecoration: ev.source === 'todo' && ev.completed ? 'line-through' : 'none' }}>{ev.name}</div>
                        {ev.source === 'plan' && <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>{t('calendar.planItem')}</div>}
                        {ev.source === 'todo' && ev.owner && <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>{ev.owner}</div>}
                        {ev.notes && <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 1 }}>{ev.notes}</div>}
                      </div>
                      {ev.source === 'user' && (
                        <div className="flex items-center gap-1 flex-none">
                          <button onClick={() => { setEditEvent(ev); setShowAdd(true); }} className="press flex items-center justify-center" style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}>
                            <Icon name="edit" size={15} />
                          </button>
                          <button onClick={() => delEvent(ev.id)} className="press flex items-center justify-center" style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}>
                            <Icon name="close" size={15} sw={2.2} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddEventModal
          date={editEvent ? new Date((editEvent.startDate || editEvent.date) + 'T00:00:00') : (selDate || addDate || today)}
          onSave={addEvent}
          onClose={() => { setShowAdd(false); setEditEvent(null); setAddDate(null); }}
          initialEvent={editEvent}
        />
      )}

      {/* legend */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 9 }}>{t('calendar.legend')}</div>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          {LEGEND.map(({ type, label }) => (
            <div key={type} className="flex items-center gap-[6px]" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-soft)' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor(type) }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
