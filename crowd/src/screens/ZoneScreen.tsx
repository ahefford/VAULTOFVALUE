import { useMemo, useState } from 'react'
import { useStore } from '../store/store'
import type { BreakRequest, Person } from '../types'
import { DUTIES, STATUS_META, dmThreadId } from '../types'
import { card, dangerBtn, ghostBtn, kicker, primaryBtn } from '../components/styles'

function latestBreak(breaks: BreakRequest[], personId: string): BreakRequest | null {
  const mine = breaks.filter((b) => b.byId === personId).sort((a, b) => a.atMs - b.atMs)
  return mine.length ? mine[mine.length - 1] : null
}

export function ZoneScreen({ onOpenReport }: { onOpenReport: () => void }) {
  const { me } = useStore()
  if (!me) return null
  if (me.role === 'lead') return <LeadZone me={me} onOpenReport={onOpenReport} />
  if (me.role === 'captain') return <CaptainOps onOpenReport={onOpenReport} />
  return <MemberZone me={me} onOpenReport={onOpenReport} />
}

function MemberZone({ me, onOpenReport }: { me: Person; onOpenReport: () => void }) {
  const { state, api } = useStore()
  const myZone = state.zones.find((z) => z.id === me.zone) ?? null
  const lead = state.people.find((p) => p.id === myZone?.leadId)
  const status = STATUS_META[me.status]
  const myBreak = latestBreak(state.breaks, me.id)
  const breakState = myBreak?.status ?? 'none'
  const duties = DUTIES[me.zone ?? ''] ?? DUTIES.main

  const statusHelp =
    me.status === 'in'
      ? 'Your lead and the Captain can both see you standing your post.'
      : me.status === 'break'
        ? 'Approved break. Tap below the moment you are back on your post.'
        : 'Confirm the moment you are physically at your post — 15 minutes before doors.'

  const breakLabel =
    breakState === 'pending'
      ? 'BREAK REQUESTED — WAITING ON LEAD'
      : breakState === 'approved'
        ? 'BREAK APPROVED BY YOUR LEAD'
        : breakState === 'denied'
          ? 'BREAK ON HOLD — ASK AGAIN LATER'
          : 'REQUEST A BREAK'
  const breakDisabled = breakState === 'pending' || breakState === 'approved'

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card}>
        <div style={kicker}>YOUR POSITION TONIGHT</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1, marginTop: 6 }}>{me.post || '—'}</div>
        <div style={{ height: 1, background: 'var(--zc-line)', margin: '12px 0' }} />
        <div style={{ display: 'flex', gap: 18 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: 'var(--zc-muted)' }}>ZONE</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{myZone?.name ?? 'ALL ZONES'}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: 'var(--zc-muted)' }}>TEAM LEAD</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{lead?.name ?? '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ ...card, background: me.status === 'in' ? 'var(--zc-panel-2)' : 'var(--zc-panel)', borderColor: me.status === 'in' ? 'var(--zc-gold)' : 'var(--zc-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 9, height: 9, background: status.color }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: status.color }}>{status.label}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--zc-muted-2)', marginTop: 6, lineHeight: 1.45 }}>{statusHelp}</div>
        <button
          className="ccbtn"
          onClick={() => api.setStatus(me.id, me.status === 'in' ? 'off' : 'in')}
          style={{ ...primaryBtn, marginTop: 12, background: me.status === 'in' ? 'var(--zc-line-2)' : 'var(--zc-gold)', color: me.status === 'in' ? 'var(--zc-ink)' : '#1b2b22' }}
        >
          {me.status === 'in' ? 'STEP OFF POST' : me.status === 'break' ? 'BACK ON POST' : 'CONFIRM IN POSITION'}
        </button>
        <button
          className="ccbtn"
          onClick={() => !breakDisabled && api.requestBreak(me.id)}
          disabled={breakDisabled}
          style={{ ...ghostBtn, marginTop: 8, color: breakState === 'approved' ? 'var(--zc-gold)' : 'var(--zc-muted-2)', opacity: breakDisabled ? 0.85 : 1, cursor: breakDisabled ? 'default' : 'pointer' }}
        >
          {breakLabel}
        </button>
      </div>

      <div style={card}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>TEAM DUTIES — {(myZone?.dutiesLabel ?? 'MAIN FLOOR')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {duties.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--zc-line-2)' }}>
              <div style={{ flex: 'none', width: 14, fontSize: 11, fontWeight: 800, color: 'var(--zc-faint)' }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, color: 'var(--zc-ink-dim)' }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="ccbtn" style={dangerBtn} onClick={onOpenReport}>
        REPORT AN INCIDENT
      </button>
    </div>
  )
}

