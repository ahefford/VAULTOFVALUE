import { useState } from 'react'
import valuetainment from '../assets/valuetainment.svg'
import { Chip } from '../components/Chips'
import { useStore } from '../store/store'
import type { Profile } from '../types'

const ROLES = ['Advisor / wealth manager', 'Lending', 'Insurance', 'Real estate', 'Founder / operator', 'Other']
const FOCUS = ['Deals', 'Referral partners', 'Capital', 'Hiring', 'Learning']

export function Onboarding() {
  const { completeOnboarding, state } = useStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [firm, setFirm] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [focus, setFocus] = useState<string[]>(['Deals'])
  const [target, setTarget] = useState(12)

  const toggleFocus = (label: string) => {
    setFocus((f) => (f.includes(label) ? f.filter((x) => x !== label) : [...f, label]))
  }

  const finish = () => {
    const profile: Profile = {
      name: name.trim() || 'You',
      firm: firm.trim(),
      role,
      focus,
      email: email.trim(),
      phone: phone.trim(),
      scanTarget: target,
      badgeLabel: `${state.eventName} ${state.eventYear}`,
    }
    completeOnboarding(profile)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '28px 22px 32px', maxWidth: 460, margin: '0 auto', boxSizing: 'border-box' }}>
      <img src={valuetainment} alt="" style={{ height: 20, width: 'auto', display: 'block', filter: 'invert(0)' }} />

      {step === 1 && (
        <div className="vv-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <div className="kicker" style={{ color: 'var(--color-accent-800)' }}>
            {state.eventName} · {state.eventYear}
          </div>
          <h1 style={{ font: '600 40px/1.05 var(--font-heading)', margin: '10px 0 0', letterSpacing: '-0.02em' }}>The Vault of Value</h1>
          <p style={{ font: '400 16px/1.5 var(--font-body)', color: 'var(--color-neutral-700)', margin: '12px 0 0' }}>
            Scan a badge, sort it into a deal, a referral or a contact, and it lands in your book before you shake the next hand. Everything
            stays on this device.
          </p>

          <div className="field" style={{ marginTop: 26 }}>
            <label>Your name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last" />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Firm and city</label>
            <input className="input" value={firm} onChange={(e) => setFirm(e.target.value)} placeholder="Firm · City" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@firm.com" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Mobile</label>
              <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" />
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={() => setStep(2)} disabled={!name.trim()}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="vv-scroll vv-rise" style={{ flex: 1, overflow: 'auto', paddingTop: 30 }}>
          <div className="kicker">Step 2 of 2</div>
          <h2 style={{ font: '600 30px/1.1 var(--font-heading)', margin: '10px 0 0', letterSpacing: '-0.014em' }}>Make it yours.</h2>
          <p style={{ font: '400 15px/1.45 var(--font-body)', color: 'var(--color-neutral-700)', margin: '8px 0 0' }}>
            This is what your code hands over and how the concierge answers you.
          </p>

          <div className="kicker" style={{ marginTop: 26 }}>
            What you do
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {ROLES.map((r) => (
              <Chip key={r} label={r} active={role === r} onClick={() => setRole(r)} />
            ))}
          </div>

          <div className="kicker" style={{ marginTop: 26 }}>
            Why you came
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {FOCUS.map((f) => (
              <Chip key={f} label={f} active={focus.includes(f)} onClick={() => toggleFocus(f)} tone="gold" />
            ))}
          </div>

          <div className="kicker" style={{ marginTop: 26 }}>
            Scans you want per day
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: 44, height: 38, padding: 0 }}
              onClick={() => setTarget((t) => Math.max(1, t - 1))}
            >
              −
            </button>
            <div style={{ font: '600 30px/1 var(--font-heading)', minWidth: 52, textAlign: 'center' }}>{target}</div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: 44, height: 38, padding: 0 }}
              onClick={() => setTarget((t) => Math.min(60, t + 1))}
            >
              ＋
            </button>
            <div style={{ flex: 1, font: '400 13px/1.35 var(--font-body)', color: 'var(--color-neutral-600)' }}>
              Sets the Daily tab's first goal
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 30 }} onClick={finish}>
            Enter the Vault
          </button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
            Back
          </button>
        </div>
      )}
    </div>
  )
}
