import { useState } from 'react'
import { useStore } from '../store/store'
import { STAGES, type Stage } from '../types'
import { Chip } from '../components/Chips'
import { IconBack } from '../components/icons'
import { Sheet } from '../components/Sheet'

export function ContactDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { state, setContactStage, addContactLog, addTask, deleteContact, updateContact } = useStore()
  const [sheet, setSheet] = useState<'referral' | 'follow' | null>(null)
  const [refDir, setRefDir] = useState<'to' | 'from'>('to')
  const [refName, setRefName] = useState('')

  const contact = state.contacts.find((c) => c.id === id)
  if (!contact) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <IconBack /> Back
        </button>
        <p>That contact was removed.</p>
      </div>
    )
  }

  const session = state.sessions.find((s) => s.id === contact.sessionId)
  const reach = [
    { k: 'Email', v: contact.email || '—' },
    { k: 'Mobile', v: contact.phone || '—' },
    { k: 'Met', v: contact.met },
    { k: 'Room', v: session ? `${session.title} · ${session.room}` : '—' },
  ]

  const saveReferral = () => {
    const who = refName.trim() || 'an unnamed introduction'
    const line = refDir === 'to' ? `Referred ${who} to ${contact.name}.` : `${contact.name} is introducing ${who}.`
    updateContact(contact.id, { bucket: 'referral' })
    addContactLog(contact.id, line)
    setSheet(null)
    setRefName('')
  }

  const whens = ['Tonight', 'Tomorrow morning', 'Friday', 'A week after the Vault']

  return (
    <div style={{ padding: '14px 18px 32px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-neutral-700)', padding: '6px 0 14px' }}
      >
        <IconBack size={14} /> Back
      </button>

      <div className="kicker">{contact.bucket === 'deal' ? 'Deal' : contact.bucket === 'referral' ? 'Referral' : 'Contact'}</div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>{contact.name}</h2>
      {(contact.firm || contact.city) && (
        <p style={{ font: '400 15px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
          {[contact.firm, contact.city].filter(Boolean).join(' · ')}
        </p>
      )}

      {contact.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          {contact.tags.map((t) => (
            <span key={t} className="tag" style={{ cursor: 'default' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {contact.bucket === 'deal' && (
        <>
          <div className="kicker" style={{ marginTop: 22 }}>
            Stage
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {STAGES.map((s: Stage) => (
              <Chip key={s} label={s} active={contact.stage === s} onClick={() => setContactStage(contact.id, s)} />
            ))}
          </div>
        </>
      )}

      <div className="kicker" style={{ marginTop: 22 }}>
        Reach
      </div>
      <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
        {reach.map((r, i) => (
          <div
            key={r.k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '11px 14px',
              borderBottom: i < reach.length - 1 ? '1px solid var(--color-divider)' : 'none',
              font: '400 15px/1.3 var(--font-body)',
            }}
          >
            <span style={{ color: 'var(--color-neutral-600)' }}>{r.k}</span>
            <span>{r.v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSheet('referral')}>
          Add referral
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSheet('follow')}>
          Follow up
        </button>
      </div>

      <div className="kicker" style={{ marginTop: 26 }}>
        Activity
      </div>
      <div style={{ marginTop: 10 }}>
        {contact.log.map((l) => (
          <div key={l.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-500)' }}>{l.when}</div>
            <div style={{ font: '400 14px/1.4 var(--font-body)', marginTop: 4 }}>{l.what}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-danger"
        style={{ marginTop: 24, fontSize: 13 }}
        onClick={() => {
          if (confirm(`Remove ${contact.name} from your book?`)) {
            deleteContact(contact.id)
            onBack()
          }
        }}
      >
        Remove from book
      </button>

      {sheet === 'referral' && (
        <Sheet title="Add referral" onClose={() => setSheet(null)}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(
              [
                { key: 'to' as const, label: 'I send them a client' },
                { key: 'from' as const, label: 'They send me a client' },
              ]
            ).map((d) => (
              <Chip key={d.key} label={d.label} active={refDir === d.key} onClick={() => setRefDir(d.key)} />
            ))}
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Who</label>
            <input className="input" value={refName} onChange={(e) => setRefName(e.target.value)} placeholder="Name of the introduction" />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={saveReferral}>
            Save
          </button>
        </Sheet>
      )}

      {sheet === 'follow' && (
        <Sheet title="Follow up" onClose={() => setSheet(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {whens.map((label) => (
              <button
                key={label}
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  addTask({ who: contact.name, what: `Follow up on ${contact.tags[0] || 'the Vault conversation'}`, dueLabel: label, contactId: contact.id })
                  setSheet(null)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}
