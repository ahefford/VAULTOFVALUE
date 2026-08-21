import { useStore } from '../store/store'
import { STAGES, type Stage } from '../types'

export function Pipeline({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, setContactStage } = useStore()
  const deals = state.contacts.filter((c) => c.bucket === 'deal')

  return (
    <div style={{ padding: '18px 18px 32px' }}>
      <div className="kicker">Pipeline</div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Where the money is.</h2>
      <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
        {deals.length} deal{deals.length === 1 ? '' : 's'} from this Vault · tap a stage button to move one along
      </p>

      {deals.length === 0 && (
        <div className="card" style={{ marginTop: 22, padding: '20px 16px' }}>
          <div style={{ font: '600 16px/1.3 var(--font-heading)' }}>No deals yet.</div>
          <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
            Scan someone in as a Deal and they will show up here.
          </p>
        </div>
      )}

      {STAGES.map((stage, i) => {
        const rows = deals.filter((c) => c.stage === stage)
        const barW = Math.min(100, rows.length * 26)
        return (
          <div key={stage} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="kicker">{stage}</div>
              <div className="kicker">{rows.length}</div>
            </div>
            <div style={{ height: 4, background: 'var(--color-neutral-200)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${barW}%`,
                  background: stage === 'Won' ? 'var(--color-process-yellow)' : 'var(--color-accent-700)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            {rows.length === 0 ? (
              <div style={{ padding: '10px 0', font: '400 13px/1.4 var(--font-body)', color: 'var(--color-neutral-500)' }}>Nothing here</div>
            ) : (
              rows.map((c) => {
                const next: Stage | null = i < STAGES.length - 1 ? STAGES[i + 1] : null
                return (
                  <div
                    key={c.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(c.id)}
                      style={{ flex: 1, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <div style={{ font: '600 15px/1.25 var(--font-heading)' }}>{c.name}</div>
                      <div style={{ font: '400 13px/1.3 var(--font-body)', color: 'var(--color-neutral-600)' }}>{c.firm || c.city}</div>
                    </button>
                    {next && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setContactStage(c.id, next)}>
                        Move to {next}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )
      })}
    </div>
  )
}
