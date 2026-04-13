import { useState } from 'react';
import { LangProvider } from './contexts/LangContext.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import PlanTab from './components/tabs/PlanTab.jsx';
import ExplorerTab from './components/tabs/ExplorerTab.jsx';
import CalendarTab from './components/tabs/CalendarTab.jsx';
import TodoTab from './components/tabs/TodoTab.jsx';
import { useWeather } from './hooks/useWeather.js';
import { useSupabaseStorage } from './hooks/useSupabaseStorage.js';

function AppInner() {
  const [tab, setTab] = useState('plan');
  const { weather, loading: wxLoading, error: wxError } = useWeather();
  const [weekendPlan,      setWeekendPlan]      = useSupabaseStorage('weekend_plan', {});
  const [userEvents,       setUserEvents]       = useSupabaseStorage('user_events', []);
  const [stickyActivities, setStickyActivities] = useSupabaseStorage('sticky_activities', []);
  const [todos,            setTodos]            = useSupabaseStorage('todos', []);

  const planCount  = Object.values(weekendPlan).reduce((s, a) => s + a.length, 0);
  const todoCount  = todos.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header weather={weather} />

      <main className="max-w-2xl mx-auto px-4 py-4 pb-nav">
        {tab === 'plan' && (
          <PlanTab
            weather={weather}
            wxLoading={wxLoading}
            wxError={wxError}
            weekendPlan={weekendPlan}
            setWeekendPlan={setWeekendPlan}
            userEvents={userEvents}
            onGoExplorer={() => setTab('explorer')}
          />
        )}
        {tab === 'explorer' && (
          <ExplorerTab
            weather={weather}
            weekendPlan={weekendPlan}
            setWeekendPlan={setWeekendPlan}
            stickyActivities={stickyActivities}
            setStickyActivities={setStickyActivities}
          />
        )}
        {tab === 'calendar' && (
          <CalendarTab
            userEvents={userEvents}
            setUserEvents={setUserEvents}
            weekendPlan={weekendPlan}
            todos={todos}
          />
        )}
        {tab === 'todos' && (
          <TodoTab todos={todos} setTodos={setTodos} />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} planCount={planCount} todoCount={todoCount} />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
