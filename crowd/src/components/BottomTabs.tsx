export interface TabDef {
  id: string
  label: string
  badge: string
}

export function BottomTabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ flex: 'none', display: 'flex', background: 'var(--zc-panel)', borderTop: '2px solid var(--zc-line)', paddingBottom: 26 }}>
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              position: 'relative',
              border: 0,
              background: 'transparent',
              padding: '12px 0 10px',
              cursor: 'pointer',
              fontFamily: 'Archivo, sans-serif',
              minHeight: 52,
            }}
          >
            <div style={{ height: 3, background: on ? 'var(--zc-gold)' : 'transparent', margin: '-12px 8px 9px' }} />
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: on ? 'var(--zc-ink)' : 'var(--zc-faint)' }}>{t.label}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.badge ? 'var(--zc-gold)' : 'transparent', marginTop: 3, minHeight: 11 }}>{t.badge || '·'}</div>
          </button>
        )
      })}
    </div>
  )
}
