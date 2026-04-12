import { useState } from 'react';
import { TYPE_PILL } from '../data/styles.js';
import { fmtLong } from '../utils/date.js';

const EMOJIS = ['🎉','🎂','🏖️','🎭','🚗','✈️','🏠','⚽','🎸','🍕','👨‍👩‍👧‍👦','❤️','🌟','🎈','🌳','🎄','🏃','🎓'];
const TYPES  = ['personal','festival','outdoors','food','culture','holiday'];

export default function AddEventModal({ date, onSave, onClose }) {
  const [name,    setName]    = useState('');
  const [emoji,   setEmoji]   = useState('🎉');
  const [type,    setType]    = useState('personal');
  const [notes,   setNotes]   = useState('');

  const startStr = date.toISOString().split('T')[0];
  const [endDate, setEndDate] = useState(startStr);
  const isMultiDay = endDate && endDate > startStr;

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now().toString(),
      startDate: startStr,
      date: startStr,
      endDate: endDate || startStr,
      name: name.trim(),
      emoji,
      type,
      notes,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet slides up from bottom on mobile, centered on desktop */}
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        <div className="flex justify-between items-center">
          {/* drag handle (mobile only) */}
          <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-stone-200 rounded-full" />
          <h3 className="font-bold text-stone-800 text-lg">Neues Ereignis</h3>
          <button onClick={onClose} className="text-stone-400 text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* date range */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">Von</div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700">{fmtLong(date)}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              Bis {isMultiDay && <span className="text-violet-500 normal-case font-normal">· mehrtägig</span>}
            </div>
            <input
              type="date"
              value={endDate}
              min={startStr}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* name */}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Was passiert?"
          className="w-full border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400"
        />

        {/* emoji picker */}
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map(em => (
            <button
              key={em}
              onClick={() => setEmoji(em)}
              className={`text-lg w-10 h-10 rounded-xl ${emoji === em ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-stone-50 hover:bg-stone-100'}`}
            >
              {em}
            </button>
          ))}
        </div>

        {/* type pills */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${type === t ? (TYPE_PILL[t] + ' ring-2 ring-offset-1 ring-amber-400') : 'bg-stone-50 border-stone-200 text-stone-600'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* notes */}
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notiz (optional)"
          className="w-full border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400"
        />

        {/* actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-stone-100 text-stone-600 rounded-xl py-3 text-sm font-semibold min-h-[48px]">
            Abbrechen
          </button>
          <button
            onClick={save}
            disabled={!name.trim()}
            className="flex-1 bg-amber-400 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl py-3 text-sm font-bold min-h-[48px]"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
