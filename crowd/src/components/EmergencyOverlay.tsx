import type { Alert } from '../types'

export function EmergencyOverlay({ alert, totalPeople, onAck }: { alert: Alert; totalPeople: number; onAck: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 54,
        bottom: 0,
        background: 'var(--zc-red)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 22px',
        animation: 'ccflash 1.1s infinite',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.22em', color: '#fff' }}>EMERGENCY ALL-HANDS</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.02, color: '#fff', marginTop: 10, textWrap: 'pretty' }}>
        {alert.text}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', marginTop: 12 }}>
        FROM {alert.from} · {alert.acks.length} OF {totalPeople} ACKNOWLEDGED
      </div>
      <button
        className="ccbtn"
        onClick={onAck}
        style={{
          marginTop: 22,
          border: 0,
          background: 'var(--zc-bg)',
          color: '#fff',
          fontFamily: 'Archivo, sans-serif',
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '.14em',
          textAlign: 'left',
          padding: '18px 16px',
          cursor: 'pointer',
          minHeight: 56,
        }}
      >
        ACKNOWLEDGE
      </button>
    </div>
  )
}
