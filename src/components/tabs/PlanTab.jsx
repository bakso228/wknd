import { useState } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';
import { fmtShort, toLocalDateStr } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';
import { catGrad } from '../../data/styles.js';
import { BASE_ACTIVITIES } from '../../data/activities.js';
import { MICRO_LOCAL } from '../../data/microLocal.js';
import { KIDS_MUNICH } from '../../data/kidsMunich.js';
import Icon from '../ui/Icon.jsx';
import Chip from '../ui/Chip.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

const PICK_POOL = [...BASE_ACTIVITIES, ...MICRO_LOCAL, ...KIDS_MUNICH];

export default function PlanTab({ weather, weekendPlan, setWeekendPlan, userEvents, setUserEvents, todos, setTodos, onGoExplorer, showToast }) {
  const { t, lang } = useLang();
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const de = lang === 'de';

  const [weekendSel, setWeekendSel] = useState('this');
  const [qMode,      setQMode]      = useState('todo');   // 'todo' | 'event'
  const [qText,      setQText]      = useState('');
  const [qDay,       setQDay]       = useState('sat');     // 'sat' | 'sun'

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateStr(today);
  const dow = today.getDay();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };

  const sat0 = addDays(today, dow === 6 ? 0 : dow === 0 ? -1 : 6 - dow);
  const sun0 = addDays(today, dow === 0 ? 0 : (7 - dow) % 7);
  const base = weekendSel === 'next' ? 7 : 0;
  const selSat = addDays(sat0, base);
  const selSun = addDays(sun0, base);
  const selSatStr = toLocalDateStr(selSat);
  const selSunStr = toLocalDateStr(selSun);

  const wxForStr = str => weather?.days?.find(w => w.dateStr === str) ?? null;
  const wxSat = wxForStr(selSatStr);
  const wxSun = wxForStr(selSunStr);

  const weekendName = de
    ? (weekendSel === 'next' ? 'Nächstes Wochenende' : 'Dieses Wochenende')
    : (weekendSel === 'next' ? 'Next weekend' : 'This weekend');
  const heroSub = `${fmtShort(selSat, lang)} – ${fmtShort(selSun, lang)}`;
  const weekendPlanned = (weekendPlan[selSatStr] || []).length + (weekendPlan[selSunStr] || []).length;

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

  const addActivity = (act, dateStr, dayName) => {
    const cur = weekendPlan[dateStr] || [];
    if (cur.some(a => a.id === act.id)) { showToast(t('toast.already'), null); return; }
    const key = act.id + '_' + Date.now();
    const item = { ...act, _key: key };
    setWeekendPlan(p => ({ ...p, [dateStr]: [...(p[dateStr] || []), item] }));
    showToast(de ? `Zu ${dayName} hinzugefügt` : `Added to ${dayName}`, () => removeFromDay(dateStr, key));
  };

  const quickAdd = () => {
    const txt = qText.trim();
    if (!txt) return;
    if (qMode === 'todo') {
      const id = Date.now().toString();
      setTodos(prev => [{ id, text: txt, owner: '', dueDate: '', completed: false, createdAt: new Date().toISOString() }, ...prev]);
      setQText('');
      showToast(t('toast.taskAdded'), () => setTodos(prev => prev.filter(td => td.id !== id)));
    } else {
      const ds = qDay === 'sun' ? selSunStr : selSatStr;
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

  // ---- smart picks ----
  const satCat = wxSat ? wxInfo(wxSat.code).cat : null;
  const sunCat = wxSun ? wxInfo(wxSun.code).cat : null;
  const inWeekend = id => (weekendPlan[selSatStr] || []).some(a => a.id === id) || (weekendPlan[selSunStr] || []).some(a => a.id === id);
  const picks = PICK_POOL
    .filter(a => a.weather && (a.weather.includes('any') || (satCat && a.weather.includes(satCat)) || (sunCat && a.weather.includes(sunCat))))
    .filter(a => !inWeekend(a.id))
    .sort((a, b) => (a.location === 'day-trip' ? 1 : 0) - (b.location === 'day-trip' ? 1 : 0))
    .slice(0, 4);

  const satName = selSat.toLocaleDateString(locale, { weekday: 'long' });

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

  const days = [
    { date: selSat, dateStr: selSatStr, wx: wxSat },
    { date: selSun, dateStr: selSunStr, wx: wxSun },
  ].filter(d => (weekendPlan[d.dateStr] || []).length > 0 || calEventsForDay(d.dateStr).length > 0);

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
          <div className="flex items-center gap-[7px]" style={{ marginTop: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginRight: 2 }}>{t('plan.day')}</span>
            <Chip size="sm" active={qDay === 'sat'} onClick={() => setQDay('sat')}>{(de ? 'Sa ' : 'Sat ') + selSat.getDate() + '.'}</Chip>
            <Chip size="sm" active={qDay === 'sun'} onClick={() => setQDay('sun')}>{(de ? 'So ' : 'Sun ') + selSun.getDate() + '.'}</Chip>
          </div>
        )}
      </div>

      {/* weekend title */}
      <div className="flex items-baseline justify-between gap-2" style={{ marginTop: 20, padding: '0 2px' }}>
        <div className="min-w-0">
          <div className="font-brand" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{weekendName}</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 1 }}>{heroSub}</div>
        </div>
        {weekendPlanned > 0 && (
          <span className="flex-none" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-deep)', background: 'var(--primary-soft)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
            {weekendPlanned} {weekendPlanned === 1 ? t('plan.activity') : t('plan.activities')}
          </span>
        )}
      </div>

      {/* weekend toggle */}
      <div style={{ marginTop: 14 }}>
        <SegmentedControl
          options={[{ value: 'this', label: t('plan.thisWE') }, { value: 'next', label: t('plan.nextWE') }]}
          value={weekendSel}
          onChange={setWeekendSel}
        />
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

      {/* smart picks */}
      {picks.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', margin: '0 2px 10px' }}>{t('plan.smartPicks')}</div>
          <div className="flex flex-col" style={{ gap: 9 }}>
            {picks.map(p => (
              <div key={p.id} className="flex items-center gap-[11px]" style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-card)', padding: '10px 11px' }}>
                <div className="flex-none flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, fontSize: 22, background: catGrad(p.cat) }}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', marginTop: 2 }}>{p.duration || (p.location === 'day-trip' ? (de ? 'Ausflug' : 'Day trip') : (de ? 'München' : 'Munich'))}</div>
                </div>
                <button onClick={() => addActivity(p, selSatStr, satName)} className="press flex-none flex items-center gap-[5px]" style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: 'var(--primary)', border: 'none', borderRadius: 'var(--r-pill)', padding: '8px 13px', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>
                  <Icon name="plus" size={13} sw={2.6} />{de ? 'Sa' : 'Sat'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
