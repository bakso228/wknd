import familyPhoto from '../../assets/family.jpg';
import { useLang } from '../../contexts/LangContext.jsx';
import { fmtShort, toLocalDateStr } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';
import { catGrad } from '../../data/styles.js';
import Icon from '../ui/Icon.jsx';

export default function PlanTab({ weather, wxLoading, wxError, weekendPlan, setWeekendPlan, userEvents, onGoExplorer }) {
  const { t, lang } = useLang();
  const locale = lang === 'de' ? 'de-DE' : 'en-US';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr    = toLocalDateStr(today);
  const tomorrowStr = toLocalDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));

  // Always show today → 2nd upcoming Sunday (covers current + next full weekend)
  const dow        = today.getDay();
  const daysToSun1 = dow === 0 ? 0 : 7 - dow;
  const totalDays  = daysToSun1 + 7 + 1;
  const planDays   = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });

  const totalPlanned = Object.values(weekendPlan).reduce((s, a) => s + a.length, 0);

  const removeFromDay = (dayKey, key) =>
    setWeekendPlan(p => ({ ...p, [dayKey]: (p[dayKey] || []).filter(a => a._key !== key) }));

  const wxForDay = d => weather?.days?.find(w => w.dateStr === toLocalDateStr(d)) ?? null;

  const calEventsForDay = d => {
    const dStr = toLocalDateStr(d);
    return (userEvents || []).filter(e => {
      const start = e.startDate || e.date;
      const end   = e.endDate   || start;
      return dStr >= start && dStr <= end;
    });
  };

  const getDayLabel = d => {
    const dStr = toLocalDateStr(d);
    if (dStr === todayStr)    return t('plan.today');
    if (dStr === tomorrowStr) return t('plan.tomorrow');
    return d.toLocaleDateString(locale, { weekday: 'long' });
  };

  const isSatOrSun = d => d.getDay() === 6 || d.getDay() === 0;

  function WeatherPill({ wx }) {
    if (!wx) return null;
    const m = wxInfo(wx.code);
    return (
      <div
        className="flex items-center gap-[5px] flex-none"
        style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', background: 'var(--soft-ice)', padding: '5px 9px', borderRadius: 'var(--r-pill)' }}
      >
        <span>{m.emoji}</span><span>{wx.maxT}°</span>
      </div>
    );
  }

  function DayCard({ date }) {
    const dStr      = toLocalDateStr(date);
    const items     = weekendPlan[dStr] || [];
    const wx        = wxForDay(date);
    const calEvs    = calEventsForDay(date);
    const isEmpty   = items.length === 0 && calEvs.length === 0;
    const isToday   = dStr === todayStr;
    const isWeekend = isSatOrSun(date);
    const dotColor  = isToday ? 'var(--primary)' : isWeekend ? 'var(--green)' : 'var(--border-strong)';

    return (
      <div
        style={{
          background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)',
          overflow: 'hidden', border: isToday ? '1px solid var(--primary)' : '1px solid transparent',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between" style={{ padding: '14px 16px 10px' }}>
          <div className="flex items-center gap-[9px] min-w-0">
            <div className="flex-none rounded-full" style={{ width: 7, height: 7, background: dotColor }} />
            <div className="min-w-0">
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{getDayLabel(date)}</div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 1 }}>{fmtShort(date, lang)}</div>
            </div>
          </div>
          <WeatherPill wx={wx} />
        </div>

        {/* body */}
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
                <button
                  onClick={() => removeFromDay(dStr, act._key)}
                  className="press flex-none flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}
                  aria-label="remove"
                >
                  <Icon name="close" size={15} sw={2.2} />
                </button>
              </div>
            );
          })}

          {calEvs.map((ev, i) => (
            <div key={'cal_' + i} className="flex items-center gap-[11px]" style={{ background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '9px 11px' }}>
              <div className="flex-none flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, fontSize: 19, background: 'var(--surface)' }}>{ev.emoji || ev.e || '📅'}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, color: 'var(--primary-deep)' }}>{ev.name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: 'var(--primary)' }}>{t('calendar.title')}</div>
              </div>
            </div>
          ))}

          {isEmpty ? (
            <button
              onClick={onGoExplorer}
              className="press w-full flex items-center justify-center gap-2"
              style={{ border: '1.5px dashed var(--border-strong)', background: 'transparent', borderRadius: 'var(--r-md)', padding: 14, cursor: 'pointer', color: 'var(--text-faint)' }}
            >
              <Icon name="search" size={17} />
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t('plan.addFromExplorer')}</span>
            </button>
          ) : isWeekend ? (
            <button
              onClick={onGoExplorer}
              className="press w-full"
              style={{ border: '1.5px dashed var(--primary)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: 11, cursor: 'pointer', color: 'var(--primary-deep)', fontSize: 12.5, fontWeight: 700 }}
            >
              {t('plan.addMore')}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderRadius: 'var(--r-lg)', height: 150, boxShadow: 'var(--shadow-card)' }}>
        <img src={familyPhoto} alt="Familie Scheybani" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 22%' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,145,220,.86), rgba(0,95,146,.92))' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 85% 15%, rgba(255,255,255,.22), transparent 60%)' }} />
        <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: -20, bottom: -26, opacity: 0.16 }}>
          <path d="M3 11.5 12 4l9 7.5M5 10v9h14v-9M10 19v-5h4v5" />
        </svg>
        <div className="absolute left-0 right-0 bottom-0" style={{ padding: '16px 18px' }}>
          <div className="font-brand" style={{ color: '#fff', fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em' }}>{t('plan.heroTitle')}</div>
          <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 12.5, fontWeight: 500, marginTop: 2 }}>
            {fmtShort(today, lang)} – {fmtShort(planDays[planDays.length - 1], lang)}
          </div>
        </div>
        {totalPlanned > 0 && (
          <div className="absolute" style={{ top: 14, right: 14, background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
            {totalPlanned} {totalPlanned === 1 ? t('plan.activity') : t('plan.activities')}
          </div>
        )}
      </div>

      {/* Weather strip */}
      {(weather?.days || wxLoading) && (
        <div className="flex" style={{ gap: 5 }}>
          {wxLoading
            ? planDays.slice(0, 9).map((_, i) => (
                <div key={i} className="flex-1 animate-pulse" style={{ height: 60, borderRadius: 'var(--r-sm)', background: 'var(--soft-ice)' }} />
              ))
            : planDays.map(d => {
                const wx        = wxForDay(d);
                const dStr      = toLocalDateStr(d);
                const isToday   = dStr === todayStr;
                const isWeekend = isSatOrSun(d);
                const m         = wx ? wxInfo(wx.code) : null;
                const bg = isToday ? 'var(--primary-soft)' : isWeekend ? '#EAF6F0' : 'var(--soft-ice)';
                const bd = isToday ? 'var(--primary)' : 'transparent';
                const fg = isToday ? 'var(--primary-deep)' : isWeekend ? 'var(--green-deep)' : 'var(--text-faint)';
                const tc = isToday ? 'var(--primary-deep)' : 'var(--text)';
                return (
                  <div key={dStr} className="flex-1 flex flex-col items-center" style={{ borderRadius: 'var(--r-sm)', padding: '7px 2px 8px', gap: 1, background: bg, border: `1px solid ${bd}` }}>
                    <div style={{ fontSize: 8.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: fg }}>
                      {isToday ? (lang === 'de' ? 'Heu' : 'Tdy') : d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '').slice(0, 3)}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.2, margin: '1px 0' }}>{m ? m.emoji : '·'}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: tc }}>{wx ? `${wx.maxT}°` : '–'}</div>
                  </div>
                );
              })
          }
        </div>
      )}

      {wxError && (
        <div className="text-center" style={{ padding: '8px 0', color: 'var(--text-faint)', fontSize: 12 }}>🌡️ {t('wx.unavailable')}</div>
      )}

      {/* Day cards — weekend days, today, or any day with items */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {planDays
          .filter(d => {
            const dStr = toLocalDateStr(d);
            const hasItems = (weekendPlan[dStr] || []).length > 0;
            const hasCalEvs = calEventsForDay(d).length > 0;
            return isSatOrSun(d) || dStr === todayStr || hasItems || hasCalEvs;
          })
          .map(d => <DayCard key={toLocalDateStr(d)} date={d} />)}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-[10px]" style={{ background: 'var(--coral-soft)', borderRadius: 'var(--r-md)', padding: '13px 14px' }}>
        <Icon name="spark" size={18} sw={2} style={{ color: 'var(--coral-deep)', flex: 'none', marginTop: 1 }} />
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--coral-deep)', lineHeight: 1.45 }}>{t('plan.explorerHint')}</div>
      </div>
    </div>
  );
}
