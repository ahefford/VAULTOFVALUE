import { useState } from 'react'
import { useStore } from '../store/store'
import { MAP_PINS, STATUS_META } from '../types'
import { Floorplan } from '../components/Floorplan'

export function MapScreen() {
  const { state, me } = useStore()
  const [selected, setSelected] = useState<string | null>(null)
  if (!me) return null
  const activeZoneId = selected ?? me.zone ?? state.zones[0]?.id ?? null
  const activeZone = state.zones.find((z) => z.id === activeZoneId) ?? null
  const members = state.people.filter((p) => p.zone === activeZoneId)

  return (
    <div style={{ padding: '16px 0 24px' }}>
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>MGM GRAND ARENA — CONFERENCE LEVEL</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }}>Live Floor Map</div>
      </div>
      <div style={{ position: 'relative', background: '#0e1712', borderTop: '2px solid var(--zc-line)', borderBottom: '2px solid var(--zc-line)' }}>
        <Floorplan />
        {state.zones.map((z) => {
          const mem = state.people.filter((p) => p.zone === z.id)
          const inCount = mem.filter((p) => p.status === 'in').length
          const pin = MAP_PINS[z.id]
          if (!pin) return null
          const on = z.id === activeZoneId
          return (
            <button
              key={z.id}
              onClick={() => setSelected(z.id)}
              style={{
                position: 'absolute',
                left: pin[0],
                top: pin[1],
                transform: 'translate(-50%,-50%)',
                border: `2px solid ${on ? 'var(--zc-gold)' : 'var(--zc-line)'}`,
                background: on ? 'var(--zc-gold)' : 'rgba(19,31,25,.92)',
                color: on ? '#1b2b22' : 'var(--zc-ink)',
                fontFamily: 'Archivo, sans-serif',
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '.1em',
                padding: '6px 8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {z.short} {inCount}/{mem.length}
            </button>
          )
        })}
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>
          {(activeZone?.name ?? '').toUpperCase()} — WHO IS WHERE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
          {members.map((m) => {
            const st = STATUS_META[m.status]
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--zc-line-2)' }}>
                <div style={{ width: 8, height: 8, flex: 'none', background: st.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--zc-faint)' }}>{m.post}</div>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: st.color }}>{st.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
