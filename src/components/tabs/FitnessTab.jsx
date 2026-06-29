import { useState } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';
import { toLocalDateStr } from '../../utils/date.js';
import { PEOPLE, PERSON, BODY_METRICS } from '../../data/fitness.js';
import Icon from '../ui/Icon.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';

const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };

// The workout challenge began on this date — earlier days are inactive/greyed out.
const CHALLENGE_START = '2026-06-15';

export default function FitnessTab({ workouts, setWorkouts, body, setBody, showToast }) {
  const { t, lang } = useLang();
  const locale = lang === 'de' ? 'de-DE' : 'en-US';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateStr(today);

  const [view,       setView]       = useState('workouts');
  const [monthY,     setMonthY]     = useState(today.getFullYear());
  const [monthM,     setMonthM]     = useState(today.getMonth());
  const [person,     setPerson]     = useState('Navid');
  const [measOpen,   setMeasOpen]   = useState(false);
  const blankMeas = { date: '', w: '', bmi: '', fat: '', mus: '', kal: '', vis: '' };
  const [meas,       setMeas]       = useState(blankMeas);

  // ---- workout mutations ----
  const toggleWorkout = (p, ds) => setWorkouts(prev => {
    const cur = prev[p] || [];
    const next = cur.includes(ds) ? cur.filter(d => d !== ds) : [...cur, ds];
    return { ...prev, [p]: next };
  });

  const shiftMonth = delta => {
    let m = monthM + delta, y = monthY;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setMonthM(m); setMonthY(y);
  };

  // ---- scoreboard counts (only days from the challenge start onward) ----
  const since = arr => (arr || []).filter(ds => ds >= CHALLENGE_START);
  const inMonth = arr => since(arr).filter(ds => { const [y, m] = ds.split('-').map(Number); return y === monthY && m === monthM + 1; }).length;
  const weekStart = addDays(today, ((today.getDay() + 6) % 7) * -1);
  const inWeek = arr => since(arr).filter(ds => { const d = parseD(ds); return d >= weekStart && d <= addDays(weekStart, 6); }).length;
  const streakOf = arr => {
    const set = new Set(since(arr));
    let n = 0, d = new Date(today);
    if (!set.has(toLocalDateStr(d))) d = addDays(d, -1);
    while (set.has(toLocalDateStr(d))) { n++; d = addDays(d, -1); }
    return n;
  };

  const monthCounts = { Navid: inMonth(workouts.Navid), Diandra: inMonth(workouts.Diandra) };
  const scoreboard = PEOPLE.map(p => {
    const leads = p === 'Navid' ? monthCounts.Navid > monthCounts.Diandra : monthCounts.Diandra > monthCounts.Navid;
    return { name: p, ...PERSON[p], month: monthCounts[p], week: inWeek(workouts[p]), streak: streakOf(workouts[p]), leads };
  });

  // ---- workout month grid ----
  const monthFirst = new Date(monthY, monthM, 1);
  const dim  = new Date(monthY, monthM + 1, 0).getDate();
  const lead = (monthFirst.getDay() + 6) % 7;
  const DOW = [...Array(7)].map((_, i) => new Date(2000, 0, 3 + i).toLocaleDateString(locale, { weekday: 'short' }).replace('.', ''));
  const monthLabel = monthFirst.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  function WorkoutToggle({ on, color, label, onClick, disabled }) {
    return (
      <button onClick={disabled ? undefined : onClick} disabled={disabled} className={disabled ? 'flex items-center justify-center' : 'press flex items-center justify-center'} style={{
        width: 19, height: 19, borderRadius: '50%', padding: 0, cursor: disabled ? 'default' : 'pointer',
        fontSize: 9, fontWeight: 800,
        border: `1.5px solid ${on ? color : 'var(--border-strong)'}`,
        background: on ? color : 'transparent',
        color: on ? '#fff' : 'var(--text-faint)',
        opacity: disabled ? 0.3 : 1,
      }}>{label}</button>
    );
  }

  // ---- body ----
  const entries = [...(body[person] || [])].sort((a, b) => a.d < b.d ? -1 : 1);
  const n = entries.length;
  const last = entries[n - 1] || null;
  const prev = entries[n - 2] || null;

  const tiles = BODY_METRICS.map(mt => {
    const v = last ? last[mt.key] : null;
    const dv = (last && prev) ? +(last[mt.key] - prev[mt.key]).toFixed(1) : 0;
    let dColor = 'var(--text-faint)';
    if (dv !== 0 && mt.better !== 'none') {
      const good = mt.better === 'up' ? dv > 0 : dv < 0;
      dColor = good ? 'var(--green-deep)' : 'var(--coral-deep)';
    }
    return {
      key: mt.key, color: mt.color, label: t(`fitness.metrics.${mt.labelKey}`),
      value: v == null ? '–' : `${v}${mt.unit ? ' ' + mt.unit : ''}`,
      deltaShow: !!(last && prev) && dv !== 0, delta: (dv > 0 ? '+' : '') + dv, deltaColor: dColor,
    };
  });

  // chart geometry
  const W = 332, H = 196, padL = 22, padR = 10, padT = 10, padB = 24, YMAX = 85;
  const xAt = i => padL + (n <= 1 ? 0 : i * (W - padL - padR) / (n - 1));
  const yAt = v => (H - padB) - (v / YMAX) * (H - padB - padT);
  const series = BODY_METRICS.filter(m => m.chart).map(mt => {
    const dots = entries.map((e, i) => ({ cx: +xAt(i).toFixed(1), cy: +yAt(e[mt.key]).toFixed(1) }));
    return { label: t(`fitness.metrics.${mt.labelKey}`), color: mt.color, points: dots.map(p => `${p.cx},${p.cy}`).join(' '), dots };
  });
  const gridY = [0, 20, 40, 60, 80].map(v => ({ y: +yAt(v).toFixed(1), label: String(v) }));
  const xLabels = n ? [
    { x: +xAt(0).toFixed(1), label: parseD(entries[0].d).toLocaleDateString(locale, { month: 'short', year: '2-digit' }) },
    { x: +xAt(n - 1).toFixed(1), label: parseD(entries[n - 1].d).toLocaleDateString(locale, { month: 'short', year: '2-digit' }) },
  ] : [];

  const history = [...entries].reverse().map(e => ({
    d: e.d,
    dateLabel: parseD(e.d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: '2-digit' }),
    w: `${e.w} kg`,
    sub: `${t('fitness.fatShort')} ${e.fat}% · ${t('fitness.muscleShort')} ${e.mus}%`,
  }));

  const setMeasField = (k, v) => setMeas(m => ({ ...m, [k]: v }));
  const openMeas = () => setMeasOpen(o => { if (!o && !meas.date) setMeas(m => ({ ...m, date: todayStr })); return !o; });
  const saveMeas = () => {
    if (!meas.date || !meas.w) return;
    const entry = { d: meas.date, w: +meas.w, bmi: +meas.bmi || 0, fat: +meas.fat || 0, mus: +meas.mus || 0, kal: +meas.kal || 0, vis: +meas.vis || 0 };
    setBody(prev => ({ ...prev, [person]: [...(prev[person] || []), entry].sort((a, b) => a.d < b.d ? -1 : 1) }));
    setMeasOpen(false); setMeas(blankMeas);
    showToast?.(t('fitness.saved'), null);
  };
  const delMeas = d => setBody(prev => ({ ...prev, [person]: (prev[person] || []).filter(e => e.d !== d) }));

  const MEAS_FIELDS = [
    { k: 'date', label: t('fitness.fields.date'),     type: 'date' },
    { k: 'w',    label: t('fitness.fields.weight'),   type: 'number' },
    { k: 'bmi',  label: t('fitness.fields.bmi'),      type: 'number' },
    { k: 'fat',  label: t('fitness.fields.fat'),      type: 'number' },
    { k: 'mus',  label: t('fitness.fields.muscle'),   type: 'number' },
    { k: 'kal',  label: t('fitness.fields.kal'),      type: 'number' },
    { k: 'vis',  label: t('fitness.fields.visceral'), type: 'number' },
  ];

  const circleBtn = onClick => ({ onClick, className: 'press flex items-center justify-center flex-none', style: { width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--soft-ice)', color: 'var(--text-soft)', cursor: 'pointer' } });

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <div style={{ padding: '2px 2px 0' }}>
        <div className="font-brand" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{t('fitness.title')}</div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 2 }}>{t('fitness.subtitle')}</div>
      </div>

      <SegmentedControl
        options={[{ value: 'workouts', label: t('fitness.views.workouts') }, { value: 'body', label: t('fitness.views.body') }]}
        value={view}
        onChange={setView}
      />

      {/* ===================== WORKOUTS ===================== */}
      {view === 'workouts' && (
        <>
          {/* scoreboard */}
          <div className="flex" style={{ gap: 10 }}>
            {scoreboard.map(p => (
              <div key={p.name} className="flex-1" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 13, border: `2px solid ${p.leads ? p.color : 'transparent'}` }}>
                <div className="flex items-center gap-[7px]">
                  <div className="flex-none rounded-full" style={{ width: 10, height: 10, background: p.color }} />
                  <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)' }}>{p.name}</span>
                  {p.leads && <span className="ml-auto" style={{ fontSize: 14 }}>🏆</span>}
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: p.deep, marginTop: 6, lineHeight: 1 }}>{p.month}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-faint)', marginTop: 2 }}>{t('fitness.thisMonth')}</div>
                <div className="flex" style={{ gap: 14, marginTop: 11 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{p.week}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('fitness.thisWeek')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{p.streak}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('fitness.streak')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* month grid */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <div className="flex items-center justify-between" style={{ padding: '13px 14px 10px' }}>
              <button {...circleBtn(() => shiftMonth(-1))}><Icon name="chevronLeft" size={17} sw={2.2} /></button>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{monthLabel}</div>
              <button {...circleBtn(() => shiftMonth(1))}><Icon name="chevronRight" size={17} sw={2.2} /></button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(7,1fr)', padding: '0 6px' }}>
              {DOW.map(d => <div key={d} className="text-center" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-faint)', padding: '4px 0 6px' }}>{d}</div>)}
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(7,1fr)', padding: '0 6px 12px' }}>
              {Array.from({ length: lead }).map((_, i) => <div key={'e' + i} style={{ height: 52 }} />)}
              {Array.from({ length: dim }).map((_, i) => {
                const dnum = i + 1;
                const ds = toLocalDateStr(new Date(monthY, monthM, dnum));
                const isToday = ds === todayStr;
                const locked = ds < CHALLENGE_START;
                const navOn = !locked && (workouts.Navid || []).includes(ds);
                const diaOn = !locked && (workouts.Diandra || []).includes(ds);
                return (
                  <div key={dnum} className="flex flex-col items-center justify-center" style={{ height: 52, gap: 4, opacity: locked ? 0.4 : 1 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: isToday ? 'var(--primary)' : locked ? 'var(--text-faint)' : 'var(--text)' }}>{dnum}</div>
                    <div className="flex" style={{ gap: 3 }}>
                      <WorkoutToggle on={navOn} color={PERSON.Navid.color} label="N" disabled={locked} onClick={() => toggleWorkout('Navid', ds)} />
                      <WorkoutToggle on={diaOn} color={PERSON.Diandra.color} label="D" disabled={locked} onClick={() => toggleWorkout('Diandra', ds)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* legend */}
          <div className="flex items-center" style={{ gap: 14, padding: '0 4px' }}>
            {PEOPLE.map(p => (
              <div key={p} className="flex items-center gap-[6px]" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-soft)' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: PERSON[p].color }} />{p}
              </div>
            ))}
            <span className="ml-auto" style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-faint)' }}>{t('fitness.tapHint')}</span>
          </div>
        </>
      )}

      {/* ===================== KÖRPER / BODY ===================== */}
      {view === 'body' && (
        <>
          <SegmentedControl
            options={PEOPLE.map(p => ({ value: p, label: p }))}
            value={person}
            onChange={setPerson}
          />

          {n > 0 ? (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', margin: '4px 2px 0' }}>{t('fitness.latest')}</div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
                {tiles.map(m => (
                  <div key={m.key} style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-card)', padding: 11 }}>
                    <div className="flex items-center gap-[5px]">
                      <div className="flex-none" style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
                      <span className="truncate" style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{m.label}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginTop: 5 }}>{m.value}</div>
                    {m.deltaShow && <div style={{ fontSize: 10, fontWeight: 700, color: m.deltaColor, marginTop: 1 }}>{m.delta}</div>}
                  </div>
                ))}
              </div>

              {/* trend chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)' }}>{t('fitness.trend')}</div>
                <svg viewBox="0 0 332 196" style={{ width: '100%', height: 'auto', marginTop: 8, overflow: 'visible' }}>
                  {gridY.map(g => (
                    <g key={g.label}>
                      <line x1="22" x2="322" y1={g.y} y2={g.y} stroke="var(--mist)" strokeWidth="1" />
                      <text x="0" y={g.y} fontSize="9" fill="var(--text-faint)" dominantBaseline="middle">{g.label}</text>
                    </g>
                  ))}
                  {series.map(sr => (
                    <polyline key={sr.label} points={sr.points} fill="none" stroke={sr.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                  {series.map(sr => sr.dots.map((pt, i) => (
                    <circle key={sr.label + i} cx={pt.cx} cy={pt.cy} r="2.4" fill={sr.color} />
                  )))}
                  {xLabels.map((xl, i) => (
                    <text key={i} x={xl.x} y="194" fontSize="9" fill="var(--text-faint)" textAnchor="middle">{xl.label}</text>
                  ))}
                </svg>
                <div className="flex flex-wrap" style={{ gap: 11, marginTop: 8 }}>
                  {series.map(sr => (
                    <div key={sr.label} className="flex items-center gap-[5px] whitespace-nowrap" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-soft)' }}>
                      <div className="flex-none" style={{ width: 9, height: 9, borderRadius: '50%', background: sr.color }} />{sr.label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: '32px 16px', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t('fitness.noData')}</div>
            </div>
          )}

          {/* add measurement */}
          <button onClick={openMeas} className="press w-full flex items-center justify-center gap-[7px]" style={{ background: 'var(--primary-soft)', border: 'none', borderRadius: 'var(--r-md)', padding: 13, cursor: 'pointer', color: 'var(--primary-deep)', fontSize: 13, fontWeight: 700 }}>
            <Icon name="plus" size={16} sw={2.4} />{t('fitness.addMeasurement')}
          </button>
          {measOpen && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {MEAS_FIELDS.map(f => (
                  <label key={f.k} className="block">
                    <span className="block" style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</span>
                    <input value={meas[f.k]} onChange={e => setMeasField(f.k, e.target.value)} type={f.type} className="w-full" style={{ border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '11px 12px', fontSize: 16, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }} />
                  </label>
                ))}
              </div>
              <button onClick={saveMeas} className="press w-full" style={{ marginTop: 12, background: 'var(--primary)', border: 'none', borderRadius: 'var(--r-md)', padding: 13, cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: 'var(--shadow-btn)' }}>{t('fitness.save')}</button>
            </div>
          )}

          {/* history */}
          {n > 0 && (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', margin: '4px 2px 0' }}>{t('fitness.allMeasurements')}</div>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                {history.map(h => (
                  <div key={h.d} className="flex items-center gap-[11px]" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex-none" style={{ width: 64, fontSize: 11.5, fontWeight: 700, color: 'var(--text-faint)' }}>{h.dateLabel}</div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{h.w}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 1 }}>{h.sub}</div>
                    </div>
                    <button onClick={() => delMeas(h.d)} className="press flex-none flex items-center justify-center" style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}>
                      <Icon name="close" size={15} sw={2.2} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
