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

export function AuthGate() {
  const { state, signIn, signUp, resetPassword } = useStore()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async () => {
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(email.trim(), password)
      else if (mode === 'signup') await signUp(email.trim(), password)
      else {
        await resetPassword(email.trim())
        setNotice('Check your email for a reset link.')
      }
    } catch {
      // state.authError is already set and rendered below
    } finally {
      setBusy(false)
    }
  }

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

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>
          {mode === 'signin' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
        </div>
        <div>
          <label style={label}>EMAIL</label>
          <input style={input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        {mode !== 'reset' && (
          <div>
            <label style={label}>PASSWORD</label>
            <input
              style={input}
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
        )}
        {state.authError && <div style={{ fontSize: 12, color: 'var(--zc-red)' }}>{state.authError}</div>}
        {notice && <div style={{ fontSize: 12, color: 'var(--zc-gold)' }}>{notice}</div>}
        <button type="submit" className="ccbtn" style={primaryBtn} disabled={busy}>
          {busy ? 'WORKING…' : mode === 'signin' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET LINK'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: '.06em' }}>
          {mode === 'signin' ? (
            <>
              <button type="button" onClick={() => setMode('signup')} style={{ background: 'transparent', border: 0, color: 'var(--zc-gold)', cursor: 'pointer', padding: 0 }}>
                NEW HERE? CREATE ACCOUNT
              </button>
              <button type="button" onClick={() => setMode('reset')} style={{ background: 'transparent', border: 0, color: 'var(--zc-muted)', cursor: 'pointer', padding: 0 }}>
                FORGOT PASSWORD?
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setMode('signin')} style={{ background: 'transparent', border: 0, color: 'var(--zc-gold)', cursor: 'pointer', padding: 0 }}>
              BACK TO SIGN IN
            </button>
          )}
        </div>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, marginTop: 'auto', paddingTop: 12 }}>
        <img src={valuetainment} alt="Valuetainment" style={{ height: 14, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
        <img src={vault26} alt="Vault '26" style={{ height: 16, width: 'auto', filter: 'brightness(2) grayscale(1)' }} />
      </div>
    </div>
  )
}
