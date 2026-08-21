import { useState } from 'react'
import { useStore } from '../store/store'
import type { Bucket } from '../types'
import { Chip } from '../components/Chips'
import { ScannerCamera } from '../components/ScannerCamera'
import { parseScannedPayload } from '../lib/parseVCard'
import { IconCamera } from '../components/icons'

const DEFAULT_TAGS = ['401(k) rollover', '1031 exchange', 'HNW intro', 'Centre of influence', 'Insurance', 'Capital raise']
const BUCKETS: { key: Bucket; label: string; note: string }[] = [
  { key: 'deal', label: 'Deal', note: 'Money on the table' },
  { key: 'referral', label: 'Referral', note: 'Sends or takes intros' },
  { key: 'contact', label: 'Contact', note: 'Keep warm' },
]

export function Scan({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, addContact, incGoal } = useStore()
  const [camera, setCamera] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [lastId, setLastId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [firm, setFirm] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bucket, setBucket] = useState<Bucket>('deal')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [note, setNote] = useState('')
  const [sessionId, setSessionId] = useState<string>(state.currentSessionId ?? '')

  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))

  const reset = () => {
    setName('')
    setFirm('')
    setCity('')
    setEmail('')
    setPhone('')
    setBucket('deal')
    setTags([])
    setCustomTag('')
    setNote('')
  }

  const save = () => {
    if (!name.trim()) return
    const contact = addContact({ name, firm, city, email, phone, bucket, tags, note, sessionId: sessionId || null })
    incGoal('scans')
    if (bucket === 'deal') incGoal('deals')
    if (bucket === 'referral') incGoal('refs')
    setFlash(`${contact.name} added as a ${bucket}.`)
    setLastId(contact.id)
    reset()
    setTimeout(() => setFlash(null), 3500)
  }

  const onScanResult = (raw: string) => {
    setCamera(false)
    const parsed = parseScannedPayload(raw)
    if (!parsed) {
      setFlash('Could not read that code. Try manual entry below.')
      setTimeout(() => setFlash(null), 3500)
      return
    }
    if (parsed.name) setName(parsed.name)
    if (parsed.firm) setFirm(parsed.firm)
    if (parsed.email) setEmail(parsed.email)
    if (parsed.phone) setPhone(parsed.phone)
  }

  return (
    <div style={{ padding: '18px 18px 32px' }}>
      <div className="kicker">Scan a badge</div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Get them in the book.</h2>
      <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
        Scan a QR code if their badge has one, or type it in — either way it lands in your book in seconds.
      </p>

      {flash && (
        <div
          className="vv-rise"
          style={{ marginTop: 14, padding: '11px 14px', background: 'var(--color-accent-100)', borderLeft: '2px solid var(--color-process-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
        >
          <div style={{ font: '600 14px/1.3 var(--font-heading)' }}>{flash}</div>
          {lastId && (
            <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={() => onOpen(lastId)}>
              View
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block"
        style={{ marginTop: 18, gap: 10 }}
        onClick={() => setCamera(true)}
      >
        <IconCamera size={20} /> Scan QR code
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
        <div style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-600)' }}>or type it in</div>
        <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
      </div>

      <div className="field">
        <label>Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Firm</label>
          <input className="input" value={firm} onChange={(e) => setFirm(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Mobile</label>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {state.sessions.length > 0 && (
        <div className="field" style={{ marginTop: 12 }}>
          <label>Room</label>
          <select className="input" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            <option value="">Not set</option>
            {state.sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.time} — {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="kicker" style={{ marginTop: 20 }}>
        Bucket
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setBucket(b.key)}
            className="card"
            style={{
              flex: 1,
              padding: '12px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              borderColor: bucket === b.key ? 'var(--color-accent-700)' : 'var(--color-divider)',
              background: bucket === b.key ? 'var(--color-accent-100)' : 'var(--color-card)',
            }}
          >
            <div style={{ font: '600 14px/1.2 var(--font-heading)', color: bucket === b.key ? 'var(--color-accent-800)' : 'var(--color-text)' }}>{b.label}</div>
            <div style={{ font: '400 12px/1.3 var(--font-body)', color: 'var(--color-neutral-600)', marginTop: 3 }}>{b.note}</div>
          </button>
        ))}
      </div>

      <div className="kicker" style={{ marginTop: 20 }}>
        Tags
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {DEFAULT_TAGS.map((t) => (
          <Chip key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} tone="gold" />
        ))}
        {tags.filter((t) => !DEFAULT_TAGS.includes(t)).map((t) => (
          <Chip key={t} label={t} active onClick={() => toggleTag(t)} tone="gold" />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          className="input"
          placeholder="Add a custom tag"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customTag.trim()) {
              toggleTag(customTag.trim())
              setCustomTag('')
            }
          }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (customTag.trim()) {
              toggleTag(customTag.trim())
              setCustomTag('')
            }
          }}
        >
          Add
        </button>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>Note</label>
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did they say? What do you owe them?" />
      </div>

      <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={save} disabled={!name.trim()}>
        Add to book
      </button>

      {camera && (
        <ScannerCamera
          onResult={onScanResult}
          onClose={() => setCamera(false)}
        />
      )}
    </div>
  )
}
