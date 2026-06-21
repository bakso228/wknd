import { useLang } from '../contexts/LangContext.jsx';
import { catGrad } from '../data/styles.js';
import Icon from './ui/Icon.jsx';

export default function ItineraryCard({ itin, stops, onAddSat, onAddSun, addedSat, addedSun }) {
  const { lang } = useLang();
  const satWord = lang === 'de' ? 'Sa' : 'Sat';
  const sunWord = lang === 'de' ? 'So' : 'Sun';

  const addBtn = (added, label, onClick) => (
    <button
      onClick={onClick}
      className="press"
      style={{
        fontSize: 12, fontWeight: 700, padding: '6px 13px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
        background: added ? 'var(--green-deep)' : 'var(--surface)',
        color: added ? '#fff' : 'var(--text-soft)',
        border: `1.5px solid ${added ? 'var(--green-deep)' : 'var(--border-strong)'}`,
      }}
    >
      {added ? `✓ ${label}` : label}
    </button>
  );

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {/* route strip */}
      <div className="flex items-center justify-between gap-2" style={{ background: 'var(--primary-soft)', padding: '7px 14px' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--primary-deep)' }}>
          Route · {itin.duration}
        </span>
        {itin.area === 'south' && (
          <span className="flex items-center gap-1 flex-none" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--primary-deep)' }}>
            <Icon name="pin" size={12} /> Nah
          </span>
        )}
      </div>

      <div style={{ padding: '13px 14px 14px' }}>
        <div className="flex gap-3 items-start">
          <div className="flex-none flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 14, fontSize: 24, background: catGrad(itin.cat || 'outdoor') }}>{itin.emoji}</div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, color: 'var(--text)' }}>{itin.name}</div>
            {itin.desc && <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.45, marginTop: 3 }}>{itin.desc}</div>}
          </div>
        </div>

        {/* stop chips */}
        <div className="flex flex-wrap items-center" style={{ gap: 4, marginTop: 11 }}>
          {stops.map((s, i) => (
            <span key={s?.id || i} className="inline-flex items-center" style={{ gap: 4 }}>
              {i > 0 && <span style={{ color: 'var(--border-strong)', fontSize: 10 }}>→</span>}
              <span className="inline-flex items-center gap-1" style={{ fontSize: 10.5, fontWeight: 600, background: 'var(--soft-ice)', borderRadius: 'var(--r-pill)', padding: '4px 9px', color: 'var(--text-soft)' }}>
                <span>{s?.emoji || '📍'}</span>
                <span>{s?.name || 'Stop'}</span>
                {s?._stay && <span style={{ color: 'var(--text-faint)' }}>· {s._stay}</span>}
              </span>
            </span>
          ))}
        </div>

        <div className="flex justify-end" style={{ gap: 7, marginTop: 13 }}>
          {addBtn(addedSat, satWord, onAddSat)}
          {addBtn(addedSun, sunWord, onAddSun)}
        </div>
      </div>
    </div>
  );
}
