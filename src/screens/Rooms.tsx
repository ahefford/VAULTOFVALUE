import { useState } from 'react'
import { useStore } from '../store/store'
import { Sheet } from '../components/Sheet'
import type { EventSession } from '../types'

export function Rooms({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, addSession, updateSession, removeSession, setCurrentSession } = useStore()
  const [editing, setEditing] = useState<EventSession | 'new' | null>(null)
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [room, setRoom] = useState('')

  const openNew = () => {
    setTime('')
    setTitle('')
    setRoom('')
    setEditing('new')
  }
  const openEdit = (s: EventSession) => {
    setTime(s.time)
    setTitle(s.title)
    setRoom(s.room)
    setEditing(s)
  }
  const save = () => {
    if (!title.trim()) return
    if (editing === 'new') {
      addSession({ time: time.trim() || '—', title: title.trim(), room: room.trim() })
    } else if (editing) {
      updateSession(editing.id, { time: time.trim() || '—', title: title.trim(), room: room.trim() })
    }
    setEditing(null)
  }

  return (
    <div style={{ padding: '18px 18px 32px' }}>
      <div className="kicker">Rooms</div>
      <h2 style={{ font: '600 30px/1.08 var(--font-heading)', margin: '8px 0 0', letterSpacing: '-0.012em' }}>Today's agenda.</h2>
      <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
        {state.sessions.length} session{state.sessions.length === 1 ? '' : 's'} · mark where you are so the concierge and your book know
      </p>

      {state.sessions.length === 0 && (
        <div className="card" style={{ marginTop: 22, padding: '20px 16px' }}>
          <div style={{ font: '600 16px/1.3 var(--font-heading)' }}>No agenda yet.</div>
          <p style={{ font: '400 14px/1.4 var(--font-body)', color: 'var(--color-neutral-700)', margin: '6px 0 0' }}>
            Add the sessions you plan to hit today.
          </p>
        </div>
      )}

      {state.sessions.map((s) => {
        const people = state.contacts.filter((c) => c.sessionId === s.id)
        const current = state.currentSessionId === s.id
        return (
          <div
            key={s.id}
            className="card"
            style={{ marginTop: 12, padding: '14px 16px', borderColor: current ? 'var(--color-accent-700)' : 'var(--color-divider)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ font: '400 12px/1 var(--font-body)', color: 'var(--color-neutral-600)' }}>{s.time}</div>
                <div style={{ font: '600 17px/1.25 var(--font-heading)', marginTop: 4 }}>{s.title}</div>
                <div style={{ font: '400 13px/1.3 var(--font-body)', color: 'var(--color-neutral-600)', marginTop: 2 }}>{s.room}</div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  flex: 'none',
                  background: current ? 'var(--color-accent-700)' : 'transparent',
                  color: current ? 'var(--color-bg)' : 'var(--color-neutral-700)',
                  border: `1px solid ${current ? 'var(--color-accent-700)' : 'var(--color-divider)'}`,
                }}
                onClick={() => setCurrentSession(current ? null : s.id)}
              >
                {current ? 'Here now' : "I'm here"}
              </button>
            </div>

            {people.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {people.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onOpen(p.id)}
                    style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', font: '400 14px/1.3 var(--font-body)', color: 'var(--color-accent-700)' }}
                  >
                    {p.name} — {p.firm || p.city}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                Edit
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => removeSession(s.id)}>
                Remove
              </button>
            </div>
          </div>
        )
      })}

      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 18 }} onClick={openNew}>
        + Add session
      </button>

      {editing && (
        <Sheet title={editing === 'new' ? 'Add session' : 'Edit session'} onClose={() => setEditing(null)}>
          <div className="field">
            <label>Time</label>
            <input className="input" value={time} onChange={(e) => setTime(e.target.value)} placeholder="9:00a" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Opening keynote" />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Room</label>
            <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Main hall" />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={save} disabled={!title.trim()}>
            Save
          </button>
        </Sheet>
      )}
    </div>
  )
}
