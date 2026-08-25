import { useState } from 'react'
import { useStore } from '../store/store'
import valuetainment from '../assets/valuetainment.png'
import vault26 from '../assets/vault26.png'

const input: React.CSSProperties = {
  background: 'var(--zc-panel)',
  border: '1px solid var(--zc-line)',
  color: 'var(--zc-ink)',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 15,
  padding: '13px 12px',
  outline: 'none',
  width: '100%',
}
const label: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '.18em',
  color: 'var(--zc-muted)',
  marginBottom: 6,
  display: 'block',
}
const primaryBtn: React.CSSProperties = {
  width: '100%',
  border: 0,
  background: 'var(--zc-gold)',
  color: '#1b2b22',
  fontFamily: 'Archivo, sans-serif',
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '.12em',
  textAlign: 'left',
  padding: '15px 14px',
  cursor: 'pointer',
  minHeight: 48,
}

export function Onboarding() {
  const { state, setMeId, addPerson, addZone } = useStore()
  const isFreshEvent = state.zones.length === 0

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--zc-bg)',
        color: 'var(--zc-ink)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 20px 32px',
        gap: 24,
      }}
    >
      <div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.2em', color: 'var(--zc-gold)' }}>CROWD CONTROL</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Zonecall</div>
      </div>

      {isFreshEvent ? <CaptainSetup onDone={setMeId} addPerson={addPerson} addZone={addZone} /> : <RosterJoin />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, marginTop: 'auto', paddingTop: 12 }}>
        <img src={valuetainment} alt="Valuetainment" style={{ height: 14, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
        <img src={vault26} alt="Vault '26" style={{ height: 16, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
      </div>
    </div>
  )
}

function CaptainSetup({
  onDone,
  addPerson,
  addZone,
}: {
  onDone: (id: string) => void
  addPerson: ReturnType<typeof useStore>['addPerson']
  addZone: ReturnType<typeof useStore>['addZone']
}) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      await Promise.all([
        addZone({ id: 'main', name: 'Main Floor', short: 'MAIN', leadId: null, dutiesLabel: 'MAIN FLOOR' }),
        addZone({ id: 'reg', name: 'Registration', short: 'REG', leadId: null, dutiesLabel: 'REGISTRATION' }),
        addZone({ id: 'exits', name: 'Exits', short: 'EXITS', leadId: null, dutiesLabel: 'EXITS' }),
      ])
      const id = await addPerson({ name: trimmed, role: 'captain', zone: null, post: 'Captain' })
      onDone(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>NO EVENT SET UP YET</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>
          Set this up as the Captain — three zones (Main Floor, Registration, Exits) get created automatically.
        </div>
      </div>
      <div>
        <label style={label}>YOUR NAME</label>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Aydin Hefford" />
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--zc-red)' }}>{error}</div>}
      <button className="ccbtn" style={primaryBtn} onClick={submit} disabled={busy || !name.trim()}>
        {busy ? 'SETTING UP…' : 'CREATE EVENT AS CAPTAIN'}
      </button>
    </div>
  )
}

function RosterJoin() {
  const { state, setMeId, addPerson } = useStore()
  const [mode, setMode] = useState<'pick' | 'new'>('pick')
  const [name, setName] = useState('')
  const [zone, setZone] = useState<string>(state.zones[0]?.id ?? '')
  const [post, setPost] = useState('')
  const [busy, setBusy] = useState(false)

  const unclaimed = state.people

  const submitNew = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const id = await addPerson({ name: trimmed, role: 'member', zone: zone || null, post: post.trim() || 'Floor' })
      setMeId(id)
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'new') {
    return (
      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>NEW TO THE TEAM</div>
        <div>
          <label style={label}>YOUR NAME</label>
          <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label style={label}>ZONE</label>
          <select style={input} value={zone} onChange={(e) => setZone(e.target.value)}>
            {state.zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>YOUR POST</label>
          <input style={input} value={post} onChange={(e) => setPost(e.target.value)} placeholder="e.g. North aisle" />
        </div>
        <button className="ccbtn" style={primaryBtn} onClick={submitNew} disabled={busy || !name.trim()}>
          {busy ? 'JOINING…' : 'JOIN THE TEAM'}
        </button>
        <button
          className="ccbtn"
          style={{ border: 0, background: 'transparent', color: 'var(--zc-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: 8, cursor: 'pointer' }}
          onClick={() => setMode('pick')}
        >
          BACK
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>WHO ARE YOU?</div>
      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)' }}>
        {unclaimed.length === 0 && <div style={{ padding: 14, fontSize: 13, color: 'var(--zc-muted)' }}>No one's on the roster yet.</div>}
        {unclaimed.map((p) => (
          <button
            key={p.id}
            className="ccrow ccbtn"
            onClick={() => setMeId(p.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              background: 'transparent',
              border: 0,
              borderTop: '1px solid var(--zc-line-2)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--zc-ink)',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                flex: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                background: 'var(--zc-line-2)',
                color: 'var(--zc-ink-dim)',
              }}
            >
              {p.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--zc-faint)' }}>
                {p.role.toUpperCase()} · {p.post}
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        className="ccbtn"
        style={{ border: '1px solid var(--zc-line)', background: 'transparent', color: 'var(--zc-ink)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', padding: 14, cursor: 'pointer' }}
        onClick={() => setMode('new')}
      >
        I'M NOT LISTED — ADD ME
      </button>
    </div>
  )
}
