export function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        border: `1px solid ${on ? 'var(--color-accent-700)' : 'var(--color-neutral-400)'}`,
        background: on ? 'var(--color-accent-700)' : 'var(--color-neutral-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        padding: 2,
        cursor: 'pointer',
        flex: 'none',
      }}
    >
      <span style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--color-bg)', display: 'block' }} />
    </button>
  )
}
