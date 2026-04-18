import { useState } from 'react';
import { useLang } from '../contexts/LangContext.jsx';
import { TYPE_PILL } from '../data/styles.js';
import { fmtLong } from '../utils/date.js';

const EMOJIS = ['📌','🎉','🎂','🏖️','🎭','🚗','✈️','🏠','⚽','🎸','🍕','👨‍👩‍👧‍👦','❤️','🌟','🎈','🌳','🎄','🏃','🎓'];
const TYPE_KEYS = ['personal','festival','outdoors','food','culture','holiday'];

export default function AddEventModal({ date, onSave, onClose, initialEvent }) {
  const { t, lang } = useLang();

  const pad = n => String(n).padStart(2, '0');
  const startStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const [name,    setName]    = useState(initialEvent?.name  ?? '');
  const [emoji,   setEmoji]   = useState(initialEvent?.emoji ?? '📌');
  const [type,    setType]    = useState(initialEvent?.type  ?? 'personal');
  const [notes,   setNotes]   = useState(initialEvent?.notes ?? '');
  const [endDate, setEndDate] = useState(initialEvent?.endDate ?? startStr);

  const isMultiDay = endDate && endDate > startStr;
  const isEditing  = !!initialEvent;

  const save = () => {
    if (!name.trim()) return;
    const id = initialEvent?.id ?? Date.now().toString();
    onSave({ id, startDate: startStr, date: startStr, endDate: endDate || startStr, name: name.trim(), emoji, type, notes });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4 relative max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-stone-200 rounded-full" />
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-stone-800 text-lg">{isEditing ? t('modal.editTitle') : t('modal.title')}</h3>
          <button onClick={onClose} className="text-stone-400 text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">{t('modal.from')}</div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700">{fmtLong(date, lang)}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">
              {t('modal.until')} {isMultiDay && <span className="text-violet-500 normal-case font-normal">{t('modal.multiDay')}</span>}
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

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('modal.placeholder')}
          className="w-full border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400"
        />

        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setEmoji(em)}
              className={`text-lg w-10 h-10 rounded-xl ${emoji === em ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-stone-50 hover:bg-stone-100'}`}>
              {em}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_KEYS.map(tk => (
            <button key={tk} onClick={() => setType(tk)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${type === tk ? (TYPE_PILL[tk] + ' ring-2 ring-offset-1 ring-amber-400') : 'bg-stone-50 border-stone-200 text-stone-600'}`}>
              {t(`modal.types.${tk}`)}
            </button>
          ))}
        </div>

        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t('modal.notePlaceholder')}
          className="w-full border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400"
        />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-stone-100 text-stone-600 rounded-xl py-3 text-sm font-semibold min-h-[48px]">{t('modal.cancel')}</button>
          <button onClick={save} disabled={!name.trim()} className="flex-1 bg-amber-400 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl py-3 text-sm font-bold min-h-[48px]">{t('modal.save')}</button>
        </div>
      </div>
    </div>
  );
}
