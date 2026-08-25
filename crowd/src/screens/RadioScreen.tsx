import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/store'
import { useMessages, useTypingIds } from '../store/threads'
import { dmThreadId, zoneThreadId, type Person } from '../types'
import { clockAt } from '../lib/time'

interface ThreadTab {
  id: string
  label: string
  participants: string[]
}

export function RadioScreen({ thread, onThreadChange }: { thread: string; onThreadChange: (id: string) => void }) {
  const { state, me, api } = useStore()
  const [draft, setDraft] = useState('')

  const baseTabs: ThreadTab[] = useMemo(() => {
    if (!me) return []
    const all: ThreadTab = { id: 'all', label: 'ALL TEAM', participants: state.people.map((p) => p.id) }
    if (me.role === 'captain') {
      return [all, ...state.zones.map((z) => ({ id: zoneThreadId(z.id), label: z.short, participants: state.people.filter((p) => p.zone === z.id || p.id === me.id).map((p) => p.id) }))]
    }
    const tabs = [all]
    const myZone = state.zones.find((z) => z.id === me.zone)
    if (myZone) tabs.push({ id: zoneThreadId(myZone.id), label: myZone.short, participants: state.people.filter((p) => p.zone === myZone.id).map((p) => p.id) })
    const captain = state.people.find((p) => p.role === 'captain')
    if (captain) tabs.push({ id: dmThreadId(me.id, captain.id), label: 'DM CAPTAIN', participants: [me.id, captain.id] })
    return tabs
  }, [me, state.people, state.zones])

  const extraDmTab: ThreadTab | null = useMemo(() => {
    if (!me || !thread.startsWith('dm:') || baseTabs.some((t) => t.id === thread)) return null
    const ids = thread.slice(3).split('-')
    const otherId = ids.find((id) => id !== me.id)
    const other = state.people.find((p) => p.id === otherId)
    return { id: thread, label: 'DM ' + (other?.initials ?? '??'), participants: ids }
  }, [thread, baseTabs, me, state.people])

  const tabs = extraDmTab ? [...baseTabs, extraDmTab] : baseTabs
  const activeTab = tabs.find((t) => t.id === thread) ?? tabs[0] ?? null

  const messages = useMessages(activeTab?.id ?? null)
  const typingIds = useTypingIds(activeTab?.id ?? null)

  useEffect(() => {
    if (activeTab && me) void api.markRead(activeTab.id, me.id)
  }, [activeTab, me, api])

  useEffect(() => {
    setDraft('')
  }, [activeTab?.id])

  if (!me || !activeTab) return null

  const typers = typingIds.filter((id) => id !== me.id).map((id) => state.people.find((p) => p.id === id)?.name).filter(Boolean) as string[]

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    void api.sendMsg(activeTab.id, me.id, trimmed)
    setDraft('')
    void api.setTyping(activeTab.id, me.id, false)
  }

  const quickReplies =
    me.role === 'captain'
      ? ['Copy that.', 'Hold your zone.', 'Send me a headcount.']
      : me.role === 'lead'
        ? ['Zone secure.', 'Need backup at my post.', 'Full headcount confirmed.']
        : ['In position.', 'Copy.', 'Line backing up here.']

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="zc-scroll" style={{ display: 'flex', gap: 0, overflow: 'auto', borderBottom: '2px solid var(--zc-line)', background: 'var(--zc-panel)' }}>
        {tabs.map((t) => (
          <TabButton key={t.id} tab={t} active={t.id === activeTab.id} meId={me.id} onClick={() => onThreadChange(t.id)} />
        ))}
      </div>
      <div style={{ padding: '14px 18px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} me={me} participants={activeTab.participants} people={state.people} />
        ))}
        {typers.length > 0 && (
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: 'var(--zc-gold)', animation: 'ccpulse 1.4s infinite' }}>
            {typers.join(', ')} is typing…
          </div>
        )}
      </div>
      <div style={{ padding: '0 18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              void api.setTyping(activeTab.id, me.id, e.target.value.length > 0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send(draft)
            }}
            placeholder="Message the channel"
            style={{ flex: 1, minWidth: 0, background: 'var(--zc-panel)', border: '1px solid var(--zc-line)', color: 'var(--zc-ink)', fontFamily: 'Archivo, sans-serif', fontSize: 13, padding: '13px 12px', outline: 'none' }}
          />
          <button
            className="ccbtn"
            onClick={() => send(draft)}
            style={{ flex: 'none', border: 0, background: 'var(--zc-gold)', color: '#1b2b22', fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', padding: '13px 15px', cursor: 'pointer' }}
          >
            SEND
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quickReplies.map((q) => (
            <button
              key={q}
              className="ccbtn"
              onClick={() => send(q)}
              style={{ border: '1px solid var(--zc-line)', background: 'transparent', color: 'var(--zc-muted-2)', fontFamily: 'Archivo, sans-serif', fontSize: 10.5, fontWeight: 700, padding: '8px 10px', cursor: 'pointer' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabButton({ tab, active, meId, onClick }: { tab: ThreadTab; active: boolean; meId: string; onClick: () => void }) {
  const unread = useUnreadForTab(tab.id, meId)
  return (
    <button
      onClick={onClick}
      style={{
        flex: 'none',
        border: 0,
        borderBottom: `3px solid ${active ? 'var(--zc-gold)' : 'transparent'}`,
        background: 'transparent',
        color: active ? 'var(--zc-ink)' : 'var(--zc-faint)',
        fontFamily: 'Archivo, sans-serif',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '.1em',
        padding: '13px 14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {tab.label}
      {unread > 0 ? ` ·${unread}` : ''}
    </button>
  )
}

function useUnreadForTab(threadId: string, meId: string): number {
  const messages = useMessages(threadId)
  return messages.filter((m) => m.byId !== meId && !m.readBy.includes(meId)).length
}

function MessageBubble({
  message,
  me,
  participants,
  people,
}: {
  message: ReturnType<typeof useMessages>[number]
  me: Person
  participants: string[]
  people: Person[]
}) {
  const who = people.find((p) => p.id === message.byId)
  const mine = message.byId === me.id
  const readers = participants.filter((id) => id !== message.byId && message.readBy.includes(id)).length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color: 'var(--zc-faint)', marginBottom: 4 }}>
        {(mine ? 'YOU' : (who?.name ?? 'Unknown').toUpperCase()) + ' · ' + clockAt(message.atMs)}
      </div>
      <div
        style={{
          maxWidth: '82%',
          background: mine ? 'var(--zc-gold)' : 'var(--zc-panel)',
          color: mine ? '#1b2b22' : 'var(--zc-ink)',
          border: `1px solid ${mine ? 'var(--zc-gold)' : 'var(--zc-line)'}`,
          padding: '10px 12px',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {message.text}
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: 'var(--zc-faint)', marginTop: 4 }}>
        {mine ? (readers ? `READ BY ${readers}` : 'DELIVERED') : ''}
      </div>
    </div>
  )
}
