export function Chip({ label, active, onClick, tone = 'accent' }: { label: string; active: boolean; onClick: () => void; tone?: 'accent' | 'gold' }) {
  const activeBg = tone === 'gold' ? 'var(--color-process-yellow)' : 'var(--color-accent-700)'
  const activeFg = tone === 'gold' ? 'var(--color-neutral-900)' : 'var(--color-bg)'
  return (
    <button
      type="button"
      className="tag"
      onClick={onClick}
      style={{
        borderColor: active ? activeBg : 'var(--color-divider)',
        background: active ? activeBg : 'transparent',
        color: active ? activeFg : 'var(--color-neutral-700)',
      }}
    >
      {label}
    </button>
  )
}
