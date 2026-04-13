import { useState, useMemo, useRef, useEffect } from 'react';
import { useLang } from '../../contexts/LangContext.jsx';

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

  // Auto-focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Known owners derived from existing todos
  const knownOwners = useMemo(() => {
    const names = todos.map(t => t.owner).filter(Boolean);
    return [...new Set(names)];
  }, [todos]);

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      owner: owner || '',
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setText('');
    setDueDate('');
    setShowDate(false);
    inputRef.current?.focus();
  };

  const toggleDone = id => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = id => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const confirmName = name => {
    const n = name.trim();
    if (n) setOwner(n);
    setTypingName(false);
    setNameInput('');
    inputRef.current?.focus();
  };

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...todos];
    if (statusFilter === 'open') list = list.filter(t => !t.completed);
    if (statusFilter === 'done') list = list.filter(t => t.completed);
    if (ownerFilter !== 'all') list = list.filter(t => t.owner === ownerFilter);
    // Open first, then by createdAt desc
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [todos, statusFilter, ownerFilter]);

  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const fmtDue = iso => new Date(iso + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' });

  const openCount = todos.filter(t => !t.completed).length;

  return (
    <div className="fade-in space-y-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">{t('todos.title')}</h2>
        {openCount > 0 && (
          <p className="text-xs text-stone-400 mt-0.5">
            {openCount} {openCount === 1 ? t('todos.openOne') : t('todos.openMany')}
          </p>
        )}
      </div>

      {/* Quick-add card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
        {/* Text input row */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder={t('todos.placeholder')}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-400 min-h-[48px]"
          />
          <button
            onClick={addTodo}
            disabled={!text.trim()}
            className="bg-amber-400 disabled:bg-stone-100 disabled:text-stone-300 text-white font-bold rounded-xl px-4 text-lg min-h-[48px] transition-colors"
          >
            +
          </button>
        </div>

        {/* Owner chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mr-0.5">{t('todos.who')}</span>

          {/* Blank / no owner chip */}
          <button
            onClick={() => setOwner('')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors min-h-[32px] ${owner === '' ? 'bg-stone-700 text-white border-stone-700' : 'bg-stone-50 text-stone-500 border-stone-200'}`}
          >
            —
          </button>

          {knownOwners.map(name => (
            <button
              key={name}
              onClick={() => setOwner(name)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors min-h-[32px] ${owner === name ? 'bg-amber-400 text-white border-amber-400' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
            >
              {name}
            </button>
          ))}

          {/* New name entry */}
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
                className="border border-amber-300 rounded-xl px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-amber-400"
              />
              <button onClick={() => confirmName(nameInput)} className="text-xs text-amber-600 font-bold px-2 min-h-[32px]">✓</button>
              <button onClick={() => { setTypingName(false); setNameInput(''); }} className="text-xs text-stone-400 px-1 min-h-[32px]">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setTypingName(true)}
              className="text-xs px-3 py-1.5 rounded-full border border-dashed border-stone-300 text-stone-400 font-medium min-h-[32px] hover:border-amber-300 hover:text-amber-500 transition-colors"
            >
              + {t('todos.addName')}
            </button>
          )}
        </div>

        {/* Optional date row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDate(v => !v)}
            className="text-xs text-stone-400 flex items-center gap-1 font-medium"
          >
            <span className={`transition-transform ${showDate ? 'rotate-90' : ''}`}>›</span>
            {t('todos.datePlaceholder')}
          </button>
          {showDate && (
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="border border-stone-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-amber-400"
            />
          )}
          {dueDate && (
            <button onClick={() => setDueDate('')} className="text-xs text-stone-400 hover:text-red-400">✕</button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        {/* Status filter */}
        <div className="flex gap-1.5 scroll-x -mx-4 px-4 pb-1">
          {['open', 'done', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`flex-shrink-0 text-xs px-3 py-2 rounded-full font-semibold border transition-colors min-h-[36px] ${statusFilter === f ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}
            >
              {t(`todos.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
            </button>
          ))}

          {/* Owner filters — only show when there are multiple owners */}
          {knownOwners.length > 0 && (
            <>
              <div className="flex-shrink-0 w-px bg-stone-200 my-1 mx-0.5" />
              <button
                onClick={() => setOwnerFilter('all')}
                className={`flex-shrink-0 text-xs px-3 py-2 rounded-full font-semibold border transition-colors min-h-[36px] ${ownerFilter === 'all' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}
              >
                {t('todos.everyone')}
              </button>
              {knownOwners.map(name => (
                <button
                  key={name}
                  onClick={() => setOwnerFilter(ownerFilter === name ? 'all' : name)}
                  className={`flex-shrink-0 text-xs px-3 py-2 rounded-full font-semibold border transition-colors min-h-[36px] ${ownerFilter === name ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-stone-600 border-stone-200'}`}
                >
                  {name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400">
          <div className="text-3xl mb-2">{statusFilter === 'done' ? '🎉' : '✅'}</div>
          <div className="text-sm font-medium">
            {statusFilter === 'done' ? t('todos.emptyDone') : t('todos.empty')}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
          {filtered.map(todo => (
            <div key={todo.id} className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${todo.completed ? 'bg-stone-50/50' : ''}`}>
              {/* Completion toggle */}
              <button
                onClick={() => toggleDone(todo.id)}
                className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? 'bg-emerald-400 border-emerald-400 text-white' : 'border-stone-300 hover:border-amber-400'}`}
              >
                {todo.completed && <span className="text-xs font-bold">✓</span>}
              </button>

              {/* Text + meta */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium leading-snug ${todo.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                  {todo.text}
                </div>
                {(todo.owner || todo.dueDate) && (
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {todo.owner && (
                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        {todo.owner}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        !todo.completed && todo.dueDate < new Date().toISOString().slice(0, 10)
                          ? 'bg-red-100 text-red-500'
                          : 'bg-sky-100 text-sky-600'
                      }`}>
                        {t('todos.due')} {fmtDue(todo.dueDate)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="flex-shrink-0 text-stone-300 hover:text-red-400 active:text-red-500 w-8 h-8 flex items-center justify-center transition-colors text-sm mt-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
