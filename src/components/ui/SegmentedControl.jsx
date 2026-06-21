// Loyalocal SegmentedControl — sunken track, active segment lifts to white.
export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <div className="flex" style={{ background: 'var(--border)', borderRadius: 'var(--r-pill)', padding: 3, gap: 3, ...style }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="press flex-1 inline-flex items-center justify-center"
            style={{
              fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-soft)',
              boxShadow: active ? '0 1px 2px rgba(31,41,51,.12)' : 'none',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
