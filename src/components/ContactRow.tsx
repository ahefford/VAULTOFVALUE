import type { Contact } from '../types'
import { BUCKET_LABEL } from '../types'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function bucketColors(bucket: Contact['bucket']) {
  if (bucket === 'deal') return { fg: 'var(--color-accent-700)', markBg: 'var(--color-accent-700)', markFg: 'var(--color-bg)' }
  if (bucket === 'referral') return { fg: 'var(--color-accent-2-700)', markBg: 'var(--color-process-yellow)', markFg: 'var(--color-neutral-900)' }
  return { fg: 'var(--color-neutral-600)', markBg: 'var(--color-accent-200)', markFg: 'var(--color-accent-800)' }
}

export function ContactRow({ contact, onOpen }: { contact: Contact; onOpen: (id: string) => void }) {
  const c = bucketColors(contact.bucket)
  const line = (contact.bucket === 'deal' ? `Deal · ${contact.stage}` : BUCKET_LABEL[contact.bucket]) + (contact.tags[0] ? ` · ${contact.tags[0]}` : contact.city ? ` · ${contact.city}` : '')
  return (
    <button
      type="button"
      onClick={() => onOpen(contact.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '12px 4px',
        border: 'none',
        background: 'transparent',
        borderBottom: '1px solid var(--color-divider)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          flex: 'none',
          borderRadius: 999,
          background: c.markBg,
          color: c.markFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '600 13px/1 var(--font-heading)',
        }}
      >
        {initials(contact.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 16px/1.25 var(--font-heading)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {contact.name}
        </div>
        <div style={{ font: '400 13px/1.3 var(--font-body)', color: c.fg, marginTop: 2 }}>{line}</div>
      </div>
      <div style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-500)', flex: 'none' }}>{contact.met}</div>
    </button>
  )
}
