import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { SELF_CHECK } from '../types'
import valuetainment from '../assets/valuetainment.png'
import vault26 from '../assets/vault26.png'

const CHAIN = [
  { n: 1, title: 'Handle It Yourself', body: 'Minor guest questions, directions, or confusion within your normal duties — resolve it on the spot.' },
  { n: 2, title: 'Radio Your Team Lead', body: "Anything that needs backup, judgment, or you're unsure how to handle." },
  { n: 3, title: 'Lead Radios the Captain', body: "Anything that can't be resolved at zone level, or involves safety, security, or a tier/access dispute." },
  { n: 4, title: 'Captain Escalates to Venue', body: 'MGM Grand security or management — for anything beyond team-level authority.' },
]

const FUNDAMENTALS = [
  "Stand at the edge of the flow, not in it — don't become your own bottleneck",
  'Make eye contact and use open body language — approachable beats authoritative',
  'Never argue with a guest in public — de-escalate first, then radio if needed',
  "Know your zone's exits cold — you may need to direct people fast",
  'Stay hydrated, stay visible, stay alert — long shifts dull attention',
  'When in doubt on a credential or access call, ask — don’t guess',
]

function checkKey(personId: string) {
  return `zc_selfcheck_${personId}`
}

export function BookScreen() {
  const { me, api } = useStore()
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!me) return
    try {
      const raw = localStorage.getItem(checkKey(me.id))
      setChecked(raw ? JSON.parse(raw) : {})
    } catch {
      setChecked({})
    }
  }, [me?.id])

  if (!me) return null

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] }
      try {
        localStorage.setItem(checkKey(me.id), JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>PROTOCOL</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }}>Chain of Command</div>
        <div style={{ marginTop: 10 }}>
          {CHAIN.map((c, i) => (
            <div key={c.n} style={{ display: 'flex', gap: 11, padding: '11px 0', borderTop: '1px solid var(--zc-line-2)', borderBottom: i === CHAIN.length - 1 ? '1px solid var(--zc-line-2)' : undefined }}>
              <div style={{ flex: 'none', width: 20, fontSize: 15, fontWeight: 800, color: 'var(--zc-gold)' }}>{c.n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zc-muted-2)', lineHeight: 1.45, marginTop: 3 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#2a0f08', border: '2px solid var(--zc-red)', padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-red)' }}>EMERGENCY</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>Never wait on the chain for a genuine safety emergency.</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#d9c9c2', lineHeight: 1.45, marginTop: 6 }}>
          Radio the Captain AND venue security at the same time. Skip levels when someone's safety is at risk — sort out reporting after.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>KEEP THESE FRONT OF MIND</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }}>Fundamentals</div>
        <div style={{ marginTop: 8 }}>
          {FUNDAMENTALS.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 11, padding: '10px 0', borderTop: '1px solid var(--zc-line-2)', borderBottom: i === FUNDAMENTALS.length - 1 ? '1px solid var(--zc-line-2)' : undefined }}>
              <div style={{ flex: 'none', width: 16, fontSize: 12, fontWeight: 800, color: 'var(--zc-faint)' }}>{i + 1}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.45, color: 'var(--zc-ink-dim)' }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>SELF-CHECK</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }}>Doing a Great Job</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {SELF_CHECK.map((t, i) => {
            const on = Boolean(checked[i])
            return (
              <button
                key={i}
                className="ccbtn"
                onClick={() => toggle(i)}
                style={{ display: 'flex', gap: 11, alignItems: 'flex-start', textAlign: 'left', border: 0, borderTop: '1px solid var(--zc-line-2)', background: 'transparent', padding: '11px 0', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}
              >
                <div style={{ flex: 'none', width: 18, height: 18, border: `2px solid ${on ? 'var(--zc-gold)' : 'var(--zc-faint)'}`, background: on ? 'var(--zc-gold)' : 'transparent', color: '#1b2b22', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? '✓' : ''}
                </div>
                <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, lineHeight: 1.45, color: on ? 'var(--zc-ink)' : 'var(--zc-muted)' }}>{t}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>END OF SHIFT</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zc-muted-2)', lineHeight: 1.45, marginTop: 6 }}>
          Log what happened in your zone while it is fresh — not from memory at the end of the night.
        </div>
        <button
          className="ccbtn"
          onClick={() => api.fileDebrief(me.id)}
          disabled={me.debriefed}
          style={{
            width: '100%',
            marginTop: 12,
            border: '1px solid var(--zc-gold)',
            background: me.debriefed ? 'var(--zc-gold)' : 'transparent',
            color: me.debriefed ? '#1b2b22' : 'var(--zc-gold)',
            fontFamily: 'Archivo, sans-serif',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '.12em',
            textAlign: 'left',
            padding: '15px 14px',
            cursor: me.debriefed ? 'default' : 'pointer',
            minHeight: 48,
          }}
        >
          {me.debriefed ? 'DEBRIEF FILED — VISIBLE TO CAPTAIN' : 'FILE MY SHIFT DEBRIEF'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, paddingTop: 4 }}>
        <img src={valuetainment} alt="Valuetainment" style={{ height: 14, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
        <img src={vault26} alt="Vault '26" style={{ height: 16, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
      </div>
    </div>
  )
}
