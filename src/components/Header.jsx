import { wxInfo } from '../utils/weather.js';

export default function Header({ weather }) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">🌞</span>
          <div>
            <div className="font-extrabold text-stone-800 leading-tight text-base">Wochenende</div>
            <div className="text-[10px] text-stone-400 font-medium">Family Planner · Oberhaching / München</div>
          </div>
        </div>

        {weather && (
          <div className="text-right text-xs text-stone-500 bg-stone-50 rounded-xl px-3 py-1.5 border border-stone-200">
            <div className="font-medium">{wxInfo(weather.sat.code).emoji} Sa {weather.sat.maxT}°</div>
            <div className="font-medium">{wxInfo(weather.sun.code).emoji} So {weather.sun.maxT}°</div>
          </div>
        )}
      </div>
    </header>
  );
}
