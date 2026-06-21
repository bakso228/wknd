import { useLang } from '../contexts/LangContext.jsx';
import { catGrad } from '../data/styles.js';
import { distanceFromHome, formatDistance } from '../utils/distance.js';
import Icon from './ui/Icon.jsx';

const TAG = {
  green:   { background: 'var(--green-soft)',   color: 'var(--green-deep)' },
  neutral: { background: 'var(--soft-ice)',     color: 'var(--text-soft)' },
  blue:    { background: 'var(--primary-soft)', color: 'var(--primary-deep)' },
};

function Tag({ tone = 'neutral', children }) {
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 'var(--r-pill)', ...TAG[tone] }}>
      {children}
    </span>
  );
}

export default function ActivityCard({ act, onAddSat, onAddSun, addedSat, addedSun, wxCat, onHide }) {
  const { t, lang } = useLang();
  const isSourced    = act.eventType === 'sourced';
  const weatherMatch = act.weather.includes('any') || act.weather.includes(wxCat);
  const distStr      = formatDistance(distanceFromHome(act));
  const isDayTrip    = act.location === 'day-trip';

  const satWord = lang === 'de' ? 'Sa' : 'Sat';
  const sunWord = lang === 'de' ? 'So' : 'Sun';

  const addBtn = (added, label, onClick) => (
    <button
      onClick={onClick}
      className="press"
      style={{
        fontSize: 12, fontWeight: 700, padding: '7px 15px', borderRadius: 'var(--r-pill)', cursor: 'pointer',
        background: added ? 'var(--green-deep)' : 'var(--surface)',
        color: added ? '#fff' : 'var(--text-soft)',
        border: `1.5px solid ${added ? 'var(--green-deep)' : 'var(--border-strong)'}`,
      }}
    >
      {added ? `✓ ${label}` : label}
    </button>
  );

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }} className="flex flex-col">

      {/* sourced top strip */}
      {isSourced && (
        <div className="flex items-center justify-between gap-2" style={{ background: 'var(--coral-soft)', padding: '7px 14px' }}>
          <span className="truncate" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--coral-deep)' }}>{act.source}</span>
          <span className="flex-none whitespace-nowrap" style={{ fontSize: 11, fontWeight: 700, color: 'var(--coral-deep)' }}>{act.dateShort}</span>
        </div>
      )}

      <div className="flex flex-col flex-1" style={{ padding: '13px 14px 14px' }}>
        {/* emoji + title + desc */}
        <div className="flex gap-3 items-start">
          <div className="flex-none flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 14, fontSize: 24, background: catGrad(act.cat) }}>{act.emoji}</div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, color: 'var(--text)' }}>{act.name}</div>
            {act.desc && <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.45, marginTop: 3 }}>{act.desc}</div>}
          </div>
        </div>

        {/* highlights */}
        {isSourced && act.highlights && (
          <div style={{ marginTop: 10, background: 'var(--primary-soft)', borderRadius: 'var(--r-sm)', padding: '8px 10px', fontSize: 11, color: 'var(--primary-deep)', lineHeight: 1.4 }}>
            {act.highlights}
          </div>
        )}

        {/* venue */}
        {isSourced && act.venue && (
          <div className="flex items-center gap-[5px]" style={{ marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
            <Icon name="pin" size={13} className="flex-none" />
            <span className="truncate">{act.venue}</span>
          </div>
        )}

        {/* tags */}
        <div className="flex flex-wrap items-center" style={{ gap: 6, marginTop: 11 }}>
          {!isSourced && (
            weatherMatch
              ? <Tag tone="green">{t('card.goodFit')}</Tag>
              : <Tag tone="neutral">{t('card.notIdeal')}</Tag>
          )}
          <Tag tone={isDayTrip ? 'blue' : 'neutral'}>{isDayTrip ? t('card.dayTrip') : t('card.inMunich')}</Tag>
          {act.duration && (
            <Tag tone="neutral"><Icon name="clock" size={12} sw={2} />{act.duration}</Tag>
          )}
          {act.age && <Tag tone="neutral">👶 {act.age}</Tag>}
          {distStr && <Tag tone="neutral">📍 {distStr}</Tag>}
        </div>

        {/* add buttons */}
        <div className="flex justify-end" style={{ gap: 7, marginTop: 13 }}>
          {addBtn(addedSat, satWord, onAddSat)}
          {addBtn(addedSun, sunWord, onAddSun)}
        </div>

        {/* footer: website + hide */}
        {(act.url || onHide) && (
          <div className="flex items-center justify-between" style={{ marginTop: 11 }}>
            {act.url
              ? <a href={act.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--primary)' }}>{t('card.openWebsite')}</a>
              : <span />}
            {onHide && (
              <button onClick={onHide} className="press" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
                hide
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
