import { collection, doc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db, EVENT_ID } from '../firebase'
import type { Message } from '../types'

function threadDoc(threadId: string) {
  return doc(db, 'events', EVENT_ID, 'threads', threadId)
}

function messagesCol(threadId: string) {
  return collection(threadDoc(threadId), 'messages')
}

export function useMessages(threadId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!threadId) {
      setMessages([])
      return
    }
    const q = query(messagesCol(threadId), orderBy('at', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const v = d.data()
            return {
              id: d.id,
              byId: v.byId ?? '',
              text: v.text ?? '',
              atMs: v.at instanceof Timestamp ? v.at.toMillis() : Date.now(),
              readBy: (v.readBy ?? []) as string[],
            }
          }),
        )
      },
      () => setMessages([]),
    )
    return unsub
  }, [threadId])

  return messages
}

export function useUnreadCount(threadId: string | null, meId: string | null): number {
  const messages = useMessages(threadId)
  if (!meId) return 0
  return messages.filter((m) => m.byId !== meId && !m.readBy.includes(meId)).length
}

export function useTotalUnread(threadIds: string[], meId: string | null): number {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const key = threadIds.join(',')

  useEffect(() => {
    if (!meId || threadIds.length === 0) {
      setCounts({})
      return
    }
    const unsubs = threadIds.map((threadId) =>
      onSnapshot(
        messagesCol(threadId),
        (snap) => {
          const n = snap.docs.filter((d) => {
            const v = d.data()
            const readBy = (v.readBy ?? []) as string[]
            return v.byId !== meId && !readBy.includes(meId)
          }).length
          setCounts((prev) => ({ ...prev, [threadId]: n }))
        },
        () => setCounts((prev) => ({ ...prev, [threadId]: 0 })),
      ),
    )
    return () => unsubs.forEach((u) => u())
    // threadIds is a fresh array each render; `key` is its stable join and is what actually gates this effect.
  }, [key, meId])

  return Object.values(counts).reduce((a, b) => a + b, 0)
}

export function useTypingIds(threadId: string | null): string[] {
  const [typingIds, setTypingIds] = useState<string[]>([])

  useEffect(() => {
    if (!threadId) {
      setTypingIds([])
      return
    }
    const unsub = onSnapshot(
      threadDoc(threadId),
      (snap) => setTypingIds((snap.data()?.typingIds ?? []) as string[]),
      () => setTypingIds([]),
    )
    return unsub
  }, [threadId])

  return typingIds
}
