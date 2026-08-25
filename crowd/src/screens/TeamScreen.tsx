import { useState } from 'react'
import { useStore } from '../store/store'
import { STATUS_META, type Role } from '../types'
import { CrownIcon } from '../components/CrownIcon'
import { primaryBtn } from '../components/styles'

export function TeamScreen({ onDm }: { onDm: (personId: string) => void }) {
  const { state, me } = useStore()
  const [manage, setManage] = useState(false)
  if (!me) return null
  const captain = state.people.find((p) => p.role === 'captain')
  const liveCount = state.people.filter((p) => p.status === 'in').length

  return (
    <div style={{ padding: '16px 18px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-muted)' }}>TEAM CROWD CONTROL</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 3 }}>Roster</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--zc-gold)' }}>
          {liveCount} / {state.people.length} LIVE
        </div>
      </div>

      {captain && captain.id !== me.id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: 12, background: 'var(--zc-panel-2)', border: '1px solid var(--zc-line)' }}>
          <CrownIcon />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: 'var(--zc-gold)' }}>CAPTAIN</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{captain.name}</div>
          </div>
          <button
            className="ccbtn"
            onClick={() => onDm(captain.id)}
            style={{ border: '1px solid var(--zc-gold)', background: 'transparent', color: 'var(--zc-gold)', fontFamily: 'Archivo, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', padding: '10px 11px', cursor: 'pointer' }}
          >
            MESSAGE
          </button>
        </div>
      )}

      {state.zones.map((z) => {
        const members = state.people.filter((p) => p.zone === z.id)
        return (
          <div key={z.id} style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, borderBottom: '2px solid var(--zc-line)', paddingBottom: 6 }}>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 800, letterSpacing: '.16em' }}>{z.name.toUpperCase()}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: 'var(--zc-muted)' }}>
                {members.filter((p) => p.status === 'in').length} / {members.length} IN POSITION
              </div>
            </div>
            {members.map((m) => {
              const st = STATUS_META[m.status]
              const isMe = m.id === me.id
              return (
                <div key={m.id} className="ccrow" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid var(--zc-line-2)' }}>
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
                      background: isMe ? 'var(--zc-gold)' : 'var(--zc-line-2)',
                      color: isMe ? '#1b2b22' : 'var(--zc-ink-dim)',
                    }}
                  >
                    {m.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {m.name}
                      {m.role === 'lead' && <span style={{ color: 'var(--zc-muted)', fontWeight: 600 }}> · LEAD</span>}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: 'var(--zc-faint)' }}>{m.post}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: st.color }} />
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: st.color, width: 74 }}>{st.label}</div>
                  </div>
                  {!isMe && (
                    <button
                      className="ccbtn"
                      onClick={() => onDm(m.id)}
                      style={{ flex: 'none', border: '1px solid var(--zc-line)', background: 'transparent', color: 'var(--zc-muted)', fontFamily: 'Archivo, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '.1em', padding: '8px 9px', cursor: 'pointer' }}
                    >
                      DM
                    </button>
                  )}
                </div>
              )
            })}
            {members.length === 0 && <div style={{ padding: '10px 4px', fontSize: 12, color: 'var(--zc-faint)' }}>No one assigned yet.</div>}
          </div>
        )
      })}

      {me.role === 'captain' && (
        <div style={{ marginTop: 24 }}>
          <button
            className="ccbtn"
            onClick={() => setManage((v) => !v)}
            style={{ width: '100%', border: '1px solid var(--zc-line)', background: 'transparent', color: 'var(--zc-muted-2)', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', padding: 13, cursor: 'pointer' }}
          >
            {manage ? 'DONE MANAGING TEAM' : 'MANAGE TEAM'}
          </button>
          {manage && <ManageTeam />}
        </div>
      )}
    </div>
  )
}

function ManageTeam() {
  const { state, addPerson, updatePerson, removePerson, addZone, updateZone } = useStore()
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [zone, setZone] = useState(state.zones[0]?.id ?? '')
  const [post, setPost] = useState('')
  const [newZoneName, setNewZoneName] = useState('')

  const fieldStyle = {
    background: 'var(--zc-bg)',
    border: '1px solid var(--zc-line)',
    color: 'var(--zc-ink)',
    fontFamily: 'Archivo, sans-serif',
    fontSize: 13,
    padding: '10px 10px',
    outline: 'none',
    width: '100%',
  } as const

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>ADD TEAM MEMBER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <input style={fieldStyle} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={fieldStyle} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="member">Member</option>
              <option value="lead">Lead</option>
            </select>
            <select style={fieldStyle} value={zone} onChange={(e) => setZone(e.target.value)}>
              {state.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          <input style={fieldStyle} placeholder="Post (e.g. North aisle)" value={post} onChange={(e) => setPost(e.target.value)} />
          <button
            className="ccbtn"
            style={primaryBtn}
            onClick={async () => {
              if (!name.trim()) return
              const id = await addPerson({ name: name.trim(), role, zone: zone || null, post: post.trim() || 'Floor' })
              if (role === 'lead' && zone) await updateZone(zone, { leadId: id })
              setName('')
              setPost('')
            }}
          >
            ADD TO ROSTER
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>ADD ZONE</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input style={fieldStyle} placeholder="Zone name" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} />
          <button
            className="ccbtn"
            onClick={async () => {
              if (!newZoneName.trim()) return
              await addZone({
                name: newZoneName.trim(),
                short: newZoneName.trim().slice(0, 6).toUpperCase(),
                leadId: null,
                dutiesLabel: newZoneName.trim().toUpperCase(),
              })
              setNewZoneName('')
            }}
            style={{ flex: 'none', border: 0, background: 'var(--zc-gold)', color: '#1b2b22', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', padding: '10px 13px', cursor: 'pointer' }}
          >
            ADD
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', padding: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>EDIT ROSTER</div>
        {state.people.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid var(--zc-line-2)' }}>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
            <select
              style={{ ...fieldStyle, width: 'auto', padding: '6px 8px', fontSize: 11 }}
              value={p.zone ?? ''}
              onChange={(e) => updatePerson(p.id, { zone: e.target.value || null })}
              disabled={p.role === 'captain'}
            >
              <option value="">No zone</option>
              {state.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.short}
                </option>
              ))}
            </select>
            <select
              style={{ ...fieldStyle, width: 'auto', padding: '6px 8px', fontSize: 11 }}
              value={p.role}
              onChange={(e) => updatePerson(p.id, { role: e.target.value as Role })}
              disabled={p.role === 'captain'}
            >
              <option value="member">Member</option>
              <option value="lead">Lead</option>
            </select>
            {p.role !== 'captain' && (
              <button
                className="ccbtn"
                onClick={() => removePerson(p.id)}
                style={{ border: '1px solid var(--zc-red)', background: 'transparent', color: 'var(--zc-red)', fontSize: 10, fontWeight: 800, padding: '6px 8px', cursor: 'pointer' }}
              >
                REMOVE
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

