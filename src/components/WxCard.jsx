import { wxInfo } from '../utils/weather.js';
import { fmtLong } from '../utils/date.js';

export default function WxCard({ label, data, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse">
        <div className="h-3 bg-stone-100 rounded w-16 mb-2" />
        <div className="h-8 bg-stone-100 rounded w-20 mb-2" />
        <div className="h-3 bg-stone-100 rounded w-24" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200 text-center text-stone-400 text-sm">
        🌡️<br />Unavailable
      </div>
    );
  }

  const wx = wxInfo(data.code);
  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm ${wx.cat === 'rainy' ? 'border-blue-200' : 'border-stone-200'}`}>
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs text-stone-500 mb-2">{fmtLong(data.date)}</div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-3xl">{wx.emoji}</span>
        <div>
          <div className="text-xl font-bold text-stone-800">{data.maxT}°</div>
          <div className="text-xs text-stone-400">min {data.minT}°</div>
        </div>
      </div>
      <div className="text-xs font-semibold text-stone-600">{wx.label}</div>
      {data.precip > 0 && (
        <div className="text-xs text-blue-500 mt-0.5">🌧 {data.precip}mm</div>
      )}
    </div>
  );
}
