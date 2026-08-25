import type { IncidentLevel } from '../types'

const OPTIONS: { label: string; level: IncidentLevel }[] = [
  { label: 'Guest dispute over seating tier', level: 'med' },
  { label: 'Entry line backing up past the doors', level: 'med' },
  { label: 'Blocked exit pathway', level: 'high' },
  { label: 'Unauthorized crossover into Platinum', level: 'high' },
  { label: 'Medical assistance needed', level: 'high' },
]

export function ReportSheet({ onSubmit, onClose }: { onSubmit: (text: string, level: IncidentLevel) => void; onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 54, bottom: 0, background: 'rgba(8,14,10,.82)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 80 }}>
      <div style={{ background: 'var(--zc-bg)', borderTop: '2px solid var(--zc-red)', padding: '18px 18px 40px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-red)' }}>REPORT AN INCIDENT</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zc-muted-2)', marginTop: 6, lineHeight: 1.45 }}>
          Goes to your lead and the Captain at once, on every phone.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {OPTIONS.map((o) => (
            <button
              key={o.label}
              className="ccbtn"
              onClick={() => onSubmit(o.label, o.level)}
              style={{
                border: `1px solid ${o.level === 'high' ? 'var(--zc-red)' : 'var(--zc-line)'}`,
                background: 'var(--zc-panel)',
                color: 'var(--zc-ink)',
                fontFamily: 'Archivo, sans-serif',
                fontSize: 12.5,
                fontWeight: 600,
                textAlign: 'left',
                padding: 14,
                cursor: 'pointer',
                minHeight: 48,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          className="ccbtn"
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 12,
            border: 0,
            background: 'var(--zc-line-2)',
            color: 'var(--zc-muted)',
            fontFamily: 'Archivo, sans-serif',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.12em',
            textAlign: 'left',
            padding: 14,
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}
