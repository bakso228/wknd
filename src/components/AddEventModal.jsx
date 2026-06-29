import { useState } from 'react';
import { useLang } from '../contexts/LangContext.jsx';
import { dotColor } from '../data/styles.js';
import Icon from './ui/Icon.jsx';

const EMOJIS = ['📌','🎉','🎂','🏖️','🎭','🚗','✈️','🏠','⚽','🎸','🍕','👨‍👩‍👧‍👦','❤️','🌟','🎈','🌳','🎄','🏃','🎓'];
const TYPE_KEYS = ['personal','festival','outdoors','food','culture','holiday'];

export default function AddEventModal({ date, onSave, onClose, initialEvent }) {
  const { t } = useLang();

  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const [name,    setName]    = useState(initialEvent?.name  ?? '');
  const [emoji,   setEmoji]   = useState(initialEvent?.emoji ?? '📌');
  const [type,    setType]    = useState(initialEvent?.type  ?? 'personal');
  const [notes,   setNotes]   = useState(initialEvent?.notes ?? '');
  const [startStr, setStartStr] = useState(initialEvent?.startDate ?? initialEvent?.date ?? dateStr);
  const [endDate, setEndDate] = useState(initialEvent?.endDate ?? dateStr);

  const isMultiDay = endDate && endDate > startStr;
  const isEditing  = !!initialEvent;

  const save = () => {
    if (!name.trim()) return;
    const id = initialEvent?.id ?? Date.now().toString();
    const end = endDate && endDate >= startStr ? endDate : startStr;
    onSave({ id, startDate: startStr, date: startStr, endDate: end, name: name.trim(), emoji, type, notes });
  };

  const inputStyle = {
    width: '100%', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)',
    padding: '13px 14px', fontSize: 16, background: 'var(--surface)', color: 'var(--text)', outline: 'none',
  };
  const eyebrow = { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 4 };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{ background: 'rgba(15,30,45,.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md relative max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ background: 'var(--surface)', borderTopLeftRadius: 'var(--r-lg)', borderTopRightRadius: 'var(--r-lg)', boxShadow: '0 -12px 48px rgba(15,30,45,.25)', padding: 22, gap: 14, paddingBottom: 'max(22px, calc(env(safe-area-inset-bottom) + 16px))' }}
      >
        <div className="sm:hidden absolute left-1/2 -translate-x-1/2" style={{ top: 8, width: 40, height: 4, background: 'var(--border-strong)', borderRadius: 999 }} />

        <div className="flex justify-between items-center" style={{ marginTop: 4 }}>
          <h3 className="font-brand" style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{isEditing ? t('modal.editTitle') : t('modal.title')}</h3>
          <button onClick={onClose} className="press flex items-center justify-center" style={{ width: 32, height: 32, border: 'none', background: 'var(--soft-ice)', color: 'var(--text-soft)', borderRadius: '50%', cursor: 'pointer' }}>
            <Icon name="close" size={16} sw={2.2} />
          </button>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <div style={eyebrow}>{t('modal.from')}</div>
            <input type="date" value={startStr} onChange={e => { const v = e.target.value; if (v) { setStartStr(v); if (endDate < v) setEndDate(v); } }} style={{ ...inputStyle, padding: '10px 12px', fontSize: 14 }} />
          </div>
          <div className="flex-1">
            <div style={eyebrow}>
              {t('modal.until')} {isMultiDay && <span style={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 600 }}>{t('modal.multiDay')}</span>}
            </div>
            <input type="date" value={endDate} min={startStr} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, padding: '10px 12px', fontSize: 14 }} />
          </div>
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder={t('modal.placeholder')} style={inputStyle} />

        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setEmoji(em)} className="press flex items-center justify-center"
              style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', fontSize: 20, cursor: 'pointer', background: emoji === em ? 'var(--primary-soft)' : 'var(--soft-ice)', border: emoji === em ? '2px solid var(--primary)' : '2px solid transparent' }}>
              {em}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {TYPE_KEYS.map(tk => {
            const active = type === tk;
            const c = dotColor(tk);
            return (
              <button key={tk} onClick={() => setType(tk)} className="press inline-flex items-center gap-[6px]"
                style={{ fontSize: 12, fontWeight: 700, padding: '0 14px', height: 36, borderRadius: 'var(--r-pill)', cursor: 'pointer', background: active ? 'var(--soft-ice)' : 'var(--surface)', color: 'var(--text-soft)', border: `1.5px solid ${active ? c : 'var(--border-strong)'}` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                {t(`modal.types.${tk}`)}
              </button>
            );
          })}
        </div>

        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('modal.notePlaceholder')} style={inputStyle} />

        <div className="flex gap-3" style={{ paddingTop: 2 }}>
          <button onClick={onClose} className="press flex-1" style={{ background: 'var(--surface)', color: 'var(--text-soft)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '13px 0', fontSize: 14, fontWeight: 700, minHeight: 48 }}>{t('modal.cancel')}</button>
          <button onClick={save} disabled={!name.trim()} className="press flex-1" style={{ background: name.trim() ? 'var(--primary)' : 'var(--border)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '13px 0', fontSize: 14, fontWeight: 700, minHeight: 48, boxShadow: name.trim() ? 'var(--shadow-btn)' : 'none' }}>{t('modal.save')}</button>
        </div>
      </div>
    </div>
  );
}
