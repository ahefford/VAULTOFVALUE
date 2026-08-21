import type { ReactNode } from 'react'
import { IconAsk, IconBook, IconDaily, IconMe, IconPipeline, IconRooms, IconScan } from './icons'

export type Tab = 'daily' | 'ask' | 'book' | 'pipe' | 'scan' | 'sess' | 'me'

const TABS: { key: Tab; label: string; icon: (color: string) => ReactNode }[] = [
  { key: 'daily', label: 'Daily', icon: (c) => <IconDaily color={c} /> },
  { key: 'ask', label: 'Ask', icon: (c) => <IconAsk color={c} /> },
  { key: 'book', label: 'Book', icon: (c) => <IconBook color={c} /> },
  { key: 'scan', label: 'Scan', icon: (c) => <IconScan color={c} /> },
  { key: 'pipe', label: 'Pipeline', icon: (c) => <IconPipeline color={c} /> },
  { key: 'sess', label: 'Rooms', icon: (c) => <IconRooms color={c} /> },
  { key: 'me', label: 'Me', icon: (c) => <IconMe color={c} /> },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        borderTop: '1px solid var(--color-divider)',
        paddingBottom: 'var(--safe-bottom)',
        zIndex: 40,
      }}
    >
      {TABS.map((t) => {
        const active = t.key === tab
        const color = active ? 'var(--color-accent-800)' : 'var(--color-neutral-600)'
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '8px 2px 7px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color,
            }}
          >
            {t.icon(color)}
            <span style={{ font: `${active ? 600 : 400} 10px/1 var(--font-body)`, letterSpacing: '0.01em' }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
