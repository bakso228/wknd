import familyPhoto from '../assets/family.jpg';
import { useLang } from '../contexts/LangContext.jsx';
import { wxInfo } from '../utils/weather.js';

export default function Header({ weather }) {
  const { t, lang, toggleLang } = useLang();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">

        {/* Left: photo + title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={familyPhoto}
            alt="Familie Scheybani"
            className="w-9 h-9 rounded-full object-cover object-top border-2 border-amber-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-extrabold text-stone-800 leading-tight text-base">Wochenende</div>
            <div className="text-[10px] text-stone-400 font-medium truncate">{t('header.subtitle')}</div>
          </div>
        </div>

        {/* Right: weather + lang toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {weather && (
            <div className="text-right text-xs text-stone-500 bg-stone-50 rounded-xl px-2.5 py-1.5 border border-stone-200">
              {weather.sat && <div className="font-medium">{wxInfo(weather.sat.code).emoji} {t('common.sat')} {weather.sat.maxT}°</div>}
              {weather.sun && <div className="font-medium">{wxInfo(weather.sun.code).emoji} {t('common.sun')} {weather.sun.maxT}°</div>}
            </div>
          )}
          <button
            onClick={toggleLang}
            className="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 hover:border-amber-300 hover:text-amber-700 transition-colors min-h-[36px] min-w-[32px]"
            title={lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          >
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>
      </div>
    </header>
  );
}
