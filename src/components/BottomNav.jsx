import { useLang } from '../contexts/LangContext.jsx';

const TAB_IDS = ['plan', 'explorer', 'calendar', 'todos', 'sources'];
const TAB_ICONS = { plan: '🗓', explorer: '🔍', calendar: '📅', todos: '✅', sources: '📍' };

export default function BottomNav({ tab, setTab, planCount, todoCount }) {
  const { t } = useLang();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 max-w-2xl mx-auto">
        {TAB_IDS.map(id => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors min-h-[56px] ${
              tab === id ? 'text-amber-500' : 'text-stone-400 active:text-stone-600'
            }`}
          >
            {tab === id && (
              <span className="absolute top-0 inset-x-6 h-0.5 bg-amber-400 rounded-full" />
            )}
            <span className="text-xl leading-none">{TAB_ICONS[id]}</span>
            <span className="text-[10px] font-semibold leading-none">{t(`nav.${id}`)}</span>
            {id === 'plan' && planCount > 0 && (
              <span className="absolute top-1.5 right-3 bg-amber-400 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[16px] text-center leading-4">
                {planCount}
              </span>
            )}
            {id === 'todos' && todoCount > 0 && (
              <span className="absolute top-1.5 right-3 bg-sky-400 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[16px] text-center leading-4">
                {todoCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
