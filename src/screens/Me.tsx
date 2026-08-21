import { useState } from 'react'
import { useStore } from '../store/store'
import { Sheet } from '../components/Sheet'
import { Switch } from '../components/Switch'
import { QrCode } from '../components/QrCode'
import { profileToVCard } from '../lib/vcard'
import { downloadCsv } from '../lib/csv'

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

export function Me() {
  const { state, updateProfile, toggleChannel, updateChannelValue, addChannel, removeChannel, setAiApiKey, setEventInfo, resetAll, exportCsv } = useStore()
  const [sheet, setSheet] = useState<'profile' | 'addChannel' | 'settings' | null>(null)

  const [pName, setPName] = useState(state.profile.name)
  const [pFirm, setPFirm] = useState(state.profile.firm)
  const [pEmail, setPEmail] = useState(state.profile.email)
  const [pPhone, setPPhone] = useState(state.profile.phone)

  const [chLabel, setChLabel] = useState('')
  const [chValue, setChValue] = useState('')

  const [eventName, setEventNameLocal] = useState(state.eventName)
  const [eventYear, setEventYearLocal] = useState(state.eventYear)
  const [apiKey, setApiKeyLocal] = useState(state.aiApiKey)

  const saveProfile = () => {
    updateProfile({ name: pName.trim() || state.profile.name, firm: pFirm.trim(), email: pEmail.trim(), phone: pPhone.trim() })
    setSheet(null)
  }

  const saveChannel = () => {
    if (!chLabel.trim()) return
    addChannel(chLabel.trim(), chValue.trim())
    setChLabel('')
    setChValue('')
    setSheet(null)
  }

  const saveSettings = () => {
    setEventInfo(eventName.trim() || state.eventName, eventYear.trim() || state.eventYear)
    setAiApiKey(apiKey.trim())
    setSheet(null)
  }

  const vcard = profileToVCard(state.profile)
  const onCount = state.channels.filter((c) => c.on).length

  return (
    <div style={{ padding: '18px 18px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            background: 'var(--color-accent-700)',
            color: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: '600 20px/1 var(--font-heading)',
            flex: 'none',
          }}
        >
          {initials(state.profile.name) || 'V'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: '600 22px/1.2 var(--font-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.profile.name || 'You'}</div>
          <div style={{ font: '400 14px/1.3 var(--font-body)', color: 'var(--color-neutral-700)' }}>{state.profile.firm || 'Add your firm'}</div>
          <div style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--color-neutral-500)', marginTop: 2 }}>{state.profile.badgeLabel}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <QrCode value={vcard} size={200} />
        <div style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--color-neutral-600)', textAlign: 'center' }}>
          Anyone's camera can scan this straight into their contacts.
        </div>
      </div>

      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => setSheet('profile')}>
        Edit my details
      </button>

      <div className="kicker" style={{ marginTop: 26 }}>
        Channels · {onCount} of {state.channels.length} on
      </div>
      <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
        {state.channels.map((c, i) => (
          <div
            key={c.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderBottom: i < state.channels.length - 1 ? '1px solid var(--color-divider)' : 'none',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                flex: 'none',
                background: c.on ? 'var(--color-accent-700)' : 'var(--color-neutral-200)',
                color: c.on ? 'var(--color-bg)' : 'var(--color-neutral-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '600 12px/1 var(--font-heading)',
              }}
            >
              {c.mark}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 14px/1.2 var(--font-heading)' }}>{c.label}</div>
              <input
                value={c.value}
                onChange={(e) => updateChannelValue(c.key, e.target.value)}
                placeholder={c.placeholder || 'Not set'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  font: '400 13px/1.3 var(--font-body)',
                  color: 'var(--color-neutral-600)',
                  width: '100%',
                }}
              />
            </div>
            <Switch on={c.on} onToggle={() => toggleChannel(c.key)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeChannel(c.key)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => setSheet('addChannel')}>
        + Add channel
      </button>

      <div className="kicker" style={{ marginTop: 26 }}>
        Your book
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        style={{ marginTop: 10 }}
        onClick={() => downloadCsv(`vault-book-${new Date().toISOString().slice(0, 10)}.csv`, exportCsv())}
      >
        Export {state.contacts.length} contact{state.contacts.length === 1 ? '' : 's'} as CSV
      </button>

      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => setSheet('settings')}>
        Event & concierge settings
      </button>

      <button
        type="button"
        className="btn btn-danger btn-block"
        style={{ marginTop: 24 }}
        onClick={() => {
          if (confirm('This clears your book, tasks and profile from this device. Continue?')) resetAll()
        }}
      >
        Reset this device
      </button>

      {sheet === 'profile' && (
        <Sheet title="Edit my details" onClose={() => setSheet(null)}>
          <div className="field">
            <label>Name</label>
            <input className="input" value={pName} onChange={(e) => setPName(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Firm and city</label>
            <input className="input" value={pFirm} onChange={(e) => setPFirm(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Email</label>
            <input className="input" type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Mobile</label>
            <input className="input" type="tel" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveProfile}>
            Save
          </button>
        </Sheet>
      )}

      {sheet === 'addChannel' && (
        <Sheet title="Add channel" onClose={() => setSheet(null)}>
          <div className="field">
            <label>Network</label>
            <input className="input" value={chLabel} onChange={(e) => setChLabel(e.target.value)} placeholder="Instagram, WhatsApp, Calendly…" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Handle or link</label>
            <input className="input" value={chValue} onChange={(e) => setChValue(e.target.value)} placeholder="@yourname" />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveChannel} disabled={!chLabel.trim()}>
            Save
          </button>
        </Sheet>
      )}

      {sheet === 'settings' && (
        <Sheet title="Event & concierge settings" onClose={() => setSheet(null)}>
          <div className="field">
            <label>Event name</label>
            <input className="input" value={eventName} onChange={(e) => setEventNameLocal(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Year</label>
            <input className="input" value={eventYear} onChange={(e) => setEventYearLocal(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 18 }}>
            <label>Anthropic API key (optional)</label>
            <input className="input" type="password" value={apiKey} onChange={(e) => setApiKeyLocal(e.target.value)} placeholder="sk-ant-…" />
            <p style={{ font: '400 12px/1.4 var(--font-body)', color: 'var(--color-neutral-600)', margin: '6px 0 0' }}>
              Stored only on this device. Without a key, Ask still works offline using your own agenda, book and uploads.
            </p>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveSettings}>
            Save
          </button>
        </Sheet>
      )}
    </div>
  )
}
