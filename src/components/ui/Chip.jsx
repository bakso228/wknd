// Loyalocal Chip — pill control. Off: 1.5px strong outline on white.
// On: solid primary, white text. `size` 'sm' (32px) | 'md' (36px).
export default function Chip({ active, onClick, children, size = 'md', title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="press flex-none whitespace-nowrap inline-flex items-center justify-center font-bold"
      style={{
        fontSize: 12,
        padding: '0 14px',
        height: size === 'sm' ? 32 : 36,
        borderRadius: 'var(--r-pill)',
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-soft)',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-strong)'}`,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
