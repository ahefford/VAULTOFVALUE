import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  AppState,
  AskMessage,
  Bucket,
  Channel,
  Contact,
  EventSession,
  FollowUpTask,
  Profile,
  Stage,
  UploadedDoc,
} from '../types'
import { makeId, relativeDayLabel } from '../lib/id'
import { defaultChannels, defaultState, STORAGE_KEY } from './defaults'
import { answerLocally } from '../lib/concierge'
import { askClaude } from '../lib/ai'

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return { ...defaultState(), ...parsed }
  } catch {
    return defaultState()
  }
}

export interface NewContactInput {
  name: string
  firm?: string
  city?: string
  email?: string
  phone?: string
  bucket: Bucket
  tags?: string[]
  note?: string
  sessionId?: string | null
}

interface StoreValue {
  state: AppState
  completeOnboarding: (profile: Profile) => void
  updateProfile: (patch: Partial<Profile>) => void
  setEventInfo: (name: string, year: string) => void

  addContact: (input: NewContactInput) => Contact
  updateContact: (id: string, patch: Partial<Contact>) => void
  setContactStage: (id: string, stage: Stage) => void
  addContactLog: (id: string, what: string) => void
  deleteContact: (id: string) => void

  addTask: (input: { who: string; what: string; dueLabel: string; contactId?: string | null }) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  incGoal: (key: string) => void
  decGoal: (key: string) => void
  addGoal: (label: string, target: number, note?: string) => void
  removeGoal: (key: string) => void
  updateGoalTarget: (key: string, target: number) => void

  toggleChannel: (key: string) => void
  connectChannel: (key: string) => void
  updateChannelValue: (key: string, value: string) => void
  addChannel: (label: string, value: string) => void
  removeChannel: (key: string) => void

  addSession: (input: { time: string; title: string; room: string }) => void
  updateSession: (id: string, patch: Partial<EventSession>) => void
  removeSession: (id: string) => void
  setCurrentSession: (id: string | null) => void

  addDoc: (doc: Omit<UploadedDoc, 'id' | 'addedAt'>) => void
  removeDoc: (id: string) => void
  sendAsk: (text: string) => Promise<void>
  askBusy: boolean
  setAiApiKey: (key: string) => void

