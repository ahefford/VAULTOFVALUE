import type { Alert } from '../types'

export function Banner({ alert, onAck }: { alert: Alert; onAck: () => void }) {
  return (
    <div style={{ flex: 'none', background: 'var(--zc-gold)', color: '#1b2b22', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em' }}>ALL-CALL — {alert.from}</div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>{alert.text}</div>
      </div>
      <button
        className="ccbtn"
        onClick={onAck}
        style={{
          flex: 'none',
          border: 0,
          background: '#1b2b22',
          color: 'var(--zc-ink)',
          fontFamily: 'Archivo, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '.12em',
          padding: '9px 12px',
          cursor: 'pointer',
        }}
      >
        COPY
      </button>
    </div>
  )
}
