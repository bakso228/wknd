import { useState, useMemo } from 'react';
import ActivityCard from '../ActivityCard.jsx';
import ItineraryCard from '../ItineraryCard.jsx';
import MapView from '../MapView.jsx';
import Chip from '../ui/Chip.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Icon from '../ui/Icon.jsx';
import { useLang } from '../../contexts/LangContext.jsx';
import { BASE_ACTIVITIES, STICKY_DEFAULTS } from '../../data/activities.js';
import { MICRO_LOCAL } from '../../data/microLocal.js';
import { KIDS_MUNICH } from '../../data/kidsMunich.js';
import { ITINERARIES } from '../../data/itineraries.js';
import { SOURCED_EVENTS } from '../../data/events.js';
import { getSeason, wxInfo, scoreActivity } from '../../utils/weather.js';
import { distanceFromHome } from '../../utils/distance.js';
import { getUpcomingWeekends, fmtShort, toLocalDateStr } from '../../utils/date.js';

function Eyebrow({ children, style }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', ...style }}>
      {children}
    </div>
  );
}

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
      .sort((a, b) => {
        const aTemp = (a.eventType === 'sourced' || a.cat === 'seasonal') ? 1 : 0;
        const bTemp = (b.eventType === 'sourced' || b.cat === 'seasonal') ? 1 : 0;
        if (bTemp !== aTemp) return bTemp - aTemp;
        return b._score - a._score;
      }),
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

  const _today = new Date(); _today.setHours(0, 0, 0, 0);
  const _dow   = _today.getDay();
  const _sat   = new Date(_today); _sat.setDate(_today.getDate() + (_dow === 6 ? 0 : _dow === 0 ? -1 : 6 - _dow));
  const _sun   = new Date(_today); _sun.setDate(_today.getDate() + (_dow === 0 ? 0 : (7 - _dow) % 7));
  const planSatStr = toLocalDateStr(_sat);
  const planSunStr = toLocalDateStr(_sun);

  const isAdded  = (id, day) => (weekendPlan[day] || []).some(a => a.id === id);
  const addToDay = (act, day) => setWeekendPlan(p => ({ ...p, [day]: [...(p[day] || []), { ...act, _key: act.id + Date.now() }] }));

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

  const sourcedItems = useMemo(() => {
    const items = filtered.filter(a => a.eventType === 'sourced');
    if (weekendFilter === 'all') return items;
    const wknd = upcomingWeekends.find(w => w.key === weekendFilter);
    if (!wknd) return items;
    return items
      .filter(a => !a.startDate || (a.startDate <= wknd.sunStr && (a.endDate || a.startDate) >= wknd.satStr))
      .sort((a, b) => (a.endDate || a.startDate || '').localeCompare(b.endDate || b.startDate || ''));
  }, [filtered, weekendFilter, upcomingWeekends]);

  const sourcedByWeekend = useMemo(() => {
    if (weekendFilter !== 'all') return null;
    return upcomingWeekends.map(wknd => ({
      wknd,
      items: filtered
        .filter(a => a.eventType === 'sourced' && (!a.startDate ||
          (a.startDate <= wknd.sunStr && (a.endDate || a.startDate) >= wknd.satStr)))
        .sort((a, b) => (a.endDate || a.startDate || '').localeCompare(b.endDate || b.startDate || '')),
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

  const inputStyle = {
    border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '11px 12px',
    fontSize: 16, background: 'var(--surface)', color: 'var(--text)', outline: 'none', width: '100%',
  };

  const cardGridCls = 'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* header */}
      <div className="flex items-end justify-between gap-2.5" style={{ padding: '2px 2px 0' }}>
        <div className="min-w-0">
          <div className="font-brand" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{t('explorer.title')}</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 2 }}>
            {filtered.length} {filtered.length === 1 ? t('explorer.activity') : t('explorer.activities')} · {t('explorer.rankedFor')} {wxCat === 'rainy' ? '🌧️' : '☀️'}
          </div>
        </div>
        {weather?.days?.[0] && (
          <div className="text-right flex-none whitespace-nowrap" style={{ background: 'var(--soft-ice)', borderRadius: 'var(--r-sm)', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-soft)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)' }}>{t('explorer.weekend')}</div>
            <div>
              {weather.sat && <>{wxInfo(weather.sat.code).emoji} {t('common.sat')} {weather.sat.maxT}° · </>}
              {weather.sun && <>{wxInfo(weather.sun.code).emoji} {weather.sun.maxT}°</>}
            </div>
          </div>
        )}
      </div>

      {/* view toggle */}
      <div className="flex justify-end">
        <SegmentedControl
          options={[{ value: 'cards', label: '📋' }, { value: 'map', label: '🗺️' }]}
          value={viewMode}
          onChange={setViewMode}
          style={{ width: 110 }}
        />
      </div>

      {/* category chips */}
      <div className="flex scroll-x -mx-[18px] px-[18px]" style={{ gap: 7, paddingBottom: 2 }}>
        {CAT_FILTERS.map(f => (
          <Chip key={f.id} active={catFilter === f.id} onClick={() => setCatFilter(f.id)}>
            {f.e} {t(`explorer.catFilters.${f.id}`)}
          </Chip>
        ))}
      </div>

      {/* location + type chips */}
      <div className="flex items-center scroll-x -mx-[18px] px-[18px]" style={{ gap: 7, paddingBottom: 2 }}>
        {['all','nearby','munich','dayTrip'].map(id => {
          const value = id === 'dayTrip' ? 'day-trip' : id;
          return (
            <Chip key={id} size="sm" active={locationFilter === value} onClick={() => setLocationFilter(value)}>
              {t(`explorer.locFilters.${id}`)}
            </Chip>
          );
        })}
        <div className="flex-none self-center" style={{ width: 1, height: 22, background: 'var(--border-strong)', margin: '0 2px' }} />
        {['all','sourced','venue','seasonal'].map(id => (
          <Chip key={id} size="sm" active={typeFilter === id} onClick={() => setTypeFilter(id)}>
            {t(`explorer.typeFilters.${id}`)}
          </Chip>
        ))}
      </div>

      {/* depth chips */}
      <div className="flex scroll-x -mx-[18px] px-[18px]" style={{ gap: 7, paddingBottom: 2 }}>
        {['all','quick','half','full'].map(id => (
          <Chip key={id} size="sm" active={depthFilter === id} onClick={() => setDepthFilter(id)}>
            {t(`explorer.depthFilters.${id}`)}
          </Chip>
        ))}
      </div>

      {/* weekend chips */}
      {hasSourced && (
        <div className="flex scroll-x -mx-[18px] px-[18px]" style={{ gap: 7, paddingBottom: 2 }}>
          {upcomingWeekends.map((w, i) => (
            <Chip key={w.key} size="sm" active={weekendFilter === w.key} onClick={() => setWeekendFilter(w.key)}>
              {t(`explorer.wkndFilters.${WKND_LABELS[i]}`)}
            </Chip>
          ))}
          <Chip size="sm" active={weekendFilter === 'all'} onClick={() => setWeekendFilter('all')}>
            {t('explorer.wkndFilters.allUpcoming')}
          </Chip>
        </div>
      )}

      {/* map view */}
      {viewMode === 'map' && <MapView events={filtered} />}

      {/* itineraries */}
      {viewMode === 'cards' && visibleItineraries.length > 0 && (
        <section>
          <Eyebrow style={{ marginBottom: 10 }}>🗺️ Routen &amp; Halbtage</Eyebrow>
          <div className={cardGridCls}>
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
        </section>
      )}

      {/* sourced events */}
      {viewMode === 'cards' && showSourced && (
        <section>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <Eyebrow>{weekendFilter === 'all' ? t('explorer.upcomingEvents') : t('explorer.thisWeekend')}</Eyebrow>
            {selectedWknd && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--coral-deep)', background: 'var(--coral-soft)', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>
                {fmtShort(selectedWknd.sat, lang)} – {fmtShort(selectedWknd.sun, lang)}
              </span>
            )}
          </div>

          {weekendFilter === 'all' && sourcedByWeekend ? (
            <div className="flex flex-col" style={{ gap: 24 }}>
              {sourcedByWeekend.map(({ wknd, items }) => (
                <div key={wknd.key}>
                  <span className="inline-block" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--coral-deep)', background: 'var(--coral-soft)', padding: '2px 8px', borderRadius: 'var(--r-pill)', marginBottom: 10 }}>
                    {fmtShort(wknd.sat, lang)} – {fmtShort(wknd.sun, lang)}
                  </span>
                  <div className={cardGridCls}>
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
            <div className={cardGridCls}>
              {sourcedItems.map(act => (
                <ActivityCard key={act.id} act={act} wxCat={wxCat}
                  onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                  addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                  onHide={() => hideActivity(act.id)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* sticky favourites */}
      {viewMode === 'cards' && stickyItems.length > 0 && (typeFilter === 'all' || typeFilter === 'venue') && (
        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <Eyebrow>{t('explorer.stickyFavs')}</Eyebrow>
            <button onClick={() => setShowAddSticky(true)} className="press" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>{t('explorer.addYours')}</button>
          </div>
          <div className={cardGridCls}>
            {stickyItems.map(act => (
              <div key={act.id} className="relative">
                <ActivityCard act={act} wxCat={wxCat}
                  onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                  addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                  onHide={() => hideActivity(act.id)} />
                {stickyActivities.find(s => s.id === act.id) && (
                  <button onClick={() => removeSticky(act.id)} className="absolute" style={{ top: 8, left: 8, fontSize: 9, fontWeight: 700, color: 'var(--coral-deep)', background: 'var(--surface)', borderRadius: 8, padding: '2px 6px', border: '1px solid var(--coral-soft)' }}>remove</button>
                )}
              </div>
            ))}
          </div>

          {showAddSticky && (
            <div className="flex flex-col" style={{ gap: 10, marginTop: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t('explorer.addStickyTitle')}</div>
              <div className="flex gap-2">
                <input value={newSticky.emoji} onChange={e => setNewSticky(p => ({ ...p, emoji: e.target.value }))} style={{ ...inputStyle, width: 52, textAlign: 'center', fontSize: 20 }} />
                <input value={newSticky.name} onChange={e => setNewSticky(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder={t('explorer.activityName')} />
              </div>
              <input value={newSticky.desc} onChange={e => setNewSticky(p => ({ ...p, desc: e.target.value }))} style={inputStyle} placeholder={t('explorer.descPlaceholder')} />
              <div className="flex gap-2">
                <button onClick={() => setShowAddSticky(false)} className="press flex-1" style={{ background: 'var(--surface)', color: 'var(--text-soft)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '11px 0', fontSize: 14, fontWeight: 700 }}>{t('modal.cancel')}</button>
                <button onClick={saveSticky} disabled={!newSticky.name.trim()} className="press flex-1" style={{ background: newSticky.name.trim() ? 'var(--primary)' : 'var(--border)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '11px 0', fontSize: 14, fontWeight: 700, boxShadow: newSticky.name.trim() ? 'var(--shadow-btn)' : 'none' }}>{t('modal.save')}</button>
              </div>
            </div>
          )}
        </section>
      )}

      {viewMode === 'cards' && stickyItems.length === 0 && catFilter !== 'sticky' && typeFilter === 'all' && locationFilter === 'all' && (
        <button onClick={() => setShowAddSticky(true)} className="press self-start" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>⭐ {t('explorer.addYours')}</button>
      )}

      {/* all other activities */}
      {viewMode === 'cards' && regularItems.length > 0 && (
        <section>
          {(showSourced || stickyItems.length > 0) && typeFilter === 'all' && catFilter === 'all' && (
            <Eyebrow style={{ marginBottom: 10 }}>{t('explorer.allYear')}</Eyebrow>
          )}
          <div className={cardGridCls}>
            {regularItems.map(act => (
              <ActivityCard key={act.id} act={act} wxCat={wxCat}
                onAddSat={() => addToDay(act, planSatStr)} onAddSun={() => addToDay(act, planSunStr)}
                addedSat={isAdded(act.id, planSatStr)} addedSun={isAdded(act.id, planSunStr)}
                onHide={() => hideActivity(act.id)} />
            ))}
          </div>
        </section>
      )}

      {/* empty state */}
      {viewMode === 'cards' && filtered.length === 0 && (
        <div className="text-center" style={{ padding: '48px 12px', color: 'var(--text-faint)' }}>
          <Icon name="search" size={40} sw={1.7} style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)' }}>{t('explorer.noResults')}</div>
          <button onClick={() => { setCatFilter('all'); setLocationFilter('all'); setTypeFilter('all'); setDepthFilter('all'); }} className="press" style={{ marginTop: 12, fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-soft)', border: 'none', borderRadius: 'var(--r-pill)', padding: '9px 16px', cursor: 'pointer' }}>
            {t('explorer.clearFilters')}
          </button>
        </div>
      )}

      {/* hidden activities */}
      {hiddenItems.length > 0 && (
        <section style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowHidden(v => !v)} className="flex items-center gap-2 w-full" style={{ fontSize: 12, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            <span>👁 {hiddenItems.length} hidden {hiddenItems.length === 1 ? 'activity' : 'activities'}</span>
            <span className="ml-auto">{showHidden ? '▲' : '▼'}</span>
          </button>
          {showHidden && (
            <div className="flex flex-col" style={{ gap: 8, marginTop: 8 }}>
              {hiddenItems.map(act => (
                <div key={act.id} className="flex items-center justify-between gap-3" style={{ background: 'var(--soft-ice)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-none" style={{ fontSize: 16 }}>{act.emoji}</span>
                    <div className="min-w-0">
                      <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-soft)' }}>{act.name}</div>
                      {act.dateShort && <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{act.dateShort}</div>}
                    </div>
                  </div>
                  <button onClick={() => unhideActivity(act.id)} className="press flex-none" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--primary)', border: '1.5px solid var(--border-strong)', background: 'var(--surface)', borderRadius: 'var(--r-pill)', padding: '6px 12px' }}>
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
