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

// Shown once, right after sign-in/sign-up, for anyone who doesn't have a
// people/{uid} document yet — first person to arrive at a fresh event
// bootstraps it as Captain, everyone after that joins with their name/zone/post.
export function ProfileSetup() {
  const { state } = useStore()
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
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>{isFreshEvent ? 'Set Up This Event' : 'Join The Team'}</div>
      </div>

      {isFreshEvent ? <CaptainSetup /> : <JoinTeam />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, marginTop: 'auto', paddingTop: 12 }}>
        <img src={valuetainment} alt="Valuetainment" style={{ height: 14, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
        <img src={vault26} alt="Vault '26" style={{ height: 16, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
      </div>
    </div>
  )
}

function CaptainSetup() {
  const { addZone, createMyProfile, signOut } = useStore()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      // firestore.rules only allows zone writes from the Captain, checked via
      // a people/{uid} lookup — so the captain's own profile has to exist
      // *before* the zones are created, not after (that ordering used to be
      // reversed here, which made every fresh-event bootstrap permission-
      // denied on the very first write).
      await createMyProfile({ name: trimmed, role: 'captain', zone: null, post: 'Captain' })
      await Promise.all([
        addZone({ id: 'main', name: 'Main Floor', short: 'MAIN', leadId: null, dutiesLabel: 'MAIN FLOOR' }),
        addZone({ id: 'reg', name: 'Registration', short: 'REG', leadId: null, dutiesLabel: 'REGISTRATION' }),
        addZone({ id: 'exits', name: 'Exits', short: 'EXITS', leadId: null, dutiesLabel: 'EXITS' }),
      ])
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
          You're the first one in — set this up as the Captain and three zones (Main Floor, Registration, Exits) get created automatically.
        </div>
      </div>
      <div>
        <label style={label}>YOUR NAME</label>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--zc-red)' }}>{error}</div>}
      <button className="ccbtn" style={primaryBtn} onClick={submit} disabled={busy || !name.trim()}>
        {busy ? 'SETTING UP…' : 'CREATE EVENT AS CAPTAIN'}
      </button>
      <button
        className="ccbtn"
        onClick={() => void signOut()}
        style={{ border: 0, background: 'transparent', color: 'var(--zc-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: 8, cursor: 'pointer' }}
      >
        WRONG ACCOUNT? SIGN OUT
      </button>
    </div>
  )
}

function JoinTeam() {
  const { state, createMyProfile, signOut } = useStore()
  const [name, setName] = useState('')
  const [zone, setZone] = useState<string>(state.zones[0]?.id ?? '')
  const [post, setPost] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      await createMyProfile({ name: trimmed, role: 'member', zone: zone || null, post: post.trim() || 'Floor' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>TELL THE TEAM WHO YOU ARE</div>
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
      {error && <div style={{ fontSize: 12, color: 'var(--zc-red)' }}>{error}</div>}
      <button className="ccbtn" style={primaryBtn} onClick={submit} disabled={busy || !name.trim()}>
        {busy ? 'JOINING…' : 'JOIN THE TEAM'}
      </button>
      <button
        className="ccbtn"
        onClick={() => void signOut()}
        style={{ border: 0, background: 'transparent', color: 'var(--zc-muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: 8, cursor: 'pointer' }}
      >
        WRONG ACCOUNT? SIGN OUT
      </button>
    </div>
  )
}
