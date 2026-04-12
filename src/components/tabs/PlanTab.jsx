import WxCard from '../WxCard.jsx';
import { getWeekend, fmtShort } from '../../utils/date.js';
import { wxInfo } from '../../utils/weather.js';

export default function PlanTab({ weather, wxLoading, wxError, weekendPlan, setWeekendPlan, onGoExplorer }) {
  const { sat, sun } = getWeekend();
  const removeFromDay = (day, key) =>
    setWeekendPlan(p => ({ ...p, [day]: p[day].filter(a => a._key !== key) }));

  const totalPlanned = (weekendPlan.sat || []).length + (weekendPlan.sun || []).length;

  function DayCol({ dayKey, date, wxData }) {
    const items = weekendPlan[dayKey] || [];
    const wx    = wxData ? wxInfo(wxData.code) : null;
    return (
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3.5">
          <div className="font-bold text-white text-base">{dayKey === 'sat' ? 'Samstag' : 'Sonntag'}</div>
          <div className="text-amber-100 text-xs mt-0.5">
            {fmtShort(date)}{wx ? ` · ${wx.emoji} ${wx.label} ${wxData.maxT}°` : ''}
          </div>
        </div>
        <div className="p-3 min-h-[140px]">
          {items.length === 0 ? (
            <button
              onClick={onGoExplorer}
              className="w-full h-28 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1.5 active:bg-amber-50/50 transition-all group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">🔍</div>
              <div className="text-xs font-semibold text-stone-400 group-hover:text-amber-600">Add from Explorer</div>
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
                    onClick={() => removeFromDay(dayKey, act._key)}
                    className="text-stone-300 hover:text-red-400 active:text-red-500 text-sm leading-none flex-shrink-0 mt-0.5 transition-colors w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={onGoExplorer}
                className="w-full py-2.5 text-xs font-semibold text-amber-600 active:bg-amber-50 rounded-lg transition-colors border border-dashed border-amber-200"
              >
                + Add more from Explorer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      {/* weekend summary bar */}
      <div className="bg-stone-800 rounded-2xl px-4 py-3 flex items-center gap-4 text-white">
        <div className="text-xs">
          <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wide">Weekend</div>
          <div className="font-bold">{fmtShort(sat)} – {fmtShort(sun)}</div>
        </div>
        <div className="w-px h-8 bg-stone-600" />
        <div className="text-xs">
          <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wide">Planned</div>
          <div className="font-bold">{totalPlanned} {totalPlanned === 1 ? 'activity' : 'activities'}</div>
        </div>
        {totalPlanned === 0 && (
          <>
            <div className="w-px h-8 bg-stone-600" />
            <div className="text-xs text-stone-400 flex-1">Browse Explorer → tap +Sa or +So to add</div>
          </>
        )}
      </div>

      {/* weather cards */}
      <div className="grid grid-cols-2 gap-3">
        <WxCard label="Samstag" data={weather?.sat} loading={wxLoading} error={wxError} />
        <WxCard label="Sonntag" data={weather?.sun} loading={wxLoading} error={wxError} />
      </div>

      {/* day columns — stacked on mobile, side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DayCol dayKey="sat" date={sat} wxData={weather?.sat} />
        <DayCol dayKey="sun" date={sun} wxData={weather?.sun} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <span>💡</span>
        <div className="text-xs text-amber-700">
          Go to <strong>Explorer</strong> to browse activities ranked by this weekend's weather &amp; season.
        </div>
      </div>
    </div>
  );
}
