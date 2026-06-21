import Icon from './Icon.jsx';

// Loyalocal toast — dark charcoal bar above the nav, green check, optional Undo.
export default function Toast({ toast, onUndo }) {
  if (!toast) return null;
  return (
    <div
      className="fixed z-50 flex items-center gap-3 rise"
      style={{
        left: 16, right: 16, bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--charcoal)', color: '#fff', borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-pop)', padding: '12px 14px', maxWidth: 600, margin: '0 auto',
      }}
    >
      <Icon name="check" size={18} style={{ color: 'var(--green)', flex: 'none' }} />
      <span className="flex-1 min-w-0" style={{ fontSize: 13, fontWeight: 600 }}>{toast.msg}</span>
      {toast.onUndo && (
        <button onClick={onUndo} className="press flex-none" style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--pass-a)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          {toast.undoLabel}
        </button>
      )}
    </div>
  );
}
