import { useState, useMemo, useRef, useEffect } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';
import Chip from '../ui/Chip.jsx';
import Icon from '../ui/Icon.jsx';

export default function TodoTab({ todos, setTodos }) {
  const { t, lang } = useLang();
  const inputRef = useRef(null);

  const [text,        setText]        = useState('');
  const [owner,       setOwner]       = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [showDate,    setShowDate]    = useState(false);
  const [typingName,  setTypingName]  = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [ownerFilter,  setOwnerFilter]  = useState('all');

  useEffect(() => { inputRef.current?.focus(); }, []);

  const knownOwners = useMemo(() => {
    const names = todos.map(t => t.owner).filter(Boolean);
    return [...new Set(names)];
  }, [todos]);

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = {
      id: Date.now().toString(), text: trimmed, owner: owner || '', dueDate: dueDate || '',
      completed: false, createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setText('');
    setDueDate('');
    setShowDate(false);
    inputRef.current?.focus();
  };

  const toggleDone = id => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = id => setTodos(prev => prev.filter(t => t.id !== id));

  const confirmName = name => {
    const n = name.trim();
    if (n) setOwner(n);
    setTypingName(false);
    setNameInput('');
    inputRef.current?.focus();
  };

  const filtered = useMemo(() => {
    let list = [...todos];
    if (statusFilter === 'open') list = list.filter(t => !t.completed);
    if (statusFilter === 'done') list = list.filter(t => t.completed);
    if (ownerFilter !== 'all') list = list.filter(t => t.owner === ownerFilter);
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [todos, statusFilter, ownerFilter]);

  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const fmtDue = iso => new Date(iso + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const todayStr = new Date().toISOString().slice(0, 10);

  const openCount = todos.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <div style={{ padding: '2px 2px 0' }}>
        <div className="font-brand" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{t('todos.title')}</div>
        {openCount > 0 && (
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-faint)', marginTop: 2 }}>
            {openCount} {openCount === 1 ? t('todos.openOne') : t('todos.openMany')}
          </div>
        )}
      </div>

      {/* quick add */}
      <div className="flex flex-col" style={{ gap: 11, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder={t('todos.placeholder')}
            className="flex-1 min-w-0"
            style={{ border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '13px 14px', fontSize: 16, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
          />
          <button
            onClick={addTodo}
            disabled={!text.trim()}
            className="press flex-none flex items-center justify-center"
            style={{ width: 50, borderRadius: 'var(--r-md)', border: 'none', background: text.trim() ? 'var(--primary)' : 'var(--border)', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', boxShadow: text.trim() ? 'var(--shadow-btn)' : 'none' }}
          >
            <Icon name="plus" size={20} sw={2.4} />
          </button>
        </div>

        {/* owner chips */}
        <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginRight: 2 }}>{t('todos.who')}</span>
          <Chip size="sm" active={owner === ''} onClick={() => setOwner('')}>—</Chip>
          {knownOwners.map(name => (
            <Chip key={name} size="sm" active={owner === name} onClick={() => setOwner(name)}>{name}</Chip>
          ))}
          {typingName ? (
            <div className="flex gap-1 items-center">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmName(nameInput);
                  if (e.key === 'Escape') { setTypingName(false); setNameInput(''); }
                }}
                placeholder={t('todos.namePlaceholder')}
                style={{ border: '1.5px solid var(--primary)', borderRadius: 'var(--r-pill)', padding: '4px 12px', fontSize: 12, width: 96, outline: 'none' }}
              />
              <button onClick={() => confirmName(nameInput)} className="press" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✓</button>
              <button onClick={() => { setTypingName(false); setNameInput(''); }} className="press" style={{ fontSize: 13, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => setTypingName(true)}
              className="press"
              style={{ fontSize: 12, fontWeight: 600, height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)', border: '1.5px dashed var(--border-strong)', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer' }}
            >
              + {t('todos.addName')}
            </button>
          )}
        </div>

        {/* optional date */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDate(v => !v)} className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="transition-transform" style={{ transform: showDate ? 'rotate(90deg)' : 'none' }}>›</span>
            {t('todos.datePlaceholder')}
          </button>
          {showDate && (
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ border: '1.5px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '6px 10px', fontSize: 12, outline: 'none' }}
            />
          )}
          {dueDate && (
            <button onClick={() => setDueDate('')} className="press" style={{ fontSize: 12, color: 'var(--text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="flex items-center scroll-x -mx-[18px] px-[18px]" style={{ gap: 7, paddingBottom: 2 }}>
        {['open', 'done', 'all'].map(f => (
          <Chip key={f} active={statusFilter === f} onClick={() => setStatusFilter(f)}>
            {t(`todos.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
          </Chip>
        ))}
        {knownOwners.length > 0 && (
          <>
            <div className="flex-none self-center" style={{ width: 1, height: 22, background: 'var(--border-strong)', margin: '0 2px' }} />
            <Chip active={ownerFilter === 'all'} onClick={() => setOwnerFilter('all')}>{t('todos.everyone')}</Chip>
            {knownOwners.map(name => (
              <Chip key={name} active={ownerFilter === name} onClick={() => setOwnerFilter(ownerFilter === name ? 'all' : name)}>{name}</Chip>
            ))}
          </>
        )}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="text-center" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', padding: '40px 12px', color: 'var(--text-faint)' }}>
          <Icon name="checkCircle" size={34} sw={2} style={{ color: 'var(--green)', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-soft)' }}>
            {statusFilter === 'done' ? t('todos.emptyDone') : t('todos.empty')}
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          {filtered.map(todo => {
            const overdue = !todo.completed && todo.dueDate && todo.dueDate < todayStr;
            return (
              <div key={todo.id} className="flex items-start gap-3" style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => toggleDone(todo.id)}
                  className="press flex-none flex items-center justify-center"
                  style={{ marginTop: 1, width: 24, height: 24, borderRadius: '50%', border: `2px solid ${todo.completed ? 'var(--green-deep)' : 'var(--border-strong)'}`, background: todo.completed ? 'var(--green-deep)' : 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  {todo.completed && <Icon name="check" size={13} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: todo.completed ? 'var(--text-faint)' : 'var(--text)', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                    {todo.text}
                  </div>
                  {(todo.owner || todo.dueDate) && (
                    <div className="flex flex-wrap items-center" style={{ gap: 6, marginTop: 6 }}>
                      {todo.owner && (
                        <span className="whitespace-nowrap" style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: 'var(--soft-ice)', color: 'var(--text-soft)' }}>{todo.owner}</span>
                      )}
                      {todo.dueDate && (
                        <span className="whitespace-nowrap" style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-pill)', background: overdue ? 'var(--coral-soft)' : 'var(--primary-soft)', color: overdue ? 'var(--coral-deep)' : 'var(--primary-deep)' }}>
                          {t('todos.due')} {fmtDue(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => deleteTodo(todo.id)} className="press flex-none flex items-center justify-center" style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', marginTop: 1 }}>
                  <Icon name="close" size={15} sw={2.2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
