import { useState } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';
import { SOURCES, CATS_SOURCES } from '../../data/sources.js';

export default function SourcesTab() {
  const { t } = useLang();
  const [cat, setCat] = useState('all');
  const filtered = cat === 'all' ? SOURCES : SOURCES.filter(s => s.cat === cat);

  return (
    <div className="fade-in space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-800">{t('sources.title')}</h2>
        <p className="text-xs text-stone-400 mt-0.5">{t('sources.subtitle')}</p>
      </div>

      <div className="flex gap-2 scroll-x -mx-4 px-4 pb-1">
        {['all', ...Object.keys(CATS_SOURCES)].map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex-shrink-0 text-xs px-3 py-2 rounded-full font-semibold border transition-colors min-h-[36px] ${cat === c ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}>
            {t(`sources.cats.${c}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(s => (
          <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-xl p-4 border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all group block card-hover">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{s.emoji}</span>
              <div>
                <div className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{s.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
