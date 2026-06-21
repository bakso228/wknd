import familyPhoto from '../assets/family.jpg';
import { useLang } from '../contexts/LangContext.jsx';
import { wxInfo } from '../utils/weather.js';

export default function Header({ weather }) {
  const { t, lang, toggleLang } = useLang();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-2xl mx-auto px-[18px] py-2 pb-3 flex items-center justify-between gap-2.5">

        {/* Left: family avatar + title */}
        <div className="flex items-center gap-[11px] min-w-0">
          <div
            className="w-[42px] h-[42px] rounded-full flex-none overflow-hidden"
            style={{ background: 'linear-gradient(135deg,var(--pass-a),var(--pass-b))' }}
          >
            <img src={familyPhoto} alt="Familie Scheybani" className="w-full h-full object-cover object-top" />
          </div>
          <div className="min-w-0">
            <div
              className="font-brand leading-tight"
              style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}
            >
              Wochenende
            </div>
            <div
              className="truncate"
              style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)' }}
            >
              {t('header.subtitle')}
            </div>
          </div>
        </div>

        {/* Right: weather mini-pill + lang toggle */}
        <div className="flex items-center gap-2 flex-none">
          {weather && (weather.sat || weather.sun) && (
            <div
              className="text-right leading-[1.4]"
              style={{ background: 'var(--soft-ice)', borderRadius: 'var(--r-sm)', padding: '5px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-soft)' }}
            >
              {weather.sat && <div className="whitespace-nowrap">{wxInfo(weather.sat.code).emoji} {t('common.sat')} {weather.sat.maxT}°</div>}
              {weather.sun && <div className="whitespace-nowrap">{wxInfo(weather.sun.code).emoji} {t('common.sun')} {weather.sun.maxT}°</div>}
            </div>
          )}
          <button
            onClick={toggleLang}
            className="press"
            style={{
              fontSize: 12, fontWeight: 700, padding: '8px 10px', minHeight: 38,
              borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border-strong)',
              background: 'var(--surface)', color: 'var(--text-soft)', cursor: 'pointer',
            }}
            title={lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </div>
    </header>
  );
}
