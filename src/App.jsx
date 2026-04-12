import { useState } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import PlanTab from './components/tabs/PlanTab.jsx';
import ExplorerTab from './components/tabs/ExplorerTab.jsx';
import CalendarTab from './components/tabs/CalendarTab.jsx';
import SourcesTab from './components/tabs/SourcesTab.jsx';
import { useWeather } from './hooks/useWeather.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App() {
  const [tab, setTab] = useState('plan');
  const { weather, loading: wxLoading, error: wxError } = useWeather();
  const [weekendPlan,       setWeekendPlan]       = useState({ sat: [], sun: [] });
  const [userEvents,        setUserEvents]        = useLocalStorage('wochenende_events', []);
  const [stickyActivities,  setStickyActivities]  = useLocalStorage('wochenende_stickies', []);

  const planCount = (weekendPlan.sat || []).length + (weekendPlan.sun || []).length;

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
          />
        )}
        {tab === 'sources' && <SourcesTab />}
      </main>

      <BottomNav tab={tab} setTab={setTab} planCount={planCount} />
    </div>
  );
}