  resetAll: () => void
  exportCsv: () => string
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [askBusy, setAskBusy] = useState(false)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, 150)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [state])

  const value = useMemo<StoreValue>(() => {
    const completeOnboarding: StoreValue['completeOnboarding'] = (profile) => {
      setState((s) => ({
        ...s,
        onboarded: true,
        profile,
        goals: s.goals.map((g) => (g.key === 'scans' ? { ...g, target: profile.scanTarget } : g)),
        channels: defaultChannels(profile.email, profile.phone),
      }))
    }

    const updateProfile: StoreValue['updateProfile'] = (patch) => {
      setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
    }

    const setEventInfo: StoreValue['setEventInfo'] = (eventName, eventYear) => {
      setState((s) => ({ ...s, eventName, eventYear }))
    }

    const addContact: StoreValue['addContact'] = (input) => {
      const now = Date.now()
      const contact: Contact = {
        id: makeId(),
        name: input.name.trim(),
        firm: input.firm?.trim() || '',
        city: input.city?.trim() || '',
        email: input.email?.trim() || '',
        phone: input.phone?.trim() || '',
        bucket: input.bucket,
        stage: 'New',
        tags: input.tags ?? [],
        sessionId: input.sessionId ?? null,
        met: relativeDayLabel(now, now),
        createdAt: now,
        log: [{ id: makeId(), when: relativeDayLabel(now, now), at: now, what: input.note?.trim() || 'Added to the book.' }],
      }
      setState((s) => ({ ...s, contacts: [contact, ...s.contacts] }))
      return contact
    }

    const updateContact: StoreValue['updateContact'] = (id, patch) => {
      setState((s) => ({ ...s, contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    }

    const setContactStage: StoreValue['setContactStage'] = (id, stage) => {
      setState((s) => ({ ...s, contacts: s.contacts.map((c) => (c.id === id ? { ...c, stage } : c)) }))
    }

    const addContactLog: StoreValue['addContactLog'] = (id, what) => {
      const now = Date.now()
      setState((s) => ({
        ...s,
        contacts: s.contacts.map((c) =>
          c.id === id ? { ...c, log: [{ id: makeId(), when: relativeDayLabel(now, now), at: now, what }, ...c.log] } : c,
        ),
      }))
    }

    const deleteContact: StoreValue['deleteContact'] = (id) => {
      setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }))
    }

    const addTask: StoreValue['addTask'] = ({ who, what, dueLabel, contactId }) => {
      const task: FollowUpTask = {
        id: makeId(),
        contactId: contactId ?? null,
        who,
        what,
        dueLabel,
        createdAt: Date.now(),
        done: false,
      }
      setState((s) => ({ ...s, tasks: [task, ...s.tasks] }))
    }

    const toggleTask: StoreValue['toggleTask'] = (id) => {
      setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))
    }

    const deleteTask: StoreValue['deleteTask'] = (id) => {
      setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
    }

    const incGoal: StoreValue['incGoal'] = (key) => {
      setState((s) => ({ ...s, goals: s.goals.map((g) => (g.key === key ? { ...g, count: g.count + 1 } : g)) }))
    }
    const decGoal: StoreValue['decGoal'] = (key) => {
      setState((s) => ({ ...s, goals: s.goals.map((g) => (g.key === key ? { ...g, count: Math.max(0, g.count - 1) } : g)) }))
    }
    const addGoal: StoreValue['addGoal'] = (label, target, note) => {
      setState((s) => ({
        ...s,
        goals: [...s.goals, { key: makeId(), label, target: Math.max(1, target), count: 0, note: note ?? '' }],
      }))
    }
    const removeGoal: StoreValue['removeGoal'] = (key) => {
      setState((s) => ({ ...s, goals: s.goals.filter((g) => g.key !== key) }))
    }
    const updateGoalTarget: StoreValue['updateGoalTarget'] = (key, target) => {
      setState((s) => ({ ...s, goals: s.goals.map((g) => (g.key === key ? { ...g, target: Math.max(1, target) } : g)) }))
    }

    const toggleChannel: StoreValue['toggleChannel'] = (key) => {
      setState((s) => ({ ...s, channels: s.channels.map((c) => (c.key === key ? { ...c, on: !c.on } : c)) }))
    }
    const connectChannel: StoreValue['connectChannel'] = (key) => {
      setState((s) => ({ ...s, channels: s.channels.map((c) => (c.key === key ? { ...c, connected: true, on: true } : c)) }))
    }
    const updateChannelValue: StoreValue['updateChannelValue'] = (key, value) => {
      setState((s) => ({ ...s, channels: s.channels.map((c) => (c.key === key ? { ...c, value, on: value ? c.on : false } : c)) }))
    }
    const addChannel: StoreValue['addChannel'] = (label, value) => {
      const channel: Channel = {
        key: makeId(),
        label,
        mark: label.slice(0, 2).toUpperCase(),
        value: value.trim(),
        on: true,
        connectable: false,
        connected: false,
        tone: 'blue',
      }
      setState((s) => ({ ...s, channels: [...s.channels, channel] }))
    }
    const removeChannel: StoreValue['removeChannel'] = (key) => {
      setState((s) => ({ ...s, channels: s.channels.filter((c) => c.key !== key) }))
    }

    const addSession: StoreValue['addSession'] = ({ time, title, room }) => {
      const session: EventSession = { id: makeId(), time, title, room }
      setState((s) => ({ ...s, sessions: [...s.sessions, session] }))
    }
    const updateSession: StoreValue['updateSession'] = (id, patch) => {
      setState((s) => ({ ...s, sessions: s.sessions.map((sess) => (sess.id === id ? { ...sess, ...patch } : sess)) }))
    }
    const removeSession: StoreValue['removeSession'] = (id) => {
      setState((s) => ({
        ...s,
        sessions: s.sessions.filter((sess) => sess.id !== id),
        currentSessionId: s.currentSessionId === id ? null : s.currentSessionId,
      }))
    }
    const setCurrentSession: StoreValue['setCurrentSession'] = (id) => {
      setState((s) => ({ ...s, currentSessionId: id }))
    }

    const addDoc: StoreValue['addDoc'] = (doc) => {
      setState((s) => ({ ...s, docs: [...s.docs, { ...doc, id: makeId(), addedAt: Date.now() }] }))
    }
    const removeDoc: StoreValue['removeDoc'] = (id) => {
      setState((s) => ({ ...s, docs: s.docs.filter((d) => d.id !== id) }))
    }

    const setAiApiKey: StoreValue['setAiApiKey'] = (key) => {
      setState((s) => ({ ...s, aiApiKey: key }))
    }

    const sendAsk: StoreValue['sendAsk'] = async (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const userMsg: AskMessage = { id: makeId(), role: 'user', text: trimmed, at: Date.now() }
      setState((s) => ({ ...s, askMessages: [...s.askMessages, userMsg] }))
      setAskBusy(true)
      try {
        const s: AppState = { ...state, askMessages: [...state.askMessages, userMsg] }
        let replyText: string
        if (s.aiApiKey) {
          try {
            replyText = await askClaude(s)
          } catch {
            replyText = answerLocally(s, trimmed)
          }
        } else {
          replyText = answerLocally(s, trimmed)
        }
        const reply: AskMessage = { id: makeId(), role: 'assistant', text: replyText, at: Date.now() }
        setState((s2) => ({ ...s2, askMessages: [...s2.askMessages, reply] }))
      } finally {
        setAskBusy(false)
      }
    }

    const resetAll: StoreValue['resetAll'] = () => {
      localStorage.removeItem(STORAGE_KEY)
      setState(defaultState())
    }

    const exportCsv: StoreValue['exportCsv'] = () => {
      const header = ['Name', 'Firm', 'City', 'Bucket', 'Stage', 'Email', 'Phone', 'Tags', 'Met', 'Notes']
      const rows = state.contacts.map((c) => [
        c.name,
        c.firm,
        c.city,
        c.bucket,
        c.stage,
        c.email,
        c.phone,
        c.tags.join('; '),
        c.met,
        c.log.map((l) => l.what).join(' | '),
      ])
      const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
      return [header, ...rows].map((r) => r.map(escape).join(',')).join('\n')
    }

    return {
      state,
      completeOnboarding,
      updateProfile,
      setEventInfo,
      addContact,
      updateContact,
      setContactStage,
      addContactLog,
      deleteContact,
      addTask,
      toggleTask,
      deleteTask,
      incGoal,
      decGoal,
      addGoal,
      removeGoal,
      updateGoalTarget,
      toggleChannel,
      connectChannel,
      updateChannelValue,
      addChannel,
      removeChannel,
      addSession,
      updateSession,
      removeSession,
      setCurrentSession,
      addDoc,
      removeDoc,
      sendAsk,
      askBusy,
      setAiApiKey,
      resetAll,
      exportCsv,
    }
  }, [state, askBusy])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
