export default function ItineraryCard({ itin, stops, onAddSat, onAddSun, addedSat, addedSun }) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 ring-1 ring-amber-100 p-3 card-hover">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
            Route · {itin.duration}
          </span>
          {itin.area === 'south' && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">📍 Nah</span>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onAddSat}
            className={`min-h-[36px] text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${addedSat ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'}`}>
            {addedSat ? '✓ Sa' : '+Sa'}
          </button>
          <button onClick={onAddSun}
            className={`min-h-[36px] text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${addedSun ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'}`}>
            {addedSun ? '✓ So' : '+So'}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl flex-shrink-0 mt-0.5">{itin.emoji}</span>
        <div>
          <div className="font-bold text-stone-800 text-sm leading-tight">{itin.name}</div>
          <div className="text-xs text-stone-500 mt-1 leading-relaxed">{itin.desc}</div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {stops.map((s, i) => (
          <span key={s?.id || i} className="inline-flex items-center gap-1">
            {i > 0 && <span className="text-stone-300 text-[10px]">→</span>}
            <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 border border-stone-200 rounded-full px-2 py-0.5 text-stone-600">
              <span>{s?.emoji || '📍'}</span>
              <span className="font-semibold">{s?.name || 'Stop'}</span>
              {s?._stay && <span className="text-stone-400">· {s._stay}</span>}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
