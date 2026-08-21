import { useMemo, useState } from 'react'
import { useStore } from '../store/store'
import { ContactRow } from '../components/ContactRow'
import { Chip } from '../components/Chips'
import { isSameLocalDay } from '../lib/id'
import { downloadCsv } from '../lib/csv'

type Take = 'ledger' | 'buckets' | 'today'
const FILTERS = ['All', 'Deals', 'Referrals', 'Contacts'] as const

export function Book({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, exportCsv } = useStore()
  const [take, setTake] = useState<Take>('ledger')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')

  const now = Date.now()
  const today = state.contacts.filter((c) => isSameLocalDay(c.createdAt, now))

  const match = (c: (typeof state.contacts)[number]) => {
    const bucketLabel = c.bucket === 'deal' ? 'Deals' : c.bucket === 'referral' ? 'Referrals' : 'Contacts'
    const inFilter = filter === 'All' || bucketLabel === filter
    const query = q.trim().toLowerCase()
    return inFilter && (!query || `${c.name} ${c.firm} ${c.tags.join(' ')}`.toLowerCase().includes(query))
  }

  const filtered = state.contacts.filter(match)

  const deals = state.contacts.filter((c) => c.bucket === 'deal').length
  const refs = state.contacts.filter((c) => c.bucket === 'referral').length
  const open = state.tasks.filter((t) => !t.done).length

  const groups = useMemo(() => {
    if (take === 'buckets') {
      return (
        [
          { key: 'deal' as const, heading: 'Deals' },
          { key: 'referral' as const, heading: 'Referrals' },
          { key: 'contact' as const, heading: 'Contacts' },
        ]
          .map((g) => ({ heading: g.heading, rows: state.contacts.filter((c) => c.bucket === g.key && match(c)) }))
          .filter((g) => g.rows.length)
      )
    }
    if (take === 'today') {
      return [{ heading: 'Today, newest first', rows: today.filter(match) }]
    }
    return [{ heading: '', rows: filtered }]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [take, state.contacts, q, filter])

  const noRows = groups.every((g) => g.rows.length === 0)

  return (
    <div style={{ padding: '18px 18px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="kicker">{take === 'today' ? 'The floor' : 'Book of business'}</div>
        <div style={{ font: '400 13px/1 var(--font-body)', color: 'var(--color-neutral-600)' }}>{state.contacts.length} names</div>
      </div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Your Vault of Value.</h2>
      <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
        {deals} deals · {refs} referral sources · {open} promise{open === 1 ? '' : 's'} open
      </p>

      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
        {(['ledger', 'buckets', 'today'] as Take[]).map((t) => (
          <Chip key={t} label={t === 'ledger' ? 'Ledger' : t === 'buckets' ? 'Buckets' : 'Today first'} active={take === t} onClick={() => setTake(t)} />
        ))}
      </div>

      <input
        className="input"
        placeholder="Search name, firm or tag"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginTop: 14 }}
      />
      {take === 'ledger' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      )}

      {state.contacts.length === 0 && (
        <div className="card" style={{ marginTop: 22, padding: '20px 16px' }}>
          <div style={{ font: '600 16px/1.3 var(--font-heading)' }}>Nothing scanned yet.</div>
          <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
            Head to the Scan tab and add the first person you meet.
          </p>
        </div>
      )}

      {state.contacts.length > 0 && noRows && (
        <div style={{ padding: '30px 4px', color: 'var(--color-neutral-600)', font: '400 14px/1.4 var(--font-body)' }}>No matches.</div>
      )}

      {groups.map((g, gi) => (
        <div key={gi} style={{ marginTop: g.heading ? 22 : 6 }}>
          {g.heading && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div className="kicker">{g.heading}</div>
              <div className="kicker">{g.rows.length}</div>
            </div>
          )}
          {g.rows.map((c) => (
            <ContactRow key={c.id} contact={c} onOpen={onOpen} />
          ))}
        </div>
      ))}

      {state.contacts.length > 0 && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 22, fontSize: 13 }}
          onClick={() => downloadCsv(`vault-book-${new Date().toISOString().slice(0, 10)}.csv`, exportCsv())}
        >
          Export book as CSV
        </button>
      )}
    </div>
  )
}
