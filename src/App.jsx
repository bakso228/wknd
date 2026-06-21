import { useState, useRef, useCallback } from 'react';
import { LangProvider, useLang } from './contexts/LangContext.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import Toast from './components/ui/Toast.jsx';
import PlanTab from './components/tabs/PlanTab.jsx';
import ExplorerTab from './components/tabs/ExplorerTab.jsx';
import CalendarTab from './components/tabs/CalendarTab.jsx';
import TodoTab from './components/tabs/TodoTab.jsx';
import FitnessTab from './components/tabs/FitnessTab.jsx';
import { useWeather } from './hooks/useWeather.js';
import { useSupabaseStorage } from './hooks/useSupabaseStorage.js';
import { SEED_WORKOUTS, SEED_BODY } from './data/fitness.js';

function AppInner() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState('plan');
  const { weather, loading: wxLoading, error: wxError } = useWeather();
  const [weekendPlan,       setWeekendPlan]       = useSupabaseStorage('weekend_plan', {});
  const [userEvents,        setUserEvents]        = useSupabaseStorage('user_events', []);
  const [stickyActivities,  setStickyActivities]  = useSupabaseStorage('sticky_activities', []);
  const [todos,             setTodos]             = useSupabaseStorage('todos', []);
  const [hiddenActivities,  setHiddenActivities]  = useSupabaseStorage('hidden_activities', []);
  const [workouts,          setWorkouts]          = useSupabaseStorage('workouts', SEED_WORKOUTS);
  const [body,              setBody]              = useSupabaseStorage('body', SEED_BODY);

  const planCount  = Object.values(weekendPlan).reduce((s, a) => s + a.length, 0);
  const todoCount  = todos.filter(t => !t.completed).length;

  // App-level toast (with Undo) — fired by Plan quick-capture / smart picks and Explore adds.
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((msg, onUndo) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, onUndo, undoLabel: lang === 'de' ? 'Rückgängig' : 'Undo' });
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, [lang]);
  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      <Header weather={weather} />

      <main className="max-w-2xl mx-auto px-[18px] py-[18px] pb-nav">
        {tab === 'plan' && (
          <PlanTab
            weather={weather}
            weekendPlan={weekendPlan}
            setWeekendPlan={setWeekendPlan}
            userEvents={userEvents}
            setUserEvents={setUserEvents}
            todos={todos}
            setTodos={setTodos}
            onGoExplorer={() => setTab('explorer')}
            showToast={showToast}
          />
        )}
        {tab === 'explorer' && (
          <ExplorerTab
            weather={weather}
            weekendPlan={weekendPlan}
            setWeekendPlan={setWeekendPlan}
            stickyActivities={stickyActivities}
            setStickyActivities={setStickyActivities}
            hiddenActivities={hiddenActivities}
            setHiddenActivities={setHiddenActivities}
            showToast={showToast}
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
        {tab === 'fitness' && (
          <FitnessTab
            workouts={workouts}
            setWorkouts={setWorkouts}
            body={body}
            setBody={setBody}
            showToast={showToast}
          />
        )}
      </main>

      <Toast toast={toast} onUndo={() => { if (toast?.onUndo) toast.onUndo(); dismissToast(); }} />
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
