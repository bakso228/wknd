import familyPhoto from '../../assets/family.jpg';
import WxCard from '../WxCard.jsx';
import { useLang } from '../../contexts/LangContext.jsx';
import { getWeekend, fmtShort, dayEvents, toLocalDateStr } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';

export default function PlanTab({ weather, wxLoading, wxError, weekendPlan, setWeekendPlan, userEvents, onGoExplorer }) {
  const { t, lang } = useLang();
  const { sat, sun } = getWeekend();
  const removeFromDay = (day, key) =>
    setWeekendPlan(p => ({ ...p, [day]: p[day].filter(a => a._key !== key) }));

  const totalPlanned = (weekendPlan.sat || []).length + (weekendPlan.sun || []).length;

  // Calendar events that fall on this weekend
  const satStr = toLocalDateStr(sat);
  const sunStr = toLocalDateStr(sun);
  const calSat = (userEvents || []).filter(e => {
    const start = e.startDate || e.date;
    const end   = e.endDate   || start;
    return satStr >= start && satStr <= end;
  });
  const calSun = (userEvents || []).filter(e => {
    const start = e.startDate || e.date;
    const end   = e.endDate   || start;
    return sunStr >= start && sunStr <= end;
  });

  function DayCol({ dayKey, date, wxData, calEvents }) {
    const items = weekendPlan[dayKey] || [];
    const wx    = wxData ? wxInfo(wxData.code) : null;
    const isEmpty = items.length === 0 && calEvents.length === 0;
    const dayLabel = dayKey === 'sat' ? t('plan.saturday') : t('plan.sunday');

    return (
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3.5">
          <div className="font-bold text-white text-base">{dayLabel}</div>
          <div className="text-amber-100 text-xs mt-0.5">
            {fmtShort(date, lang)}{wx ? ` · ${wx.emoji} ${t(`wx.${wx.labelKey}`)} ${wxData.maxT}°` : ''}
          </div>
        </div>
        <div className="p-3 min-h-[140px]">
          {isEmpty ? (
            <button
              onClick={onGoExplorer}
              className="w-full h-28 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1.5 active:bg-amber-50/50 transition-all group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">🔍</div>
              <div className="text-xs font-semibold text-stone-400 group-hover:text-amber-600">{t('plan.addFromExplorer')}</div>
            </button>
          ) : (
            <div className="space-y-2">
              {/* Plan items */}
              {items.map(act => (
                <div key={act._key} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-lg flex-shrink-0">{act.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-800 leading-tight">{act.name}</div>
                    {act.dateShort  && <div className="text-[10px] text-violet-600 font-semibold mt-0.5">{act.dateShort}</div>}
                    {act.duration && !act.dateShort && <div className="text-[10px] text-stone-400 mt-0.5">⏱ {act.duration}</div>}
                  </div>
                  <button
                    onClick={() => removeFromDay(dayKey, act._key)}
                    className="text-stone-300 hover:text-red-400 text-sm leading-none flex-shrink-0 mt-0.5 transition-colors w-6 h-6 flex items-center justify-center"
                  >✕</button>
                </div>
              ))}
              {/* Calendar events for this day */}
              {calEvents.map((ev, i) => (
                <div key={'cal_' + i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-lg flex-shrink-0">{ev.emoji || ev.e || '📅'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-blue-800 leading-tight">{ev.name}</div>
                    <div className="text-[10px] text-blue-400 mt-0.5">📅 {t('calendar.title')}</div>
                  </div>
                </div>
              ))}
              <button
                onClick={onGoExplorer}
                className="w-full py-2.5 text-xs font-semibold text-amber-600 active:bg-amber-50 rounded-lg transition-colors border border-dashed border-amber-200"
              >
                {t('plan.addMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
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
            {fmtShort(sat, lang)} – {fmtShort(sun, lang)}
          </div>
        </div>
        {/* plan count badge */}
        {totalPlanned > 0 && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {totalPlanned} {totalPlanned === 1 ? t('plan.activity') : t('plan.activities')}
          </div>
        )}
      </div>

      {/* weather cards */}
      <div className="grid grid-cols-2 gap-3">
        <WxCard label={t('plan.saturday')} data={weather?.sat} loading={wxLoading} error={wxError} />
        <WxCard label={t('plan.sunday')}   data={weather?.sun} loading={wxLoading} error={wxError} />
      </div>

      {/* day columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DayCol dayKey="sat" date={sat} wxData={weather?.sat} calEvents={calSat} />
        <DayCol dayKey="sun" date={sun} wxData={weather?.sun} calEvents={calSun} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <span>💡</span>
        <div className="text-xs text-amber-700">{t('plan.explorerHint')}</div>
      </div>
    </div>
  );
}
