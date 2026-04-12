import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations.js';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('wknd_lang') || 'de');

  const toggleLang = () => {
    const next = lang === 'de' ? 'en' : 'de';
    setLang(next);
    localStorage.setItem('wknd_lang', next);
  };

  // Simple dot-path accessor: t('plan.saturday') → translations[lang].plan.saturday
  const t = (path) => {
    const keys = path.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    return val ?? path;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
