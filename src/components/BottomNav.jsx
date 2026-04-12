const TABS = [
  { id: 'plan',     label: 'Plan',    icon: '🗓'  },
  { id: 'explorer', label: 'Explore', icon: '🔍'  },
  { id: 'calendar', label: 'Calendar',icon: '📅'  },
  { id: 'sources',  label: 'Sources', icon: '📍'  },
];

export default function BottomNav({ tab, setTab, planCount }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-4 max-w-2xl mx-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors min-h-[56px] ${
              tab === t.id ? 'text-amber-500' : 'text-stone-400 active:text-stone-600'
            }`}
          >
            {/* active pill indicator */}
            {tab === t.id && (
              <span className="absolute top-0 inset-x-6 h-0.5 bg-amber-400 rounded-full" />
            )}
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[10px] font-semibold leading-none">{t.label}</span>
            {/* plan count badge */}
            {t.id === 'plan' && planCount > 0 && (
              <span className="absolute top-1.5 right-5 bg-amber-400 text-white text-[9px] font-bold px-1.5 rounded-full min-w-[16px] text-center leading-4">
                {planCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
