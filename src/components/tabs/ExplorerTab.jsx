import { useState, useMemo } from 'react';
import ActivityCard from '../ActivityCard.jsx';
import ItineraryCard from '../ItineraryCard.jsx';
import MapView from '../MapView.jsx';
import { useLang } from '../../contexts/LangContext.jsx';
import { BASE_ACTIVITIES, STICKY_DEFAULTS } from '../../data/activities.js';
import { MICRO_LOCAL } from '../../data/microLocal.js';
import { KIDS_MUNICH } from '../../data/kidsMunich.js';
import { ITINERARIES } from '../../data/itineraries.js';
import { SOURCED_EVENTS } from '../../data/events.js';
import { getSeason, wxInfo, scoreActivity } from '../../utils/weather.js';
import { distanceFromHome } from '../../utils/distance.js';
import { getUpcomingWeekends, fmtShort, toLocalDateStr } from '../../utils/date.js';

export default function ExplorerTab({ weather, weekendPlan, setWeekendPlan, stickyActivities, setStickyActivities, hiddenActivities, setHiddenActivities }) {
  const { t, lang } = useLang();
  const [catFilter,      setCatFilter]      = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [depthFilter,    setDepthFilter]    = useState('all');
  const [weekendFilter,  setWeekendFilter]  = useState('wknd_0');
  const [viewMode,       setViewMode]       = useState('cards'); // 'cards' | 'map'
  const [showAddSticky,  setShowAddSticky]  = useState(false);
  const [newSticky,      setNewSticky]      = useState({ name: '', emoji: '⭐', desc: '' });
  const [showHidden,     setShowHidden]     = useState(false);

  const season = getSeason(new Date().getMonth() + 1);
  // Use today's weather (days[0]) for activity ranking
  const wxCat  = weather?.days?.[0] ? wxInfo(weather.days[0].code).cat : 'sunny';

  const upcomingWeekends = useMemo(() => getUpcomingWeekends(5), []);

  const allActivities = useMemo(() => {
    const userStickies = stickyActivities.filter(s => !STICKY_DEFAULTS.find(d => d.id === s.id));
    return [...STICKY_DEFAULTS, ...userStickies, ...BASE_ACTIVITIES, ...MICRO_LOCAL, ...KIDS_MUNICH];
  }, [stickyActivities]);

  const hiddenSet = useMemo(() => new Set(hiddenActivities), [hiddenActivities]);

  const scored = useMemo(() =>
    [...SOURCED_EVENTS, ...allActivities]
      .filter(a => !hiddenSet.has(a.id))
      .map(a => ({ ...a, _score: scoreActivity(a, wxCat, season) }))
      .sort((a, b) => b._score - a._score),
    [allActivities, wxCat, season, hiddenSet]
  );

  const hiddenItems = useMemo(() =>
    [...SOURCED_EVENTS, ...allActivities].filter(a => hiddenSet.has(a.id)),
    [allActivities, hiddenSet]
  );

  const hideActivity   = id => setHiddenActivities(prev => [...prev, id]);
  const unhideActivity = id => setHiddenActivities(prev => prev.filter(h => h !== id));

  const filtered = useMemo(() => {
    let list = scored;
    if (catFilter !== 'all') {
      if (catFilter === 'sticky')       list = list.filter(a => a.cat === 'sticky');
      else if (catFilter === 'sourced') list = list.filter(a => a.eventType === 'sourced');
      else                              list = list.filter(a => a.cat === catFilter && a.eventType !== 'sourced');
    }
    if (locationFilter === 'nearby') {
      list = list.filter(a => {
        if (a.area === 'south') return true;
        const d = distanceFromHome(a);
        return d != null && d.km <= 15;
      });
    } else if (locationFilter !== 'all') {
      list = list.filter(a => a.location === locationFilter);
    }
    if (typeFilter === 'sourced')  list = list.filter(a => a.eventType === 'sourced');
    if (typeFilter === 'venue')    list = list.filter(a => a.eventType === 'venue');
    if (typeFilter === 'seasonal') list = list.filter(a => a.eventType === 'seasonal');
    if (depthFilter === 'quick') list = list.filter(a => a.depth === 'micro' || a.depth === 'short');
    if (depthFilter === 'half')  list = list.filter(a => a.depth === 'half');
    if (depthFilter === 'full')  list = list.filter(a => a.depth === 'full');
    return list;
  }, [scored, catFilter, locationFilter, typeFilter, depthFilter]);

  // +Sa/+So always targets the nearest upcoming Saturday/Sunday (within the 7-day window)
  const _today = new Date(); _today.setHours(0, 0, 0, 0);
  const _dow   = _today.getDay();
  const _sat   = new Date(_today); _sat.setDate(_today.getDate() + (_dow === 6 ? 0 : _dow === 0 ? -1 : 6 - _dow));
  const _sun   = new Date(_today); _sun.setDate(_today.getDate() + (_dow === 0 ? 0 : (7 - _dow) % 7));
  const planSatStr = toLocalDateStr(_sat);
  const planSunStr = toLocalDateStr(_sun);

  const isAdded  = (id, day) => (weekendPlan[day] || []).some(a => a.id === id);
  const addToDay = (act, day) => setWeekendPlan(p => ({ ...p, [day]: [...(p[day] || []), { ...act, _key: act.id + Date.now() }] }));

  // Resolve itinerary stops to full activities + apply active filters.
  const allById = useMemo(() => {
    const map = new Map();
    [...allActivities, ...SOURCED_EVENTS].forEach(a => map.set(a.id, a));
    return map;
  }, [allActivities]);

  const visibleItineraries = useMemo(() => {
    if (typeFilter === 'sourced' || typeFilter === 'seasonal') return [];
    if (catFilter === 'sticky' || catFilter === 'sourced')     return [];
    return ITINERARIES
      .map(itin => ({
        ...itin,
        stops: itin.stops.map(s => {
          const a = allById.get(s.activityId);
          return a ? { ...a, _stay: s.stay } : null;
        }).filter(Boolean),
      }))
      .filter(itin => itin.stops.length >= 2)
      .filter(itin => {
        if (locationFilter === 'nearby') return itin.area === 'south';
        if (locationFilter === 'munich') return itin.area !== 'south' || itin.stops.every(s => s.location === 'munich');
        if (locationFilter === 'day-trip') return itin.stops.some(s => s.location === 'day-trip');
        return true;
      })
      .filter(itin => itin.weather.includes('any') || itin.weather.includes(wxCat))
      .filter(itin => itin.season.includes('all')  || itin.season.includes(season));
  }, [allById, catFilter, locationFilter, typeFilter, wxCat, season]);

  const addItineraryToDay = (itin, day) =>
    setWeekendPlan(p => ({
      ...p,
      [day]: [
        ...(p[day] || []),
        ...itin.stops
          .filter(s => !(p[day] || []).some(a => a.id === s.id))
          .map(s => ({ ...s, _key: s.id + Date.now() + Math.random() })),
      ],
    }));

  const itinAdded = (itin, day) =>
    itin.stops.length > 0 &&
    itin.stops.every(s => (weekendPlan[day] || []).some(a => a.id === s.id));

  // Sourced items, filtered by selected weekend and sorted by startDate
  const sourcedItems = useMemo(() => {
    const items = filtered.filter(a => a.eventType === 'sourced');
    if (weekendFilter === 'all') return items;
    const wknd = upcomingWeekends.find(w => w.key === weekendFilter);
    if (!wknd) return items;
    return items
      .filter(a => !a.startDate || (a.startDate <= wknd.sunStr && (a.endDate || a.startDate) >= wknd.satStr))
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  }, [filtered, weekendFilter, upcomingWeekends]);

  // Grouped by weekend for the 'all upcoming' view
  const sourcedByWeekend = useMemo(() => {
    if (weekendFilter !== 'all') return null;
    return upcomingWeekends.map(wknd => ({
      wknd,
      items: filtered
        .filter(a => a.eventType === 'sourced' && (!a.startDate ||
          (a.startDate <= wknd.sunStr && (a.endDate || a.startDate) >= wknd.satStr)))
        .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
    })).filter(g => g.items.length > 0);
  }, [filtered, weekendFilter, upcomingWeekends]);

  const stickyItems  = filtered.filter(a => a.cat === 'sticky');
  const regularItems = filtered.filter(a => a.eventType !== 'sourced' && a.cat !== 'sticky');
  const hasSourced   = filtered.some(a => a.eventType === 'sourced');
  const showSourced  = weekendFilter === 'all'
    ? (sourcedByWeekend && sourcedByWeekend.length > 0)
    : sourcedItems.length > 0;

  const saveSticky = () => {
    if (!newSticky.name.trim()) return;
    const s = { id: 'user_sticky_' + Date.now(), name: newSticky.name.trim(), emoji: newSticky.emoji, desc: newSticky.desc, cat: 'sticky', location: 'munich', eventType: 'venue', weather: ['any'], season: ['all'], duration: '', age: '', url: '', tags: ['personal'] };
    setStickyActivities([...stickyActivities, s]);
    setNewSticky({ name: '', emoji: '⭐', desc: '' });
    setShowAddSticky(false);
  };
  const removeSticky = id => setStickyActivities(stickyActivities.filter(s => s.id !== id));

  const selectedWknd = weekendFilter === 'all' ? null : upcomingWeekends.find(w => w.key === weekendFilter);
  const WKND_LABELS  = ['this', 'next', 'in2wks', 'in3wks', 'in4wks'];

  const CAT_FILTERS = [
    { id: 'all',      e: '✨' }, { id: 'sourced',  e: '📰' }, { id: 'outdoor',  e: '🌿' },
    { id: 'indoor',   e: '🏛️' }, { id: 'theater',  e: '🎭' }, { id: 'food',     e: '🍺' },
    { id: 'seasonal', e: '🎡' }, { id: 'sticky',   e: '⭐' },
  ];

  return (
    <div className="fade-in space-y-4">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-800">{t('explorer.title')}</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? t('explorer.activity') : t('explorer.activities')} · {t('explorer.rankedFor')} {wxCat === 'rainy' ? '🌧️' : '☀️'} {season}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Card / Map toggle */}
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'cards' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
            >📋</button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'map' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
            >🗺️</button>
          </div>
          {weather?.days?.[0] && (
            <div className="text-right text-xs text-stone-500 bg-white rounded-xl px-3 py-2 border border-stone-200">
              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wide mb-0.5">{t('explorer.weekend')}</div>
              <div>
                {weather.sat && <>{wxInfo(weather.sat.code).emoji} Sa {weather.sat.maxT}° · </>}
                {weather.sun && <>{wxInfo(weather.sun.code).emoji} So {weather.sun.maxT}°</>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 scroll-x -mx-4 px-4 pb-1">
        {CAT_FILTERS.map(f => (
          <button key={f.id} onClick={() => setCatFilter(f.id)}
            className={`flex-shrink-0 text-xs px-3 py-2 rounded-full font-semibold border transition-colors min-h-[36px] ${catFilter === f.id ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}>
            {f.e} {t(`explorer.catFilters.${f.id}`)}
          </button>
        ))}
      </div>

      {/* Location + type filter chips */}
      <div className="flex gap-1.5 scroll-x -mx-4 px-4 pb-1">
        {['all','nearby','munich','dayTrip'].map(id => {
          const value = id === 'dayTrip' ? 'day-trip' : id;
          return (
            <button key={id} onClick={() => setLocationFilter(value)}
              className={`flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-full font-semibold border transition-colors min-h-[32px] ${
                locationFilter === value
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-stone-500 border-stone-200'
              }`}>
              {t(`explorer.locFilters.${id}`)}
            </button>
          );
        })}
        <div className="w-px h-6 bg-stone-200 flex-shrink-0 self-center mx-1" />
        {['all','sourced','venue','seasonal'].map(id => (
          <button key={id} onClick={() => setTypeFilter(id)}
            className={`flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-full font-semibold border transition-colors min-h-[32px] ${typeFilter === id ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-500 border-stone-200'}`}>
            {t(`explorer.typeFilters.${id}`)}
          </button>
        ))}
      </div>

      {/* Depth filter chips */}
      <div className="flex gap-1.5 scroll-x -mx-4 px-4 pb-1">
        {['all','quick','half','full'].map(id => (
          <button key={id} onClick={() => setDepthFilter(id)}
            className={`flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-full font-semibold border transition-colors min-h-[32px] ${depthFilter === id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-500 border-stone-200'}`}>
            {t(`explorer.depthFilters.${id}`)}
          </button>
        ))}
      </div>

      {/* Weekend filter chips — shown only when sourced events are in scope */}
      {hasSourced && (
        <div className="flex gap-1.5 scroll-x -mx-4 px-4 pb-1">
          {upcomingWeekends.map((w, i) => (
            <button key={w.key} onClick={() => setWeekendFilter(w.key)}
              className={`flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-full font-semibold border transition-colors min-h-[32px] ${weekendFilter === w.key ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-500 border-stone-200'}`}>
              {t(`explorer.wkndFilters.${WKND_LABELS[i]}`)}
            </button>
          ))}
          <button onClick={() => setWeekendFilter('all')}
            className={`flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-full font-semibold border transition-colors min-h-[32px] ${weekendFilter === 'all' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-500 border-stone-200'}`}>
            {t('explorer.wkndFilters.allUpcoming')}
          </button>
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <MapView events={filtered} />
      )}

      {/* Itineraries */}
      {viewMode === 'cards' && visibleItineraries.length > 0 && (
        <section>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
            🗺️ Routen &amp; Halbtage
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleItineraries.map(itin => (
              <ItineraryCard
                key={itin.id}
                itin={itin}
                stops={itin.stops}
                onAddSat={() => addItineraryToDay(itin, planSatStr)}
                onAddSun={() => addItineraryToDay(itin, planSunStr)}
                addedSat={itinAdded(itin, planSatStr)}
                addedSun={itinAdded(itin, planSunStr)}
              />
            ))}
          </div>
          <div className="border-t border-stone-100 mt-4" />
        </section>
      )}

      {/* Sourced events */}
      {viewMode === 'cards' && showSourced && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-bold text-violet-700 uppercase tracking-wide">
              {weekendFilter === 'all' ? t('explorer.upcomingEvents') : t('explorer.thisWeekend')}
            </div>
            {selectedWknd && (
              <div className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {fmtShort(selectedWknd.sat, lang)} – {fmtShort(selectedWknd.sun, lang)}
              </div>
            )}
            <div className="text-[9px] text-stone-300 ml-auto hidden sm:block">{t('explorer.sourcedNote')}</div>
          </div>

          {weekendFilter === 'all' && sourcedByWeekend ? (
            <div className="space-y-6">
              {sourcedByWeekend.map(({ wknd, items }) => (
                <div key={wknd.key}>
                  <div className="text-[10px] text-violet-500 font-bold uppercase tracking-wide mb-2 bg-violet-50 inline-block px-2 py-0.5 rounded-full">
                    {fmtShort(wknd.sat, lang)} – {fmtShort(wknd.sun, lang)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map(act => (
                      <ActivityCard key={act.id} act={act} wxCat={wxCat}
                        onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                        addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                        onHide={() => hideActivity(act.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sourcedItems.map(act => (
                <ActivityCard key={act.id} act={act} wxCat={wxCat}
                  onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                  addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                  onHide={() => hideActivity(act.id)} />
              ))}
            </div>
          )}

          {(stickyItems.length > 0 || regularItems.length > 0) && typeFilter === 'all' && catFilter === 'all' && <div className="border-t border-stone-100 mt-4" />}
        </section>
      )}

      {/* Sticky favourites */}
      {viewMode === 'cards' && stickyItems.length > 0 && (typeFilter === 'all' || typeFilter === 'venue') && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wide">{t('explorer.stickyFavs')}</div>
            <button onClick={() => setShowAddSticky(true)} className="text-xs text-amber-600 font-semibold min-h-[36px] px-2">{t('explorer.addYours')}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stickyItems.map(act => (
              <div key={act.id} className="relative">
                <ActivityCard act={act} wxCat={wxCat}
                  onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                  addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                  onHide={() => hideActivity(act.id)} />
                {stickyActivities.find(s => s.id === act.id) && (
                  <button onClick={() => removeSticky(act.id)} className="absolute top-2 left-2 text-[9px] text-red-400 bg-white rounded px-1 border border-red-100 min-h-[24px]">remove</button>
                )}
              </div>
            ))}
          </div>

          {showAddSticky && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
              <div className="font-semibold text-rose-700 text-sm">{t('explorer.addStickyTitle')}</div>
              <div className="flex gap-2">
                <input value={newSticky.emoji} onChange={e => setNewSticky(p => ({ ...p, emoji: e.target.value }))} className="w-12 border border-stone-200 rounded-lg px-2 py-2 text-center text-lg" />
                <input value={newSticky.name}  onChange={e => setNewSticky(p => ({ ...p, name: e.target.value }))}  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" placeholder={t('explorer.activityName')} />
              </div>
              <input value={newSticky.desc} onChange={e => setNewSticky(p => ({ ...p, desc: e.target.value }))} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" placeholder={t('explorer.descPlaceholder')} />
              <div className="flex gap-2">
                <button onClick={() => setShowAddSticky(false)} className="flex-1 bg-white text-stone-600 border border-stone-200 rounded-lg py-2.5 text-sm font-semibold">{t('modal.cancel')}</button>
                <button onClick={saveSticky} disabled={!newSticky.name.trim()} className="flex-1 bg-rose-500 disabled:bg-stone-200 text-white rounded-lg py-2.5 text-sm font-bold">{t('modal.save')}</button>
              </div>
            </div>
          )}
          {regularItems.length > 0 && <div className="border-t border-stone-100 mt-4" />}
        </section>
      )}

      {viewMode === 'cards' && stickyItems.length === 0 && catFilter !== 'sticky' && typeFilter === 'all' && locationFilter === 'all' && (
        <button onClick={() => setShowAddSticky(true)} className="text-xs text-amber-600 font-semibold">⭐ {t('explorer.addYours')}</button>
      )}

      {/* All other activities */}
      {viewMode === 'cards' && regularItems.length > 0 && (
        <section>
          {(showSourced || stickyItems.length > 0) && typeFilter === 'all' && catFilter === 'all' && (
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">{t('explorer.allYear')}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regularItems.map(act => (
              <ActivityCard key={act.id} act={act} wxCat={wxCat}
                onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                onHide={() => hideActivity(act.id)} />
            ))}
          </div>
        </section>
      )}

      {viewMode === 'cards' && filtered.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">{t('explorer.noResults')}</div>
          <button onClick={() => { setCatFilter('all'); setLocationFilter('all'); setTypeFilter('all'); setDepthFilter('all'); }} className="mt-3 text-xs text-amber-600 hover:underline">
            {t('explorer.clearFilters')}
          </button>
        </div>
      )}

      {/* Hidden activities */}
      {hiddenItems.length > 0 && (
        <section className="pt-2 border-t border-stone-100">
          <button
            onClick={() => setShowHidden(v => !v)}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-600 transition-colors w-full py-1"
          >
            <span>👁 {hiddenItems.length} hidden {hiddenItems.length === 1 ? 'activity' : 'activities'}</span>
            <span className="ml-auto">{showHidden ? '▲' : '▼'}</span>
          </button>
          {showHidden && (
            <div className="mt-2 space-y-2">
              {hiddenItems.map(act => (
                <div key={act.id} className="flex items-center justify-between gap-3 bg-stone-50 rounded-lg px-3 py-2.5 border border-stone-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{act.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-500 truncate">{act.name}</div>
                      {act.dateShort && <div className="text-[10px] text-stone-400">{act.dateShort}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => unhideActivity(act.id)}
                    className="flex-shrink-0 text-[10px] font-semibold text-amber-600 border border-amber-200 bg-amber-50 rounded-lg px-2.5 py-1.5 min-h-[32px] hover:bg-amber-100 transition-colors"
                  >
                    unhide
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
