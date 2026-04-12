import familyPhoto from '../../assets/family.jpg';
import { useLang } from '../../contexts/LangContext.jsx';
import { fmtShort, toLocalDateStr } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';

export default function PlanTab({ weather, wxLoading, wxError, weekendPlan, setWeekendPlan, userEvents, onGoExplorer }) {
  const { t, lang } = useLang();
  const locale = lang === 'de' ? 'de-DE' : 'en-US';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr    = toLocalDateStr(today);
  const tomorrowStr = toLocalDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));

  // Always show today → 2nd upcoming Sunday (covers current + next full weekend)
  const dow         = today.getDay();
  const daysToSun1  = dow === 0 ? 0 : 7 - dow;  // 0 if today is Sun, else days until next Sun
  const totalDays   = daysToSun1 + 7 + 1;        // through the Sunday one week after sun1
  const planDays    = Array.from({ length: totalDays }, (_, i) => {
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

  // Color scheme: amber=today, violet=weekend, sky=weekday
  const dayGradient = d => {
    if (toLocalDateStr(d) === todayStr) return 'from-amber-400 to-orange-400';
    if (isSatOrSun(d))                 return 'from-violet-500 to-purple-500';
    return 'from-sky-500 to-blue-500';
  };

  function DayCard({ date }) {
    const dStr     = toLocalDateStr(date);
    const items    = weekendPlan[dStr] || [];
    const wx       = wxForDay(date);
    const wxMeta   = wx ? wxInfo(wx.code) : null;
    const calEvs   = calEventsForDay(date);
    const isEmpty  = items.length === 0 && calEvs.length === 0;
    const isWeekend = isSatOrSun(date);
    const gradient  = dayGradient(date);

    // Weekday cards with no content: compact single-line header
    if (!isWeekend && isEmpty) {
      return (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${gradient} px-4 py-2.5 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{getDayLabel(date)}</span>
              <span className="text-white/70 text-xs">{fmtShort(date, lang)}</span>
            </div>
            {wxMeta && (
              <div className="text-white/90 text-xs font-semibold">{wxMeta.emoji} {wx.maxT}°</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        <div className={`bg-gradient-to-r ${gradient} px-4 py-3.5`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-base">{getDayLabel(date)}</div>
              <div className="text-white/80 text-xs mt-0.5">
                {fmtShort(date, lang)}
                {wxMeta ? ` · ${wxMeta.emoji} ${t(`wx.${wxMeta.labelKey}`)} ${wx.maxT}°` : ''}
              </div>
            </div>
            {items.length > 0 && (
              <div className="text-white/80 text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? t('plan.activity') : t('plan.activities')}
              </div>
            )}
          </div>
        </div>
        <div className="p-3 min-h-[80px]">
          {isEmpty ? (
            <button
              onClick={onGoExplorer}
              className="w-full h-16 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center gap-2 active:bg-amber-50/50 transition-all group"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">🔍</div>
              <div className="text-xs font-semibold text-stone-400 group-hover:text-amber-600">{t('plan.addFromExplorer')}</div>
            </button>
          ) : (
            <div className="space-y-2">
              {items.map(act => (
                <div key={act._key} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-lg flex-shrink-0">{act.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-800 leading-tight">{act.name}</div>
                    {act.dateShort  && <div className="text-[10px] text-violet-600 font-semibold mt-0.5">{act.dateShort}</div>}
                    {act.duration && !act.dateShort && <div className="text-[10px] text-stone-400 mt-0.5">⏱ {act.duration}</div>}
                  </div>
                  <button
                    onClick={() => removeFromDay(dStr, act._key)}
                    className="text-stone-300 hover:text-red-400 text-sm leading-none flex-shrink-0 mt-0.5 transition-colors w-6 h-6 flex items-center justify-center"
                  >✕</button>
                </div>
              ))}
              {calEvs.map((ev, i) => (
                <div key={'cal_' + i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-lg flex-shrink-0">{ev.emoji || ev.e || '📅'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-blue-800 leading-tight">{ev.name}</div>
                    <div className="text-[10px] text-blue-400 mt-0.5">📅 {t('calendar.title')}</div>
                  </div>
                </div>
              ))}
              {isWeekend && (
                <button
                  onClick={onGoExplorer}
                  className="w-full py-2.5 text-xs font-semibold text-amber-600 active:bg-amber-50 rounded-lg transition-colors border border-dashed border-amber-200"
                >
                  {t('plan.addMore')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const compact = planDays.length > 9; // condense chips when many days

  return (
    <div className="fade-in space-y-3">
      {/* Family hero photo */}
      <div className="relative rounded-2xl overflow-hidden h-40 shadow-md">
        <img
          src={familyPhoto}
          alt="Familie Scheybani"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
          <div className="text-white font-bold text-base drop-shadow">Familie Scheybani 🏡</div>
          <div className="text-white/75 text-xs mt-0.5 drop-shadow">
            {fmtShort(today, lang)} – {fmtShort(planDays[planDays.length - 1], lang)}
          </div>
        </div>
        {totalPlanned > 0 && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {totalPlanned} {totalPlanned === 1 ? t('plan.activity') : t('plan.activities')}
          </div>
        )}
      </div>

      {/* Full-width weather strip — fills entire width via CSS grid */}
      {(weather?.days || wxLoading) && (
        <div
          className="grid gap-1.5 w-full"
          style={{ gridTemplateColumns: `repeat(${planDays.length}, 1fr)` }}
        >
          {wxLoading
            ? planDays.map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-200 animate-pulse h-16" />
              ))
            : planDays.map(d => {
                const wx        = wxForDay(d);
                const dStr      = toLocalDateStr(d);
                const isToday   = dStr === todayStr;
                const isWeekend = isSatOrSun(d);
                const wxMeta    = wx ? wxInfo(wx.code) : null;
                return (
                  <div key={dStr}
                    className={`text-center rounded-xl py-1.5 px-0.5 border flex flex-col items-center justify-center ${
                      isToday   ? 'bg-amber-50 border-amber-300' :
                      isWeekend ? 'bg-violet-50 border-violet-200' :
                                  'bg-white border-stone-200'
                    }`}>
                    <div className={`text-[9px] font-bold uppercase leading-tight ${
                      isToday ? 'text-amber-600' : isWeekend ? 'text-violet-600' : 'text-stone-500'
                    }`}>
                      {isToday
                        ? (lang === 'de' ? 'Heute' : 'Today')
                        : d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
                    </div>
                    {!compact && (
                      <div className="text-[8px] text-stone-400 leading-tight">
                        {d.toLocaleDateString(locale, { day: 'numeric', month: 'numeric' })}
                      </div>
                    )}
                    {wx ? (
                      <>
                        <div className="text-base leading-tight my-0.5">{wxMeta.emoji}</div>
                        <div className={`text-xs font-bold leading-tight ${isToday ? 'text-amber-700' : isWeekend ? 'text-violet-700' : 'text-stone-700'}`}>
                          {wx.maxT}°
                        </div>
                        {!compact && (
                          <div className="text-[8px] text-stone-400 leading-tight">{wx.minT}°</div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-stone-300 mt-1">–</div>
                    )}
                  </div>
                );
              })
          }
        </div>
      )}

      {wxError && (
        <div className="text-center py-2 text-stone-400 text-xs">🌡️ {t('wx.unavailable')}</div>
      )}

      {/* Day plan cards */}
      <div className="space-y-2">
        {planDays.map(d => <DayCard key={toLocalDateStr(d)} date={d} />)}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <span>💡</span>
        <div className="text-xs text-amber-700">{t('plan.explorerHint')}</div>
      </div>
    </div>
  );
}