function LeadZone({ me, onOpenReport }: { me: Person; onOpenReport: () => void }) {
  const { state, api } = useStore()
  const myZone = state.zones.find((z) => z.id === me.zone) ?? null
  const zoneMembers = state.people.filter((p) => p.zone === me.zone)
  const inCount = zoneMembers.filter((p) => p.status === 'in').length
  const total = zoneMembers.length
  const pct = total ? Math.round((inCount / total) * 100) : 0
  const myTeam = zoneMembers.filter((p) => p.id !== me.id)
  const pendingBreaks = state.breaks.filter((b) => {
    if (b.status !== 'pending') return false
    const requester = state.people.find((p) => p.id === b.byId)
    return requester ? myZone?.leadId === me.id && requester.zone === me.zone : false
  })

  const captain = state.people.find((p) => p.role === 'captain')

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card}>
        <div style={kicker}>{(myZone?.name ?? 'YOUR ZONE').toUpperCase()} — HEADCOUNT</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 0.9, color: 'var(--zc-gold)' }}>{inCount}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--zc-muted)', paddingBottom: 4 }}>/ {total} IN POSITION</div>
        </div>
        <div style={{ height: 6, background: 'var(--zc-line-2)', marginTop: 12 }}>
          <div style={{ height: 6, background: 'var(--zc-gold)', width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
          {myTeam.map((m) => {
            const st = STATUS_META[m.status]
            return (
              <div key={m.id} className="ccrow" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--zc-line-2)' }}>
                <div style={{ width: 28, height: 28, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: 'var(--zc-line-2)', color: 'var(--zc-ink-dim)' }}>
                  {m.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', color: 'var(--zc-faint)' }}>{m.post}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: st.color }} />
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em', color: st.color }}>{st.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {pendingBreaks.length > 0 && (
        <div style={{ background: 'var(--zc-panel-2)', border: '2px solid var(--zc-gold)', padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>BREAK REQUESTS — NEEDS YOUR CALL</div>
          {pendingBreaks.map((b) => {
            const p = state.people.find((x) => x.id === b.byId)
            return (
              <div key={b.id} style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p?.name ?? 'Unknown'}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--zc-muted-2)', marginTop: 2 }}>{p?.post}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    className="ccbtn"
                    onClick={() => api.resolveBreak(b.id, true)}
                    style={{ flex: 1, border: 0, background: 'var(--zc-gold)', color: '#1b2b22', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textAlign: 'left', padding: 13, cursor: 'pointer', minHeight: 46 }}
                  >
                    APPROVE
                  </button>
                  <button
                    className="ccbtn"
                    onClick={() => api.resolveBreak(b.id, false)}
                    style={{ flex: 1, border: '1px solid var(--zc-faint)', background: 'transparent', color: 'var(--zc-muted-2)', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textAlign: 'left', padding: 13, cursor: 'pointer', minHeight: 46 }}
                  >
                    HOLD
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>RADIO CHECK-IN</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zc-muted-2)', marginTop: 6, lineHeight: 1.45 }}>
          Captain expects a check-in every 30–60 minutes, even when nothing is wrong.
        </div>
        <button
          className="ccbtn"
          style={{ ...primaryBtn, marginTop: 12 }}
          onClick={() =>
            captain &&
            api.sendMsg(
              dmThreadId(me.id, captain.id),
              me.id,
              `${myZone?.short ?? 'ZONE'} check-in: ${inCount} of ${total} in position, no issues.`,
            )
          }
        >
          CHECK IN WITH CAPTAIN
        </button>
      </div>

      <button className="ccbtn" style={dangerBtn} onClick={onOpenReport}>
        ESCALATE AN INCIDENT
      </button>
    </div>
  )
}

function CaptainOps({ onOpenReport }: { onOpenReport: () => void }) {
  const { state, me, api } = useStore()
  const zoneStats = useMemo(
    () =>
      state.zones.map((z) => {
        const mem = state.people.filter((p) => p.zone === z.id)
        const inCount = mem.filter((p) => p.status === 'in').length
        return { zone: z, total: mem.length, inCount, pct: mem.length ? Math.round((inCount / mem.length) * 100) : 0 }
      }),
    [state.zones, state.people],
  )
  const openIncidents = state.incidents.filter((i) => i.status === 'open')
  const [broadcastText, setBroadcastTextState] = useState('')

  if (!me) return null

  const presets = [
    'Doors open in 15 — everyone to your posts.',
    'Main floor is at capacity, hold entries.',
    'Break rotations start now, leads coordinate.',
  ]

  const emergency = () => {
    const text = window.prompt('Emergency message to send to every phone right now:', 'Clear the north exit pathway now and hold your zone.')
    if (text && text.trim()) api.sendAlert(me.id, text.trim(), 'emergency')
  }

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card}>
        <div style={kicker}>FLOOR STATUS — ALL ZONES</div>
        {zoneStats.map((x) => (
          <div key={x.zone.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--zc-line-2)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 800, letterSpacing: '.06em' }}>{x.zone.name.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: x.inCount === x.total && x.total > 0 ? 'var(--zc-gold)' : 'var(--zc-sage)' }}>{x.inCount}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--zc-faint)' }}>/ {x.total}</div>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--zc-muted)', marginTop: 3 }}>
              LEAD: {state.people.find((p) => p.id === x.zone.leadId)?.name ?? '—'} ·{' '}
              {x.inCount === x.total && x.total > 0 ? 'fully in position' : `${x.total - x.inCount} still to confirm`}
            </div>
            <div style={{ height: 5, background: 'var(--zc-line-2)', marginTop: 8 }}>
              <div style={{ height: 5, background: x.inCount === x.total && x.total > 0 ? 'var(--zc-gold)' : 'var(--zc-sage)', width: `${x.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-gold)' }}>BROADCAST TO ALL PHONES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {presets.map((label) => (
            <button
              key={label}
              className="ccbtn"
              onClick={() => api.sendAlert(me.id, label, 'notice')}
              style={{ border: '1px solid var(--zc-line)', background: 'var(--zc-line-2)', color: 'var(--zc-ink)', fontFamily: 'Archivo, sans-serif', fontSize: 12, fontWeight: 700, textAlign: 'left', padding: 13, cursor: 'pointer', minHeight: 46 }}
            >
              {label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={broadcastText}
              onChange={(e) => setBroadcastTextState(e.target.value)}
              placeholder="Custom broadcast…"
              style={{ flex: 1, minWidth: 0, background: 'var(--zc-bg)', border: '1px solid var(--zc-line)', color: 'var(--zc-ink)', fontFamily: 'Archivo, sans-serif', fontSize: 12.5, padding: '11px 10px', outline: 'none' }}
            />
            <button
              className="ccbtn"
              onClick={() => {
                if (broadcastText.trim()) {
                  api.sendAlert(me.id, broadcastText.trim(), 'notice')
                  setBroadcastTextState('')
                }
              }}
              style={{ flex: 'none', border: 0, background: 'var(--zc-gold)', color: '#1b2b22', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', padding: '11px 13px', cursor: 'pointer' }}
            >
              SEND
            </button>
          </div>
        </div>
        <button
          className="ccbtn"
          onClick={emergency}
          style={{ width: '100%', marginTop: 12, border: 0, background: 'var(--zc-red)', color: '#fff', fontFamily: 'Archivo, sans-serif', fontSize: 13, fontWeight: 800, letterSpacing: '.14em', textAlign: 'left', padding: '16px 14px', cursor: 'pointer', minHeight: 52 }}
        >
          EMERGENCY ALL-HANDS
        </button>
      </div>

      <div style={card}>
        <div style={kicker}>ESCALATIONS TO YOU</div>
        {openIncidents.length === 0 ? (
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zc-faint)', marginTop: 8 }}>Nothing open. Leads are holding their zones.</div>
        ) : (
          openIncidents.map((i) => {
            const who = state.people.find((p) => p.id === i.byId)
            const acked = i.acks.includes(me.id)
            const color = i.level === 'high' ? 'var(--zc-red)' : 'var(--zc-gold)'
            return (
              <div key={i.id} style={{ padding: '11px 0', borderTop: '1px solid var(--zc-line-2)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color, border: `1px solid ${color}`, padding: '2px 5px' }}>
                    {i.level === 'high' ? 'PRIORITY' : 'ZONE LEVEL'}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--zc-faint)' }}>
                    {(who?.name ?? '')} · {state.zones.find((z) => z.id === who?.zone)?.short ?? ''}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginTop: 6 }}>{i.text}</div>
                <button
                  className="ccbtn"
                  onClick={() => api.ackIncident(i.id, me.id)}
                  style={{ marginTop: 9, border: `1px solid ${acked ? 'var(--zc-sage)' : 'var(--zc-gold)'}`, background: 'transparent', color: acked ? 'var(--zc-sage)' : 'var(--zc-gold)', fontFamily: 'Archivo, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', padding: '10px 12px', cursor: 'pointer' }}
                >
                  {acked ? 'ACKNOWLEDGED — CLOSE OUT' : 'ACKNOWLEDGE'}
                </button>
              </div>
            )
          })
        )}
      </div>

      <button
        className="ccbtn"
        onClick={onOpenReport}
        style={{ border: '1px solid var(--zc-line)', background: 'transparent', color: 'var(--zc-muted-2)', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textAlign: 'left', padding: 13, cursor: 'pointer' }}
      >
        LOG AN INCIDENT YOURSELF
      </button>
    </div>
  )
}
