import valuetainment from '../assets/valuetainment.svg'
import { useStore } from '../store/store'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TopBar({ onAvatar }: { onAvatar: () => void }) {
  const { state } = useStore()
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--color-bg)',
        paddingTop: 'calc(var(--safe-top) + 14px)',
        paddingBottom: 11,
        paddingLeft: 18,
        paddingRight: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottom: '2px solid var(--color-process-yellow)',
      }}
    >
      <img src={valuetainment} alt={state.eventName} style={{ height: 16, width: 'auto', display: 'block' }} />
      <button
        type="button"
        onClick={onAvatar}
        style={{
          width: 32,
          height: 32,
          flex: 'none',
          borderRadius: 999,
          border: '1px solid var(--color-accent-800)',
          background: 'var(--color-accent-700)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '600 12px/1 var(--font-heading)',
          color: 'var(--color-bg)',
        }}
      >
        {initials(state.profile.name) || 'V'}
      </button>
    </div>
  )
}
