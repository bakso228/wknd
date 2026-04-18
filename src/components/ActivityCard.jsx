import { useLang } from '../contexts/LangContext.jsx';
import { CAT_BADGE } from '../data/styles.js';

export default function ActivityCard({ act, onAddSat, onAddSun, addedSat, addedSun, wxCat, onHide }) {
  const { t } = useLang();
  const isSourced    = act.eventType === 'sourced';
  const weatherMatch = act.weather.includes('any') || act.weather.includes(wxCat);

  const catBadge = isSourced ? CAT_BADGE.sourced : (CAT_BADGE[act.cat] || 'bg-stone-100 text-stone-600');
  const catLabel = isSourced ? t('card.thisWeekend') : t(`catLabels.${act.cat}`);

  return (
    <div className={`bg-white rounded-xl border flex flex-col card-hover ${isSourced ? 'border-violet-200 ring-1 ring-violet-100' : 'border-stone-200'}`}>

      {/* sourced banner */}
      {isSourced && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1.5 rounded-t-xl flex items-center justify-between">
          <span className="text-white text-[10px] font-bold uppercase tracking-wide">📰 {act.source}</span>
          <span className="text-violet-100 text-[10px] font-semibold">{act.dateShort}</span>
        </div>
      )}

      <div className="px-4 pt-3 pb-2">
        {/* badges + add buttons */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {!isSourced && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catBadge}`}>{catLabel}</span>
            )}
            {!isSourced && !weatherMatch && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200">{t('card.notIdeal')}</span>
            )}
            {!isSourced && weatherMatch && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">{t('card.goodFit')}</span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${act.location === 'day-trip' ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
              {act.location === 'day-trip' ? t('card.dayTrip') : t('card.inMunich')}
            </span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={onAddSat}
              className={`min-h-[36px] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all border ${addedSat ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'}`}
            >
              {addedSat ? '✓ Sa' : '+Sa'}
            </button>
            <button
              onClick={onAddSun}
              className={`min-h-[36px] text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all border ${addedSun ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'}`}
            >
              {addedSun ? '✓ So' : '+So'}
            </button>
          </div>
        </div>

        {/* emoji + title + desc */}
        <div className="flex gap-2.5 items-start">
          <span className="text-2xl flex-shrink-0 mt-0.5">{act.emoji}</span>
          <div>
            <div className="font-bold text-stone-800 text-sm leading-tight">{act.name}</div>
            <div className="text-xs text-stone-500 mt-1 leading-relaxed">{act.desc}</div>
          </div>
        </div>
      </div>

      {/* sourced: venue + highlights */}
      {isSourced && (
        <div className="px-4 pb-2">
          {act.venue && <div className="text-[10px] text-stone-400 mb-1">📍 {act.venue}</div>}
          {act.highlights && (
            <div className="bg-violet-50 rounded-lg px-2.5 py-2 text-[10px] text-violet-700 leading-relaxed border border-violet-100">
              {act.highlights}
            </div>
          )}
        </div>
      )}

      {/* meta chips */}
      <div className="px-4 pb-2 flex flex-wrap gap-1">
        {act.duration && (
          <span className="text-[10px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded border border-stone-100">⏱ {act.duration}</span>
        )}
        {act.age && (
          <span className="text-[10px] bg-stone-50 text-stone-500 px-2 py-0.5 rounded border border-stone-100">👶 {act.age}</span>
        )}
      </div>

      {(act.url || onHide) && (
        <div className="px-4 pb-3 mt-auto flex items-center justify-between">
          {act.url
            ? <a href={act.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-600 hover:underline font-semibold">{t('card.openWebsite')}</a>
            : <span />
          }
          {onHide && (
            <button onClick={onHide} className="text-[10px] text-stone-300 hover:text-stone-500 transition-colors min-h-[28px] px-1">
              hide
            </button>
          )}
        </div>
      )}
    </div>
  );
}
