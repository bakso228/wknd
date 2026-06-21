import { useLang } from '../contexts/LangContext.jsx';
import Icon from './ui/Icon.jsx';

const TABS = [
  { id: 'plan',     icon: 'house' },
  { id: 'explorer', icon: 'search' },
  { id: 'calendar', icon: 'calendar' },
  { id: 'todos',    icon: 'checkCircle' },
];

export default function BottomNav({ tab, setTab, planCount, todoCount }) {
  const { t } = useLang();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="flex max-w-2xl mx-auto px-1.5"
        style={{ paddingTop: 6, paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
      >
        {TABS.map(({ id, icon }) => {
          const active = tab === id;
          const badge = id === 'plan' ? planCount : id === 'todos' ? todoCount : 0;
          const badgeColor = id === 'todos' ? 'var(--coral)' : 'var(--primary)';
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="press relative flex-1 flex flex-col items-center gap-[3px] py-2"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--primary)' : 'var(--text-faint)' }}
            >
              {active && (
                <span
                  className="absolute top-0"
                  style={{ width: 26, height: 3, borderRadius: 999, background: 'var(--primary)' }}
                />
              )}
              <Icon name={icon} size={23} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>{t(`nav.${id}`)}</span>
              {badge > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 4, right: 'calc(50% - 26px)', minWidth: 16, height: 16, padding: '0 4px',
                    borderRadius: 999, background: badgeColor, color: '#fff', fontSize: 9, fontWeight: 800,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
