import { useState } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';
import { fmtShort, toLocalDateStr } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';
import { catGrad } from '../../data/styles.js';
import { PEOPLE, PERSON } from '../../data/fitness.js';
import Icon from '../ui/Icon.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

export default function PlanTab({ weather, weekendPlan, setWeekendPlan, userEvents, setUserEvents, todos, setTodos, pickups, setPickups, onGoExplorer, showToast }) {
  const { t, lang } = useLang();
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const de = lang === 'de';

  const [qMode,      setQMode]      = useState('todo');   // 'todo' | 'event'
  const [qText,      setQText]      = useState('');

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateStr(today);
  const dow = today.getDay();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };

  const [qDate, setQDate] = useState(todayStr);   // event quick-add date (any day)

  const wxForStr = str => weather?.days?.find(w => w.dateStr === str) ?? null;

  // ---- this week's Monday → next week's Sunday (14-day window) ----
  const monday0 = addDays(today, -((dow + 6) % 7));
  const rangeDays = Array.from({ length: 14 }, (_, i) => addDays(monday0, i));
  const rangeEnd = rangeDays[rangeDays.length - 1];

  // nearest upcoming weekend, used only for the weather verdict line
  const sat0 = addDays(today, dow === 6 ? 0 : dow === 0 ? -1 : 6 - dow);
  const sun0 = addDays(today, dow === 0 ? 0 : (7 - dow) % 7);
  const wxSat = wxForStr(toLocalDateStr(sat0));
  const wxSun = wxForStr(toLocalDateStr(sun0));

  const heroSub = `${fmtShort(monday0, lang)} – ${fmtShort(rangeEnd, lang)}`;

  // ---- weather verdict ----
  const verdict = (() => {
    const codes = [wxSat?.code, wxSun?.code].filter(c => c != null).map(c => wxInfo(c).cat);
    if (!codes.length) return '';
    const good = codes.every(c => c === 'sunny');
    const rain = codes.every(c => c === 'rainy');
    const anyRain = codes.includes('rainy');
    if (good) return t('plan.verdictSunny');
    if (rain) return t('plan.verdictRainy');
    if (anyRain) return t('plan.verdictMixed');
    return t('plan.verdictCloudy');
  })();

  // ---- mutations ----
  const removeFromDay = (dateStr, key) =>
    setWeekendPlan(p => ({ ...p, [dateStr]: (p[dateStr] || []).filter(a => a._key !== key) }));

  const quickAdd = () => {
    const txt = qText.trim();
    if (!txt) return;
    if (qMode === 'todo') {
      const id = Date.now().toString();
      setTodos(prev => [{ id, text: txt, owner: '', dueDate: '', completed: false, createdAt: new Date().toISOString() }, ...prev]);
      setQText('');
      showToast(t('toast.taskAdded'), () => setTodos(prev => prev.filter(td => td.id !== id)));
    } else {
      const ds = qDate;
      const id = Date.now().toString();
      const ev = { id, startDate: ds, date: ds, endDate: ds, name: txt, emoji: '📌', type: 'personal', notes: '' };
      setUserEvents(prev => [...prev, ev]);
      setQText('');
      showToast(t('toast.eventAdded'), () => setUserEvents(prev => prev.filter(e => e.id !== id)));
    }
  };

  const calEventsForDay = dateStr => (userEvents || []).filter(e => {
    const start = e.startDate || e.date;
    const end   = e.endDate   || start;
    return dateStr >= start && dateStr <= end;
  });

  // ---- kids pickup: this week Mon–Fri + next week Mon–Fri (fixed, not rolling) ----
  const businessDays = [];
  for (let d = new Date(monday0); businessDays.length < 10; d = addDays(d, 1)) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) businessDays.push(new Date(d));
  }
  const cyclePickup = ds => setPickups(prev => {
    const cur = prev[ds];
    const next = cur === undefined ? 'Navid' : cur === 'Navid' ? 'Diandra' : null;
    const copy = { ...prev };
    if (next === null) delete copy[ds]; else copy[ds] = next;
    return copy;
  });

  function WeatherPill({ wx }) {
    if (!wx) return null;
    return (
      <div className="flex items-center gap-[5px] flex-none" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', background: 'var(--soft-ice)', padding: '5px 9px', borderRadius: 'var(--r-pill)' }}>
        <span>{wxInfo(wx.code).emoji}</span><span>{wx.maxT}°</span>
      </div>
    );
  }

  function DayCard({ date, dateStr, wx }) {
    const items  = weekendPlan[dateStr] || [];
    const calEvs = calEventsForDay(dateStr);
    const isToday = dateStr === todayStr;
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', border: isToday ? '1px solid var(--primary)' : '1px solid transparent' }}>
        <div className="flex items-center justify-between" style={{ padding: '14px 16px 10px' }}>
          <div className="flex items-center gap-[9px] min-w-0">
            <div className="flex-none rounded-full" style={{ width: 7, height: 7, background: 'var(--primary)' }} />
            <div className="min-w-0">
              <div className="flex items-center gap-[7px]">
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{date.toLocaleDateString(locale, { weekday: 'long' })}</span>
                {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-deep)', background: 'var(--primary-soft)', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>{t('plan.today')}</span>}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 1 }}>{date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}</div>
            </div>
          </div>
          <WeatherPill wx={wx} />
        </div>
        <div className="flex flex-col gap-2" style={{ padding: '0 14px 14px' }}>
          {items.map(act => {
            const isSourced = act.eventType === 'sourced';
            return (
              <div key={act._key} className="flex items-center gap-[11px]" style={{ background: 'var(--soft-ice)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
                <div className="flex-none flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, fontSize: 20, background: catGrad(act.cat) }}>{act.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, color: 'var(--text)' }}>{act.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: isSourced ? 'var(--coral-deep)' : 'var(--text-faint)' }}>
                    {isSourced ? act.dateShort : (act.duration ? `⏱ ${act.duration}` : '')}
                  </div>
                </div>
                <button onClick={() => removeFromDay(dateStr, act._key)} className="press flex-none flex items-center justify-center rounded-full" style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }} aria-label="remove">
                  <Icon name="close" size={15} sw={2.2} />
                </button>
              </div>
            );
          })}
          {calEvs.map((ev, i) => (
            <div key={'cal_' + i} className="flex items-center gap-[11px]" style={{ background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
              <div className="flex-none flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, fontSize: 19, background: 'var(--surface)' }}>{ev.emoji || '📅'}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, color: 'var(--primary-deep)' }}>{ev.name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: 'var(--primary)' }}>{de ? 'Termin' : 'Event'}</div>
              </div>
            </div>
          ))}
          <button onClick={onGoExplorer} className="press w-full" style={{ border: '1.5px dashed var(--primary)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: 11, cursor: 'pointer', color: 'var(--primary-deep)', fontSize: 12.5, fontWeight: 700 }}>
            {t('plan.addMore')}
          </button>
        </div>
      </div>
    );
  }

  const days = rangeDays
    .map(date => { const dateStr = toLocalDateStr(date); return { date, dateStr, wx: wxForStr(dateStr) }; })
    .filter(d => (weekendPlan[d.dateStr] || []).length > 0 || calEventsForDay(d.dateStr).length > 0);

  const weekendPlanned = days.reduce((n, d) => n + (weekendPlan[d.dateStr] || []).length, 0);

  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {/* quick capture */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', marginBottom: 10 }}>{t('plan.quickCapture')}</div>
        <div style={{ marginBottom: 9 }}>
          <SegmentedControl
            options={[{ value: 'todo', label: t('plan.modeTodo') }, { value: 'event', label: t('plan.modeEvent') }]}
            value={qMode}
            onChange={setQMode}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={qText}
            onChange={e => setQText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && quickAdd()}
            placeholder={qMode === 'todo' ? t('todos.placeholder') : t('plan.eventPlaceholder')}
            className="flex-1 min-w-0"
            style={{ border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '12px 13px', fontSize: 16, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
          />
          <button onClick={quickAdd} className="press flex-none flex items-center justify-center" style={{ width: 48, borderRadius: 'var(--r-md)', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>
            <Icon name="plus" size={20} sw={2.4} />
          </button>
        </div>
        {qMode === 'event' && (
          <div className="flex items-center gap-[9px]" style={{ marginTop: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginRight: 2 }}>{t('plan.eventDate')}</span>
            <input
              type="date"
              value={qDate}
              onChange={e => setQDate(e.target.value || todayStr)}
              style={{ border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '8px 11px', fontSize: 14, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {/* kids pickup calendar */}
      <div style={{ marginTop: 16, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
        <div className="flex items-center justify-between gap-2" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)' }}>{t('plan.pickupTitle')}</div>
          <div className="flex items-center" style={{ gap: 12 }}>
            {PEOPLE.map(p => (
              <div key={p} className="flex items-center gap-[5px]" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PERSON[p].color }} />{p}
              </div>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {businessDays.map(d => {
            const ds = toLocalDateStr(d);
            const who = pickups[ds];
            const isToday = ds === todayStr;
            const color = who ? PERSON[who].color : null;
            return (
              <div key={ds} className="flex flex-col items-center" style={{ gap: 4 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-faint)' }}>
                  {d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text)' }}>{d.getDate()}</div>
                <button
                  onClick={() => cyclePickup(ds)}
                  className="press flex items-center justify-center"
                  aria-label={`pickup ${ds}`}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', padding: 0, cursor: 'pointer',
                    fontSize: 12, fontWeight: 800,
                    border: `1.5px solid ${who ? color : 'var(--border-strong)'}`,
                    background: who ? color : 'transparent',
                    color: who ? '#fff' : 'var(--text-faint)',
                  }}
                >
                  {who ? who[0] : ''}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 12 }}>{t('plan.pickupHint')}</div>
      </div>

      {/* upcoming title */}
      <div className="flex items-baseline justify-between gap-2" style={{ marginTop: 20, padding: '0 2px' }}>
        <div className="min-w-0">
          <div className="font-brand" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{t('plan.upcomingTitle')}</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 1 }}>{heroSub}</div>
        </div>
        {weekendPlanned > 0 && (
          <span className="flex-none" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-deep)', background: 'var(--primary-soft)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
            {weekendPlanned} {weekendPlanned === 1 ? t('plan.activity') : t('plan.activities')}
          </span>
        )}
      </div>

      {/* weather verdict */}
      {verdict && (
        <div className="flex items-center gap-[10px]" style={{ marginTop: 12, background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-card)', padding: '11px 13px' }}>
          <div className="flex-1 min-w-0" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{verdict}</div>
          <div className="flex items-center gap-[9px] flex-none whitespace-nowrap" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-soft)' }}>
            {wxSat && <span>{wxInfo(wxSat.code).emoji} {t('common.sat')} {wxSat.maxT}°</span>}
            {wxSun && <span>{wxInfo(wxSun.code).emoji} {t('common.sun')} {wxSun.maxT}°</span>}
          </div>
        </div>
      )}

      {/* day cards */}
      {days.length > 0 && (
        <div className="flex flex-col" style={{ gap: 12, marginTop: 16 }}>
          {days.map(d => <DayCard key={d.dateStr} {...d} />)}
        </div>
      )}

      {/* empty weekend */}
      {days.length === 0 && (
        <div className="text-center" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: '26px 18px', marginTop: 16 }}>
          <div className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 14, margin: '0 auto 12px', background: 'var(--primary-soft)', color: 'var(--primary-deep)' }}>
            <Icon name="house" size={24} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{t('plan.emptyTitle')}</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 3 }}>{t('plan.emptyBody')}</div>
        </div>
      )}
    </div>
  );
}
